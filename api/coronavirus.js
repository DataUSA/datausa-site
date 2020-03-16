const axios = require("axios");
const {merge} = require("d3-array");
const {nest} = require("d3-collection");
const {titleCase} = require("d3plus-text");

const baseURL = "https://api.covid19api.com/country/us/status/";
const columns = ["confirmed", "recovered", "deaths"];
const levels = ["state", "county", "place"];

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/coronavirus/:level/", async(req, res) => {

    const {level} = req.params;

    const requests = columns.map(column => axios.get(`${baseURL}${column}`)
      .then(resp => resp.data));

    const payloads = await Promise.all(requests);

    let data = nest()
      .key(d => `${d.Province}_${d.Date}`)
      .entries(merge(payloads))
      .map(group => {
        const d = group.values[0];
        const obj = {
          Geography: d.Province,
          Level: !d.Province.match(/\, [A-Z]{2}$/) ? "state"
            : d.Province.match(/County\, [A-Z]{2}$/) ? "county"
              : "place",
          Date: d.Date.split("T")[0].replace(/\-/g, "/")
        };
        columns.forEach(column => {
          obj[titleCase(column)] = (group.values.find(d => d.Status === column) || {Cases: 0}).Cases;
        });
        return obj;
      });

    if (levels.includes(level)) data = data.filter(d => d.Level === level);

    data = merge(nest()
      .key(d => d.Geography)
      .entries(data)
      .map(group => {
        const index = group.values.findIndex(d => d.Confirmed > 0);
        return group.values.slice(index - 1);
      }));

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

    const formattedData = data
      .reduce((arr, d) => {
        const name = d.Geography;
        const id = lookup[name];
        if (id) {
          d["ID Geography"] = id;
          arr.push(d);
        }
        return arr;
      }, []);

    res.json({data: formattedData, timestamp: new Date()});

  });


};
