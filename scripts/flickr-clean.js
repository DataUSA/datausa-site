#! /usr/bin/env node

const Sequelize = require("sequelize"),
      fs = require("fs"),
      path = require("path"),
      shell = require("shelljs");

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

async function run() {

  const pagesWithImages = await db.search.findAll({where: {imageId: {[Sequelize.Op.ne]: null}}});
  const usedImages = pagesWithImages.map(d => d.imageId);

  const unusedImagesRows = await db.image.findAll({where: {id: {[Sequelize.Op.notIn]: usedImages}}});
  const unusedImages = unusedImagesRows.map(d => d.id);

  console.log(`Deleting ${unusedImages.length} unused images...`);

  unusedImages.forEach(id => {
    const splashPath = path.join(process.cwd(), `static/images/profile/splash/${id}.jpg`);
    const thumbPath = path.join(process.cwd(), `static/images/profile/thumb/${id}.jpg`);
    if (shell.test("-e", splashPath)) fs.unlinkSync(splashPath);
    if (shell.test("-e", thumbPath)) fs.unlinkSync(thumbPath);
  });

  await db.image_content.destroy({where: {id: unusedImages}});
  await db.image.destroy({where: {id: unusedImages}});

  shell.exit(0);

}

run();
