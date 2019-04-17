const FUNC = require("../utils/FUNC"),
      PromiseThrottle = require("promise-throttle"),
      axios = require("axios"),
      libs = require("../utils/libs"), // leave this! needed for the variable functions
      mortarEval = require("../utils/mortarEval"),
      sequelize = require("sequelize"),
      urlSwap = require("../utils/urlSwap"),
      varSwapRecursive = require("../utils/varSwapRecursive"),
      yn = require("yn");

const verbose = yn(process.env.CANON_CMS_LOGGING);

const throttle = new PromiseThrottle({
  requestsPerSecond: 10,
  promiseImplementation: Promise
});

const searchMap = {
  cip: "CIP",
  geo: "Geography",
  naics: "PUMS Industry",
  napcs: "NAPCS",
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
  {association: "selectors", separate: true},
  {
    association: "section",
    attributes: ["slug"],
    include: [{
      association: "profile",
      attributes: ["slug", "dimension"]
    }]
  }
];

const formatters4eval = formatters => formatters.reduce((acc, f) => {

  const name = f.name === f.name.toUpperCase()
    ? f.name.toLowerCase()
    : f.name.replace(/^\w/g, chr => chr.toLowerCase());

  // Formatters may be malformed. Wrap in a try/catch to avoid js crashes.
  try {
    acc[name] = FUNC.parse({logic: f.logic, vars: ["n"]}, acc);
  }
  catch (e) {
    console.log("Server-side Malformed Formatter encountered: ", e.message);
    acc[name] = FUNC.parse({logic: "return \"N/A\";", vars: ["n"]}, acc);
  }

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

  app.get("/api/internalprofile/:slug", async(req, res) => {
    const {slug} = req.params;
    const reqObj = Object.assign({}, profileReq, {where: {slug}});
    const profile = await db.profiles.findOne(reqObj).catch(() => false);
    if (profile) res.json(sortProfile(profile));
    else res.json({error: "Not a valid profile slug"});
  });

  app.get("/api/variables/:slug/:id", async(req, res) => {

    const {slug, id} = req.params;

    if (verbose) console.log("\n\nVariable Endpoint:", `/api/variables/${slug}/${id}`);

    /** */
    function createGeneratorFetch(r, attr) {
      let url = urlSwap(r, {...req.params, ...cache, ...attr});
      if (url.indexOf("http") !== 0) {
        const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;
        url = `${origin}${url.indexOf("/") === 0 ? "" : "/"}${url}`;
      }
      return axios.get(url)
        .then(resp => {
          if (verbose) console.log("Variable Loaded:", url);
          return resp;
        })
        .catch(() => {
          if (verbose) console.log("Variable Error:", url);
          return {};
        });
    }

    // Begin by fetching the profile by slug, and all the generators that belong to that profile
    /* Potential TODO here: Later in this function we manually get generators and materializers.
     * Maybe refactor this to get them immediately in the profile get using include.
     */
    const profile = await db.profiles.findOne({where: {slug}, raw: true});
    if (!profile) res.json({error: "Not a valid profile slug"});
    else {
      const pid = profile.id;
      const attr = await db.search.findOne({where: {id, dimension: searchMap[slug]}});
      const formatters = await db.formatters.findAll();
      const generators = await db.generators.findAll({where: {profile_id: pid}});

      // Given a profile id (pid) and its generators, hit all the API endpoints they provide

      // Create a hash table so the formatters are directly accessible by name
      const formatterFunctions = formatters4eval(formatters);

      // Deduplicate generators that share an API endpoint
      const requests = Array.from(new Set(generators.map(g => g.api)));

      // Generators use <id> as a placeholder. Replace instances of <id> with the provided id from the URL
      // The .catch here is to handle malformed API urls, returning an empty object
      const fetches = requests.map(r => throttle.add(createGeneratorFetch.bind(this, r, attr)));
      const results = await Promise.all(fetches);

      // Given a profile id, its generators, their API endpoints, and the responses of those endpoints,
      // start to build a returnVariables object by executing the javascript of each generator on its data

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

      const materializers = await db.materializers.findAll({where: {profile_id: pid}, raw: true});

      // Given the partially built returnVariables and all the materializers for this profile id,
      // Run the materializers and fold their generated variables into returnVariables

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

      res.json(returnVariables);

    }

  });

  /* Main API Route to fetch a profile, given a slug and an id
   * slugs represent the type of page (geo, naics, soc, cip, university)
   * ids represent actual entities / locations (nyc, bu)
  */
  app.get("/api/profile/:slug/:pid", async(req, res) => {

    const {slug, pid} = req.params;

    const attribute = await db.search.findOne({where: {dimension: searchMap[slug], [sequelize.Op.or]: {id: pid, slug: pid}}});
    if (!attribute) res.json({error: "Not a valid ID"});
    else {

      const {id} = attribute;
      const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;
      const image = await axios.get(`${origin}/api/profile/${slug}/${id}/json`)
        .then(resp => resp.data)
        .catch(() => ({}));

      /* The following Promises, as opposed to being nested, are run sequentially.
      * Each one returns a new promise, whose response is then handled in the following block
      * Note that this means if any info from a given block is required in any later block,
      * We must pass that info as one of the arguments of the returned Promise.
      */

      // Given the completely built returnVariables and all the formatters (formatters are global)
      // Get the ACTUAL profile itself and all its dependencies and prepare it to be formatted and regex replaced
      // See profileReq above to see the sequelize formatting for fetching the entire profile
      const variables = await axios.get(`${origin}/api/variables/${slug}/${id}`)
        .then(resp => resp.data)
        .catch(() => ({}));

      delete variables._genStatus;
      delete variables._matStatus;

      const formatters = await db.formatters.findAll();
      const formatterFunctions = formatters4eval(formatters);

      const breadcrumbs = await axios.get(`${origin}/api/parents/${slug}/${id}`)
        .then(resp => resp.data)
        .catch(() => []);

      const request = await axios.get(`${origin}/api/internalprofile/${slug}`);

      // Given a returnObject with completely built returnVariables, a hash array of formatter functions, and the profile itself
      // Go through the profile and replace all the provided {{vars}} with the actual variables we've built
      let returnObject = {};
      // Create a "post-processed" profile by swapping every {{var}} with a formatted variable
      if (verbose) console.log("Variables Loaded, starting varSwap...");
      const profile = varSwapRecursive(request.data, formatterFunctions, variables, req.query);
      returnObject = Object.assign({}, returnObject, profile);
      returnObject.id = id;
      returnObject.variables = variables;
      returnObject.breadcrumbs = breadcrumbs;
      returnObject.image = image;
      returnObject.sections.forEach(section => {
        section.topics.forEach(topic => {
          topic.profile = profile.slug;
          topic.section = section.slug;
        });
      });
      if (verbose) console.log("varSwap complete, sending json...");
      res.json(returnObject);

    }

  });

  // Endpoint for when a user selects a new dropdown for a topic, requiring new variables
  app.get("/api/topic/:slug/:pid/:topicId", async(req, res) => {

    const {slug, pid, topicId} = req.params;
    const origin = `http${ req.connection.encrypted ? "s" : "" }://${ req.headers.host }`;

    const attribute = await db.search.findOne({where: {[sequelize.Op.or]: {id: pid, slug: pid}}});
    if (!attribute) res.json({error: "Not a valid ID"});
    else {

      const {id} = attribute;

      // As with profiles above, we need formatters, variables, and the topic itself in order to
      // create a "postProcessed" topic that can be returned to the requester.
      const variables = await axios.get(`${origin}/api/variables/${slug}/${id}`)
        .then(resp => resp.data)
        .catch(() => ({}));
      delete variables._genStatus;
      delete variables._matStatus;

      const formatters = await db.formatters.findAll();
      const formatterFunctions = formatters4eval(formatters);

      const where = {};
      if (isNaN(parseInt(topicId, 10))) where.slug = topicId;
      else where.id = topicId;
      const topics = await db.topics.findAll({where, include: topicReq})
        .then(rows => rows.map(t => t.toJSON()))
        .catch(() => []);
      let topic = topics.find(t => t.section.profile.slug === slug);
      topic = varSwapRecursive(topic, formatterFunctions, variables, req.query);
      topic.profile = topic.section.profile.slug;
      topic.section = topic.section.slug;

      if (topic.subtitles) topic.subtitles.sort(sorter);
      if (topic.selectors) topic.selectors.sort(sorter);
      if (topic.stats) topic.stats.sort(sorter);
      if (topic.descriptions) topic.descriptions.sort(sorter);
      if (topic.visualizations) topic.visualizations.sort(sorter);

      res.json({variables, ...topic});

    }

  });

};
