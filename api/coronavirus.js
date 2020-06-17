const PromiseThrottle = require("promise-throttle");
const axios = require("axios");
const {merge} = require("d3-array");
const {titleCase} = require("d3plus-text");

// const levels = ["state", "county", "place"];
const levels = ["state", "county"];

const beds = [{Geography: "Alabama", Total: 3.1}, {Geography: "Alaska", Total: 2.2}, {Geography: "Arizona", Total: 1.9}, {Geography: "Arkansas", Total: 3.2}, {Geography: "California", Total: 1.8}, {Geography: "Colorado", Total: 1.9}, {Geography: "Connecticut", Total: 2}, {Geography: "Delaware", Total: 2.2}, {Geography: "District of Columbia", Total: 4.4}, {Geography: "Florida", Total: 2.6}, {Geography: "Georgia", Total: 2.4}, {Geography: "Hawaii", Total: 1.9}, {Geography: "Idaho", Total: 1.9}, {Geography: "Illinois", Total: 2.5}, {Geography: "Indiana", Total: 2.7}, {Geography: "Iowa", Total: 3}, {Geography: "Kansas", Total: 3.3}, {Geography: "Kentucky", Total: 3.2}, {Geography: "Louisiana", Total: 3.3}, {Geography: "Maine", Total: 2.5}, {Geography: "Maryland", Total: 1.9}, {Geography: "Massachusetts", Total: 2.3}, {Geography: "Michigan", Total: 2.5}, {Geography: "Minnesota", Total: 2.5}, {Geography: "Mississippi", Total: 4}, {Geography: "Missouri", Total: 3.1}, {Geography: "Montana", Total: 3.3}, {Geography: "Nebraska", Total: 3.6}, {Geography: "Nevada", Total: 2.1}, {Geography: "New Hampshire", Total: 2.1}, {Geography: "New Jersey", Total: 2.4}, {Geography: "New Mexico", Total: 1.8}, {Geography: "New York", Total: 2.7}, {Geography: "North Carolina", Total: 2.1}, {Geography: "North Dakota", Total: 4.3}, {Geography: "Ohio", Total: 2.8}, {Geography: "Oklahoma", Total: 2.8}, {Geography: "Oregon", Total: 1.6}, {Geography: "Pennsylvania", Total: 2.9}, {Geography: "Rhode Island", Total: 2.1}, {Geography: "South Carolina", Total: 2.4}, {Geography: "South Dakota", Total: 4.8}, {Geography: "Tennessee", Total: 2.9}, {Geography: "Texas", Total: 2.3}, {Geography: "Utah", Total: 1.8}, {Geography: "Vermont", Total: 2.1}, {Geography: "Virginia", Total: 2.1}, {Geography: "Washington", Total: 1.7}, {Geography: "West Virginia", Total: 3.8}, {Geography: "Wisconsin", Total: 2.1}, {Geography: "Wyoming", Total: 3.5}];
// const icu = [{Geography: "Alaska", Total: 217, TotalPC: 0.29}, {Geography: "Alabama", Total: 1525, TotalPC: 0.31}, {Geography: "Arkansas", Total: 1387, TotalPC: 0.46}, {Geography: "Arizona", Total: 2266, TotalPC: 0.31}, {Geography: "California", Total: 8864, TotalPC: 0.22}, {Geography: "Colorado", Total: 1816, TotalPC: 0.31}, {Geography: "Connecticut", Total: 810, TotalPC: 0.22}, {Geography: "District of Columbia", Total: 456, TotalPC: 0.64}, {Geography: "Delaware", Total: 217, TotalPC: 0.22}, {Geography: "Florida", Total: 6837, TotalPC: 0.32}, {Geography: "Georgia", Total: 2261, TotalPC: 0.21}, {Geography: "Hawaii", Total: 245, TotalPC: 0.17}, {Geography: "Iowa", Total: 923, TotalPC: 0.29}, {Geography: "Idaho", Total: 537, TotalPC: 0.3}, {Geography: "Illinois", Total: 3954, TotalPC: 0.31}, {Geography: "Indiana", Total: 2336, TotalPC: 0.34}, {Geography: "Kansas", Total: 1047, TotalPC: 0.35}, {Geography: "Kentucky", Total: 1541, TotalPC: 0.34}, {Geography: "Louisiana", Total: 1710, TotalPC: 0.36}, {Geography: "Massachusetts", Total: 1418, TotalPC: 0.2}, {Geography: "Maryland", Total: 1683, TotalPC: 0.27}, {Geography: "Maine", Total: 327, TotalPC: 0.24}, {Geography: "Michigan", Total: 3075, TotalPC: 0.3}, {Geography: "Minnesota", Total: 1628, TotalPC: 0.29}, {Geography: "Missouri", Total: 2843, TotalPC: 0.46}, {Geography: "Mississippi", Total: 1191, TotalPC: 0.39}, {Geography: "Montana", Total: 362, TotalPC: 0.34}, {Geography: "North Carolina", Total: 2547, TotalPC: 0.24}, {Geography: "North Dakota", Total: 343, TotalPC: 0.45}, {Geography: "Nebraska", Total: 903, TotalPC: 0.46}, {Geography: "New Hampshire", Total: 341, TotalPC: 0.25}, {Geography: "New Jersey", Total: 2087, TotalPC: 0.23}, {Geography: "New Mexico", Total: 459, TotalPC: 0.21}, {Geography: "Nevada", Total: 466, TotalPC: 0.15}, {Geography: "New York", Total: 5245, TotalPC: 0.26}, {Geography: "Ohio", Total: 4449, TotalPC: 0.38}, {Geography: "Oklahoma", Total: 1558, TotalPC: 0.39}, {Geography: "Oregon", Total: 1059, TotalPC: 0.25}, {Geography: "Pennsylvania", Total: 4556, TotalPC: 0.35}, {Geography: "Puerto Rico", Total: 111, TotalPC: 0.03}, {Geography: "Rhode Island", Total: 142, TotalPC: 0.13}, {Geography: "South Carolina", Total: 1728, TotalPC: 0.33}, {Geography: "South Dakota", Total: 325, TotalPC: 0.36}, {Geography: "Tennessee", Total: 2011, TotalPC: 0.29}, {Geography: "Texas", Total: 10753, TotalPC: 0.37}, {Geography: "Utah", Total: 738, TotalPC: 0.23}, {Geography: "Virginia", Total: 1769, TotalPC: 0.2}, {Geography: "Vermont", Total: 110, TotalPC: 0.17}, {Geography: "Washington", Total: 1759, TotalPC: 0.23}, {Geography: "Wisconsin", Total: 1808, TotalPC: 0.31}, {Geography: "West Virginia", Total: 696, TotalPC: 0.38}, {Geography: "Wyoming", Total: 84, TotalPC: 0.14}];
const icu = [{Geography: "Alaska", Total: 217, TotalPC: 0.29}, {Geography: "Alabama", Total: 1525, TotalPC: 0.31}, {Geography: "Arkansas", Total: 1387, TotalPC: 0.46}, {Geography: "Arizona", Total: 2266, TotalPC: 0.31}, {Geography: "California", Total: 8864, TotalPC: 0.22}, {Geography: "Colorado", Total: 1816, TotalPC: 0.31}, {Geography: "Connecticut", Total: 810, TotalPC: 0.22}, {Geography: "Delaware", Total: 217, TotalPC: 0.22}, {Geography: "Florida", Total: 6837, TotalPC: 0.32}, {Geography: "Georgia", Total: 2261, TotalPC: 0.21}, {Geography: "Hawaii", Total: 245, TotalPC: 0.17}, {Geography: "Iowa", Total: 923, TotalPC: 0.29}, {Geography: "Idaho", Total: 537, TotalPC: 0.3}, {Geography: "Illinois", Total: 3954, TotalPC: 0.31}, {Geography: "Indiana", Total: 2336, TotalPC: 0.34}, {Geography: "Kansas", Total: 1047, TotalPC: 0.35}, {Geography: "Kentucky", Total: 1541, TotalPC: 0.34}, {Geography: "Louisiana", Total: 1710, TotalPC: 0.36}, {Geography: "Massachusetts", Total: 1418, TotalPC: 0.2}, {Geography: "Maryland", Total: 1683, TotalPC: 0.27}, {Geography: "Maine", Total: 327, TotalPC: 0.24}, {Geography: "Michigan", Total: 3075, TotalPC: 0.3}, {Geography: "Minnesota", Total: 1628, TotalPC: 0.29}, {Geography: "Missouri", Total: 2843, TotalPC: 0.46}, {Geography: "Mississippi", Total: 1191, TotalPC: 0.39}, {Geography: "Montana", Total: 362, TotalPC: 0.34}, {Geography: "North Carolina", Total: 2547, TotalPC: 0.24}, {Geography: "North Dakota", Total: 343, TotalPC: 0.45}, {Geography: "Nebraska", Total: 903, TotalPC: 0.46}, {Geography: "New Hampshire", Total: 341, TotalPC: 0.25}, {Geography: "New Jersey", Total: 2087, TotalPC: 0.23}, {Geography: "New Mexico", Total: 459, TotalPC: 0.21}, {Geography: "Nevada", Total: 466, TotalPC: 0.15}, {Geography: "New York", Total: 5245, TotalPC: 0.26}, {Geography: "Ohio", Total: 4449, TotalPC: 0.38}, {Geography: "Oklahoma", Total: 1558, TotalPC: 0.39}, {Geography: "Oregon", Total: 1059, TotalPC: 0.25}, {Geography: "Pennsylvania", Total: 4556, TotalPC: 0.35}, {Geography: "Puerto Rico", Total: 111, TotalPC: 0.03}, {Geography: "Rhode Island", Total: 142, TotalPC: 0.13}, {Geography: "South Carolina", Total: 1728, TotalPC: 0.33}, {Geography: "South Dakota", Total: 325, TotalPC: 0.36}, {Geography: "Tennessee", Total: 2011, TotalPC: 0.29}, {Geography: "Texas", Total: 10753, TotalPC: 0.37}, {Geography: "Utah", Total: 738, TotalPC: 0.23}, {Geography: "Virginia", Total: 1769, TotalPC: 0.2}, {Geography: "Vermont", Total: 110, TotalPC: 0.17}, {Geography: "Washington", Total: 1759, TotalPC: 0.23}, {Geography: "Wisconsin", Total: 1808, TotalPC: 0.31}, {Geography: "West Virginia", Total: 696, TotalPC: 0.38}, {Geography: "Wyoming", Total: 84, TotalPC: 0.14}];

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
      }, {
        "04000US66": 165768, // Guam
        "04000US69": 56882,  // Northern Mariana Islands
        "04000US78": 106977  // Virgin Islands
      });

    // RETURN PAYLOAD
    res.json({
      beds: formattedBeds,
      icu: formattedICU,
      population: populationLookup
    });

  });


};
