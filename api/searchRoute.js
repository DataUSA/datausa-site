const sequelize = require("sequelize");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/search", async(req, res) => {

    const where = {};

    let {limit = "10"} = req.query;
    limit = parseInt(limit, 10);

    const {id, q, dimension} = req.query;

    if (q) {
      where[sequelize.Op.or] = [
        {name: {[sequelize.Op.iLike]: `%${q}%`}},
        {display: {[sequelize.Op.iLike]: `%${q}%`}},
        {keywords: {[sequelize.Op.overlap]: [q]}}
      ];
    }

    if (dimension) where.dimension = dimension;
    if (id) where.id = id.includes(",") ? id.split(",") : id;

    const rows = await db.search.findAll({
      include: [{model: db.images}],
      limit,
      order: [["zvalue", "DESC"]],
      where
    });

    const dimensions = Array.from(new Set(rows.map(d => d.dimension)));
    const slugs = await db.profiles.findAll({where: {dimension: dimensions}})
      .reduce((obj, d) => (obj[d.dimension] = d.slug, obj), {});

    const results = rows.map(d => ({
      dimension: d.dimension,
      hierarchy: d.hierarchy,
      id: d.id,
      image: d.image,
      keywords: d.keywords,
      name: d.display,
      profile: slugs[d.dimension],
      slug: d.slug,
      stem: d.stem === 1
    }));

    res.json({
      results,
      query: {dimension, id, limit, q}
    });

  });

};
