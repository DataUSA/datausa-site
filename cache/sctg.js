const axios = require("axios");

const {CANON_LOGICLAYER_CUBE} = process.env;
const prefix = `${CANON_LOGICLAYER_CUBE}${CANON_LOGICLAYER_CUBE.slice(-1) === "/" ? "" : "/"}`;

module.exports = function() {

  return axios.get(`${prefix}cubes/dot_faf/dimensions/SCTG/`)
    .then(resp => resp.data)
    .then(data => {
      const {members} = data.hierarchies[0].levels[1];
      return members.reduce((obj, d) => {
        obj[d.key] = {
          id: d.key,
          name: d.caption || d.name
        };
        return obj;
      }, {});
    });

};
