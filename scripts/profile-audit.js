#! /usr/bin/env node

const Sequelize = require("sequelize"),
      d3Collection = require("d3-collection"),
      fs = require("fs"),
      path = require("path");

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

const folder = path.join(__dirname, "../db");
fs.readdirSync(folder)
  .filter(file => file && file.indexOf(".") !== 0)
  .forEach(file => {
    const fullPath = path.join(folder, file);
    const model = db.import(fullPath);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if ("associate" in db[modelName]) db[modelName].associate(db);
});

const dimension = process.argv.slice(2).join(" ");
let levels = [];
let printout = "";

/** */
function checklist(keys) {
  printout += `${levels.map(level => `\n#### ${level}\n${keys.map(k => ` - [ ] ${k}`).join("\n")}`).join("\n")}\n`;
}

db.profiles
  .findOne({
    where: {dimension},
    include: [{
      association: "sections", separate: true, order: [["ordering", "ASC"]], include: [{
        association: "topics", separate: true, order: [["ordering", "ASC"]]
      }]
    }]
  })
  .then(async profile => {

    levels = await db.search
      .findAll({attributes: ["hierarchy", [Sequelize.fn("count", Sequelize.col("id")), "count"]], group: ["hierarchy"], where: {dimension}, raw: true})
      .then(rows => rows
        .sort((a, b) => parseInt(a.count, 10) - parseInt(b.count, 10))
        .map(row => row.hierarchy)
      );

    printout += `# ${dimension} Profile Audit\n`;
    printout += "\n# Splash\n";
    checklist(["Title", "Stats"]);
    printout += "\n# About\n";
    checklist(["Paragraph Text", "Parent Nestings", "Visualization"]);

    profile.sections.sort((a, b) => a.order - b.order).forEach(section => {
      printout += `\n# ${section.title.replace(/<[^>]+>/g, "")}\n`;
      checklist(["Paragraph Text"]);
      d3Collection.nest()
        .key(d => d.slug)
        .entries(section.topics.sort((a, b) => a.order - b.order))
        .forEach(group => {
          printout += `\n## ${group.values[0].title.replace(/<[^>]+>/g, "")}\n`;
          checklist([
            "Title",
            "Stats",
            "Paragraph Text",
            "Visualization Data",
            "Visualization Tooltip",
            "View Data",
            "Add Data to Cart"
          ]);
        });
    });

    printout += "\n## Keep Exploring\n";
    checklist(["Links Available"]);

    fs.writeFile("./scripts/profile-audit.txt", printout, "utf8", err => {
      if (err) console.log(err);
      else console.log("created scripts/profile-audit.txt");
      process.exit(0);
    });

  });
