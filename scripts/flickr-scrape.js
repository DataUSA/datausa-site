#! /usr/bin/env node

const Flickr = require("flickr-sdk"),
      {GoogleSpreadsheet} = require("google-spreadsheet"),
      PromiseThrottle = require("promise-throttle"),
      Sequelize = require("sequelize"),
      axios = require("axios"),
      chalk = require("chalk"),
      fs = require("fs"),
      path = require("path"),
      readline = require("readline"),
      sharp = require("sharp"),
      shell = require("shelljs");

const creds = require("../google_auth.json");

const slugMap = {
  cip: "CIP",
  geo: "Geography",
  naics: "PUMS Industry",
  napcs: "NAPCS",
  soc: "PUMS Occupation",
  university: "University"
};

// Query to generate CSV for google sheet
//
// select s.id, s.zvalue, s.display as name, i.url as image_link, i.meta as image_meta
// from search as s left join images as i on s."imageId" = i.id
// where s.dimension = 'NAPCS'
// order by s.zvalue desc

const dimension = process.argv[2];
if (!dimension) {
  console.log("Process must contain a dimension argument.");
  shell.exit(1);
}

const flickrThrottle = new PromiseThrottle({
  requestsPerSecond: 5,
  promiseImplementation: Promise
});

const googleThrottle = new PromiseThrottle({
  requestsPerSecond: 0.95,
  promiseImplementation: Promise
});

const dbName = process.env.CANON_DB_NAME;
const dbUser = process.env.CANON_DB_USER;
const dbHost = process.env.CANON_DB_HOST || "127.0.0.1";
const dbPw = process.env.CANON_DB_PW || null;

const db = new Sequelize(dbName, dbUser, dbPw,
  {
    host: dbHost,
    dialect: "postgres",
    define: {timestamps: true},
    logging: () => {}
  }
);

const dbFolder = path.join(__dirname, "../node_modules/@datawheel/canon-cms/src/db/");
fs.readdirSync(dbFolder)
  .filter(file => file && file.indexOf(".") !== 0)
  .forEach(file => {
    const model = db.import(path.join(dbFolder, file));
    db[model.name] = model;
  });


const flickr = new Flickr(process.env.FLICKR_API_KEY);
const validLicenses = ["4", "5", "7", "8", "9", "10"];

const errors = [];
const updates = [];
let total = 0;
let checked = 0;

/** */
function catcher(err) {
  console.log(err);
  shell.exit(1);
}

/** */
function printProgress() {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  checked++;
  const percentage = checked / total;
  process.stdout.write(`${(percentage * 100).toFixed(0)}% (${checked} out of ${total})`);
  return true;
}

/** */
function fetchImage(row) {

  const photoId = row.image_link.replace("https://flic.kr/p/", "");

  const tableRow = {
    url: row.image_link,
    meta: row.image_meta
  };

  if (errors.includes(tableRow.url)) return true;

  return flickr.photos.getInfo({photo_id: photoId})
    .then(res => {
      const photo = res.body.photo;
      tableRow.author = photo.owner.realname || photo.owner.username;
      tableRow.license = parseInt(photo.license, 10);
      if (!validLicenses.includes(tableRow.license)) {
        if (row.error) {
          row.error = "";
          updates.push(row);
        }
        return db.image.findOrCreate({where: {url: tableRow.url}, defaults: tableRow});
      }
      else {
        errors.push(tableRow.url);
        const e = `Bad License: ${tableRow.url} (${tableRow.license})`;
        if (row.error !== `license-${tableRow.license}`) {
          row.error = `license-${tableRow.license}`;
          updates.push(row);
        }
        throw e;
      }
    })
    .then(([match, created]) => {

      const imageId = match.id;
      const splashPath = path.join(process.cwd(), `static/images/profile/splash/${imageId}.jpg`);
      const thumbPath = path.join(process.cwd(), `static/images/profile/thumb/${imageId}.jpg`);

      if (!created && shell.test("-e", splashPath) && shell.test("-e", thumbPath)) {
        return db.search.update({imageId}, {where: {id: row.id, dimension: slugMap[dimension]}})
          .then(printProgress);
      }
      else {

        console.log(`\nNew Image: ${imageId}`);

        return db.search
          .update({imageId}, {where: {id: row.id, dimension: slugMap[dimension]}})
          .then(() => flickr.photos.getSizes({photo_id: photoId}))
          .then(res => {
            let image = res.body.sizes.size.find(d => parseInt(d.width, 10) >= 1600);
            if (!image) image = res.body.sizes.size.find(d => parseInt(d.width, 10) >= 1000);
            if (!image) image = res.body.sizes.size.find(d => parseInt(d.width, 10) >= 500);
            return axios.get(image.source, {responseType: "arraybuffer"}).then(d => d.data);
          })
          .then(res => Promise.all([
            sharp(res).resize(1600).toFile(splashPath),
            sharp(res).resize(425).toFile(thumbPath)
          ]))
          .then(printProgress);

      }
    })
    .catch(err => {
      if (err.response) {
        const {status, text} = err.response;
        console.log(`\n${status} - ${row.image_link} - ${JSON.parse(text).message}`);
        if (row.error !== "removed") {
          row.error = "removed";
          updates.push(row);
        }
      }
      else {
        console.log(chalk.bold.red(`\n${err.fields ? `${err.fields.id} - ` : ""}${err}`));
      }
      printProgress();
    });

}

/** */
function saveRow(row) {

  return row.save()
    .then(() => {
      printProgress();
      return true;
    })
    .catch(catcher);

}

const doc = new GoogleSpreadsheet("1emEA-Tz4EBugidBRSQ5e4eq9AkQaEqAerTW0XtGL4AI");

async function run() {

  await doc.useServiceAccountAuth(creds).catch(catcher);
  await doc.loadInfo().catch(catcher);

  const worksheet = doc.sheetsByIndex.find(d => d.title.toLowerCase().includes(dimension.toLowerCase()));
  if (!worksheet) {
    console.log(`Unable to find sheet matching "${dimension}"`);
    shell.exit(1);
  }
  else {
    const rows = await worksheet.getRows().catch(catcher);
    const validRows = rows.filter(row => row.image_link);
    console.log(`Rows found: ${rows.length}`);

    let fetches = [];
    validRows.forEach(row => {
      fetches.push(flickrThrottle.add(fetchImage.bind(this, row)));
    });
    checked = 0;
    total = fetches.length;
    console.log(`Images found: ${total}`);
    await Promise.all(fetches);

    if (updates.length) {
      fetches = [];
      updates.forEach(row => {
        fetches.push(googleThrottle.add(saveRow.bind(this, row)));
      });
      checked = 0;
      total = fetches.length;
      console.log("\n\nUpdating Spreadsheet Error Column");
      await Promise.all(fetches);
    }

    console.log("\n");
    shell.exit(0);

  }

}

run();
