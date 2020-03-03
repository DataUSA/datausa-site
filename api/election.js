const axios = require("axios");
const loadJSON = require("../utils/loadJSON");

const candidates = {
  senator: loadJSON("/static/data/senators.json")
};

const {CANON_LOGICLAYER_CUBE} = process.env;

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/civic/:type/:geo", async(req, res) => {

    const {type} = req.params;
    let {geo} = req.params;

    let retArray = candidates[type] || [];

    if (geo !== "01000US") {

      if (!geo.startsWith("040")) {
        const url = `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${geo}?targetLevels=state&overlapSize=true`;
        const states = await axios.get(url)
          .then(resp => resp.data)
          .then(resp => {
            if (resp.error) {
              console.error(`[geoservice error] ${url}`);
              console.error(resp.error);
              return [];
            }
            else {
              return resp || [];
            }
          })
          .then(arr => arr.sort((a, b) => b.overlap_size - a.overlap_size))
          .catch(() => []);
        geo = states[0].geoid;
      }

      const attr = await db.search.findOne({where: {dimension: "Geography", hierarchy: "State", id: geo}});
      retArray = retArray.filter(d => d.State === attr.name);

    }

    res.json(retArray);

  });


};
