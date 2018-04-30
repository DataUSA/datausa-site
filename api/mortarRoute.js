const axios = require("axios"),
      varSwap = require("../utils/varSwap");

const profileReqWithGens = {
  include: [
    {
      association: "generators"
    },
    {
      association: "materializers"
    },
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

const profileReq = {
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

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/internalprofile/all", (req, res) => {
    db.profiles.findAll(profileReqWithGens).then(u => res.json(u).end());
  });

  app.get("/api/internalprofile/:slug", (req, res) => {
    const {slug} = req.params;
    const reqObj = Object.assign({}, profileReq, {where: {slug}});
    db.profiles.findOne(reqObj).then(u => res.json(u).end());
  });

  app.get("/api/variables/:slug/:id", (req, res) => {
    const {slug, id} = req.params;
    const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;

    // Begin by fetching the profile by slug, and all the generators that belong to that profile
    db.profiles.findOne({where: {slug}, raw: true})
      .then(profile =>
        Promise.all([profile.id, db.formatters.findAll(), db.generators.findAll({where: {profile_id: profile.id}})])
      )
      // Given a profile id and its generators, hit all the API endpoints they provide
      .then(resp => {
        const [pid, formatters, generators] = resp;
        // Create a hash table so the formatters are directly accessible by name
        const formatterFunctions = formatters.reduce((acc, f) => (acc[f.name.replace(/^\w/g, chr => chr.toLowerCase())] = Function("n", "libs", "formatters", f.logic), acc), {});
        // Deduplicate generators that share an API endpoint
        const requests = Array.from(new Set(generators.map(g => g.api)));
        // Generators use <id> as a placeholder. Replace instances of <id> with the provided id from the URL
        // The .catch here is to handle malformed API urls, returning an empty object
        const fetches = requests.map(r => axios.get(r.replace(/\<id\>/g, id)).catch(() => ({})));
        return Promise.all([pid, generators, requests, formatterFunctions, Promise.all(fetches)]);
      })
      // Given a profile id, its generators, their API endpoints, and the responses of those endpoints,
      // start to build a returnVariables object by executing the javascript of each generator on its data
      .then(resp => {
        const [pid, generators, requests, formatterFunctions, results] = resp;
        let returnVariables = {};
        const genStatus = {};
        results.forEach((r, i) => {
          // For every API result, find ONLY the generators that depend on this data
          const requiredGenerators = generators.filter(g => g.api === requests[i]);
          // Build the return object using a reducer, one generator at a time
          returnVariables = requiredGenerators.reduce((acc, g) => {
            let vars = {};
            // Because generators are arbitrary javascript, they may be malformed. We need to wrap the
            // entire execution in a try/catch. genStatus is used to track the status of each individual generator
            try {
              const resp = r.data;
              if (resp) {
                eval(`
                  let f = (resp, formatters) => {${g.logic}};
                  vars = f(resp, formatterFunctions);
                `);
                // A successfully run genStatus will contain the variables generated.
                genStatus[g.id] = vars;
              }
              else {
                // If resp was null/empty, the API link didn't resolve
                genStatus[g.id] = {error: "Invalid API Link"};
              }
            }
            catch (e) {
              // An unsuccessfully run genStatus will contain the error
              genStatus[g.id] = {error: e};
            }
            // Fold the generated variables into the accumulating returnVariables
            return {...returnVariables, ...vars};
          }, returnVariables);
        });
        returnVariables._genStatus = genStatus;
        return Promise.all([returnVariables, formatterFunctions, db.materializers.findAll({where: {profile_id: pid}, raw: true})]);
      })
      // Given the partially built returnVariables and all the materializers for this profile id,
      // Run the materializers and fold their generated variables into returnVariables
      .then(resp => {
        let returnVariables = resp[0];
        const formatterFunctions = resp[1];
        const materializers = resp[2];
        // The order of materializers matter because input to later materializers depends on output from earlier materializers
        materializers.sort((a, b) => a.ordering - b.ordering);
        let matStatus = {};
        returnVariables = materializers.reduce((acc, m) => {
          let vars = {};
          try {
            eval(`
              let f = (variables, formatters) => {${m.logic}};
              vars = f(acc, formatterFunctions);
            `);
            matStatus[m.id] = vars;
          }
          catch (e) {
            matStatus[m.id] = {error: e};
          }
          return {...acc, ...vars};
        }, returnVariables);
        returnVariables._matStatus = matStatus;
        return res.json(returnVariables).end();
      })
  });

  /* Main API Route to fetch a profile, given a slug and an id
   * slugs represent the type of page (geo, naics, soc, cip, university)
   * ids represent actual entities / locations (nyc, bu)
  */

  app.get("/api/profile/:slug/:id", (req, res) => {
    const {slug, id} = req.params;
    const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;

      /* The following Promises, as opposed to being nested, are run sequentially.
       * Each one returns a new promise, whose response is then handled in the following block
       * Note that this means if any info from a given block is required in any later block,
       * We must pass that info as one of the arguments of the returned Promise.
      */

    Promise.all([axios.get(`${origin}/api/variables/${slug}/${id}`), db.formatters.findAll()])

      // Given the completely built returnVariables and all the formatters (formatters are global)
      // Get the ACTUAL profile itself and all its dependencies and prepare it to be formatted and regex replaced
      // See profileReq above to see the sequelize formatting for fetching the entire profile
      .then(resp => {
        const variables = resp[0].data;
        const formatters = resp[1];
        const formatterFunctions = formatters.reduce((acc, f) => (acc[f.name.replace(/^\w/g, chr => chr.toLowerCase())] = Function("n", "libs", "formatters", f.logic), acc), {});
        const request = axios.get(`${origin}/api/internalprofile/${slug}`);
        return Promise.all([variables, formatterFunctions, request]);
      })
      // Given a returnObject with completely built returnVariables, a hash array of formatter functions, and the profile itself
      // Go through the profile and replace all the provided {{vars}} with the actual variables we've built
      .then(resp => {
        let returnObject = {};
        const variables = resp[0];
        const formatterFunctions = resp[1];
        // Create a "post-processed" profile by swapping every {{var}} with a formatted variable
        const profile = varSwap(resp[2].data, formatterFunctions, variables);
        returnObject.pid = id;
        // The varswap function is not recursive. We have to do some work here to crawl down the profile
        // and run the varswap at each level.
        if (profile.sections) {
          profile.sections = profile.sections.map(s => {
            if (s.topics) {
              s.topics = s.topics.map(t => {
                if (t.visualizations) {
                  t.visualizations = t.visualizations.map(v => {
                    let vars = {};
                    try {
                      eval(`
                        let f = (variables, formatters) => {${v.logic.replace(/\<id\>/g, id)}};
                        vars = f(variables, formatterFunctions);
                      `);
                    }
                    catch (e) {
                      console.log("visualization error", e);
                    }
                    return vars;
                  });
                }
                if (t.stats) {
                  t.stats = t.stats.map(s => varSwap(s, formatterFunctions, variables));
                }
                return varSwap(t, formatterFunctions, variables);
              });
            }
            return varSwap(s, formatterFunctions, variables);
          });
        }
        if (profile.visualizations) {
          profile.visualizations = profile.visualizations.map(v => {
            let vars = {};
            try {
              eval(`
                let f = (variables, formatters) => {${v.logic.replace(/\<id\>/g, id)}};
                vars = f(variables, formatterFunctions);
              `);
            }
            catch (e) {
              console.log("visualization error", e);
            }
            return vars;
          });
        }
        if (profile.stats) {
          profile.stats = profile.stats.map(s => varSwap(s, formatterFunctions, variables));
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
