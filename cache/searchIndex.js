const lunr = require("lunr");

module.exports = async function(app) {

  const {db} = app.settings;

  const rows = await db.search.findAll({include: [{model: db.images}]});

  const slugs = await db.profiles.findAll()
    .reduce((obj, d) => (obj[d.dimension] = d.slug, obj), {});

  const results = rows
    .map(d => ({
      dimension: d.dimension,
      hierarchy: d.hierarchy,
      id: d.id,
      image: d.image,
      keywords: d.keywords,
      name: d.display,
      profile: slugs[d.dimension],
      slug: d.slug,
      stem: d.stem === 1,
      zvalue: d.zvalue
    }));

  const totals = results.reduce((obj, d) => {
    if (!obj[d.dimension]) obj[d.dimension] = {};
    if (!obj[d.dimension][d.hierarchy]) obj[d.dimension][d.hierarchy] = 0;
    obj[d.dimension][d.hierarchy]++;
    return obj;
  }, {});

  return {
    rows: results.reduce((obj, d) => (obj[d.id] = d, obj), {}),
    totals,
    index: lunr(function() {
      this.ref("id");
      this.field("display", {boost: 3});
      this.field("keywords", {boost: 2});
      this.field("dimension");
      this.field("hierarchy");
      this.pipeline.remove(lunr.stemmer);
      this.searchPipeline.remove(lunr.stemmer);
      rows.forEach(row => this.add(row, {boost: row.zvalue}));
    })
  };

};
