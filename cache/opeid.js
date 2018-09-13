const {Client} = require("mondrian-rest-client");
const {CANON_LOGICLAYER_CUBE} = process.env;

module.exports = async function() {

  const client = new Client(CANON_LOGICLAYER_CUBE);

  return client.cube("ipeds_completions")
    .then(c => {
      const query = c.query
        .drilldown("University", "University", "University")
        .measure("Completions")
        .property("University", "University", "OPEID6");
      return client.query(query, "jsonrecords");
    })
    .then(resp => resp.data.data.reduce((acc, d) => {
      acc[d["ID University"]] = d.OPEID6;
      return acc;
    }, {}))
    .catch(err => {
      console.error(` 🌎  OPEID6 Cache Error: ${err.message}`);
      if (err.config) console.error(err.config.url);
    });

};
