const axios = require("axios");
const {CANON_CONST_TESSERACT} = process.env;

module.exports = async function() {

  return axios.get(`${CANON_CONST_TESSERACT}tesseract/data.jsonrecords?cube=BLS+Employment+-+Industry+Only&drilldowns=Industry&measures=NSA+Employees`)
    .then(resp => resp.data)
    .then(resp => resp.data.reduce((acc, d) => {
      acc[d["Industry ID"].slice(2).replace(/0+$/, "")] = d["Industry ID"];
      return acc;
    }, {}))
    .catch(err => {
      console.error(` 🌎  BLS Monthly Industry Cache Error: ${err.message}`);
      if (err.config) console.error(err.config.url);
    });

};
