const Sequelize = require("sequelize");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/cart/levels/", async(req, res) => {

    const levels = await db.search
      .findAll({
        group: ["dimension", "hierarchy"],
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("hierarchy")), "hierarchy"], "dimension"]
      })
      .reduce((obj, d) => {
        obj[d.hierarchy] = d.dimension;
        return obj;
      }, {})
      .catch(() => ({}));

    res.json(levels);

  });

  app.get("/api/cart/levels/:dimension", async(req, res) => {

    const {dimension} = req.params;

    const attrs = await db.search
      .findAll({
        group: ["dimension", "hierarchy"],
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("hierarchy")), "hierarchy"], "dimension"],
        where: {dimension}
      })
      .map(d => d.hierarchy)
      .catch(() => []);

    res.json(attrs);

  });

};
