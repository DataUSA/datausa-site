const axios = require("axios");
const {CANON_CONST_TESSERACT} = process.env;
const prefix = `${CANON_CONST_TESSERACT}${CANON_CONST_TESSERACT.slice(-1) === "/" ? "" : "/"}`;

module.exports = async function() {

  const levels = ["Nation", "State", "County", "MSA", "Place", "PUMA", "Congressional District"];
  const popQueries = levels.map(level => {
    const url = `${prefix}tesseract/data.jsonrecords?cube=acs_yg_total_population_5&drilldowns=${encodeURIComponent(level)}&locale=en&measures=Population&time=Year.latest`;
    return axios.get(url)
      .then(resp => resp.data.data.reduce((acc, d) => {
        acc[d[`${level} ID`]] = d.Population;
        return acc;
      }, {}))
      .catch(err => {
        console.error(` 🌎  ${level} Pop Cache Error: ${err.message}`);
        if (err.config) console.error(err.config.url);
      });
  });

  const rawPops = await Promise.all(popQueries);
  const pops = rawPops.reduce((obj, d) => (obj = Object.assign(obj, d), obj), {});
  return pops;

};
