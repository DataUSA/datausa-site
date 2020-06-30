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

  const {db} = app;

  const rows = await db.search
    .findAll({
      include: [
        {model: db.image},
        {association: "content"}
      ]
    })
    .catch(() => []);

  const meta = await db.profile_meta.findAll()
    .catch(() => []);

  const slugs = meta
    .reduce((obj, m) => {
      if (!obj[m.dimension]) obj[m.dimension] = m.slug;
      return obj;
    }, {});

  const results = rows
    .map((d, i) => {

      const content = d.content[0];

      const name = sanitizeName(content.name);

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
        image: d.image ? d.image.toJSON() : false,
        key: `${d.dimension}-${d.hierarchy}-${d.id}`,
        keywords: content.keywords,
        name: content.name,
        profile: slugs[d.dimension],
        slug: d.slug,
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
