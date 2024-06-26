#! /usr/bin/env node

const {Client, MondrianDataSource} = require("@datawheel/olap-client"),
      Sequelize = require("sequelize"),
      d3Array = require("d3-array"),
      fs = require("fs"),
      {strip} = require("d3plus-text");

const dimension = process.argv.slice(2).join(" ");

const stems = ["400801", "110104", "140501", "140901", "151001", "260909", "261101", "261302", "270301", "400401", "150303", "512005", "279999", "110101", "110102", "111099", "130501", "140101", "141801", "150699", "110803", "151199", "110804", "159999", "260399", "260807", "270103", "301801", "301701", "400599", "410399", "450301", "151299", "260205", "260406", "269999", "110899", "149999", "400299", "150306", "150703", "299999", "290403", "400101", "400699", "410301", "450603", "151399", "142501", "261502", "511401", "110299", "151599", "260903", "409", "260904", "261003", "261001", "110201", "110103", "110202", "110203", "110301", "110401", "110501", "110901", "111001", "141301", "111003", "111004", "111005", "111006", "261501", "130601", "140102", "140701", "261199", "130603", "140702", "140801", "261599", "270306", "140802", "140804", "140999", "270399", "270503", "141901", "140803", "140805", "140902", "140903", "141004", "270599", "141201", "290307", "141401", "142101", "150799", "142001", "142301", "142701", "142201", "143201", "143801", "143901", "144001", "144501", "150403", "143401", "150404", "143501", "143601", "143701", "144301", "144401", "290301", "150000", "150101", "150201", "150304", "150305", "150399", "150401", "150405", "150406", "150501", "150503", "290407", "290409", "150507", "150508", "150607", "150611", "150613", "150614", "150615", "150701", "150702", "150616", "150801", "150803", "150805", "150704", "150899", "150903", "150999", "151102", "151103", "151503", "151202", "151203", "151204", "151301", "151302", "151303", "400404", "151306", "151401", "151501", "151601", "260203", "260204", "260206", "260207", "260307", "260209", "260210", "260301", "140899", "260305", "260401", "260404", "260407", "260499", "260502", "260503", "260508", "260701", "260308", "260504", "422705", "260505", "260506", "260507", "260708", "260801", "260702", "260707", "260806", "260901", "260709", "260802", "260803", "260804", "260805", "260902", "260910", "260905", "260907", "400502", "260908", "261309", "260912", "261002", "400402", "260911", "261303", "261004", "400602", "21", "261005", "261006", "261102", "261103", "261201", "261301", "261007", "261304", "303301", "261305", "261306", "15", "261307", "261401", "401002", "261308", "261310", "261503", "261504", "270104", "270303", "270305", "280501", "280502", "290202", "422704", "270105", "270199", "270304", "290201", "290203", "290207", "290205", "290302", "290303", "290304", "290305", "290306", "290406", "290402", "290404", "290405", "400899", "290408", "300101", "300601", "300801", "303201", "301901", "303101", "302501", "303001", "400201", "400202", "400203", "400403", "400601", "400503", "400504", "400506", "400507", "400508", "400501", "400509", "400510", "400511", "400603", "400605", "400607", "400604", "400606", "400804", "400805", "400806", "401001", "400802", "400807", "400808", "401099", "409999", "410303", "422702", "422707", "410000", "410101", "410204", "410205", "410299", "422701", "422703", "422706", "422708", "422709", "422799", "430106", "140601", "430116", "450702", "511002", "511005", "512003", "512004", "512006", "512007", "512010", "512202", "512503", "512502", "512205", "512504", "512505", "512506", "521301", "521302", "521304", "110199", "140401", "512511", "512009", "512510", "110701", "521399", "142401", "144101", "140301", "260208", "141001", "141003", "150612", "150901", "151304", "260599", "261104", "260999", "141101", "270101", "280505", "290401", "301001", "143301", "302701", "400809", "270501", "270502", "290499", "400499", "400810", "150505", "151502", "290299", "260202", "260403", "150599", "151201", "260799", "270102", "4002", "512706", "29", "1110", "1102", "1409", "1108", "1407", "1408", "1511", "1503", "1504", "1505", "1506", "1507", "1508", "2610", "1509", "1512", "2608", "2705", "2611", "2603", "2604", "2605", "2607", "2609", "2904", "2703", "2615", "2903", "2701", "2902", "4008", "4102", "4103", "4227", "3015", "4701", "290399", "5213", "140799", "4004", "4006", "4005", "2602", "2613", "100304", "110801", "110802", "111002", "140201", "141099", "144201", "150499", "150506", "151305", "260299", "261399", "290204", "290206", "490101", "520407", "1002", "470110", "470616", "470609", "480510", "40902", "40901", "100105", "100201", "100202", "100203", "470199", "430204", "430201", "460415", "470103", "470106", "470302", "470603", "470604", "470605", "470606", "470607", "470608", "470610", "470409", "470612", "470614", "480501", "480503", "480506", "480507", "480508", "419999", "500502", "510717", "510906", "540104", "142801", "260102", "2101", "261099", "510603", "40", "1410", "1513", "510707", "1001", "470104", "40999", "11099", "520302", "30511", "1101", "110", "10106", "100299", "1515", "26", "27", "301501", "511001", "512312", "210101", "470613", "4010", "260899", "11002", "30509", "1099", "131309", "470303", "470105", "470611", "470615", "470617", "500913", "109999", "260101"];

