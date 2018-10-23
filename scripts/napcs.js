#! /usr/bin/env node

const {Client} = require("mondrian-rest-client"),
      Sequelize = require("sequelize"),
      d3Array = require("d3-array"),
      shell = require("shelljs");

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

function formatter(members, data, dimension, level) {

  const newData = members.reduce((arr, d) => {
    const obj = {};
    obj.id = `${d.key}`;
    obj.name = d.name;
    obj.display = d.caption;
    obj.zvalue = data[obj.id] || 0;
    obj.dimension = dimension;
    obj.hierarchy = level;
    obj.stem = -1;
    arr.push(obj);
    return arr;
  }, []);
  const st = d3Array.deviation(newData, d => d.zvalue);
  const average = d3Array.median(newData, d => d.zvalue);
  newData.forEach(d => d.zvalue = (d.zvalue - average) / st);
  return newData;
}

async function start() {

  const cubeName = "usa_spending";
  const measure = "Obligation Amount";
  const dimension = "NAPCS";

  const cube = await client.cube(cubeName);

  const levels = cube.dimensionsByName[dimension].hierarchies[0].levels.slice(1);

  let fullList = [];
  for (let i = 0; i < levels.length; i++) {

    const level = levels[i];
    const members = await client.members(level);

    const data = await client.query(cube.query
      .drilldown(dimension, dimension, level.name)
      .measure(measure), "jsonrecords")
      .then(resp => resp.data.data)
      .then(data => data.reduce((obj, d) => {
        obj[d[`ID ${level.name}`]] = d[measure];
        return obj;
      }, {}));

    fullList = fullList.concat(formatter(members, data, dimension, level.name));

  }

  for (let i = 0; i < fullList.length; i++) {
    const obj = fullList[i];
    const {id, dimension, hierarchy} = obj;
    const [row, created] = await db.search.findOrCreate({
      where: {id, dimension, hierarchy},
      defaults: obj
    });
    if (created) console.log(`Created: ${row.id} ${row.display}`);
    else {
      await row.updateAttributes(obj);
      console.log(`Updated: ${row.id} ${row.display}`);
    }
  }

  shell.exit(0);

}

start();
