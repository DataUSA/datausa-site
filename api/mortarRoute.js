const FUNC = require("../utils/FUNC"),
      axios = require("axios"),
      libs = require("../utils/libs"), // leave this! needed for the variable functions
      mortarEval = require("../utils/mortarEval"),
      urlSwap = require("../utils/urlSwap"),
      varSwapRecursive = require("../utils/varSwapRecursive");

const searchMap = {
  cip: "CIP",
  geo: "Geography",
  naics: "PUMS Industry",
  soc: "PUMS Occupation",
  university: "University"
};

const profileReq = {
  include: [
    {association: "visualizations", separate: true},
    {association: "stats", separate: true},
    {association: "descriptions", separate: true},
    {
      association: "sections", separate: true,
      include: [
        {association: "subtitles", separate: true},
        {association: "descriptions", separate: true},
        {
          association: "topics", separate: true,
          include: [
            {association: "subtitles", separate: true},
            {association: "descriptions", separate: true},
            {association: "visualizations", separate: true},
            {association: "stats", separate: true},
            {association: "selectors", separate: true}
          ]
        }
      ]
    }
  ]
};

const topicReq = [
  {association: "subtitles", separate: true},
  {association: "descriptions", separate: true},
  {association: "visualizations", separate: true},
  {association: "stats", separate: true},
  {association: "selectors", separate: true}
];

const formatters4eval = formatters => formatters.reduce((acc, f) => {

  const name = f.name === f.name.toUpperCase()
    ? f.name.toLowerCase()
    : f.name.replace(/^\w/g, chr => chr.toLowerCase());

  acc[name] = FUNC.parse({logic: f.logic, vars: ["n"]}, acc);

  return acc;

}, {});

const sorter = (a, b) => a.ordering - b.ordering;

// Using nested ORDER BY in the massive includes is incredibly difficult so do it manually here. Eventually move it up to the query.
const sortProfile = profile => {
  profile = profile.toJSON();
  if (profile.stats) profile.stats.sort(sorter);
  if (profile.descriptions) profile.descriptions.sort(sorter);
  if (profile.visualizations) profile.visualizations.sort(sorter);
  if (profile.sections) {
    profile.sections.sort(sorter);
    profile.sections.map(section => {
      if (section.subtitles) section.subtitles.sort(sorter);
      if (section.descriptions) section.descriptions.sort(sorter);
      if (section.topics) {
        section.topics.sort(sorter);
        section.topics.map(topic => {
          if (topic.subtitles) topic.subtitles.sort(sorter);
          if (topic.selectors) topic.selectors.sort(sorter);
          if (topic.stats) topic.stats.sort(sorter);
          if (topic.descriptions) topic.descriptions.sort(sorter);
          if (topic.visualizations) topic.visualizations.sort(sorter);
        });
      }
    });
  }
  return profile;
};

module.exports = function(app) {

  const {cache, db} = app.settings;

  app.get("/api/internalprofile/:slug", (req, res) => {
    const {slug} = req.params;
    const reqObj = Object.assign({}, profileReq, {where: {slug}});
    db.profiles.findOne(reqObj).then(profile => res.json(sortProfile(profile)).end());
  });

  app.get("/api/variables/:slug/:id", (req, res) => {
    const {slug, id} = req.params;

    // Begin by fetching the profile by slug, and all the generators that belong to that profile
    /* Potential TODO here: Later in this function we manually get generators and materializers.
     * Maybe refactor this to get them immediately in the profile get using include.
     */
    db.profiles.findOne({where: {slug}, raw: true})
      .then(profile =>
        Promise.all([profile.id, db.search.findOne({where: {id, dimension: searchMap[slug]}}), db.formatters.findAll(), db.generators.findAll({where: {profile_id: profile.id}})])
      )
      // Given a profile id and its generators, hit all the API endpoints they provide
      .then(resp => {
        const [pid, attr, formatters, generators] = resp;
        // Create a hash table so the formatters are directly accessible by name
        const formatterFunctions = formatters4eval(formatters);
        // Deduplicate generators that share an API endpoint
        const requests = Array.from(new Set(generators.map(g => g.api)));
        // Generators use <id> as a placeholder. Replace instances of <id> with the provided id from the URL
        // The .catch here is to handle malformed API urls, returning an empty object
        const fetches = requests.map(r => {
          let url = urlSwap(r, {...req.params, ...cache, ...attr});
          if (url.indexOf("http") !== 0) {
            const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;
            url = `${origin}${url.indexOf("/") === 0 ? "" : "/"}${url}`;
          }
          return axios.get(url).catch(() => ({}));
        });
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
            const evalResults = mortarEval("resp", r.data, g.logic, formatterFunctions);
            const {vars} = evalResults;
            // genStatus is used to track the status of each individual generator
            genStatus[g.id] = evalResults.error ? {error: evalResults.error} : evalResults.vars;
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
        const matStatus = {};
        returnVariables = materializers.reduce((acc, m) => {
          const evalResults = mortarEval("variables", acc, m.logic, formatterFunctions);
          const {vars} = evalResults;
          matStatus[m.id] = evalResults.error ? {error: evalResults.error} : evalResults.vars;
          return {...acc, ...vars};
        }, returnVariables);
        returnVariables._matStatus = matStatus;
        return res.json(returnVariables).end();
      });
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
        const formatterFunctions = formatters4eval(formatters);
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
        const profile = varSwapRecursive(resp[2].data, formatterFunctions, variables, req.query);
        returnObject.pid = id;
        returnObject = Object.assign({}, returnObject, profile);
        returnObject.variables = variables;
        res.json(returnObject).end();
      })
      .catch(err => {
        console.error("Error!", err);
      });

  });

  // Endpoint for when a user selects a new dropdown for a topic, requiring new variables
  app.get("/api/topic/:slug/:id/:topicId", (req, res) => {
    const {slug, id, topicId} = req.params;
    const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;
    // As with profiles above, we need formatters, variables, and the topic itself in order to
    // create a "postProcessed" topic that can be returned to the requester.
    const getVariables = axios.get(`${origin}/api/variables/${slug}/${id}`);
    const getFormatters = db.formatters.findAll();
    const getTopic = db.topics.findOne({where: {id: topicId}, include: topicReq});

    Promise.all([getVariables, getFormatters, getTopic]).then(resp => {
      const variables = resp[0].data;
      const formatters = resp[1];
      const formatterFunctions = formatters4eval(formatters);
      const topic = varSwapRecursive(resp[2].toJSON(), formatterFunctions, variables, req.query);
      if (topic.subtitles) topic.subtitles.sort(sorter);
      if (topic.selectors) topic.selectors.sort(sorter);
      if (topic.stats) topic.stats.sort(sorter);
      if (topic.descriptions) topic.descriptions.sort(sorter);
      if (topic.visualizations) topic.visualizations.sort(sorter);
      res.json(topic).end();
    });
  });

};
