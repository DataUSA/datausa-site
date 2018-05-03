const axios = require("axios");

const {CUBE_URL} = process.env;

module.exports = function() {

  return axios.get(`${CUBE_URL}/cubes/`)
    .then(resp => resp.data.cubes)
    .then(cubes => {

      const cubeQueries = cubes
        .filter(cube => cube.dimensions.find(d => d.name === "Year"))
        .map(cube => axios
          .get(`${CUBE_URL}cubes/${cube.name}/aggregate.jsonrecords?drilldown[]=[Year].[Year]`)
          .then(resp => {
            const years = resp.data.map(d => d["ID Year"]).sort();
            return {
              cube: cube.name,
              latest: years[years.length - 1],
              oldest: years[0],
              years
            };
          })
          .catch(() => console.log("Error: ", cube.name)));

      return Promise.all(cubeQueries)
        .then(arr => arr.filter(d => d)
          .reduce((obj, d) => (obj[d.cube] = d, obj), {}));

    });

};
