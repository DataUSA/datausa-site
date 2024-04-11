const {BetaAnalyticsDataClient} = require('@google-analytics/data');
const {sum} = require("d3-array");
const {Op} = require("sequelize");

// configure an auth client
const client = new BetaAnalyticsDataClient({
  keyFilename: process.env.GA_KEYFILE,
});

const slugMap = {
  cip: "CIP",
  geo: "Geography",
  naics: "PUMS Industry",
  napcs: "NAPCS",
  soc: "PUMS Occupation",
  university: "University"
};

const newProfiles = [
  // fill this array with profile slugs to be tagged as "New"
];

const hiddenProfiles = [
  // fill this array with profile slugs that you want to be surpressed
  "california",
  "united-states",
  "new-york-ny"
]

const tilesPerColumn = 4;

const prepTile = (row, profile) => ({
  title: row.content[0].name,
  new: newProfiles.includes(row.slug) || newProfiles.includes(row.id),
  url: `/profile/${profile}/${row.slug || row.id}`,
  image: `/api/profile/${profile}/${row.slug || row.id}/thumb`
});

const fetchProfileViews = async(slug, daysAgo = 7) => client
  .runReport({
    property: "properties/402781720",
    dateRanges: [
      {
        startDate: `${daysAgo}daysAgo`,
        endDate: "yesterday",
      }
    ],
    metrics: [
      {name: "screenPageViews"}
    ],
    dimensions: [
      {name: "pagePath"}
    ],
    dimensionFilter:  {
      filter: {
        fieldName: "pagePath",
        stringFilter: {
          matchType: "FULL_REGEXP",
          value: `\/profile\/(${slug})\/.*`
        }
      }
    },
    orderBys: [
      {metric: {metricName: "screenPageViews"}, desc: true}
    ],
    limit: tilesPerColumn * 4
  })
  .then(resp => resp[0].rows)
  .then(rows => (
    rows
      .map(row => row.dimensionValues[0].value.split("/")[3].split("?")[0])
      .filter(slug => !hiddenProfiles.includes(slug))
  ))
  .catch(err => {
    // console.error(err.message);
    return [];
  });

module.exports = function(app) {

  const {db} = app.settings;
  const {totals} = app.settings.cache.searchIndex;

  const createTiles = (slugs, profile) => db.search
    .findAll({
      include: [{association: "content"}],
      where: {
        dimension: slugMap[profile],
        [Op.or]: [{id: slugs}, {slug: slugs}]
      }
    })
    .then(attrs => attrs
      .sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug))
      .map(a => prepTile(a, profile))
    )
    .catch(() => []);

  app.get("/api/home", async(req, res) => {

    const mostVisited = {
      geo:        await fetchProfileViews("geo", 1),
      naics:      await fetchProfileViews("naics", 7),
      soc:        await fetchProfileViews("soc", 7),
      university: await fetchProfileViews("university", 7),
      cip:        await fetchProfileViews("cip", 7),
      napcs:      await fetchProfileViews("napcs", 7)
    };

    const carousels = [];


    /*
     * Create Location Tiles
    */
    const geoSlugs = mostVisited.geo.concat(
      ["california", "welch-wv", "new-york-ny", "houston-tx", "arlington-va"]
    );

    const geos = await createTiles(geoSlugs, "geo");

    carousels.push({
      title: "Locations",
      slug: "geo",
      icon: "/icons/dimensions/Geography.svg",
      url: "/search/?dimension=Geography",
      tiles: geos.slice(0, tilesPerColumn),
      total: sum(Object.values(totals.Geography))
    });


    /*
     * Create Industry Tiles
    */
    const indSlugs = mostVisited.naics.concat(
      [
        "oil-gas-extraction",
        "finance-insurance",
        "restaurants-food-services",
        "utilities",
        "manufacturing"
      ]
    );

    const industries = await createTiles(indSlugs, "naics");

    carousels.push({
      title: "Industries",
      slug: "naics",
      icon: "/icons/dimensions/PUMS Industry.svg",
      url: "/search/?dimension=PUMS Industry",
      tiles: industries.slice(0, tilesPerColumn),
      total: sum(Object.values(totals["PUMS Industry"]))
    });


    /*
     * Create Occupation Tiles
    */
    const occSlugs = mostVisited.soc.concat(
      [
        "customer-service-representatives",
        "police-officers",
        "service-occupations",
        "registered-nurses",
        "physical-therapists"
      ]
    );

    const occupations = await createTiles(occSlugs, "soc");

    carousels.push({
      title: "Jobs",
      slug: "soc",
      icon: "/icons/dimensions/PUMS Occupation.svg",
      url: "/search/?dimension=PUMS Occupation",
      tiles: occupations.slice(0, tilesPerColumn),
      total: sum(Object.values(totals["PUMS Occupation"]))
    });


    /*
     * Create University Tiles
    */
    const universitySlugs = mostVisited.university.concat(
      [
        "harvard-university",
        "university-of-washington-seattle-campus",
        "university-of-california-los-angeles",
        "university-of-california-berkeley",
        "stanford-university"
      ]
    );

    const universities = await createTiles(universitySlugs, "university");

    carousels.push({
      title: "Universities",
      slug: "university",
      icon: "/icons/dimensions/University.svg",
      url: "/search/?dimension=University",
      tiles: universities.slice(0, tilesPerColumn),
      total: sum(Object.values(totals.University))
    });

    /*
     * Create Degree Tiles
    */
    const cipSlugs = mostVisited.cip.concat(
      [
        "computer-science-110701",
        "engineering",
        "general-business-administration-management",
        "electrical-engineering",
        "biology"
      ]
    );

    const courses = await createTiles(cipSlugs, "cip");

    carousels.push({
      title: "Degrees",
      slug: "cip",
      icon: "/icons/dimensions/CIP.svg",
      url: "/search/?dimension=CIP",
      tiles: courses.slice(0, tilesPerColumn),
      total: sum(Object.values(totals.CIP))
    });

    /*
     * Create Degree Tiles
    */
    const napcsSlugs = mostVisited.napcs.concat(
      [
        "accounting-and-related-services-except-it-support-services-for-trade-professional-and-business",
        "materials-and-supplies-for-machinery-and-transportation-equipment-manufacturing",
        "research-and-development-services-54301",
        "communications-and-information-and-related-services",
        "contract-management-and-operation-services-except-property-and-construction-project-management"
      ]
    );

    const products = await createTiles(napcsSlugs, "napcs");

    carousels.push({
      title: "Products",
      slug: "napcs",
      icon: "/icons/dimensions/NAPCS.svg",
      url: "/search/?dimension=NAPCS",
      tiles: products.slice(0, tilesPerColumn),
      total: sum(Object.values(totals.NAPCS))
    });

    /*
     * Return "carousels"
    */
    res.json(carousels);

  });

};
