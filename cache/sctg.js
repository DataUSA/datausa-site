const axios = require("axios");

const {CANON_LOGICLAYER_CUBE} = process.env;

module.exports = function() {

  return axios.get(`${CANON_LOGICLAYER_CUBE}/cubes/dot_faf/dimensions/SCTG/`)
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
