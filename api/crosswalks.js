const axios = require("axios");
const sequelize = require("sequelize");
const loadJSON = require("../utils/loadJSON");
const {max} = require("d3-array");

const universitySimilar = loadJSON("/static/data/similar_universities_with_dist.json");
const napcs2sctg = loadJSON("/static/data/nacps2sctg.json");
const naics2io = loadJSON("/static/data/pums_naics_to_iocode.json");

const naics2bls = loadJSON("/static/data/pums_bls_industry_crosswalk.json");
const soc2bls = loadJSON("/static/data/pums_bls_occupation_crosswalk.json");

const {CANON_API, CANON_GEOSERVICE_API, CANON_CONST_TESSERACT} = process.env;
const geoOrder = ["Nation", "State", "County", "MSA", "Place", "PUMA"];

module.exports = function(app) {

  const {cache, db} = app.settings

  app.get("/api/geo/children/:id/", async(req, res) => {

    const {id} = req.params;
    const {level} = req.query;

    const prefix = id.slice(0, 3);
    let cut, drilldown;

    if (["Nation", "State"].includes(level)) {
      cut = false;
      drilldown = level;
    }
    else if (prefix === "040") { // State
      cut = id;
      drilldown = level || "County";
    }
    else if (prefix === "050") { // County
      cut = id;
      drilldown = level || "Tract";
    }
    else if (prefix === "310") { // MSA
      if (level === "Tract") {
        cut = id;
        drilldown = "MSA-Tract";
      }
      else {
        const url = `${CANON_GEOSERVICE_API}relations/intersects/${id}?targetLevels=state&overlapSize=true`;
        const cuts = await axios.get(url)
          .then(resp => resp.data)
          .then(resp => {
            if (resp.error) {
              console.error(`[geoservice error] ${url}`);
              console.error(resp.error);
              return [];
            }
            else {
              return resp  || [];
            }
          })
          .then(arr => arr.sort((a, b) => b.overlap_size - a.overlap_size))
          .catch(() => []);
        cut = cuts.length ? cuts.every(d => d.level === "state") ? cuts.map(d => d.geoid) : cuts[0].geoid : "01000US";
        drilldown = level || "County";
      }
    }
    else if (prefix === "160") { // Place
      if (level === "Tract") {
        cut = id;
        drilldown = "Place-Tract";
      }
      else {
        cut = `040${id.slice(3, 9)}`;
        drilldown = level || "Place";
      }
    }
    else if (prefix === "795") { // PUMA
      cut = `040${id.slice(3, 9)}`;
      drilldown = level || "PUMA";
    }
    else if (prefix === "500") { // Congressional District
      cut = `040${id.slice(3, 9)}`;
      drilldown = level || "Congressional District";
    }
    else {
      cut = false;
      drilldown = level || "State";
    }

    res.json({cut, drilldown});

  });

  app.get("/api/geo/childrenCounty/:id/", async(req, res) => {

    const {id} = req.params;

    const prefix = id.slice(0, 3);
    let level, parent;

    if (prefix === "010") {
      parent = false;
      level = "State";
    }
    else if (prefix === "310") {
      const url = `${CANON_GEOSERVICE_API}relations/intersects/${id}?targetLevels=state&overlapSize=true`;
      const parents = await axios.get(url)
        .then(resp => resp.data)
        .then(resp => {
          if (resp.error) {
            console.error(`[geoservice error] ${url}`);
            console.error(resp.error);
            return [];
          }
          else {
            return resp  || [];
          }
        })
        .then(arr => arr.sort((a, b) => b.overlap_size - a.overlap_size))
        .catch(() => []);
      parent = parents.length ? parents.map(d => d.geoid) : "01000US";
      level = "County";
    }
    else {
      parent = `040${id.slice(3, 9)}`;
      level = "County";
    }

    res.json({cut: parent, drilldown: level});

  });

  app.get("/api/cip/parent/:id/:level", async(req, res) => {

    const {id, level} = req.params;
    const depth = parseInt(level.slice(3), 10);
    const parentId = id.slice(0, depth);
    const cip = await db.search
      .findOne({
        where: {id: parentId, dimension: "CIP"},
        include: [{association: "content"}]
      })
      .catch(err => res.json(err));
    const ret = cip.toJSON();
    ret.name = ret.content[0].name;
    delete ret.content;
    res.json(ret);

  });

  app.get("/api/:slug/similar/:urlId", async(req, res) => {

    const {limit, slug, urlId} = req.params;

    const meta = await db.profile_meta.findOne({where: {slug}}).catch(() => false);

    if (!meta) res.json({error: "Not a valid profile type"});
    else {

      const {dimension} = meta;

      const attr = await db.search
        .findOne({where: {[sequelize.Op.or]: {id: urlId, slug: urlId}, dimension}})
        .catch(err => res.json(err));

      if (!attr) res.json({error: "Not a valid ID"});
      else {

        const {hierarchy, id} = attr;
        let attrs = [];

        if (dimension === "Geography") {
          if (id === "01000US") {

            const states = await axios
              .get(`${CANON_API}/api/data?drilldowns=State&measure=Household%20Income%20by%20Race&Year=latest&order=Household%20Income%20by%20Race`)
              .then(resp => {
                const arr = resp.data.data;
                const l = Math.ceil(parseFloat(limit || 6) / 2);
                return arr.slice(0, l).concat(arr.slice(-l));
              })
              .catch(() => []);

            attrs = states.length ? await db.search
              .findAll({
                where: {id: states.map(d => d["ID State"]), dimension},
                include: [{association: "content"}]
              })
              .catch(() => []) : [];

          }
          else {
            const prefix = id.slice(0, 3);

            const targetLevels = prefix === "040" ? "msa" /* state */
              : prefix === "050" ? "state,msa" /* county */
                : prefix === "310" ? "state" /* msa */
                  : prefix === "160" ? "state,msa,county" /* place */
                    : prefix === "795" ? "state,msa,county" /* puma */
                      : prefix === "500" ? "state,msa,county" /* district */
                        : false;

            const url = targetLevels
              ? `${CANON_GEOSERVICE_API}relations/intersects/${id}?targetLevels=${targetLevels}`
              : `${CANON_GEOSERVICE_API}relations/intersects/${id}`;

            let ids = await axios.get(url)
              .then(resp => resp.data)
              .then(resp => {
                if (resp.error) {
                  console.error(`[geoservice error] ${url}`);
                  console.error(resp.error);
                  return [];
                }
                else {
                  return resp  || [];
                }
              })
              .then(resp => resp.map(d => d.geoid))
              .catch(() => []);

            ids.push("01000US");

            if (cache.pops[id] > 250000) ids = ids.filter(d => cache.pops[d] > 250000);

            attrs = await db.search
              .findAll({
                where: {id: ids, dimension},
                include: [{association: "content"}]
              })
              .catch(() => []);

            const neighbors = ["160"].includes(prefix) ? [] : await axios.get(`${CANON_API}/api/neighbors?dimension=Geography&id=${id}`)
              .then(resp => resp.data.data)
              .catch(() => []);

            attrs = attrs.concat(neighbors)
              .filter((d, i, arr) => arr.indexOf(arr.find(a => a.id === d.id)) === i);
          }
        }
        else if (dimension === "University") {
          if (hierarchy === "University") {
            const ids = (universitySimilar[id] || [])
              .slice(0, limit || 5)
              .map(d => d.university);
            attrs = await db.search
              .findAll({
                where: {id: ids, dimension},
                include: [{association: "content"}]
              })
              .catch(() => []);
          }
          else {
            attrs = await db.search
              .findAll({
                where: {dimension, hierarchy},
                include: [{association: "content"}]
              })
              .catch(() => []);
          }
        }
        else {

          const parents = await axios.get(`${CANON_API}/api/parents/${slug}/${id}`)
            .then(resp => resp.data)
            .catch(() => []);

          attrs = parents.length ? await db.search
            .findAll({
              where: {id: parents.map(d => d.id), dimension},
              include: [{association: "content"}]
            })
            .catch(() => []) : [];

          const measures = {
            "PUMS Occupation": "Average Wage",
            "PUMS Industry": "Average Wage",
            "CIP": "Completions",
            "NAPCS": "Obligation Amount"
          };
          const neighbors = measures[dimension] ? await axios.get(`${CANON_API}/api/neighbors?dimension=${dimension}&id=${id}&measure=${measures[dimension]}`)
            .then(resp => resp.data.data.map(d => d[`ID ${hierarchy}`]))
            .catch(() => []) : [];

          const neighborAttrs = neighbors.length ? await db.search
            .findAll({
              where: {id: neighbors.filter(d => d !== id).map(String), dimension, hierarchy},
              include: [{association: "content"}]
            })
            .catch(() => []) : [];

          attrs = attrs.concat(neighborAttrs)
            .filter((d, i, arr) => arr.indexOf(arr.find(a => a.id === d.id && a.hierarchy === d.hierarchy)) === i);
        }

        const retArray = attrs
          .sort((a, b) => b.zvalue - a.zvalue)
          .slice(0, limit || 6)
          .map(row => {
            if (row.toJSON) {
              const d = row.toJSON();
              d.name = d.content[0].name
              delete d.content;
              return d;
            }
            return row;
          });

        res.json(retArray);

      }

    }

  });

  app.get("/api/university/opeid/:id", (req, res) => {

    res.json({opeid: cache.opeid[req.params.id]});

  });

  app.get("/api/naics/:id/:level", (req, res) => {

    const {id, level} = req.params;

    if (level === "Industry") {
      const ids = naics2bls[req.params.id] || [];
      res.json(ids);
    }
    else {
      const matches = naics2io[id] || {};
      const available = "L0";
      res.json({id: matches[available], level: level.replace(/L[0-9]$/g, available)});
    }

  });

  app.get("/api/soc/:id/bls", (req, res) => {

    const ids = soc2bls[req.params.id] || [];
    res.json(ids);

  });

  app.get("/api/napcs/:id/sctg", (req, res) => {

    const ids = napcs2sctg[req.params.id] || [];
    res.json(ids.map(d => cache.sctg[d] || {id: d}));

  });

  /**
   * The following three lookup methods make two queries: one to IPEDS, one to PUMS. The following CIP2 IDs exist
   * in IPEDS but not in PUMS. This causes cuts to fail and shows incomplete data. When performing any of the following
   * two-part queries, filter out the "bad" CIP2s from the IPEDS results so that PUMS only gets confirmed good IDs.
   */
  const ipedsPumsFilter = d => !["21", "29", "32", "33", "34", "35", "36", "37", "48", "53", "60"].includes(d["ID CIP2"]);

  /**
   * To handle the sentence: "The most common jobs for people who hold a degree in one of the
   * 5 most specialized majors at University," requires that we construct an API request
   * WITH THOSE 5 MAJORS in the url. This crosswalk is responsible for constructing that request.
   */
  app.get("/api/university/commonJobLookup/:id/:hierarchy", async(req, res) => {

    const ipedsPumsFilterTesseract = d => ![21, 29, 32, 33, 34, 35, 36, 37, 48, 53, 60].includes(d["CIP2 ID"]);

    const {id} = req.params;
    const {hierarchy} = req.params;

    const latestYearUrl = `${CANON_CONST_TESSERACT}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year&include=${hierarchy}:${id}&locale=en&measures=Completions&time=Year.latest`
    const latestYear = await axios.get(latestYearUrl)
      .then(resp => resp.data.data[0]["Year"]);

    const cipURL = `${CANON_CONST_TESSERACT}complexity/rca_historical.jsonrecords?cube=ipeds_completions&location=${hierarchy}&activity=CIP2&measure=Completions&time=Year&filter=${hierarchy}:${id}&cuts=Year:${latestYear}`

    const CIP2 = await axios.get(cipURL)
      .then(resp => resp.data.data
        .sort((a, b) => b["Completions RCA"] - a["Completions RCA"])
        .filter(ipedsPumsFilterTesseract)
        .slice(0, 5)
        .map(d => `${d["CIP2 ID"]}`.padStart(2, '0')).join());

    const logicUrl = `${CANON_CONST_TESSERACT}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,CIP2,Detailed+Occupation&include=Workforce+Status:true;Employment+Time+Status:1;CIP2:${CIP2}&locale=en&measures=Record+Count,Total+Population&time=Year.latest&filters=Record+Count.gte.5&sort=Total+Population.desc`
    const jobList = await axios.get(logicUrl)
      .then(resp => resp.data.data)
      .catch(() => []);

    const dedupedJobs = [];
    // The jobList has duplicates. For example, if a Biology Major becomes a Physician, and a separate
    // Science major becomes a Physician, these are listed as separate data points. These must be folded
    // together under one "Physician" to create an accurate picture of "jobs held by graduates with X degrees"
    jobList.forEach(d => {
      const thisJob = dedupedJobs.find(j => j["Detailed Occupation"] === d["Detailed Occupation"]);
      if (thisJob) {
        thisJob["Total Population"] += d["Total Population"];
      }
      else {
        dedupedJobs.push(d);
      }
    });

    dedupedJobs.sort((a, b) => b["Total Population"] - a["Total Population"]);
    res.json({data: dedupedJobs.slice(0, 10)});

  });

  /**
   * To handle the sentence: "The highest paying jobs for people who hold a degree in one of the
   * 5 most specialized majors at University."
   */
  app.get("/api/university/highestWageLookup/:id/:hierarchy", async(req, res) => {

    const ipedsPumsFilterTesseract = d => ![21, 29, 32, 33, 34, 35, 36, 37, 48, 53, 60].includes(d["CIP2 ID"]);

    const {id} = req.params;
    const {hierarchy} = req.params;

    const latestYearUrl = `${CANON_CONST_TESSERACT}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year&include=${hierarchy}:${id}&locale=en&measures=Completions&time=Year.latest`
    const latestYear = await axios.get(latestYearUrl)
      .then(resp => resp.data.data[0]["Year"]);

    const cipURL = `${CANON_CONST_TESSERACT}complexity/rca_historical.jsonrecords?cube=ipeds_completions&location=${hierarchy}&activity=CIP2&measure=Completions&time=Year&filter=${hierarchy}:${id}&cuts=Year:${latestYear}`

    const CIP2 = await axios.get(cipURL)
      .then(resp => resp.data.data
        .sort((a, b) => b["Completions RCA"] - a["Completions RCA"])
        .filter(ipedsPumsFilterTesseract)
        .slice(0, 5)
        .map(d => `${d["CIP2 ID"]}`.padStart(2, '0')).join());

    const logicUrl = `${CANON_CONST_TESSERACT}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,CIP2,Detailed+Occupation&include=Workforce+Status:true;Employment+Time+Status:1;CIP2:${CIP2}&locale=en&measures=Record+Count,Average+Wage&time=Year.latest&filters=Record+Count.gte.5&sort=Average+Wage.desc`

    const wageList = await axios.get(logicUrl)
    .then(resp => resp.data.data)

    wageList.sort((a, b) => b["Average Wage"] - a["Average Wage"]);

    const dedupedWages = [];
    wageList.forEach(d => {
      if (dedupedWages.length < 5 && !dedupedWages.find(w => w["Detailed Occupation"] === d["Detailed Occupation"])) dedupedWages.push(d);
    });


    dedupedWages.sort((a, b) => b["Average Wage"] - a["Average Wage"]);
    res.json({data: dedupedWages.slice(0, 10)});

  });

  /**
   * To handle the sentence: "The most common industries for people who hold a degree in one
   * of the 5 most specialized majors at University."
   */
  app.get("/api/university/commonIndustryLookup/:id/:hierarchy", async(req, res) => {

    const ipedsPumsFilterTesseract = d => ![21, 29, 32, 33, 34, 35, 36, 37, 48, 53, 60].includes(d["CIP2 ID"]);

    const {id} = req.params;
    const {hierarchy} = req.params;

    const latestYearUrl = `${CANON_CONST_TESSERACT}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year&include=${hierarchy}:${id}&locale=en&measures=Completions&time=Year.latest`
    const latestYear = await axios.get(latestYearUrl)
      .then(resp => resp.data.data[0]["Year"]);

    const cipURL = `${CANON_CONST_TESSERACT}complexity/rca_historical.jsonrecords?cube=ipeds_completions&location=${hierarchy}&activity=CIP2&measure=Completions&time=Year&filter=${hierarchy}:${id}&cuts=Year:${latestYear}`

    const CIP2 = await axios.get(cipURL)
      .then(resp => resp.data.data
        .sort((a, b) => b["Completions RCA"] - a["Completions RCA"])
        .filter(ipedsPumsFilterTesseract)
        .slice(0, 5)
        .map(d => `${d["CIP2 ID"]}`.padStart(2, '0')).join());

    const logicUrl = `${CANON_CONST_TESSERACT}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,CIP2,Industry+Group&include=Workforce+Status:true;Employment+Time+Status:1;CIP2:${CIP2}&locale=en&measures=Record+Count,Total+Population&time=Year.latest&filters=Record+Count.gte.5&sort=Total+Population.desc`

    let industryList = await axios.get(logicUrl)
      .then(resp => resp.data.data);

    const dedupedIndustries = [];
    // The industryList has duplicates. For example, if a Biology Major enters Biotech, and a separate
    // Science major enters Biotech, these are listed as separate data points. These must be folded
    // together under one "Biotech" to create an accurate picture of "industries entered by graduates with X degrees"
    industryList = industryList.filter(d => d["Industry Group ID"] !== "")

    industryList.forEach(d => {
    const thisIndustry = dedupedIndustries.find(j => j["Industry Group"] === d["Industry Group"]);
      if (thisIndustry) {
        thisIndustry["Total Population"] += d["Total Population"];
      }
      else {
        dedupedIndustries.push(d);
      }
    });

    dedupedIndustries.sort((a, b) => b["Total Population"] - a["Total Population"]);
    res.json({data: dedupedIndustries.slice(0, 10)});

  });

  app.get("/api/parents/:slug/:id", async(req, res) => {

    const {slug, id} = req.params;
    const {loose} = req.query;

    const meta = await db.profile_meta.findOne({where: {slug}}).catch(() => false);
    if (!meta) res.json({error: "Not a valid profile type"});
    const {dimension} = meta;

    const attr = await db.search
      .findOne({
        where: {[sequelize.Op.or]: {id, slug: id}, dimension},
        include: [{association: "content"}]
      })
      .catch(err => {
        res.json(err);
        return false;
      });

    attr.name = attr.content[0].name;

    if (attr) {
      if (dimension === "Geography") {
        if (attr.id === "01000US") {
          res.json([]);
        }
        else {
          const prefix = attr.id.slice(0, 3);

          const targetLevels = prefix === "040" ? "nation" /* state */
            : prefix === "050" ? "state,msa" /* county */
              : prefix === "310" ? "state" /* msa */
                : prefix === "160" ? "state,county,msa,puma" /* place */
                  : prefix === "795" ? "state" /* puma */
                    : prefix === "500" ? loose ? "place,msa,county,state" : "state" /* district */
                      : false;

          const url = targetLevels
            ? `${CANON_GEOSERVICE_API}relations/intersects/${attr.id}?targetLevels=${targetLevels}&overlapSize=true`
            : `${CANON_GEOSERVICE_API}relations/intersects/${attr.id}&overlapSize=true`;

          const parents = await axios.get(url)
            .then(resp => resp.data)
            .then(resp => {
              if (resp.error) {
                console.error(`[geoservice error] ${url}`);
                console.error(resp.error);
                return [];
              }
              else {
                return resp  || [];
              }
            })
            .catch(() => []);

          let ids = parents.map(d => d.geoid);
          if (cache.pops[attr.id] > 250000) ids = ids.filter(d => cache.pops[d] > 250000);
          if (!ids.includes("01000US")) ids.unshift("01000US");

          const attrs = ids.length ? await db.search
            .findAll({
              where: {id: ids, dimension},
              include: [{association: "content"}]
            })
            .map(row => {
              const d = row.toJSON();
              d.name = row.content[0].name;
              delete d.content;
              return d;
            })
            .catch(() => []) : [];

          res.json(attrs.sort((a, b) => {
            const levelDiff = geoOrder.indexOf(a.hierarchy) - geoOrder.indexOf(b.hierarchy);
            if (levelDiff === 0) {
              return b.overlap_size - a.overlap_size;
            }
            else {
              return levelDiff;
            }
          }));
        }
      }
      else {
        const parents = cache.parents[slug] || {};
        const ids = parents[attr.id] || [];

        const attrs = ids.length ? await db.search
          .findAll({
            where: {id: ids, dimension},
            include: [{association: "content"}]
          })
          .map(row => {
            const d = row.toJSON();
            d.name = row.content[0].name;
            delete d.content;
            return d;
          })
          .catch(() => []) : [];

        res.json(attrs);
      }
    }

  });

  app.get("/api/neighbors", async(req, res) => {

    const {dimension, drilldowns, id, limit = 5} = req.query;
    let {hierarchy} = req.query;

    if (dimension === "Geography") {

      const url = `${CANON_GEOSERVICE_API}neighbors/${id}`;
      const neighbors = await axios.get(url)
        .then(resp => resp.data)
        .then(resp => {
          if (resp.error) {
            console.error(`[geoservice error] ${url}`);
            console.error(resp.error);
            return [];
          }
          else {
            return resp  || [];
          }
        })
        .then(resp => resp.map(d => d.geoid))
        .catch(() => []);

      let attrs = await db.search
        .findAll({
          where: {dimension, id: neighbors},
          include: [{association: "content"}],
        })
        .catch(() => []);

      attrs = attrs.map(row => {
        const d = row.toJSON();
        d.name = d.content[0].name;
        delete d.content;
        return d;
      });

      res.json({data: attrs});

    }
    else {

      const where = {dimension, id};
      if (hierarchy) where.hierarchy = hierarchy;
      const attr = await db.search.findOne({where}).catch(() => false);

      if (!attr) res.json({error: "Not a valid attribute ID or dimension"});
      else {

        if (!hierarchy) hierarchy = attr.hierarchy;

        req.query.limit = 10000;
        const measure = req.query.measure || req.query.measures;
        if (req.query.measure) {
          req.query.measures = req.query.measure;
          delete req.query.measure;
        }
        delete req.query.dimension;
        delete req.query.id;
        delete req.query.hierarchy;
        if (!req.query.order) {
          req.query.order = measure.split(",")[0];
          req.query.sort = "desc";
        }

        if (!drilldowns) {
          req.query.drilldowns = hierarchy;
        }
        else if (!drilldowns.includes(hierarchy)) {
          req.query.drilldowns += `,${hierarchy}`;
        }

        if (measure !== "Obligation Amount" && !req.query.Year && !req.query.year) {
          const allYearQuery = Object.assign({[hierarchy]: id}, req.query);
          const allYearParams = Object.entries(allYearQuery).map(([key, val]) => `${key}=${val}`).join("&");
          const allYearURL = `${CANON_API}/api/data?${allYearParams}`;
          const allYearData = await axios.get(allYearURL)
            .then(resp => resp.data)
            .catch(error => ({error}));
          if (allYearData.error) req.query.Year = "latest";
          else req.query.Year = max(allYearData.data, d => d["ID Year"]);
        }

        const query = Object.assign({}, req.query);
        const params = Object.entries(query).map(([key, val]) => `${key}=${val}`).join("&");
        const logicUrl = `${CANON_API}/api/data?${params}`;

        const resp = await axios.get(logicUrl)
          .then(resp => resp.data)
          .catch(error => ({error}));

        if (resp.error) res.json(resp);
        else {

          const list = resp.data;
          const entry = list.find(d => d[`ID ${hierarchy}`] === id);

          const index = list.indexOf(entry);
          let data;

          if (index <= limit / 2 + 1) {
            data = list.slice(0, limit);
          }
          else if (index > list.length - limit / 2 - 1) {
            data = list.slice(-limit);
          }
          else {
            const min = Math.ceil(index - limit / 2);
            data = list.slice(min, min + limit);
          }

          data.forEach(d => {
            d.Rank = list.indexOf(d) + 1;
          });

          res.json({data, source: resp.source});

        }
      }
    }

  });


};
