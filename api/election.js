const axios = require("axios");
const loadJSON = require("../utils/loadJSON");

const candidates = {
  senator: loadJSON("/static/data/senators.json"),
  representative: loadJSON("/static/data/representatives.json")
};

const {CANON_LOGICLAYER_CUBE} = process.env;

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/civic/:type/:geo", async(req, res) => {

    const {type} = req.params;
    const {geo} = req.params;
    let districts = [], state = geo;

    let retArray = candidates[type] || [];

    if (geo !== "01000US") {

      if (!geo.startsWith("040")) {
        const targetLevels = type === "senator" ? "state" : "state,congressionaldistrict";
        const url = `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${geo}?targetLevels=${targetLevels}&overlapSize=true`;
        const parents = await axios.get(url)
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
        const states = parents.filter(d => d.level === "state");
        if (states.length) state = parents.filter(d => d.level === "state")[0].geoid;
        districts = parents.filter(d => d.level === "congressionaldistrict");
        if (districts.length) {
          districts = districts.map(d => d.name.match(/([0-9]{1,2})/)[0]);
        }
      }

      if (state.startsWith("040")) {
        const attr = await db.search.findOne({where: {dimension: "Geography", hierarchy: "State", id: state}});
        retArray = retArray.filter(d => d.State === attr.name);
      }
      if (districts.length) {
        retArray = retArray.filter(d => districts.includes(d.District));
      }

    }

    res.json(retArray);

  });


};
