const axios = require("axios");
const {CANON_LOGICLAYER_CUBE} = process.env;

module.exports = async function() {

  return axios.get(`${CANON_LOGICLAYER_CUBE}/cubes/ipeds_completions/dimensions/University/hierarchies/University/levels/University/members?member_properties[]=OPEID6`)
    .then(resp => resp.data)
    .then(data => data.members.reduce((acc, d) => {
      acc[d.key] = d.properties.OPEID6;
      return acc;
    }, {}))
    .catch(err => {
      console.error(` 🌎  OPEID6 Cache Error: ${err.message}`);
      if (err.config) console.error(err.config.url);
    });

};
