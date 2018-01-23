const axios = require("axios");

const varSwap = (sourceObj, formatterFunctions, variables) => {
  for (const skey in sourceObj) {
    if (sourceObj.hasOwnProperty(skey) && typeof sourceObj[skey] === "string") {
      const re = new RegExp(/([A-z0-9]*)\{\{([A-z0-9]+)\}\}/g);
      let m;
      do {
        m = re.exec(sourceObj[skey]);
        if (m) {
          const formatter = m[1] ? formatterFunctions[m[1]] : d => d;
          sourceObj[skey] = sourceObj[skey].replace(m[0], formatter(variables[m[2]]));
        }
      } while (m);
    }
  }
  return sourceObj;
};

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
          returnVariables = requiredGenerators.reduce((acc, g) => {
            const logicFunc = Function("resp", g.logic);
            const vars = logicFunc(r.data);
            return {...returnVariables, ...vars};
          }, returnVariables);
        });
        return Promise.all([returnVariables, db.materializers.findAll({raw: true})]);
      })
      .then(resp => {
        let returnVariables = resp[0];
        const materializers = resp[1];
        materializers.sort((a, b) => a.ordering - b.ordering);
        returnVariables = materializers.reduce((acc, m) => {
          const logicFunc = Function("variables", m.logic);
          const vars = logicFunc(acc);
          return {...acc, ...vars};
        }, returnVariables);
        return Promise.all([returnVariables, db.formatters.findAll()]);
      })
      .then(resp => {
        const [variables, formatters] = resp;
        const formatterFunctions = formatters.reduce((acc, f) => (acc[f.name] = Function("n", f.logic), acc), {});
        const returnObject = {variables};
        return Promise.all([returnObject, formatterFunctions, db.profiles.findOne({where: {slug}, include: [{association: "visualizations", attributes: ["logic"], where: {owner_type: "profile"}}, {association: "sections", include: [{association: "topics", include: [{association: "visualizations", attributes: ["logic"], where: {owner_type: "topic"}}]}]}]})]);
      })
      .then(resp => {
        let returnObject = resp[0];
        const formatterFunctions = resp[1];
        const profile = varSwap(resp[2].toJSON(), formatterFunctions, returnObject.variables);
        if (profile.sections) {
          profile.sections = profile.sections.map(s => {
            if (s.topics) {
              s.topics = s.topics.map(t => {
                if (t.visualizations) {
                  t.visualizations = t.visualizations.map(v => Function("variables", v.logic.replace(/\<id\>/g, id))(returnObject.variables));
                }
                return varSwap(t, formatterFunctions, returnObject.variables);
              });
            }
            return varSwap(s, formatterFunctions, returnObject.variables);
          });
        }
        if (profile.visualizations) {
          profile.visualizations = profile.visualizations.map(v => Function("variables", v.logic.replace(/\<id\>/g, id))(returnObject.variables));
        }
        returnObject = Object.assign({}, returnObject, profile);
        return Promise.all([returnObject, formatterFunctions, db.visualizations.findAll({where: {owner_type: "profile", owner_id: profile.id}})]);
      })
      .then(resp => {
        res.json(resp[0]).end();
      })
      .catch(err => {
        console.error(err);
      });

  });

};
