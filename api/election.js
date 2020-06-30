const axios = require("axios");
const loadJSON = require("../utils/loadJSON");

const candidates = {
  senator: loadJSON("/static/data/senators.json"),
  representative: loadJSON("/static/data/representatives.json")
};

const {CANON_LOGICLAYER_CUBE} = process.env;

module.exports = function(app) {

  const {db} = app.settings

  app.get("/api/civic/:type/:geo", async(req, res) => {

    const {type} = req.params;
    const {geo} = req.params;
    let districts = [], states = [];

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
        states = parents
          .filter(d => d.level === "state")
          .sort((a, b) => b.overlap_size - a.overlap_size)
          .map(d => d.geoid);
        districts = parents.filter(d => d.level === "congressionaldistrict")
          .map(d => {
            const district = +d.geoid.slice(-2);
            return district ? `${district}` : "at-large";
          });

      }
      else {
        states = [geo];
      }

      if (states.length) {
        const attrs = await db.search.findAll({where: {dimension: "Geography", hierarchy: "State", id: states}});
        const names = attrs.map(d => d.name);
        retArray = retArray.filter(d => names.includes(d.State));
        retArray.forEach(r => {
          r["ID State"] = attrs.find(d => d.name === r.State).id;
        });
        retArray = retArray.sort((a, b) => states.indexOf(a["ID State"]) - states.indexOf(b["ID State"]));
      }
      if (districts.length) {
        retArray = retArray.filter(d => districts.includes(d.District));
      }

    }

    res.json(retArray);

  });


};
