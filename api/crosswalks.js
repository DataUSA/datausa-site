const fs = require("fs"),
      path = require("path");

function loadJSON(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, filename), "utf8"));
}

const universitySimilar = loadJSON("../static/data/similar_universities.json");
const napcs2sctg = loadJSON("../static/data/nacps2sctg.json");

module.exports = function(app) {

  const {cache, db} = app.settings;

  app.get("/api/cip/parent/:id/:level", (req, res) => {

    const {id, level} = req.params;
    const depth = parseInt(level.slice(3), 10);
    const parentId = id.slice(0, depth);
    db.search
      .findOne({where: {id: parentId, dimension: "CIP"}})
      .then(cip => {
        res.json(cip);
      })
      .catch(err => res.json(err));

  });

  app.get("/api/university/similar/:id", (req, res) => {

    const ids = universitySimilar[req.params.id] || [];

    db.search
      .findAll({where: {id: ids, dimension: "University"}})
      .then(universities => {
        res.json(universities);
      })
      .catch(err => res.json(err));

  });

  app.get("/api/university/opeid/:id", (req, res) => {

    res.json({opeid: cache.opeid[req.params.id]});

  });

  app.get("/api/napcs/:id/sctg", (req, res) => {

    const ids = napcs2sctg[req.params.id] || [];
    res.json(ids.map(d => cache.sctg[d] || {id: d}));

  });


};
