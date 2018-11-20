const axios = require("axios");

const {CANON_LOGICLAYER_CUBE} = process.env;

/** Prases the return from the members call into an object lookup. */
function parseParents(data) {
  const obj = {};
  const levels = data.hierarchies[0].levels.filter(level => level.name !== "(All)");
  for (let i = 0; i < levels.length; i++) {
    const members = levels[i].members;
    for (let x = 0; x < members.length; x++) {
      const d = members[x];
      const list = d.ancestors
        .filter(a => a.level_name !== "(All)")
        .map(a => `${a.key}`);
      obj[d.key] = Array.from(new Set(list));
    }
  }
  return obj;
}

module.exports = function() {

  return Promise
    .all([
      axios.get(`${CANON_LOGICLAYER_CUBE}/cubes/pums_5/dimensions/PUMS%20Industry/`).then(resp => resp.data),
      axios.get(`${CANON_LOGICLAYER_CUBE}/cubes/pums_5/dimensions/PUMS%20Occupation/`).then(resp => resp.data),
      axios.get(`${CANON_LOGICLAYER_CUBE}/cubes/ipeds_completions/dimensions/CIP/`).then(resp => resp.data),
      axios.get(`${CANON_LOGICLAYER_CUBE}/cubes/ipeds_completions/dimensions/University/`).then(resp => resp.data),
      axios.get(`${CANON_LOGICLAYER_CUBE}/cubes/usa_spending/dimensions/NAPCS/`).then(resp => resp.data)
    ])
    .then(([industries, occupations, courses, universities, products]) => ({
      naics: parseParents(industries),
      soc: parseParents(occupations),
      cip: parseParents(courses),
      university: parseParents(universities),
      napcs: parseParents(products)
    }));

};
