#! /usr/bin/env node

const Flickr = require("flickr-sdk"),
      PromiseThrottle = require("promise-throttle"),
      Sequelize = require("sequelize"),
      axios = require("axios"),
      chalk = require("chalk"),
      csvParser = require("d3-dsv").csvParse,
      fs = require("fs"),
      path = require("path"),
      sharp = require("sharp"),
      shell = require("shelljs");

// Query to generate CSV for google sheet
//
// select s.id, s.zvalue, s.display as name, i.url as image_link, i.meta as image_meta
// from search as s left join images as i on s."imageId" = i.id
// where s.dimension = 'NAPCS'
// order by s.zvalue desc

const throttle = new PromiseThrottle({
  requestsPerSecond: 0.5,
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

const dimension = process.argv[2];
const filename = process.argv[3];
const contents = shell.cat(filename);
const rows = csvParser(contents);

const flickr = new Flickr(process.env.FLICKR_API_KEY);
const validLicenses = ["4", "5", "7", "8", "9", "10"];

const errors = [];
const fetches = [];

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
        return db.images.findOrCreate({where: {url: tableRow.url}, defaults: tableRow});
      }
      else {
        errors.push(tableRow.url);
        const e = `Bad License: ${tableRow.url} (${tableRow.license})`;
        throw e;
      }
    })
    .then(([match, created]) => {

      const imageId = match.id;
      const splashPath = path.join(process.cwd(), `static/images/profile/splash/${imageId}.jpg`);
      const thumbPath = path.join(process.cwd(), `static/images/profile/thumb/${imageId}.jpg`);

      if (!created && shell.test("-e", splashPath) && shell.test("-e", thumbPath)) {
        return db.search.update({imageId}, {where: {id: row.id, dimension}});
      }
      else {

        console.log(`New Image: ${imageId}`);

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
          ]));

      }
    })
    .catch(err => {
      if (err.response) {
        const {status, text} = err.response;
        console.log(`${status} - ${row.image_link} - ${JSON.parse(text).message}`);
      }
      else {
        console.log(chalk.bold.red(err));
      }
    });

}

rows
  .filter(row => row.image_link)
  .forEach(row => {
    fetches.push(throttle.add(fetchImage.bind(this, row)));
  });

Promise.all(fetches)
  .then(() => {
    shell.exit(0);
  });
