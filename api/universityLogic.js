const fs = require("fs"),
      path = require("path");

const filename = "../static/data/similar_universities.json";
const similarities = JSON.parse(fs.readFileSync(path.join(__dirname, filename), "utf8"));

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/university/similar/:id", (req, res) => {

    const ids = similarities[req.params.id] || [];

    db.search
      .findAll({where: {id: ids, dimension: "University"}})
      .then(universities => {
        res.json(universities).end();
      })
      .catch(err => res.json(err).end());

  });

};
