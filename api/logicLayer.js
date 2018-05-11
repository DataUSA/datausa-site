const d3Array = require("d3-array"),
      d3Collection = require("d3-collection"),
      multiSort = require("../utils/multiSort"),
      slugMap = require("../utils/slugMap");

const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
const cartesian = (a, b, ...c) => b ? cartesian(f(a, b), ...c) : a.map(x => [x]);

function intersect(a, b) {
  return [...new Set(a)].filter(x => new Set(b).has(x));
}

module.exports = function(app) {

  const {cache, db} = app.settings;
  const {client, measures, pops, years} = cache.cube;

  app.get("/api/data/", (req, res) => {

    const {
      measure,
      order = "Year",
      sort = "desc",
      year = "all"
    } = req.query;

    if (!measure) res.json({error: "Query must contain at least one measure."});
    const required = measure.split(",");

    let bigGeos = true;
    const dimensions = [];
    ["geo", "naics", "soc", "university", "cip"].forEach(t => {
      if (req.query[t]) {
        const ids = req.query[t].split(",");
        dimensions.push({
          type: t,
          id: ids
        });
        if (t === "geo") bigGeos = ids.every(g => pops[g] && pops[g] >= 250000);
      }
    });

    const queries = {};
    required.forEach(measure => {
      const cubes = measures[measure]
        .filter(cube => !cube.name.match(/_[0-9]$/g) ||
          cube.name.match(bigGeos ? /_1$/g : /_5$/g));

      if (cubes.length === 1) {
        const cube = cubes[0];
        if (!queries[cube.name]) {
          queries[cube.name] = {measures: [], ...cube};
        }
        queries[cube.name].measures.push(measure);
      }
      else {
        console.log(`Unable to determine cube for ${measure}`);
        console.log(cubes);
      }

    });

    Promise.all(dimensions.map(d => db.search.findAll({where: d})))
      .then(attributes => {

        const cuts = d3Array.merge(attributes).reduce((obj, d) => {
          const dim = slugMap[d.type];
          if (!obj[dim]) obj[dim] = {};
          if (!obj[dim][d.sumlevel]) obj[dim][d.sumlevel] = [];
          obj[dim][d.sumlevel].push(d);
          return obj;
        }, {});

        let queryCrosses = [];
        const queryPromises = [];
        Object.keys(queries).forEach(name => {

          const cube = queries[name];

          const dims = Object.keys(cube.dimensions)
            .filter(dim => dim in cuts)
            .map(dim => intersect(cube.dimensions[dim], Object.keys(cuts[dim])).map(d => ({[dim]: d})));

          const crosses = cartesian(...dims);
          queryCrosses = queryCrosses.concat(crosses);

          crosses.forEach(dimSet => {

            const q = client.cube(name)
              .then(c => {

                const query = c.query;

                if ("Year" in cube.dimensions) {
                  query.drilldown("Year", "Year", "Year");
                  if (year !== "all") {
                    const queryYears = year.split(",").map(y => {
                      if (y === "latest") return years[name].latest;
                      if (y === "previous") return years[name].previous;
                      if (y === "oldest") return years[name].oldest;
                      return y;
                    });
                    query.cut(`{${queryYears.map(y => `[Year].[Year].[Year].&[${y}]`).join(", ")}}`);
                  }
                }

                dimSet.forEach(dim => {
                  const type = Object.keys(dim)[0];
                  const level = dim[type];
                  query
                    .drilldown(type, level, level)
                    .cut(`{${cuts[type][level].map(g => `[${type}].[${level}].[${level}].&[${g.id}]`).join(", ")}}`);
                });

                cube.measures.forEach(measure => query.measure(measure));
                return client.query(query, "jsonrecords");
              });

            queryPromises.push(q);

          });

        });

        return Promise.all([queryCrosses, Promise.all(queryPromises)]);

      })
      .then(([crosses, data]) => {

        const flatArray = data.reduce((arr, d, i) => {

          const cross = crosses[i];
          const newArray = d.data.data.map(row => {
            cross.forEach(c => {
              const type = Object.keys(c)[0];
              const level = c[type];
              if (level in row) {
                row[type] = row[level];
                row[`${type} ID`] = row[`ID ${level}`];
                delete row[level];
                delete row[`ID ${level}`];
              }
              delete row["ID Year"];
            });
            return row;
          });

          arr = arr.concat(newArray);

          return arr;

        }, []);

        const keys = crosses[0].map(d => Object.keys(d)[0]);
        keys.push("Year");

        const mergedData = d3Collection.nest()
          .key(d => keys.map(key => d[key]).join("_"))
          .entries(flatArray)
          .map(d => Object.assign(...d.values));

        const sortedData = multiSort(mergedData, order.split(","), sort);

        return sortedData;

      })
      .then(data => res.json({data, source: Object.values(queries)}).end());



  });

};
