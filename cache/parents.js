const axios = require("axios");

const {CUBE_URL} = process.env;

function parseParents(data) {
  const levels = data.hierarchies[0].levels;
  return levels[levels.length - 1].members
    .reduce((obj, d) => {
      const list = d.ancestors
        .filter(a => a.depth)
        .map(a => a.key);
      obj[d.key] = Array.from(new Set(list));
      return obj;
    }, {});
}

module.exports = function() {

  return Promise
    .all([
      axios.get(`${CUBE_URL}/cubes/pums_5/dimensions/PUMS%20Industry/`).then(resp => resp.data),
      axios.get(`${CUBE_URL}/cubes/pums_5/dimensions/PUMS%20Occupation/`).then(resp => resp.data),
      axios.get(`${CUBE_URL}/cubes/ipeds_completions/dimensions/CIP/`).then(resp => resp.data),
      axios.get(`${CUBE_URL}/cubes/ipeds_completions/dimensions/University/`).then(resp => resp.data)
    ])
    .then(([industries, occupations, courses, universities]) => ({
      naics: parseParents(industries),
      soc: parseParents(occupations),
      cip: parseParents(courses),
      university: parseParents(universities)
    }));

};
