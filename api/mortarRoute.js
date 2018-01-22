const axios = require("axios");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/profile/:slug/:id", (req, res) => {
    const {slug, id} = req.params;

    db.generators.findAll()
      .then(generators => {
        const requests = Array.from(new Set(generators.map(g => g.api)));
        const fetches = requests.map(r => axios.get(r.replace(/\<id\>/g, id)));
        return Promise.all([generators, requests, Promise.all(fetches)]);
      })
      .then(resp => {
        const [generators, requests, results] = resp;
        let returnVariables = {};
        results.forEach((r, i) => {
          const requiredGenerators = generators.filter(g => g.api === requests[i]);
          requiredGenerators.forEach(g => {
            const logicFunc = Function("resp", g.logic);
            const vars = logicFunc(r.data);
            returnVariables = Object.assign({}, returnVariables, vars);
          });
        });
        return Promise.all([returnVariables, db.materializers.findAll()]);
      })
      .then(resp => {
        let returnVariables = resp[0];
        const materializers = resp[1];
        materializers.sort((a, b) => a.ordering - b.ordering);
        materializers.forEach(m => {
          const logicFunc = Function("variables", m.logic);
          const vars = logicFunc(returnVariables);
          returnVariables = Object.assign({}, returnVariables, vars);
        });
        return Promise.all([returnVariables, db.formatters.findAll()]);
      })
      .then(resp => {
        const [variables, formatters] = resp;
        const returnObject = {variables};
        return Promise.all([returnObject, formatters, db.profiles.findOne({where: {slug}, raw: true})]);
      })
      .then(resp => {
        let returnObject = resp[0];
        const formatters = resp[1];
        const profile = resp[2];
        for (const pkey in profile) {
          if (profile.hasOwnProperty(pkey) && pkey !== "id") {
            for (const vkey in returnObject.variables) {
              if (returnObject.variables.hasOwnProperty(vkey)) {
                const val = returnObject.variables[vkey];
                profile[pkey] = profile[pkey].replace(`{{${vkey}}}`, val);
              }
            }
          }
        }
        returnObject = Object.assign({}, returnObject, profile);
        res.json(returnObject).end();
      })
      .catch(err => {
        console.error(err);
      });

  });

};
