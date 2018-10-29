const axios = require("axios");

const loadJSON = require("../utils/loadJSON");

const universitySimilar = loadJSON("/static/data/similar_universities.json");
const napcs2sctg = loadJSON("/static/data/nacps2sctg.json");

const {CANON_API} = process.env;

module.exports = function(app) {

  const {cache, db} = app.settings;

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

  app.get("/api/university/similar/:id", (req, res) => {

    const ids = universitySimilar[req.params.id] || [];

    db.search
      .findAll({where: {id: ids, dimension: "University"}})
      .then(universities => {
        res.json(universities);
      })
      .catch(err => res.json(err));

  });

  app.get("/api/university/opeid/:id", (req, res) => {

    res.json({opeid: cache.opeid[req.params.id]});

  });

  app.get("/api/napcs/:id/sctg", (req, res) => {

    const ids = napcs2sctg[req.params.id] || [];
    res.json(ids.map(d => cache.sctg[d] || {id: d}));

  });

  app.get("/api/neighbors", async(req, res) => {

    const {dimension, drilldowns, id, limit = 5} = req.query;

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

    if (!req.query.Year && !req.query.year) req.query.Year = "latest";

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

    let list = resp.data;

    const entry = list.find(d => d[`ID ${hierarchy}`] === id);
    const index = list.indexOf(entry);

    if (index <= limit / 2 + 1) {
      list = list.slice(0, limit);
    }
    else if (index > list.length - limit / 2 - 1) {
      list = list.slice(-limit);
    }
    else {
      const min = Math.ceil(index - limit / 2);
      list = list.slice(min, min + limit);
    }

    res.json({data: list, source: resp.source});

  });


};
