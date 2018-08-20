const {Client} = require("mondrian-rest-client"),
      PromiseThrottle = require("promise-throttle"),
      d3Array = require("d3-array");

const throttle = new PromiseThrottle({
  requestsPerSecond: 50,
  promiseImplementation: Promise
});

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
                      level: parts[2],
                      properties: l.properties
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

      const cubeQueries = cubes
        .filter(cube => cube.dimensions.find(d => d.name === "Year"))
        .map(cube => throttle.add(() => client.cube(cube.name)
          .then(c => {
            const query = c.query.drilldown("Year", "Year");
            // TODO: replace this logic to use the members endpoint
            query.measure(cube.measures[0].name);
            return client.query(query, "jsonrecords");
          })
          .then(resp => {
            const years = resp.data.data.map(d => d["ID Year"]).sort();
            // console.log(` 🗓️  Year Cache Success: ${cube.name}`);
            return {
              cube: cube.name,
              latest: years[years.length - 1],
              oldest: years[0],
              previous: years.length > 1 ? years[years.length - 2] : years[years.length - 1],
              years
            };
          })
          .catch(err => {
            console.error(` 🚫  Year Cache Error: ${cube.name} (${err.status} - ${err.message})`);
          })));

      return Promise.all(cubeQueries)
        .then(rawYears => {

          const years = rawYears.filter(d => d)
            .reduce((obj, d) => (obj[d.cube] = d, obj), {});

          return {client, measures, years};

        });

    });

};
