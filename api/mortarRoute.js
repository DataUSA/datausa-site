const axios = require("axios");

const profileReq = {   
  logging: console.log, 
  include: [
    {
      association: "visualizations"
    }, 
    {
      association: "stats"
    },
    { 
      association: "sections", 
      include: [
        {
          association: "topics", 
          include: [
            {
              association: "visualizations"
            },
            {
              association: "stats"
            }
          ]
        }
      ]
    }
  ]
};

const varSwap = (sourceObj, formatterFunctions, variables) => {
  for (const skey in sourceObj) {
    if (sourceObj.hasOwnProperty(skey) && typeof sourceObj[skey] === "string") {
      const re = new RegExp(/([A-z0-9]*)\{\{([A-z0-9]+)\}\}/g);
      let m;
      do {
        m = re.exec(sourceObj[skey]);
        if (m) {
          const formatter = m[1] ? formatterFunctions[m[1]] : d => d;
          const reswap = new RegExp(`${m[0]}`, "g");
          sourceObj[skey] = sourceObj[skey].replace(reswap, formatter(variables[m[2]]));
        }
      } while (m);
    }
  }
  return sourceObj;
};

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/internalprofile/all", (req, res) => {
    Promise.all([
      db.generators.findAll(),
      db.materializers.findAll(),
      db.formatters.findAll(),
      db.profiles.findAll(profileReq)
    ]).then(resp => {
      res.json({
        builders: {
          generators: resp[0],
          materializers: resp[1].sort((a, b) => a.ordering - b.ordering),
          formatters: resp[2]
        },
        profiles: resp[3]
      });
    });
    
  });

  app.get("/api/internalprofile/:slug", (req, res) => {
    const {slug} = req.params;
    const reqObj = Object.assign({}, profileReq, {where: {slug}});
    db.profiles.findOne(reqObj).then(u => res.json(u).end());
  });

  app.get("/api/profile/:slug/:id", (req, res) => {
    const {slug, id} = req.params;
    const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;

    db.profiles.findOne({where: {slug}, raw: true})
      .then(profile => 
        Promise.all([profile.id, db.generators.findAll({where: {profile_id: profile.id}})])
      )
      .then(resp => {
        const [pid, generators] = resp;
        const requests = Array.from(new Set(generators.map(g => g.api)));
        const fetches = requests.map(r => axios.get(r.replace(/\<id\>/g, id)));
        return Promise.all([pid, generators, requests, Promise.all(fetches)]);
      })
      .then(resp => {
        const [pid, generators, requests, results] = resp;
        let returnVariables = {};
        const genStatus = {};
        results.forEach((r, i) => {
          const requiredGenerators = generators.filter(g => g.api === requests[i]);
          returnVariables = requiredGenerators.reduce((acc, g) => {
            let vars = {};
            try {
              const resp = r.data;
              eval(`
                let f = resp => {${g.logic}};
                vars = f(resp);
              `);
              genStatus[g.id] = vars;
            }
            catch (e) {
              genStatus[g.id] = {error: e};
            }
            return {...returnVariables, ...vars};
          }, returnVariables);
        });
        returnVariables._genStatus = genStatus;
        return Promise.all([returnVariables, db.materializers.findAll({where: {profile_id: pid}, raw: true})]);
      })
      .then(resp => {
        let returnVariables = resp[0];
        const materializers = resp[1];
        materializers.sort((a, b) => a.ordering - b.ordering);
        let matStatus = {};
        returnVariables = materializers.reduce((acc, m) => {
          let vars = {};
          try {
            eval(`
              let f = variables => {${m.logic}};
              vars = f(acc);
            `);
            matStatus[m.id] = vars;
          }
          catch (e) {
            matStatus[m.id] = {error: e};
          }
          return {...acc, ...vars};
        }, returnVariables);
        returnVariables._matStatus = matStatus;
        return Promise.all([returnVariables, db.formatters.findAll()]);
      })
      .then(resp => {
        const [variables, formatters] = resp;
        const formatterFunctions = formatters.reduce((acc, f) => (acc[f.name] = Function("n", f.logic), acc), {});
        const returnObject = {variables};
        const request = axios.get(`${origin}/api/internalprofile/${slug}`);
        return Promise.all([returnObject, formatterFunctions, request]);
      })
      .then(resp => {
        let returnObject = resp[0];
        const formatterFunctions = resp[1];
        const profile = varSwap(resp[2].data, formatterFunctions, returnObject.variables);
        returnObject.pid = id;
        if (profile.sections) {
          profile.sections = profile.sections.map(s => {
            if (s.topics) {
              s.topics = s.topics.map(t => {
                if (t.visualizations) {
                  t.visualizations = t.visualizations.map(v => Function("variables", v.logic.replace(/\<id\>/g, id))(returnObject.variables));
                }
                if (t.stats) {
                  t.stats = t.stats.map(s => varSwap(s, formatterFunctions, returnObject.variables));
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
        if (profile.stats) {
          profile.stats = profile.stats.map(s => varSwap(s, formatterFunctions, returnObject.variables));
        }
        returnObject = Object.assign({}, returnObject, profile);
        return Promise.all([returnObject, formatterFunctions, db.visualizations.findAll({where: {owner_type: "profile", owner_id: profile.id}})]);
      })
      .then(resp => {
        res.json(resp[0]).end();
      })
      .catch(err => {
        console.error("Error!", err);
      });

  });

};
