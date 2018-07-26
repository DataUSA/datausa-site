const Sequelize = require("sequelize"),
      axios = require("axios"),
      canonConfig = require("../canon.js"),
      d3Array = require("d3-array"),
      d3Collection = require("d3-collection"),
      multiSort = require("../utils/multiSort"),
      yn = require("yn");

const {CUBE_URL} = process.env;

// const debug = process.env.NODE_ENV === "development";
const debug = false;

// replace this in canon with "express-async-await" package
// https://odino.org/async-slash-await-in-expressjs/
const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

const aliases = canonConfig["canon-logic"]
  ? canonConfig["canon-logic"].aliases || {}
  : {};

const cubeFilters = canonConfig["canon-logic"]
  ? canonConfig["canon-logic"].cubeFilters || []
  : [];

const relations = canonConfig["canon-logic"]
  ? canonConfig["canon-logic"].relations || {}
  : {};

const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
const cartesian = (a = [], b, ...c) => b ? cartesian(f(a, b), ...c) : a.map(x => [x]);

function intersect(a, b) {
  return [...new Set(a)].filter(x => new Set(b).has(x));
}

function findDimension(flatDims, level) {
  let dims = flatDims.filter(d => d.level === level);
  if (dims.length > 1) {
    const hierarchyMatches = dims.filter(d => d.hierarchy === level);
    if (hierarchyMatches.length) dims = hierarchyMatches;
  }
  return dims[0];
}

function findKey(query, key, fallback) {
  let value = fallback;
  if (query[key]) value = query[key];
  else if (aliases[key]) {
    const alts = typeof aliases[key] === "string" ? [aliases[key]] : aliases[key];
    for (let i = 0; i < alts.length; i++) {
      if (query[alts[i]]) {
        value = query[alts[i]];
        break;
      }
    }
  }
  return value;
}

