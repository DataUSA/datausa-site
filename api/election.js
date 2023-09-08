const axios = require("axios");
const loadJSON = require("../utils/loadJSON");

const candidates = {
  senator: loadJSON("/static/data/senators.json"),
  representative: loadJSON("/static/data/representatives.json")
};

const {CANON_GEOSERVICE_API} = process.env;

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
        const url = `${CANON_GEOSERVICE_API}/api/relations/intersects/${geo}?targetLevels=${targetLevels}&overlapSize=true`;
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
          .then(arr => arr.filter(d => d.overlap_size > 0.00001).sort((a, b) => b.overlap_size - a.overlap_size))
          .catch(() => []);
        states = parents
          .filter(d => d.level === "state")
          .sort((a, b) => b.overlap_size - a.overlap_size);

        if (states.length > 1 && !geo.startsWith("310")) states = states.slice(0, 1);

        states = states
          .map(d => d.geoid);
        if (geo.startsWith("500")) districts = [`${+geo.slice(-2)}`];
        // districts = parents.filter(d => d.level === "congressionaldistrict")
        //   .map(d => {
        //     const district = +d.geoid.slice(-2);
        //     return district ? `${district}` : "at-large";
        //   });
      }
      else {
        states = [geo];
      }

      if (states.length) {

        const attrs = await db.search
          .findAll({
            where: {dimension: "Geography", hierarchy: "State", id: states},
            include: [{association: "content"}]
          })
          .catch(() => []);

        const names = attrs.map(d => d.content[0].name);
        retArray = retArray.filter(d => names.includes(d.State));
        retArray.forEach(r => {
          r["ID State"] = attrs.find(d => d.content[0].name === r.State).id;
        });
        retArray = retArray.sort((a, b) => states.indexOf(a["ID State"]) - states.indexOf(b["ID State"]));
      }

      if (districts.length && retArray.length && retArray[0].District) {
        retArray = retArray.filter(d => districts.includes(d.District));
      }

      if (type === "representative") {

        const rows = await db.search
          .findAll({where: {dimension: "Geography", hierarchy: "Congressional District"}})
          .catch(() => []);

        const districtLookup = rows.reduce((obj, d) => {
          const state = d.id.slice(0, -2).replace("500", "040");
          if (!obj[state]) obj[state] = {};
          obj[state][`${+d.id.slice(-2)}`] = d;
          return obj;
        }, {});

        retArray.forEach(r => {
          r["Slug District"] = districtLookup[r["ID State"]] && districtLookup[r["ID State"]][r.District]
            ? districtLookup[r["ID State"]][r.District].slug : "";
        });

      }

    }

    res.json(retArray);

  });


};
