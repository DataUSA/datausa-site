const fs = require("fs"),
      path = require("path");

const filename = "../static/data/similar_universities.json";
const similarities = JSON.parse(fs.readFileSync(path.join(__dirname, filename), "utf8"));

module.exports = function(app) {

  const {db} = app.settings;

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

    const ids = similarities[req.params.id] || [];

    db.search
      .findAll({where: {id: ids, dimension: "University"}})
      .then(universities => {
        res.json(universities);
      })
      .catch(err => res.json(err));

  });

};