module.exports = function(app) {

  const {cache, db} = app.settings;
  const {client, measures: cubeMeasures, years} = cache.cube;
  const caches = cache.cube;

  app.get("/api/cubes", (req, res) => {
    const returnCaches = {...caches};
    delete returnCaches.client;
    res.json(returnCaches).end();
  });

  app.get("/api/data/", asyncMiddleware(async (req, res) => {

    let reserved = ["cuts", "drilldowns", "limit", "measures", "order", "parents", "sort", "Year"];
    reserved = reserved.concat(d3Array.merge(reserved.map(r => {
      let alts = aliases[r] || [];
      if (typeof alts === "string") alts = [alts];
      return alts;
    })));

    let measures = findKey(req.query, "measures");
    if (measures) measures = measures.split(",");
    else res.json({error: "Query must contain at least one measure."});

    const cuts = findKey(req.query, "cuts", "")
      .split(",")
      .filter(d => d !== "")
      .map(cut => cut.split(":"))
      .map(arr => [arr[0], [arr[1]]]);

    const drilldowns = findKey(req.query, "drilldowns", "")
      .split(",")
      .filter(d => d !== "");

    const year = findKey(req.query, "Year", "all");

    const {
      order = "Year",
      parents = "false",
      sort = "desc"
    } = req.query;

    let {limit} = req.query,
        perValue = false;
    if (limit) {
      if (limit.includes(":")) {
        [limit, perValue] = limit.split(":");
      }
      limit = parseInt(limit, 10);
    }

    const searchDims = await db.search.findAll({
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("dimension")), "dimension"]],
      where: {}
    }).map(d => d.dimension);

    const dimensions = [];
    for (let key in req.query) {
      if (!reserved.includes(key)) {

        let ids = req.query[key];

        for (const alias in aliases) {
          const list = aliases[alias] instanceof Array ? aliases[alias] : [aliases[alias]];
          if (list.includes(key)) key = alias;
        }

        ids = await Promise.all(d3Array.merge(ids
          .split(",")
          .map(id => {
            if (id.includes(":") && key in relations) {
              const rels = Object.keys(relations[key]);
              id = id.split(":");
              return id.slice(1)
                .map(v => {
                  if (rels.includes(v)) {
                    return axios.get(relations[key][v].url(id[0]))
                      .then(resp => resp.data)
                      .then(relations[key][v].callback)
                      .catch(() => null);
                  }
                  else {
                    return [v];
                  }
                })
                .filter(v => v);
            }
            else {
              return [[id]];
            }
          })));

        ids = d3Array.merge(ids);

        if (searchDims.includes(key)) {
          dimensions.push({
            dimension: key,
            id: ids
          });
        }
        else {
          cuts.push([key, ids]);
        }
      }
    }

    const attributes = await Promise.all(dimensions.map(d => db.search.findAll({where: d})));

    const queries = {};
    const dimCuts = d3Array.merge(attributes).reduce((obj, d) => {
      const dim = d.dimension;
      if (!obj[dim]) obj[dim] = {};
      if (!obj[dim][d.hierarchy]) obj[dim][d.hierarchy] = [];
      obj[dim][d.hierarchy].push(d);
      return obj;
    }, {});

    const dimDrills = d3Array.merge(Object.values(dimCuts).map(d => Object.keys(d)));

    for (let i = 0; i < measures.length; i++) {
      const measure = measures[i];

      // filter out cubes that don't match cuts and dimensions
      let cubes = cubeMeasures[measure]
        .filter(cube => {
          const flatDims = cube.flatDims = d3Array.merge(Object.values(cube.dimensions));
          let allowed = true;

          for (let i = 0; i < dimDrills.length; i++) {
            const drilldownDim = flatDims.find(d => d.level === dimDrills[i]);
            if (!drilldownDim) {
              allowed = false;
              break;
            }
          }

          if (allowed) {
            for (let i = 0; i < drilldowns.length; i++) {
              const drilldownDim = flatDims.find(d => d.level === drilldowns[i]);
              if (!drilldownDim) {
                allowed = false;
                break;
              }
            }
          }

          if (allowed) {
            for (let i = 0; i < cuts.length; i++) {
              const cutDim = flatDims.find(d => d.level === cuts[i][0]);
              if (!cutDim) {
                allowed = false;
                break;
              }
            }
          }

          return allowed;
        });

      // runs user-defined cube filters from canon.js
      cubeFilters.forEach(filter => {
        cubes = d3Collection.nest()
          .key(filter.key)
          .entries(cubes)
          .map(d => {
            if (d.values.length > 1) {
              const matching = d.values.filter(cube => cube.name.match(filter.regex));
              d.values = filter.filter(matching, {dimensions, measures}, caches);
            }
            return d.values[0];
          });
      });

      // filter out cubes with additional unused dimensions
      if (cubes.length > 1) {
        const minDims = d3Array.min(cubes.map(c => Object.keys(c.dimensions).length));
        cubes = cubes.filter(c => Object.keys(c.dimensions).length === minDims);
      }


      if (cubes.length === 0) {
        console.log("\nNo cubes matched.");
      }
      else {
        const cube = cubes[0];
        if (!queries[cube.name]) {
          queries[cube.name] = {measures: [], ...cube};
        }
        queries[cube.name].measures.push(measure);
      }

    }

    let queryCrosses = [];
    const queryPromises = [];
    const names = Object.keys(queries);
    for (let ii = 0; ii < names.length; ii++) {
      const name = names[ii];

      const cube = queries[name];
      const flatDims = cube.flatDims;

      const dims = Object.keys(cube.dimensions)
        .filter(dim => dim in dimCuts)
        .map(dim => intersect(
          cube.dimensions[dim].map(d => d.level),
          Object.keys(dimCuts[dim])
        ).map(d => ({[dim]: d})));

      const crosses = cartesian(...dims);
      if (!crosses.length) crosses.push([]);

      const queryYears = Array.from(new Set(d3Array.merge(year
        .split(",")
        .map(y => {
          if (y === "latest") return [years[name].latest];
          if (y === "previous") return [years[name].previous];
          if (y === "oldest") return [years[name].oldest];
          if (y === "all") return years[name].years;
          return y;
        })
      )));

      if (perValue && perValue in cube.dimensions) {
        const {dimension, hierarchy, level} = cube.dimensions[perValue]
          .find(d => d.level === perValue);

        // TODO for some reason doing this axios call wipes out cube.dimensions
        const dims = cube.dimensions;
        const members = await axios.get(`${CUBE_URL}cubes/${name}/dimensions/${dimension}/hierarchies/${hierarchy}/levels/${level}/members`)
          .then(resp => resp.data.members.map(d => d.key));
        cube.dimensions = dims;

        crosses.forEach(cross => {
          const starterCross = cross.slice();
          members.forEach((v, i) => {
            const obj = {[perValue]: {level, cut: v}};
            if (!i) cross.push(obj);
            else crosses.push([...starterCross, obj]);
          });
        });

      }

      queryCrosses = queryCrosses.concat(crosses);

      crosses.forEach(dimSet => {

        const q = client.cube(name)
          .then(c => {

            const query = c.query;

            if (debug) console.log(`\nLogic Layer Query: ${name}`);
            if ("Year" in cube.dimensions) {
              query.drilldown("Year", "Year", "Year");
              if (debug) console.log("Drilldown: Year - Year - Year");
              if (year !== "all") {
                const yearCut = `{${queryYears.map(y => `[Year].[Year].[Year].&[${y}]`).join(",")}}`;
                if (debug) console.log(`Cut: ${yearCut}`);
                query.cut(yearCut);
              }
            }

            drilldowns.forEach(level => {
              const {dimension, hierarchy} = findDimension(flatDims, level);
              if (debug) console.log(`Drilldown: ${dimension} - ${hierarchy} - ${level}`);
              query.drilldown(dimension, hierarchy, level);
            });

            cuts.forEach(([level, value]) => {
              const {dimension, hierarchy} = findDimension(flatDims, level);
              if (!drilldowns.includes(level)) {
                if (debug) console.log(`Drilldown: ${dimension} - ${hierarchy} - ${level}`);
                query.drilldown(dimension, hierarchy, level);
              }
              const cut = value.map(v => `[${dimension}].[${hierarchy}].[${level}].&[${v}]`).join(",");
              if (debug) console.log(`Cut: ${cut}`);
              query.cut(`{${cut}}`);
            });

            dimSet.forEach(dim => {
              const dimension = Object.keys(dim)[0];
              const level = dim[dimension];
              if (dimension in dimCuts) {
                const {hierarchy} = findDimension(flatDims, level);
                const dimCut = `{${dimCuts[dimension][level].map(g => `[${dimension}].[${hierarchy}].[${level}].&[${g.id}]`).join(",")}}`;
                if (debug) {
                  console.log(`Drilldown: ${dimension} - ${hierarchy} - ${level}`);
                  console.log(`Cut: ${dimCut}`);
                }
                query
                  .drilldown(dimension, hierarchy, level)
                  .cut(dimCut);
              }
              else if (level.cut) {
                const {level: l, cut: cutValue} = level;
                const {hierarchy, level: realLevel} = findDimension(flatDims, l);
                if (dimension !== "Year" && !drilldowns.includes(realLevel)) {
                  if (debug) console.log(`Drilldown: ${dimension} - ${hierarchy} - ${realLevel}`);
                  query.drilldown(dimension, hierarchy, realLevel);
                }
                const cut = `{[${dimension}].[${hierarchy}].[${realLevel}].&[${cutValue}]}`;
                if (debug) console.log(`Cut: ${cut}`);
                query.cut(cut);
              }
            });

            cube.measures.forEach(measure => {
              if (debug) console.log(`Measure: ${measure}`);
              query.measure(measure);
            });

            query.option("parents", yn(parents));

            return client.query(query, "jsonrecords");
          })
          .catch(error => {
            console.error("\nCube Error", error.config ? error.config.url : error);
            return {error};
          });

        queryPromises.push(q);

      });

    }

    const [crosses, data] = await Promise.all([queryCrosses, Promise.all(queryPromises)]);

    const flatArray = data.reduce((arr, d, i) => {

      let data = d.error ? [] : d.data.data;
      if (perValue) {
        data = multiSort(data, order.split(","), sort);
        data = data.slice(0, limit);
      }

      const cross = crosses[i];
      const newArray = data.map(row => {
        cross.forEach(c => {
          const type = Object.keys(c)[0];
          const level = c[type];
          if (level in row && type !== level) {
            row[type] = row[level];
            delete row[level];
            row[`ID ${type}`] = row[`ID ${level}`];
            delete row[`ID ${level}`];
          }
        });
        return row;
      });

      arr = arr.concat(newArray);

      return arr;

    }, []);

    const keys = d3Array.merge([
      crosses.length ? crosses[0].map(d => Object.keys(d)[0]) : [],
      drilldowns,
      cuts.map(d => d[0]),
      ["Year"]
    ]);

    const mergedData = d3Collection.nest()
      .key(d => keys.map(key => d[key]).join("_"))
      .entries(flatArray)
      .map(d => Object.assign(...d.values));

    let sortedData = multiSort(mergedData, order.split(","), sort);

    if (limit && !perValue) sortedData = sortedData.slice(0, limit);

    const source = Object.values(queries).map(d => {
      delete d.flatDims;
      delete d.dimensions;
      return d;
    });

    res.json({data: sortedData, source}).end();

  }));

};
