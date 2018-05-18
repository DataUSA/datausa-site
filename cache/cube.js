const {Client} = require("mondrian-rest-client"),
      d3Array = require("d3-array"),
      sumlevels = require("../app/consts/sumlevels");

const {CUBE_URL} = process.env;

module.exports = function() {

  const client = new Client(CUBE_URL);

  return client.cubes()
    .then(cubes => {

      const measures = {};
      cubes.forEach(cube => {
        cube.measures.forEach(measure => {
          const {name} = measure;
          if (!measures[name]) measures[name] = [];
          const dimensions = cube.dimensions
            .reduce((acc, d) => {
              let hierarchies = d.hierarchies
                .map(h => {
                  const levels = h.levels.map(l => {
                    const parts = l.fullName
                      .split(".")
                      .map(p => p.replace(/^\[|\]$/g, ""));
                    if (parts.length === 2) parts.unshift(parts[0]);
                    return {
                      dimension: parts[0],
                      hierarchy: parts[1],
                      level: parts[2]
                    };
                  });
                  levels.shift();
                  return levels;
                });
              hierarchies = Array.from(new Set(d3Array.merge(hierarchies)));
              acc[d.name] = hierarchies;
              return acc;
            }, {});
          measures[name].push({
            annotations: cube.annotations,
            dimensions,
            name: cube.name
          });
        });
      });

      const popQueries = Object.keys(sumlevels.geo).filter(d => !["Zip"].includes(d))
        .map(level => client.cube("acs_yg_total_population_1")
          .then(c => {
            const query = c.query
              .drilldown("Geography", level, level)
              .measure("Total Population Sum")
              .cut("[Year].[Year].[Year].&[2016]");
            return client.query(query, "jsonrecords");
          })
          .then(resp => resp.data.data.reduce((acc, d) => {
            acc[d[`ID ${level}`]] = d["Total Population Sum"];
            return acc;
          }, {}))
          .catch(err => {
            console.error(` 🌎  Pop Cache Error: ${level} (${err.status} - ${err.message})`);
          }));

      const cubeQueries = cubes
        .filter(cube => cube.dimensions.find(d => d.name === "Year"))
        .map(cube => client.cube(cube.name)
          .then(c => {
            const query = c.query.drilldown("Year", "Year");
            return client.query(query, "jsonrecords");
          })
          .then(resp => {
            const years = resp.data.data.map(d => d["ID Year"]).sort();
            return {
              cube: cube.name,
              latest: years[years.length - 1],
              oldest: years[0],
              previous: years.length > 1 ? years[years.length - 2] : years[years.length - 1],
              years
            };
          })
          .catch(err => {
            console.log(` 🗓️  Year Cache Error: ${cube.name} (${err.status} - ${err.message})`);
          }));

      return Promise.all([Promise.all(popQueries), Promise.all(cubeQueries)])
        .then(([rawPops, rawYears]) => {

          const pops = rawPops
            .reduce((obj, d) => (obj = Object.assign(obj, d), obj), {});

          const years = rawYears.filter(d => d)
            .reduce((obj, d) => (obj[d.cube] = d, obj), {});

          return {client, measures, pops, years};

        });

    });

};
