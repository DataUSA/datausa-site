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

const aliases = canonConfig["canon-logic"]
  ? canonConfig["canon-logic"].aliases || {}
  : {};

const cubeFilters = canonConfig["canon-logic"]
  ? canonConfig["canon-logic"].cubeFilters || []
  : [];

const relations = canonConfig["canon-logic"]
  ? canonConfig["canon-logic"].relations || {}
  : {};

const substitutions = canonConfig["canon-logic"]
  ? canonConfig["canon-logic"].substitutions || {}
  : {};

const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
const cartesian = (a = [], b, ...c) => b ? cartesian(f(a, b), ...c)[0] : a.map(x => [x]);

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
  if (fallback instanceof Array && !(value instanceof Array)) {
    value = value
      .split(/\,([A-z])/g)
      .reduce((arr, d) => {
        if (arr.length && arr[arr.length - 1].length === 1) arr[arr.length - 1] += d;
        else if (d.length) arr.push(d);
        return arr;
      }, []);
  }
  return value;
}

module.exports = function(app) {

  const {cache, db} = app.settings;
  const {client, measures: cubeMeasures, years} = cache.cube;

  app.get("/api/cubes", (req, res) => {
    const returnCaches = {...cache.cube};
    delete returnCaches.client;
    res.json(returnCaches).end();
  });

  app.get("/api/data/", async(req, res) => {

    let reserved = ["cuts", "drilldowns", "limit", "measures", "order", "parents", "properties", "sort", "Year"];
    reserved = reserved.concat(d3Array.merge(reserved.map(r => {
      let alts = aliases[r] || [];
      if (typeof alts === "string") alts = [alts];
      return alts;
    })));

    const measures = findKey(req.query, "measures", []);
    if (!measures.length) res.json({error: "Query must contain at least one measure."});

    const cuts = findKey(req.query, "cuts", [])
      .map(cut => cut.split(":"))
      .map(arr => [arr[0], [arr[1]]]);

    const drilldowns = findKey(req.query, "drilldowns", []);
    const properties = findKey(req.query, "properties", []);
    const order = findKey(req.query, "order", ["Year"]);
    const year = findKey(req.query, "Year", "all");

    const {
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
          if (Object.prototype.hasOwnProperty.call(aliases, alias)) {
            const list = aliases[alias] instanceof Array ? aliases[alias] : [aliases[alias]];
            if (list.includes(key)) key = alias;
          }
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
      const {dimension, hierarchy} = d;
      if (!obj[dimension]) obj[dimension] = {};
      if (!obj[dimension][hierarchy]) obj[dimension][hierarchy] = [];
      obj[dimension][hierarchy].push(d);
      return obj;
    }, {});

    for (let i = 0; i < measures.length; i++) {
      const measure = measures[i];

      // filter out cubes that don't match cuts and dimensions
      let cubes = (cubeMeasures[measure] || [])
        .filter(cube => {

          const flatDims = cube.flatDims = d3Array.merge(Object.values(cube.dimensions));
          cube.subs = {};
          let allowed = true;

          for (const dim in dimCuts) {
            if (Object.prototype.hasOwnProperty.call(dimCuts, dim)) {
              for (const level in dimCuts[dim]) {
                if (Object.prototype.hasOwnProperty.call(dimCuts[dim], level)) {
                  const drilldownDim = flatDims.find(d => d.level === level);
                  if (!drilldownDim) {
                    if (substitutions[dim] && substitutions[dim].levels[level]) {
                      const potentialSubs = substitutions[dim].levels[level];
                      let sub;
                      for (let i = 0; i < potentialSubs.length; i++) {
                        const p = potentialSubs[i];
                        const subDim = flatDims.find(d => d.level === p);
                        if (subDim) {
                          sub = p;
                          break;
                        }
                      }
                      if (sub) {
                        cube.subs[level] = sub;
                        break;
                      }
                      else {
                        allowed = false;
                        break;
                      }
                    }
                    else {
                      allowed = false;
                      break;
                    }
                  }
                }
              }
              if (!allowed) break;
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
              d.values = filter.filter(matching, {dimensions, measures}, cache);
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
        console.log(req.query);
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

      const cubeDimCuts = {};
      cube.substitutions = [];
      for (const dim in dimCuts) {
        if (Object.prototype.hasOwnProperty.call(dimCuts, dim)) {
          cubeDimCuts[dim] = {};
          for (const level in dimCuts[dim]) {
            if (Object.prototype.hasOwnProperty.call(dimCuts[dim], level)) {
              const masterDims = dimCuts[dim][level];
              const subLevel = cube.subs[level];
              if (subLevel) {
                cubeDimCuts[dim][subLevel] = [];
                for (let d = 0; d < masterDims.length; d++) {
                  const oldId = masterDims[d].id;
                  const subUrl = substitutions[dim].url(oldId, subLevel);
                  const subId = await axios.get(subUrl)
                    .then(resp => resp.data)
                    .then(substitutions[dim].callback);
                  const subAttr = await db.search.findOne({where: {id: subId, dimension: dim, hierarchy: subLevel}});
                  cube.substitutions.push(subAttr);
                  cubeDimCuts[dim][subLevel].push(subAttr);
                }
              }
              else {
                cubeDimCuts[dim][level] = masterDims;
              }
            }
          }
        }
      }

      const dims = Object.keys(cube.dimensions)
        .filter(dim => dim in cubeDimCuts)
        .map(dim => {
          const cubeLevels = cube.dimensions[dim].map(d => d.level);
          const cutLevels = Object.keys(cubeDimCuts[dim]);
          const i = intersect(cubeLevels, cutLevels);
          return i.map(d => ({[dim]: d}));
        });

      const crosses = cartesian(...dims);
      if (!crosses.length) crosses.push([]);

      const queryYears = Array.from(new Set(d3Array.merge(year
        .split(",")
        .map(y => {
          if (y === "latest") return [years[name].latest];
          if (y === "previous") return [years[name].previous];
          if (y === "oldest") return [years[name].oldest];
          if (y === "all") return years[name].years;
          return [y];
        })
      )));

      if (perValue && perValue in cube.dimensions) {
        const {dimension, hierarchy, level} = cube.dimensions[perValue]
          .find(d => d.level === perValue);

        // TODO for some reason doing this axios call wipes out cube.dimensions
        const cubeDims = cube.dimensions;
        const members = await axios.get(`${CUBE_URL}cubes/${name}/dimensions/${dimension}/hierarchies/${hierarchy}/levels/${level}/members`)
          .then(resp => resp.data.members.map(d => d.key));
        cube.dimensions = cubeDims;

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

      for (let iii = 0; iii < crosses.length; iii++) {
        const dimSet = crosses[iii];

        const q = client.cube(name)
          .then(c => {

            const query = c.query;

            const queryDrilldowns = drilldowns.map(d => findDimension(flatDims, d));
            const queryCuts = cuts.map(([level, value]) => [findDimension(flatDims, level), value]);

            if (debug) console.log(`\nLogic Layer Query: ${name}`);
            if ("Year" in cube.dimensions) {
              const drill = {dimension: "Year", hierarchy: "Year", level: "Year"};
              queryDrilldowns.push(drill);
              if (year !== "all") queryCuts.push([drill, queryYears]);
            }

            dimSet.forEach(dim => {
              const dimension = Object.keys(dim)[0];
              const level = dim[dimension];
              if (dimension in cubeDimCuts) {
                const drill = findDimension(flatDims, level);
                queryCuts.push([drill, cubeDimCuts[dimension][level].map(d => d.id)]);
                queryDrilldowns.push(drill);
              }
              else if (level.cut) {
                const {level: l, cut: cutValue} = level;
                const drill = findDimension(flatDims, l);
                if (dimension !== "Year" && !drilldowns.includes(drill.level)) queryDrilldowns.push(drill);
                queryCuts.push([drill, cutValue]);
              }
            });

            cube.measures.forEach(measure => {
              if (debug) console.log(`Measure: ${measure}`);
              query.measure(measure);
            });

            queryCuts.forEach(arr => {
              const [drill, value] = arr;
              const {dimension, hierarchy, level} = drill;
              if (!drilldowns.includes(level)) queryDrilldowns.push(drill);
              const cut = (value instanceof Array ? value : [value]).map(v => `[${dimension}].[${hierarchy}].[${level}].&[${v}]`).join(",");
              if (debug) console.log(`Cut: ${cut}`);
              query.cut(`{${cut}}`);
            });

            const completedDrilldowns = [];
            queryDrilldowns.forEach(d => {
              const {dimension, hierarchy, level} = d;
              const dimString = `${dimension}, ${hierarchy}, ${level}`;
              if (!completedDrilldowns.includes(dimString)) {
                completedDrilldowns.push(dimString);
                if (debug) console.log(`Drilldown: ${dimString}`);
                query.drilldown(dimension, hierarchy, level);
                (properties.length && d.properties ? d.properties : []).forEach(prop => {
                  if (properties.includes(prop)) {
                    const propString = `${dimension}, ${hierarchy}, ${prop}`;
                    if (debug) console.log(`Property: ${propString}`);
                    query.property(dimension, hierarchy, prop);
                  }
                });
              }
            });

            query.option("parents", yn(parents));

            return client.query(query, "jsonrecords");
          })
          .catch(d => {
            console.log("\nCube Error", d.response.status, d.response.statusText);
            console.log(d.response.data);
            return {error: d};
          });

        queryPromises.push(q);

      }

    }

    const data = await Promise.all(queryPromises);

    const flatArray = data.reduce((arr, d, i) => {

      let data = d.error || !d.data.data ? [] : d.data.data;

      if (perValue) {
        data = multiSort(data, order, sort);
        data = data.slice(0, limit);
      }

      const cross = queryCrosses[i];
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
      queryCrosses.length ? queryCrosses[0].map(d => Object.keys(d)[0]) : [],
      drilldowns,
      cuts.map(d => d[0]),
      ["Year"]
    ]);

    const mergedData = d3Collection.nest()
      .key(d => keys.map(key => d[key]).join("_"))
      .entries(flatArray)
      .map(d => Object.assign(...d.values));

    let sortedData = multiSort(mergedData, order, sort);

    if (limit && !perValue) sortedData = sortedData.slice(0, limit);

    const source = Object.values(queries).map(d => {
      delete d.flatDims;
      delete d.dimensions;
      delete d.subs;
      return d;
    });

    res.json({data: sortedData, source}).end();

  });

};
