const axios = require("axios");

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

/* Given an object, a hashtable of formatting functions, and a lookup object full of variables
 * Replace every instance of {{var}} with its true value from the lookup object, and 
 * apply the appropriate formatter
 * TODO: maybe make this recursive in the future, crawling down the object?
*/

const varSwap = (sourceObj, formatterFunctions, variables) => {
  for (const skey in sourceObj) {
    if (sourceObj.hasOwnProperty(skey) && typeof sourceObj[skey] === "string") {
      // Find all instances of the following type:  FormatterName{{VarToReplace}}
      const re = new RegExp(/([A-z0-9]*)\{\{([A-z0-9]+)\}\}/g);
      let m;
      do {
        m = re.exec(sourceObj[skey]);
        if (m) {
          // FormatterName{{VarToReplace}}
          const fullMatch = m[0];  
          // Get the function from the hash table using the lookup key FormatterName (or no-op if not found)
          const formatter = m[1] ? formatterFunctions[m[1]] : d => d;
          // VarToReplace
          const keyMatch = m[2];
          const reswap = new RegExp(fullMatch, "g");
          sourceObj[skey] = sourceObj[skey].replace(reswap, formatter(variables[keyMatch]));
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
      db.profiles.findAll(profileReqWithGens)
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

    // Begin by fetching the profile by slug, and all the generators that belong to that profile
    db.profiles.findOne({where: {slug}, raw: true})
      .then(profile => 
        Promise.all([profile.id, db.generators.findAll({where: {profile_id: profile.id}})])
      )
      // Given a profile id and its generators, hit all the API endpoints they provide
      .then(resp => {
        const [pid, generators] = resp;
        // Deduplicate generators that share an API endpoint
        const requests = Array.from(new Set(generators.map(g => g.api)));
        // Generators use <id> as a placeholder. Replace instances of <id> with the provided id from the URL
        const fetches = requests.map(r => axios.get(r.replace(/\<id\>/g, id)));
        return Promise.all([pid, generators, requests, Promise.all(fetches)]);
      })
      // Given a profile id, its generators, their API endpoints, and the responses of those endpoints,
      // start to build a returnVariables object by executing the javascript of each generator on its data
      .then(resp => {
        const [pid, generators, requests, results] = resp;
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
              eval(`
                let f = resp => {${g.logic}};
                vars = f(resp);
              `);
              // A successfully run genStatus will contain the variables generated.
              genStatus[g.id] = vars;
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
        return Promise.all([returnVariables, db.materializers.findAll({where: {profile_id: pid}, raw: true})]);
      })
      // Given the partially built returnVariables and all the materializers for this profile id,
      // Run the materializers and fold their generated variables into returnVariables
      .then(resp => {
        let returnVariables = resp[0];
        const materializers = resp[1];
        // The order of materializers matter because input to later materializers depends on output from earlier materializers
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
      // Given the partially built returnVariables and all the formatters (formatters are global)
      // Get the ACTUAL profile itself and all its dependencies and prepare it to be formatted and regex replaced
      // See profileReq above to see the sequelize formatting for fetching the entire profile
      .then(resp => {
        const [variables, formatters] = resp;
        // Create a hash table so the formatters are directly accessible by name
        const formatterFunctions = formatters.reduce((acc, f) => (acc[f.name] = Function("n", f.logic), acc), {});
        const returnObject = {variables};
        const request = axios.get(`${origin}/api/internalprofile/${slug}`);
        return Promise.all([returnObject, formatterFunctions, request]);
      })
      // Given the partially built returnVariables, a hash array of formatter functions, and the profile itself
      // Go through the profile and replace all the provided {{vars}} with the actual variables we've built
      .then(resp => {
        let returnObject = resp[0];
        const formatterFunctions = resp[1];
        // Create a "post-processed" profile by swapping every {{var}} with a formatted variable 
        const profile = varSwap(resp[2].data, formatterFunctions, returnObject.variables);
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
                        let f = variables => {${v.logic.replace(/\<id\>/g, id)}};
                        vars = f(returnObject.variables);
                      `);
                    }
                    catch (e) {
                      console.log("visualization error", e);
                    }
                    return vars;
                  });
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
          profile.visualizations = profile.visualizations.map(v => {
            let vars = {};
            try {
              eval(`
                let f = variables => {${v.logic.replace(/\<id\>/g, id)}};
                vars = f(returnObject.variables);
              `);
            }
            catch (e) {
              console.log("visualization error", e);
            }
            return vars;
          });
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
