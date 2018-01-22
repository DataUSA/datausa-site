const axios = require("axios");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/profile/:slug/:id", (req, res) => {
    const {id} = req.params;
    let returnVariables = {};
    db.generators.findAll().then(generators => {
      const requests = Array.from(new Set(generators.map(g => g.api)));
      Promise.all(requests.map(r => axios.get(r.replace(/\<id\>/g, id)))).then(results => {
        results.forEach((r, i) => {
          const requiredGenerators = generators.filter(g => g.api === requests[i]);
          requiredGenerators.forEach(g => {
            const logicFunc = Function("resp", g.logic);
            const vars = logicFunc(r.data);
            returnVariables = Object.assign({}, returnVariables, vars);
          });
        });
        db.materializers.findAll().then(materializers => {
          materializers.sort((a, b) => a.ordering - b.ordering);
          materializers.forEach(m => {
            const logicFunc = Function("variables", m.logic);
            const vars = logicFunc(returnVariables);
            returnVariables = Object.assign({}, returnVariables, vars);
          });
          res.json(returnVariables).end();
        });
      });
    });
  });

};
