const axios = require("axios");
const {CANON_CONST_TESSERACT} = process.env;
const prefix = `${CANON_CONST_TESSERACT}${CANON_CONST_TESSERACT.slice(-1) === "/" ? "" : "/"}`;

module.exports = async function () {

  return axios.get(`${prefix}tesseract/data.jsonrecords?cube=university_cube&drilldowns=University,URL&locale=en&measures=Count`)
    .then(resp => resp.data)
    .then(data => {
      const result = data.data.reduce((acc, d) => {
        acc[d["University ID"]] = d.URL;
        return acc;
      }, {});
      return result;
    })
    .catch(err => {
      console.error(` 🌎  URL Cache Error: ${err.message}`);
      if (err.config) console.error(err.config.url);
    });

};
