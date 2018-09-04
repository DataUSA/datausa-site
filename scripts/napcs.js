#! /usr/bin/env node

const {Client} = require("mondrian-rest-client"),
      Sequelize = require("sequelize");

const d3Array = require("d3-array"),
      fs = require("fs");
const client = new Client("https://canon-api.datausa.io/");

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

function formatter(data, level) {
  const newData = data.reduce((arr, d) => {
    const obj = {};
    obj.id = `${d[`ID ${level}`]}`;
    obj.name = d[level];
    obj.display = d[level];
    obj.zvalue = d["Obligation Amount"];
    obj.dimension = "NAPCS";
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

  const cube = await client.cube("usa_spending");

  const level1 = await client.query(cube.query
    .drilldown("NAPCS", "NAPCS", "NAPCS Section")
    .cut("[Fiscal Year].[Fiscal Year].[Year].&[2017]")
    .measure("Obligation Amount"), "jsonrecords")
    .then(resp => resp.data.data)
    .then(data => formatter(data, "NAPCS Section"));

  const level2 = await client.query(cube.query
    .drilldown("NAPCS", "NAPCS", "NAPCS Group")
    .cut("[Fiscal Year].[Fiscal Year].[Year].&[2017]")
    .measure("Obligation Amount"), "jsonrecords")
    .then(resp => resp.data.data)
    .then(data => formatter(data, "NAPCS Group"));

  const level3 = await client.query(cube.query
    .drilldown("NAPCS", "NAPCS", "NAPCS Class")
    .cut("[Fiscal Year].[Fiscal Year].[Year].&[2017]")
    .measure("Obligation Amount"), "jsonrecords")
    .then(resp => resp.data.data)
    .then(data => formatter(data, "NAPCS Class"));

  const fullList = level1.concat(level2).concat(level3);

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

  // const json = JSON.stringify(fullList);
  // fs.writeFile("napcs.json", json, "utf8", () => {});

}

start();
