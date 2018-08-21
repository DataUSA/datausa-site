const {Client} = require("mondrian-rest-client");
const {CANON_LOGICLAYER_CUBE} = process.env;

module.exports = async function() {

  const client = new Client(CANON_LOGICLAYER_CUBE);

  const levels = ["Nation", "State", "County", "Msa", "Place", "Puma", "Tract"];
  const popQueries = levels
    .map(level => client.cube("acs_yg_total_population_1")
      .then(c => {
        const query = c.query
          .drilldown("Geography", level, level)
          .measure("Total Population")
          .cut("[Year].[Year].[Year].&[2016]");
        return client.query(query, "jsonrecords");
      })
      .then(resp => resp.data.data.reduce((acc, d) => {
        acc[d[`ID ${level}`]] = d["Total Population"];
        return acc;
      }, {}))
      .catch(err => {
        console.error(` 🌎  ${level} Pop Cache Error: ${err.message}`);
        if (err.config) console.error(err.config.url);
      }));

  const rawPops = await Promise.all(popQueries);
  const pops = rawPops.reduce((obj, d) => (obj = Object.assign(obj, d), obj), {});
  return pops;

};
