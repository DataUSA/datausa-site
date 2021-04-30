const axios = require("axios");
const {CANON_LOGICLAYER_CUBE} = process.env;
const prefix = `${CANON_LOGICLAYER_CUBE}${CANON_LOGICLAYER_CUBE.slice(-1) === "/" ? "" : "/"}`;

module.exports = async function() {

  return axios.get(`${prefix}cubes/ipeds_completions/dimensions/University/hierarchies/University/levels/University/members?member_properties[]=URL`)
    .then(resp => resp.data)
    .then(data => data.members.reduce((acc, d) => {
      acc[d.key] = d.properties.URL;
      return acc;
    }, {}))
    .catch(err => {
      console.error(` 🌎  URL Cache Error: ${err.message}`);
      if (err.config) console.error(err.config.url);
    });

};
