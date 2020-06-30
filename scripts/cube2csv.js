#! /usr/bin/env node

const {Client, MondrianDataSource} = require("@datawheel/olap-client"),
      PromiseThrottle = require("promise-throttle"),
      d3Array = require("d3-array"),
      fs = require("fs");

const throttle = new PromiseThrottle({
  requestsPerSecond: 50,
  promiseImplementation: Promise
});

function parse(str) {
  return str.replace(/\,/g, "\,").replace(/\"/g, "\'");
}

const {CANON_LOGICLAYER_CUBE} = process.env;

const datasource = new MondrianDataSource(CANON_LOGICLAYER_CUBE);
const client = new Client(datasource);

client.getCubes()
  .then(cubes => {

    const measures = {};
    cubes
      // .filter(cube => cube.annotations.topic === "Health")
      .forEach(cube => {
        cube.measures
          .filter(measure => !measure.annotations.rca_measure && !measure.annotations.error_for_measure && !measure.annotations.source_for_measure && !measure.annotations.collection_for_measure)
          .forEach(measure => {
            const {annotations, name} = measure;
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
              annotations,
              cube_annotations: cube.annotations,
              dimensions,
              name: cube.name
            });
          });
      });

    const cubeQueries = cubes
      .filter(cube => cube.dimensions.find(d => d.name === "Year"))
      .map(cube => throttle.add(() => client.getCube(cube.name)
        .then(c => {
          const query = c.query
            .addDrilldown("Year", "Year")
            .setFormat("jsonrecords");
          return client.execQuery(query);
        })
        .then(resp => {
          const years = resp.data.data.map(d => d["ID Year"]).sort();
          return {
            cube: cube.name,
            years
          };
        })
        .catch(err => {
          console.log(` 🗓️  Year Cache Error: ${cube.name} (${err.status} - ${err.message})`);
        })));

    return Promise.all(cubeQueries)
      .then(rawYears => {

        let csv = "\"Measure\",\"Hide in Viz Builder\",\"Hide in Map\",\"Description\",\"Cube\",\"Topic\",\"Subtopic\",\"Dataset\",\"Source\",\"Source Description\",\"Years Available\",\"Cuts\"";
        // console.log(csv);

        const yearLookup = rawYears.reduce((obj, d) => (obj[d.cube] = d3Array.extent(d.years), obj), {});

        const filteredMeasures = Object.keys(measures).sort((a, b) => a.localeCompare(b));

        filteredMeasures.forEach(measure => {
          console.log(measure);

          let row = "";
          row += `\"${measure}\"`;

          const cubes = measures[measure];
          const {annotations, cube_annotations: source, name} = cubes[0];
          const {details, hide_in_map, hide_in_ui} = annotations;
          const {source_description, source_name, subtopic, topic} = source;
          const datasets = cubes
            .filter(cube => cube.cube_annotations.dataset_name)
            .map(cube => cube.cube_annotations.dataset_name)
            .join(", ");

          row += `,\"${hide_in_ui ? hide_in_ui : false}\"`;
          row += `,\"${hide_in_map ? hide_in_map : false}\"`;
          row += `,\"${details ? parse(details) : ""}\"`;
          row += `,\"${name || ""}\"`;
          row += `,\"${topic || ""}\"`;
          row += `,\"${subtopic || ""}\"`;
          row += `,\"${datasets}\"`;
          row += `,\"${source_name || ""}\"`;
          row += `,\"${source_description ? parse(source_description) : ""}\"`;
          row += `,\"${yearLookup[name] ? yearLookup[name].join("-") : ""}\"`;

          const dims = Array.from(new Set(d3Array.merge(cubes.map(cube => Object.keys(cube.dimensions)
            .filter(d => d !== "Year")
            .map(d => {
              const levels = Array.from(new Set(cube.dimensions[d]
                .filter(c => !c.level.includes("Parent"))
                .map(c => c.level.includes("::") ? c.level.split("::")[1] : c.level))).join(", ");
              return levels === d ? d : `${d} (${levels})`;
            }))))).join(", ");

          row += `,\"${dims}\"`;
          csv += `\n${row}`;

        });

        fs.writeFile("./scripts/measures.csv", csv, "utf8", err => {
          if (err) console.log(err);
          else console.log("created scripts/measures.csv");
        });

      });

  });
