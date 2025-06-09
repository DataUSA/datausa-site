const axios = require("axios");

const {CANON_CONST_TESSERACT} = process.env;
const prefix = `${CANON_CONST_TESSERACT}${CANON_CONST_TESSERACT.slice(-1) === "/" ? "" : "/"}`;

module.exports = function () {

  return axios.get(`${prefix}tesseract/members?cube=dot_faf&level=SCTG2`)
    .then(resp => resp.data)
    .then(data => {
      return data.members.reduce((obj, d) => {
        obj[d.key] = {
          id: d.key,
          name: d.caption
        };
        return obj;
      }, {});
    })
    .catch(err => {
      console.error(` 🌎  SCTG Cache Error: ${err.message}`);
      if (err.config) console.error(err.config.url);
      return [];
    });
};
