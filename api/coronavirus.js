const PromiseThrottle = require("promise-throttle");
const axios = require("axios");
const {merge} = require("d3-array");
const {titleCase} = require("d3plus-text");

// const levels = ["state", "county", "place"];
const levels = ["state", "county"];

const beds = [{Geography: "Alabama", Total: 3.1}, {Geography: "Alaska", Total: 2.2}, {Geography: "Arizona", Total: 1.9}, {Geography: "Arkansas", Total: 3.2}, {Geography: "California", Total: 1.8}, {Geography: "Colorado", Total: 1.9}, {Geography: "Connecticut", Total: 2}, {Geography: "Delaware", Total: 2.2}, {Geography: "District of Columbia", Total: 4.4}, {Geography: "Florida", Total: 2.6}, {Geography: "Georgia", Total: 2.4}, {Geography: "Hawaii", Total: 1.9}, {Geography: "Idaho", Total: 1.9}, {Geography: "Illinois", Total: 2.5}, {Geography: "Indiana", Total: 2.7}, {Geography: "Iowa", Total: 3}, {Geography: "Kansas", Total: 3.3}, {Geography: "Kentucky", Total: 3.2}, {Geography: "Louisiana", Total: 3.3}, {Geography: "Maine", Total: 2.5}, {Geography: "Maryland", Total: 1.9}, {Geography: "Massachusetts", Total: 2.3}, {Geography: "Michigan", Total: 2.5}, {Geography: "Minnesota", Total: 2.5}, {Geography: "Mississippi", Total: 4}, {Geography: "Missouri", Total: 3.1}, {Geography: "Montana", Total: 3.3}, {Geography: "Nebraska", Total: 3.6}, {Geography: "Nevada", Total: 2.1}, {Geography: "New Hampshire", Total: 2.1}, {Geography: "New Jersey", Total: 2.4}, {Geography: "New Mexico", Total: 1.8}, {Geography: "New York", Total: 2.7}, {Geography: "North Carolina", Total: 2.1}, {Geography: "North Dakota", Total: 4.3}, {Geography: "Ohio", Total: 2.8}, {Geography: "Oklahoma", Total: 2.8}, {Geography: "Oregon", Total: 1.6}, {Geography: "Pennsylvania", Total: 2.9}, {Geography: "Rhode Island", Total: 2.1}, {Geography: "South Carolina", Total: 2.4}, {Geography: "South Dakota", Total: 4.8}, {Geography: "Tennessee", Total: 2.9}, {Geography: "Texas", Total: 2.3}, {Geography: "Utah", Total: 1.8}, {Geography: "Vermont", Total: 2.1}, {Geography: "Virginia", Total: 2.1}, {Geography: "Washington", Total: 1.7}, {Geography: "West Virginia", Total: 3.8}, {Geography: "Wisconsin", Total: 2.1}, {Geography: "Wyoming", Total: 3.5}];
const icu = [{Geography: "Washington", Total: 1236}, {Geography: "New York", Total: 2923}, {Geography: "Massachusetts", Total: 1273}, {Geography: "Colorado", Total: 881}, {Geography: "Vermont", Total: 88}, {Geography: "Rhode Island", Total: 235}, {Geography: "Louisiana", Total: 1195}, {Geography: "New Hampshire", Total: 197}, {Geography: "Maine", Total: 218}, {Geography: "Oregon", Total: 647}, {Geography: "Nebraska", Total: 478}, {Geography: "New Mexico", Total: 300}, {Geography: "Delaware", Total: 140}, {Geography: "California", Total: 6872}, {Geography: "New Jersey", Total: 1670}, {Geography: "Iowa", Total: 408}, {Geography: "South Dakota", Total: 153}, {Geography: "Hawaii", Total: 169}, {Geography: "Connecticut", Total: 594}, {Geography: "Montana", Total: 159}, {Geography: "District of Columbia", Total: 254}, {Geography: "Georgia", Total: 2175}, {Geography: "Pennsylvania", Total: 2293}, {Geography: "Minnesota", Total: 899}, {Geography: "Nevada", Total: 683}, {Geography: "Florida", Total: 4704}, {Geography: "Illinois", Total: 2667}, {Geography: "Virginia", Total: 1281}, {Geography: "Maryland", Total: 962}, {Geography: "South Carolina", Total: 936}, {Geography: "Wyoming", Total: 98}, {Geography: "Michigan", Total: 1874}, {Geography: "Wisconsin", Total: 1180}, {Geography: "Utah", Total: 482}, {Geography: "Arkansas", Total: 640}, {Geography: "Tennessee", Total: 1500}, {Geography: "Alabama", Total: 1062}, {Geography: "North Carolina", Total: 1680}, {Geography: "Idaho", Total: 285}, {Geography: "Ohio", Total: 2419}, {Geography: "Kentucky", Total: 1259}, {Geography: "Mississippi", Total: 618}, {Geography: "Indiana", Total: 1605}, {Geography: "Kansas", Total: 611}, {Geography: "Arizona", Total: 1286}, {Geography: "Texas", Total: 5517}, {Geography: "Oklahoma", Total: 812}, {Geography: "Alaska", Total: 106}, {Geography: "North Dakota", Total: 168}, {Geography: "Missouri", Total: 1603}, {Geography: "West Virginia", Total: 462}];

const throttle = new PromiseThrottle({
  requestsPerSecond: 10,
  promiseImplementation: Promise
});

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/covid19/old/:level/", async(req, res) => {

    const {level} = req.params;

    const lookup = await db.search
      .findAll({
        where: {
          dimension: "Geography",
          hierarchy: !levels.includes(level) ? levels.map(titleCase) : titleCase(level)
        }
      })
      .then(rows => rows.reduce((obj, d) => {
        obj[d.name] = d.id;
        return obj;
      }, {}));

    // ADD IDS FOR HOSPITAL BEDS
    const formattedBeds = beds
      .reduce((arr, d) => {
        const name = d.Geography;
        const id = lookup[name];
        if (id) {
          d["ID Geography"] = id;
          arr.push(d);
        }
        return arr;
      }, []);

    const formattedICU = icu
      .reduce((arr, d) => {
        const name = d.Geography;
        const id = lookup[name];
        if (id) {
          d["ID Geography"] = id;
          arr.push(d);
        }
        return arr;
      }, []);


    // POPULATION LOOKUP
    const requestedLevels = (level === "all" ? levels : [level]).map(titleCase);
    const origin = `${ req.protocol }://${ req.headers.host }`;
    const popRequests = requestedLevels.map(level => throttle.add(() => axios.get(`${origin}/api/data?measures=Population&drilldowns=${level}&year=latest`)
      .then(resp => resp.data.data)
      .then(data => data.map(d => {
        d["ID Geography"] = d[`ID ${level}`];
        return d;
      }))));

    const popPayload = await Promise.all(popRequests);

    const populationLookup = merge(popPayload)
      .reduce((obj, d) => {
        obj[d["ID Geography"]] = d.Population;
        return obj;
      }, {});

    // RETURN PAYLOAD
    res.json({
      beds: formattedBeds,
      icu: formattedICU,
      population: populationLookup
    });

  });


};
