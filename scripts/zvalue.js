#! /usr/bin/env node

const {Client} = require("mondrian-rest-client"),
      PromiseThrottle = require("promise-throttle"),
      Sequelize = require("sequelize"),
      d3Array = require("d3-array"),
      fs = require("fs"),
      readline = require("readline"),
      shell = require("shelljs");

// const throttle = new PromiseThrottle({
//   requestsPerSecond: 10,
//   promiseImplementation: Promise
// });

const {CANON_LOGICLAYER_CUBE} = process.env;
const client = new Client(CANON_LOGICLAYER_CUBE);

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

const model = db.import("../db/search.js");
db[model.name] = model;

/** */
function formatter(members, data, dimension, level) {

  const newData = members.reduce((arr, d) => {
    const obj = {};
    obj.id = `${d.key}`;
    obj.name = d.name;
    obj.display = d.caption;
    obj.zvalue = data[obj.id] || 0;
    obj.dimension = dimension;
    obj.hierarchy = level;
    // obj.stem = -1;
    arr.push(obj);
    return arr;
  }, []);

  return newData;

}

/** */
async function start() {

  const cubeName = "acs_yg_total_population_5";
  const measure = "Population";
  const dimension = "Geography";

  const cube = await client.cube(cubeName);

  // const levels = cube.dimensionsByName[dimension].hierarchies[0].levels.slice(1);
  const levels = cube.dimensionsByName[dimension].hierarchies
    .filter(d => ["Nation", "Place", "County", "State", "MSA", "PUMA"].includes(d.name));
  // .filter(d => ["State"].includes(d.name));

  let fullList = [];
  for (let i = 0; i < levels.length; i++) {

    const level = levels[i].levels[levels[i].levels.length - 1];
    console.log(`Getting members for ${level.name}...`);
    const members = await client.members(level);

    console.log(`Getting data for ${level.name}...`);
    const data = await client.query(cube.query
      .drilldown(dimension, level.name, level.name)
      .cut("[Year].[Year].[Year].&[2016]")
      .measure(measure), "jsonrecords")
      .then(resp => resp.data.data)
      .then(data => data.reduce((obj, d) => {
        if (d[measure]) obj[d[`ID ${level.name}`]] = d[measure];
        return obj;
      }, {}));

    console.log(`${Object.keys(data).length} data points for ${level.name}`);

    console.log(`Formatting data for ${level.name}...`);
    fullList = fullList.concat(formatter(members, data, dimension, level.name));

  }

  const st = d3Array.deviation(fullList, d => d.zvalue);
  const average = d3Array.median(fullList, d => d.zvalue);
  fullList.forEach(d => d.zvalue = (d.zvalue - average) / st);

  const keys = Object.keys(fullList[0]);

  // let csv = keys.join(",");
  // fullList.forEach(obj => {
  //   csv += `\n${keys.map(key => `\"${obj[key]}\"`)}`;
  // });

  // fs.writeFile("./scripts/search.csv", csv, "utf8", err => {
  //   if (err) console.log(err);
  //   else console.log("created scripts/search.csv");
  // });

  let txt = `INSERT INTO search (${keys.join(", ")})\nVALUES `;
  fullList.forEach((obj, i) => {
    txt += `${i ? "," : ""}\n(${keys.map(key => `\'${`${obj[key]}`.replace(/\'/g, "''")}\'`)})`;
  });
  txt += `\nON CONFLICT (name, id, dimension, hierarchy)\nDO UPDATE SET (${keys.join(", ")}) = (${keys.map(key => `EXCLUDED.${key}`).join(", ")});`;

  fs.writeFile("./scripts/zvalue-query.txt", txt, "utf8", err => {
    if (err) console.log(err);
    else console.log("created scripts/zvalue-query.txt");
  });

  // let created = 0;
  // let completed = 0;
  // const total = fullList.length;
  // console.log("");

  // const errors = [];

  /** */
  // function updateDB(obj) {
  //   const {id, dimension, hierarchy} = obj;
  //   return db.search
  //     .findOrCreate({
  //       where: {id, dimension, hierarchy},
  //       defaults: obj
  //     })
  //     .then(([row, newlyCreated]) => {
  //       readline.clearLine(process.stdout, 0);
  //       readline.cursorTo(process.stdout, 0);
  //       completed++;
  //       const percentage = completed / total;
  //       process.stdout.write(`${(percentage * 100).toFixed(0)}% (${completed} out of ${total})`);
  //       if (newlyCreated) {
  //         created++;
  //         return row;
  //       }
  //       else return row.update(obj);
  //     })
  //     .catch(() => {
  //       readline.clearLine(process.stdout, 0);
  //       readline.cursorTo(process.stdout, 0);
  //       completed++;
  //       const percentage = completed / total;
  //       process.stdout.write(`${(percentage * 100).toFixed(0)}% (${completed} out of ${total})`);
  //       errors.push(obj);
  //     });
  // }

  // const queries = fullList.map(obj => throttle.add(updateDB.bind(this, obj)));

  // await Promise.all(queries);
  // console.log(`\nUpdated ${total - created} existing rows.`);
  // console.log(`Created ${created} new rows.\n`);
  // errors.forEach(obj => {
  //   console.log(`Timeout Error: ${obj.id} ${obj.zvalue}`);
  // });

  // shell.exit(0);

}

start();
