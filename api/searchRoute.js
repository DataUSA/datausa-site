const sequelize = require("sequelize");

const slugMap = {
  geo: "Geography",
  naics: "PUMS Industry",
  soc: "PUMS Occupation",
  cip: "CIP",
  university: "University"
};

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/search", (req, res) => {

    const where = {};

    let {limit = "10"} = req.query;
    limit = parseInt(limit, 20);

    const {id, q, type} = req.query;

    if (q) {
      where[sequelize.Op.or] = [
        {name: {[sequelize.Op.iLike]: `%${q}%`}},
        {display: {[sequelize.Op.iLike]: `%${q}%`}},
        {keywords: {[sequelize.Op.overlap]: [q]}}
      ];
    }

    if (type) where.dimension = slugMap[type] || type;
    if (id) where.id = id.includes(",") ? id.split(",") : id;

    db.search.findAll({
      include: [{model: db.images}],
      limit,
      order: [["zvalue", "DESC"]],
      where
    })
      .then(results => {
        results = results.map(d => ({
          dimension: d.hierarchy,
          id: d.id,
          image: d.image,
          keywords: d.keywords,
          name: d.display,
          sumlevel: d.hierarchy,
          slug: d.slug,
          stem: d.stem === 1,
          type: d.dimension
        }));
        res.json({results, query: {id, limit, q, type}}).end();
      });
  });

};
