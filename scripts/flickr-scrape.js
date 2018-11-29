#! /usr/bin/env node

const Flickr = require("flickr-sdk"),
      GoogleSpreadsheet = require("google-spreadsheet"),
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

// Query to generate CSV for google sheet
//
// select s.id, s.zvalue, s.display as name, i.url as imagelink, i.meta as imagemeta
// from search as s left join images as i on s."imageId" = i.id
// where s.dimension = 'NAPCS'
// order by s.zvalue desc

const dimension = process.argv[2];
if (!dimension) {
  console.log("Process must contain a dimension argument.");
  shell.exit(1);
}

const throttle = new PromiseThrottle({
  requestsPerSecond: 5,
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

const dbFolder = path.join(__dirname, "../db/");
fs.readdirSync(dbFolder)
  .filter(file => file && file.indexOf(".") !== 0)
  .forEach(file => {
    const model = db.import(path.join(dbFolder, file));
    db[model.name] = model;
  });


const flickr = new Flickr(process.env.FLICKR_API_KEY);
const validLicenses = ["4", "5", "7", "8", "9", "10"];

const errors = [];
const fetches = [];
let total = 0;
let checked = 0;

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

  const photoId = row.imagelink.replace("https://flic.kr/p/", "");

  const tableRow = {
    url: row.imagelink,
    meta: row.imagemeta
  };

  if (errors.includes(tableRow.url)) return true;

  return flickr.photos.getInfo({photo_id: photoId})
    .then(res => {
      const photo = res.body.photo;
      tableRow.author = photo.owner.realname || photo.owner.username;
      tableRow.license = parseInt(photo.license, 10);
      if (!validLicenses.includes(tableRow.license)) {
        return db.images.findOrCreate({where: {url: tableRow.url}, defaults: tableRow});
      }
      else {
        errors.push(tableRow.url);
        const e = `Bad License: ${tableRow.url} (${tableRow.license})`;
        if ("error" in row) {
          row.error = `license-${tableRow.license}`;
          row.save();
        }
        throw e;
      }
    })
    .then(([match, created]) => {

      const imageId = match.id;
      const splashPath = path.join(process.cwd(), `static/images/profile/splash/${imageId}.jpg`);
      const thumbPath = path.join(process.cwd(), `static/images/profile/thumb/${imageId}.jpg`);

      if (!created && shell.test("-e", splashPath) && shell.test("-e", thumbPath)) {
        return db.search.update({imageId}, {where: {id: row.id, dimension}})
          .then(printProgress);
      }
      else {

        console.log(`New Image: ${imageId}`);
        if (row.error) {
          row.error = "";
          row.save();
        }

        return db.search
          .update({imageId}, {where: {id: row.id, dimension}})
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
        console.log(`\n${status} - ${row.imagelink} - ${JSON.parse(text).message}`);
        if ("error" in row) {
          row.error = "removed";
          row.save();
        }
      }
      else {
        console.log(chalk.bold.red(`\n${err.fields ? `${err.fields.id} - ` : ""}${err}`));
      }
      printProgress();
    });

}

const doc = new GoogleSpreadsheet("1emEA-Tz4EBugidBRSQ5e4eq9AkQaEqAerTW0XtGL4AI");
doc.useServiceAccountAuth(creds, err => {
  if (err) {
    console.log(err);
    shell.exit(1);
  }
  else {
    doc.getInfo((err, info) => {
      if (err) {
        console.log(err);
        shell.exit(1);
      }
      else {
        const worksheet = info.worksheets.find(d => d.title.toLowerCase().includes(dimension.toLowerCase()));
        if (!worksheet) {
          console.log(`Unable to find sheet matching "${dimension}"`);
          shell.exit(1);
        }
        else {
          worksheet.getRows((err, rows) => {
            if (err) {
              console.log(err);
              shell.exit(1);
            }
            else {
              console.log(`Rows found: ${rows.length}`);
              rows
                .filter(row => row.imagelink)
                .forEach(row => {
                  fetches.push(throttle.add(fetchImage.bind(this, row)));
                });

              total = fetches.length;

              console.log(`Images found: ${total}`);

              Promise.all(fetches)
                .then(() => {
                  console.log("\n");
                  shell.exit(0);
                });

            }
          });
        }
      }
    });
  }
});
