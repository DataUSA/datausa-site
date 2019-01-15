const axios = require("axios");
const sequelize = require("sequelize");
const loadJSON = require("../utils/loadJSON");

const universitySimilar = loadJSON("/static/data/similar_universities_with_dist.json");
const napcs2sctg = loadJSON("/static/data/nacps2sctg.json");
const naics2io = loadJSON("/static/data/pums_naics_to_iocode.json");

const naics2bls = loadJSON("/static/data/pums_bls_industry_crosswalk.json");
const soc2bls = loadJSON("/static/data/pums_bls_occupation_crosswalk.json");

const {CANON_API, CANON_LOGICLAYER_CUBE} = process.env;
const geoOrder = ["Nation", "State", "County", "MSA", "Place", "PUMA"];

module.exports = function(app) {

  const {cache, db} = app.settings;

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
        cut = await axios.get(`${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=state&overlapSize=true`)
          .then(resp => resp.data)
          .then(arr => arr.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid);
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
    else if (prefix === "795") { // Puma
      cut = `040${id.slice(3, 9)}`;
      drilldown = level || "PUMA";
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
      parent = await axios.get(`${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=state&overlapSize=true`)
        .then(resp => resp.data)
        .then(arr => arr.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid);
      level = "County";
    }
    else {
      parent = `040${id.slice(3, 9)}`;
      level = "County";
    }

    res.json({cut: parent, drilldown: level});

  });

  app.get("/api/cip/parent/:id/:level", (req, res) => {

    const {id, level} = req.params;
    const depth = parseInt(level.slice(3), 10);
    const parentId = id.slice(0, depth);
    db.search
      .findOne({where: {id: parentId, dimension: "CIP"}})
      .then(cip => {
        res.json(cip);
      })
      .catch(err => res.json(err));

  });

  app.get("/api/:slug/similar/:urlId", async(req, res) => {

    const {limit, slug, urlId} = req.params;

    const profile = await db.profiles.findOne({where: {slug}});
    const {dimension} = profile;

    const attr = await db.search.findOne({where: {[sequelize.Op.or]: {id: urlId, slug: urlId}, dimension}})
      .catch(err => res.json(err));

    const {hierarchy, id} = attr;
    let attrs = [];

    if (dimension === "Geography") {
      if (id === "01000US") {
        const states = await axios.get(`${CANON_API}/api/data?drilldowns=State&measure=Household%20Income%20by%20Race&Year=latest&order=Household%20Income%20by%20Race`)
          .then(resp => {
            const arr = resp.data.data;
            const l = Math.ceil(parseFloat(limit || 6) / 2);
            return arr.slice(0, l).concat(arr.slice(-l));
          });
        attrs = states.length ? await db.search
          .findAll({where: {id: states.map(d => d["ID State"]), dimension}})
          .catch(err => res.json(err)) : [];
      }
      else {
        const prefix = id.slice(0, 3);

        const targetLevels = prefix === "040" ? "msa" /* state */
          : prefix === "050" ? "state,msa" /* county */
            : prefix === "310" ? "state" /* msa */
              : prefix === "160" ? "state,msa,county,puma" /* place */
                : prefix === "795" ? "state,msa,county" /* puma */
                  : false;

        const url = targetLevels
          ? `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=${targetLevels}`
          : `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}`;

        const ids = await axios.get(url)
          .then(resp => resp.data.map(d => d.geoid))
          .catch(err => res.json(err));

        ids.push("01000US");

        attrs = await db.search
          .findAll({where: {id: ids, dimension}})
          .catch(err => res.json(err));

        const neighbors = ["160"].includes(prefix) ? [] : await axios.get(`${CANON_API}/api/neighbors?dimension=Geography&id=${id}`)
          .then(resp => resp.data.data)
          .catch(err => res.json(err));

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
          .findAll({where: {id: ids, dimension}})
          .catch(err => res.json(err));
      }
      else {
        attrs = await db.search
          .findAll({where: {dimension, hierarchy}})
          .catch(err => res.json(err));
      }
    }
    else {

      const parents = await axios.get(`${CANON_API}/api/parents/${slug}/${id}`)
        .then(resp => resp.data)
        .catch(err => res.json(err));

      attrs = parents.length ? await db.search
        .findAll({where: {id: parents.map(d => d.id), dimension}})
        .catch(err => res.json(err)) : [];

      const measures = {
        "PUMS Occupation": "Average Wage",
        "PUMS Industry": "Average Wage",
        "CIP": "Completions",
        "NAPCS": "Obligation Amount"
      };
      const neighbors = measures[dimension] ? await axios.get(`${CANON_API}/api/neighbors?dimension=${dimension}&id=${id}&measure=${measures[dimension]}`)
        .then(resp => resp.data.data.map(d => d[`ID ${hierarchy}`]))
        .catch(err => res.json(err)) : [];

      const neighborAttrs = neighbors.length ? await db.search
        .findAll({where: {id: neighbors.filter(d => d !== id).map(String), dimension, hierarchy}})
        .catch(err => res.json(err)) : [];

      attrs = attrs.concat(neighborAttrs)
        .filter((d, i, arr) => arr.indexOf(arr.find(a => a.id === d.id && a.hierarchy === d.hierarchy)) === i);
    }

    res.json(attrs.sort((a, b) => b.zvalue - a.zvalue).slice(0, limit || 6));



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
  app.get("/api/university/commonJobLookup/:id", (req, res) => {
    const {id} = req.params;
    const cipURL = `${CANON_API}/api/data?University=${id}&measures=Completions,yuc%20RCA&year=latest&drilldowns=CIP2&order=yuc%20RCA&sort=desc`;
    axios.get(cipURL).then(resp => {
      const CIP2 = resp.data.data.filter(ipedsPumsFilter).slice(0, 5).map(d => d["ID CIP2"]).join();
      const logicUrl = `${CANON_API}/api/data?measures=Total%20Population,Record%20Count&year=latest&drilldowns=CIP2,Detailed%20Occupation&order=Total%20Population&sort=desc&Workforce%20Status=true&Employment%20Time%20Status=1&Record%20Count%3E=5&CIP2=${CIP2}`;
      axios.get(logicUrl).then(resp => {
        const dedupedJobs = [];
        const jobList = resp.data.data;
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
        res.json({data: dedupedJobs.slice(0, 10)}).end();
      });
    });
  });

  /**
   * To handle the sentence: "The highest paying jobs for people who hold a degree in one of the
   * 5 most specialized majors at University."
   */
  app.get("/api/university/highestWageLookup/:id", (req, res) => {
    const {id} = req.params;
    const cipURL = `${CANON_API}/api/data?University=${id}&measures=Completions,yuc%20RCA&year=latest&drilldowns=CIP2&order=yuc%20RCA&sort=desc`;
    axios.get(cipURL).then(resp => {
      const CIP2 = resp.data.data.filter(ipedsPumsFilter).slice(0, 5).map(d => d["ID CIP2"]).join();
      const logicUrl = `${CANON_API}/api/data?measures=Average%20Wage,Record%20Count&year=latest&drilldowns=CIP2,Detailed%20Occupation&order=Average%20Wage&sort=desc&Workforce%20Status=true&Employment%20Time%20Status=1&Record%20Count%3E=5&CIP2=${CIP2}`;
      axios.get(logicUrl).then(resp => {
        const dedupedWages = [];
        const wageList = resp.data.data;
        wageList.forEach(d => {
          if (dedupedWages.length < 5 && !dedupedWages.find(w => w["Detailed Occupation"] === d["Detailed Occupation"])) dedupedWages.push(d);
        });
        res.json({data: dedupedWages.slice(0, 10)}).end();
      });
    });
  });

  /**
   * To handle the sentence: "The most common industries for people who hold a degree in one
   * of the 5 most specialized majors at University."
   */
  app.get("/api/university/commonIndustryLookup/:id", (req, res) => {
    const {id} = req.params;
    const cipURL = `${CANON_API}/api/data?University=${id}&measures=Completions,yuc%20RCA&year=latest&drilldowns=CIP2&order=yuc%20RCA&sort=desc`;
    axios.get(cipURL).then(resp => {
      const CIP2 = resp.data.data.filter(ipedsPumsFilter).slice(0, 5).map(d => d["ID CIP2"]).join();
      const logicUrl = `${CANON_API}/api/data?measures=Total%20Population,Record%20Count&year=latest&drilldowns=CIP2,Industry%20Group&order=Total%20Population&Workforce%20Status=true&Employment%20Time%20Status=1&sort=desc&Record%20Count>=5&CIP2=${CIP2}`;
      axios.get(logicUrl).then(resp => {
        const dedupedIndustries = [];
        const industryList = resp.data.data;
        // The industryList has duplicates. For example, if a Biology Major enters Biotech, and a separate
        // Science major enters Biotech, these are listed as separate data points. These must be folded
        // together under one "Biotech" to create an accurate picture of "industries entered by graduates with X degrees"
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
        res.json({data: dedupedIndustries.slice(0, 10)}).end();
      });
    });
  });

  app.get("/api/parents/:slug/:id", async(req, res) => {

    const {slug, id} = req.params;
    const {dimension} = await db.profiles.findOne({where: {slug}});
    const attr = await db.search
      .findOne({where: {[sequelize.Op.or]: {id, slug: id}, dimension}})
      .catch(err => res.json(err));

    if (attr) {
      if (dimension === "Geography") {
        if (attr.id === "01000US") res.json([]);
        const prefix = attr.id.slice(0, 3);

        const targetLevels = prefix === "040" ? "nation" /* state */
          : prefix === "050" ? "state,msa" /* county */
            : prefix === "310" ? "state" /* msa */
              : prefix === "160" ? "state,county,msa" /* place */
                : prefix === "795" ? "state" /* puma */
                  : false;

        const url = targetLevels
          ? `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${attr.id}?targetLevels=${targetLevels}`
          : `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${attr.id}`;

        const parents = await axios.get(url).then(resp => resp.data);
        const ids = parents.map(d => d.geoid);
        if (!ids.includes("01000US")) ids.unshift("01000US");
        const attrs = ids.length ? await db.search.findAll({where: {id: ids, dimension}}) : [];
        res.json(attrs.sort((a, b) => geoOrder.indexOf(a.hierarchy) - geoOrder.indexOf(b.hierarchy)));
      }
      else {
        const parents = cache.parents[slug] || {};
        const ids = parents[attr.id] || [];
        const attrs = ids.length ? await db.search.findAll({where: {id: ids, dimension}}) : [];
        res.json(attrs);
      }
    }

  });

  app.get("/api/neighbors", async(req, res) => {

    const {dimension, drilldowns, id, limit = 5} = req.query;

    if (dimension === "Geography") {

      const neighbors = await axios.get(`${CANON_LOGICLAYER_CUBE}/geoservice-api/neighbors/${id}`)
        .then(resp => resp.data.map(d => d.geoid))
        .catch(err => res.json(err));

      const attrs = await db.search
        .findAll({where: {dimension, id: neighbors}})
        .catch(err => res.json(err));

      res.json({data: attrs});

    }
    else {
      const attr = await db.search.findOne({where: {dimension, id}});
      const {hierarchy} = attr;

      req.query.limit = 10000;
      const measure = req.query.measure || req.query.measures;
      if (req.query.measure) {
        req.query.measures = req.query.measure;
        delete req.query.measure;
      }
      delete req.query.dimension;
      delete req.query.id;
      if (!req.query.order) {
        req.query.order = measure.split(",")[0];
        req.query.sort = "desc";
      }

      if (measure !== "Obligation Amount" && !req.query.Year && !req.query.year) req.query.Year = "latest";

      if (!drilldowns) {
        req.query.drilldowns = hierarchy;
      }
      else if (!drilldowns.includes(hierarchy)) {
        req.query.drilldowns += `,${hierarchy}`;
      }

      const params = Object.entries(req.query).map(([key, val]) => `${key}=${val}`).join("&");
      const logicUrl = `${CANON_API}/api/data?${params}`;

      const resp = await axios.get(logicUrl)
        .then(resp => resp.data);

      if (resp.error) res.json(resp);

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

  });


};
