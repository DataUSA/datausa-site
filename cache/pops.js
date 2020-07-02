const {Client, MondrianDataSource} = require("@datawheel/olap-client");
const {CANON_LOGICLAYER_CUBE} = process.env;

module.exports = async function() {

  const datasource = new MondrianDataSource(CANON_LOGICLAYER_CUBE);
  const client = new Client(datasource);

  const levels = ["Nation", "State", "County", "MSA", "Place", "PUMA"];
  const popQueries = levels
    .map(level => client.getCube("acs_yg_total_population_5")
      .then(c => {
        const query = c.query
          .addDrilldown(level)
          .addMeasure("Population")
          .addCut("[Year].[Year]", ["2018"])
          .setFormat("jsonrecords");
        return client.execQuery(query);
      })
      .then(resp => resp.data.reduce((acc, d) => {
        acc[d[`ID ${level}`]] = d.Population;
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