const stateList = {
  "Arizona": "AZ",
  "Alabama": "AL",
  "Alaska": "AK",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY"
};

const dataLookup = {
  "Geography": {
    table: "acs_yg_total_population_5",
    year: "2017",
    measure: "Population"
  },
  "PUMS Industry": {
    table: "pums_5",
    year: "2017",
    measure: "Total Population"
  },
  "PUMS Occupation": {
    table: "pums_5",
    year: "2017",
    measure: "Total Population"
  },
  "University": {
    table: "ipeds_completions",
    year: "2017",
    measure: "Completions"
  },
  "CIP": {
    table: "ipeds_completions",
    year: "2017",
    measure: "Completions"
  },
  "NAPCS": {
    table: "usa_spending",
    year: "2017",
    yearName: "Fiscal Year",
    measure: "Obligation Amount"
  }
};

const {CANON_LOGICLAYER_CUBE} = process.env;
const datasource = new MondrianDataSource(CANON_LOGICLAYER_CUBE);
const client = new Client(datasource);

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
    obj.stem = dimension === "CIP" && stems.includes(d.key) ? 1 : 0;
    arr.push(obj);
    return arr;
  }, []);

  return newData;

}

/** */
async function start() {

  const {table, year, yearName = "Year", measure} = dataLookup[dimension];

  console.log(dimension);

  const cube = await client.getCube(table);

  const levels = dimension === "Geography"
    ? cube.dimensionsByName[dimension].hierarchies
      .filter(d => ["Nation", "Place", "County", "State", "MSA", "PUMA"].includes(d.name))
    : cube.dimensionsByName[dimension].hierarchies[0].levels.filter(d => d.name !== "(All)");

  console.log(levels.map(d => d.name));
  let fullList = [];
  for (let i = 0; i < levels.length; i++) {

    let level = levels[i];
    if (dimension === "Geography") level = level.levels[levels[i].levels.length - 1];
    console.log(`Getting members for ${level.name}...`);
    const members = await client.members(level);

    console.log(`Getting data for ${level.name}...`);
    const data = await client.execQuery(
        cube.query
          .addDrilldown(level.name)
          .addCut(`[${yearName}].[${yearName}]`, [`${year}`])
          .addMeasure(measure)
          .setFormat("jsonrecords")
      )
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
  fullList = fullList.sort((a, b) => b.zvalue - a.zvalue);

  const currentDB = await db.search.findAll({where: {dimension}, raw: true})
    .reduce((obj, d) => {
      if (d.slug && d.slug.length) obj[`${d.id} ${d.hierarchy}`] = {slug: d.slug, name: d.name};
      return obj;
    }, {});

  const slugs = [];
  fullList.forEach(d => {

    d.slug = currentDB[`${d.id} ${d.hierarchy}`]
      ? currentDB[`${d.id} ${d.hierarchy}`].slug
      : strip(d.name).replace(/-{2,}/g, "-").toLowerCase();

    if (slugs.includes(d.slug)) {
      if (d.dimension === "Geography") {
        const state = currentDB[`04000US${d.id.slice(7, 9)} State`];
        if (state && stateList[state.name]) {
          d.slug += `-${stateList[state.name].toLowerCase()}`;
        }
        if (slugs.includes(d.slug)) {
          d.slug += `-${d.hierarchy.toLowerCase()}`;
        }
      }
      else if (d.dimension === "CIP") {
        d.slug += `-${d.hierarchy.slice(3)}`;
      }
      else if (d.dimension === "PUMS Industry") {
        d.slug += `-${d.hierarchy.slice(9).toLowerCase()}`;
      }
      else if (d.dimension === "PUMS Industry") {
        d.slug += `-${d.hierarchy.replace(" Occupation", "").replace(" ", "-").toLowerCase()}`;
      }
      else if (d.dimension === "NAPCS") {
        d.slug += `-${d.hierarchy.slice(6).toLowerCase()}`;
      }
    }

    if (slugs.includes(d.slug)) d.slug += `-${d.id}`;
    slugs.push(d.slug);

  });

  const keys = Object.keys(fullList[0]);

  let txt = `INSERT INTO search (${keys.join(", ")})\nVALUES `;
  fullList.forEach((obj, i) => {
    txt += `${i ? "," : ""}\n(${keys.map(key => `\'${`${obj[key]}`.replace(/\'/g, "''")}\'`)})`;
  });
  txt += `\nON CONFLICT (id, dimension, hierarchy)\nDO UPDATE SET (${keys.join(", ")}) = (${keys.map(key => `EXCLUDED.${key}`).join(", ")});`;

  fs.writeFile("./scripts/zvalue-query.txt", txt, "utf8", err => {
    if (err) console.log(err);
    else console.log("created scripts/zvalue-query.txt");
    process.exit(0);
  });

}

start();
