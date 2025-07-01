const axios = require("axios");

const {CANON_CONST_TESSERACT} = process.env;
const prefix = `${CANON_CONST_TESSERACT}${CANON_CONST_TESSERACT.slice(-1) === "/" ? "" : "/"}`;

module.exports = async function (app) {

  const {db} = app;

  const geomapData = await axios.get(`${prefix}tesseract/data.jsonrecords?cube=acs_yg_total_population_5&drilldowns=State,Year&locale=en&measures=Population&time=Year.latest`)
    .then(resp => resp.data)
    .then(data => ({ data: data.data }))
    .catch(err => {
      console.error(` 🌎  Geomap Cache Error: ${err.message}`);
      if (err.config) console.error(err.config.url);
      return { data: [] };
    });

  const stateRows = await db.search
    .findAll({
      attributes: ["id", "slug"],
      where: {
        dimension: "Geography",
        hierarchy: "State"
    }
  }).catch(err => {
    console.error("Error fetching state slugs:", err.message);
    return [];
  });

  const idToSlug = {};
  stateRows.forEach(row => {
    idToSlug[row.id] = row.slug;
  });

  const dataWithSlugs = (geomapData.data || []).map(entry => ({
    ...entry,
    slug: idToSlug[entry["State ID"]]
  }));

  return {
    data: dataWithSlugs,
  };
};
