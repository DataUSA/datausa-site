const sequelize = require("sequelize"),
      sumlevels = require("../app/consts/sumlevels.js");

module.exports = function(app) {

  const {cache, db} = app.settings;

  app.get("/api/cache", (req, res) => {
    const ret = cache.year;
    res.json({result: ret}).end();
  });

  app.get("/api/search", (req, res) => {

    const where = {};

    let {limit = "10"} = req.query;
    limit = parseInt(limit, 20);

    const {kind, q} = req.query;
    if (q) {
      where[sequelize.Op.or] = [
        {name: {[sequelize.Op.iLike]: `%${q}%`}},
        {display: {[sequelize.Op.iLike]: `%${q}%`}},
        {keywords: {[sequelize.Op.overlap]: [q]}}
      ];
    }
    if (kind) {
      where.kind = kind;
    }

    db.search.findAll({
      limit,
      order: [["zvalue", "DESC"]],
      where
    })
      .then(results => {
        results = results.map(d => ({
          id: d.id,
          keywords: d.keywords,
          name: d.display,
          sumlevel: sumlevels[d.kind][d.sumlevel] ? sumlevels[d.kind][d.sumlevel].label : d.sumlevel,
          slug: d.url_name,
          stem: d.is_stem === 1,
          type: d.kind
        }));
        res.json({results, query: {limit, q, kind}}).end();
      });
  });

};
