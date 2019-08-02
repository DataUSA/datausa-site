const lunr = require("lunr");
const sanitizeName = require("../utils/sanitizeName");

const abbreviations = {
  en: [
    ["ft", "fort"],
    ["jct", "junction"],
    ["mdw", "meadow"],
    ["mt", "mount"],
    ["mtn", "mountain"],
    ["pt", "point"],
    ["st", "saint"]
  ]
};

module.exports = async function(app) {

  const {db} = app.settings;

  const rows = await db.search.findAll({include: [{model: db.images}]})
    .catch(() => []);

  const slugs = await db.profiles.findAll()
    .catch(() => [])
    .reduce((obj, d) => (obj[d.dimension] = d.slug, obj), {});

  const results = rows
    .map(d => {

      const name = sanitizeName(d.display);

      const alts = name.split(/[\s\-]/g);
      abbreviations.en.forEach(abbr => {
        if (alts.includes(abbr[0])) alts.push(abbr[1]);
        else if (alts.includes(abbr[1])) alts.push(abbr[0]);
      });

      return {
        alts,
        dimension: d.dimension,
        hierarchy: d.hierarchy,
        id: d.id,
        image: d.image,
        key: `${d.dimension}-${d.hierarchy}-${d.id}`,
        keywords: d.keywords,
        name: d.display,
        profile: slugs[d.dimension],
        slug: d.slug,
        stem: d.stem === 1,
        zvalue: d.zvalue
      };
    });

  const totals = results.reduce((obj, d) => {
    if (!obj[d.dimension]) obj[d.dimension] = {};
    if (!obj[d.dimension][d.hierarchy]) obj[d.dimension][d.hierarchy] = 0;
    obj[d.dimension][d.hierarchy]++;
    return obj;
  }, {});

  return {
    rows: results.reduce((obj, d) => (obj[d.key] = d, obj), {}),
    totals,
    index: lunr(function() {

      this.ref("key");
      this.field("keywords", {boost: 3});
      this.field("alts", {boost: 2});
      this.field("dimension");
      this.field("hierarchy");

      this.pipeline.reset();
      this.searchPipeline.reset();

      results.forEach(result => this.add(result, {boost: result.zvalue}));

    })
  };

};
