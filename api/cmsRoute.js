const sequelize = require("sequelize");
const shell = require("shelljs");
const Op = sequelize.Op;
const yn = require("yn");

const topicTypeDir = "app/toCanon/topics/";

const cmsCheck = () => process.env.NODE_ENV === "development" || yn(process.env.CANON_CMS_ENABLE);

const isEnabled = (req, res, next) => {
  if (cmsCheck()) return next();
  return res.status(401).send("Not Authorized");
};

const profileReqTreeOnly = {
  attributes: ["id", "title", "slug", "ordering"],
  include: [
    {
      association: "sections", attributes: ["id", "title", "slug", "ordering", "profile_id"],
      include: [
        {association: "topics", attributes: ["id", "title", "slug", "ordering", "section_id", "type"]}
      ]
    }
  ]
};

const storyReqTreeOnly = {
  attributes: ["id", "title", "ordering"],
  include: [
    {
      association: "storytopics", attributes: ["id", "title", "slug", "ordering", "story_id", "type"]
    }
  ]
};

const profileReqProfileOnly = {
  include: [
    {association: "generators", attributes: ["id", "name"]},
    {association: "materializers", attributes: ["id", "name", "ordering"]},
    {association: "visualizations", attributes: ["id", "ordering"]},
    {association: "stats", attributes: ["id", "ordering"]},
    {association: "descriptions", attributes: ["id", "ordering"]}
  ]
};

const storyReqStoryOnly = {
  include: [
    {association: "authors", attributes: ["id", "ordering"]},
    {association: "descriptions", attributes: ["id", "ordering"]},
    {association: "footnotes", attributes: ["id", "ordering"]}
  ]
};

const sectionReqSectionOnly = {
  include: [
    {association: "subtitles", attributes: ["id", "ordering"]},
    {association: "descriptions", attributes: ["id", "ordering"]}
  ]
};

const topicReqTopicOnly = {
  include: [
    {association: "subtitles", attributes: ["id", "ordering"]},
    {association: "descriptions", attributes: ["id", "ordering"]},
    {association: "visualizations", attributes: ["id", "ordering"]},
    {association: "stats", attributes: ["id", "ordering"]},
    {association: "selectors"}
  ]
};

const storyTopicReqStoryTopicOnly = {
  include: [
    {association: "subtitles", attributes: ["id", "ordering"]},
    {association: "descriptions", attributes: ["id", "ordering"]},
    {association: "visualizations", attributes: ["id", "ordering"]},
    {association: "stats", attributes: ["id", "ordering"]}
  ]
};

const sorter = (a, b) => a.ordering - b.ordering;

// Using nested ORDER BY in the massive includes is incredibly difficult so do it manually here. todo: move it up to the query.
const sortProfileTree = profiles => {
  profiles = profiles.map(p => p.toJSON());
  profiles.sort(sorter);
  profiles.forEach(p => {
    p.sections.sort(sorter);
    p.sections.forEach(s => {
      s.topics.sort(sorter);
    });
  });
  return profiles;
};

const sortStoryTree = stories => {
  stories = stories.map(s => s.toJSON());
  stories.sort(sorter);
  stories.forEach(s => {
    s.storytopics.sort(sorter);
  });
  return stories;
};

const sortProfile = profile => {
  profile = profile.toJSON();
  ["materializers", "visualizations", "stats", "descriptions"].forEach(type => profile[type].sort(sorter));
  return profile;
};

const sortStory = story => {
  story = story.toJSON();
  ["descriptions", "footnotes", "authors"].forEach(type => story[type].sort(sorter));
  return story;
};

const sortSection = section => {
  section = section.toJSON();
  ["subtitles", "descriptions"].forEach(type => section[type].sort(sorter));
  return section;
};

const sortTopic = topic => {
  topic = topic.toJSON();
  ["subtitles", "visualizations", "stats", "descriptions", "selectors"].forEach(type => topic[type].sort(sorter));
  return topic;
};

const sortStoryTopic = storytopic => {
  storytopic = storytopic.toJSON();
  ["subtitles", "visualizations", "stats", "descriptions"].forEach(type => storytopic[type].sort(sorter));
  return storytopic;
};

module.exports = function(app) {

  const {db} = app.settings;

  /* BEGIN PIECEMEAL CMS API GETS */

  app.get("/api/cms", (req, res) => {
    res.json(cmsCheck());
  });

  app.get("/api/cms/tree", async(req, res) => {
    let profiles = await db.profiles.findAll(profileReqTreeOnly);
    profiles = sortProfileTree(profiles);
    res.json(profiles);
  });

  app.get("/api/cms/storytree", async(req, res) => {
    let stories = await db.stories.findAll(storyReqTreeOnly);
    stories = sortStoryTree(stories);
    res.json(stories);
  });

  app.get("/api/cms/profile/get/:id", async(req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, profileReqProfileOnly, {where: {id}});
    const profile = await db.profiles.findOne(reqObj);
    res.json(sortProfile(profile));
  });

  app.get("/api/cms/story/get/:id", async(req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, storyReqStoryOnly, {where: {id}});
    const story = await db.stories.findOne(reqObj);
    res.json(sortStory(story));
  });

  app.get("/api/cms/section/get/:id", async(req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, sectionReqSectionOnly, {where: {id}});
    const section = await db.sections.findOne(reqObj);
    res.json(sortSection(section));
  });

  app.get("/api/cms/topic/get/:id", async(req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, topicReqTopicOnly, {where: {id}});
    let topic = await db.topics.findOne(reqObj);
    const topicTypes = [];
    shell.ls(`${topicTypeDir}*.jsx`).forEach(file => {
      const compName = file.replace(topicTypeDir, "").replace(".jsx", "");
      topicTypes.push(compName);
    });
    topic = sortTopic(topic);
    topic.types = topicTypes;
    res.json(topic);
  });

  app.get("/api/cms/storytopic/get/:id", async(req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, storyTopicReqStoryTopicOnly, {where: {id}});
    let storytopic = await db.storytopics.findOne(reqObj);
    const topicTypes = [];
    shell.ls(`${topicTypeDir}*.jsx`).forEach(file => {
      const compName = file.replace(topicTypeDir, "").replace(".jsx", "");
      topicTypes.push(compName);
    });
    storytopic = sortStoryTopic(storytopic);
    storytopic.types = topicTypes;
    res.json(storytopic);
  });

  app.get("/api/cms/generator/get/:id", async(req, res) => {
    const u = await db.generators.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/materializer/get/:id", async(req, res) => {
    const u = await db.materializers.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/profile_stat/get/:id", async(req, res) => {
    const u = await db.profiles_stats.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/profile_visualization/get/:id", async(req, res) => {
    const u = await db.profiles_visualizations.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/profile_description/get/:id", async(req, res) => {
    const u = await db.profiles_descriptions.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/story_description/get/:id", async(req, res) => {
    const u = await db.stories_descriptions.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  // not sure if we need this - will footnote editing be a singular list, therefore not requiring piecemeal gets?
  app.get("/api/cms/story_footnote/get/:id", async(req, res) => {
    const u = await db.stories_footnotes.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/author/get/:id", async(req, res) => {
    const u = await db.authors.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/section_subtitle/get/:id", async(req, res) => {
    const u = await db.sections_subtitles.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/section_description/get/:id", async(req, res) => {
    const u = await db.sections_descriptions.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/topic_subtitle/get/:id", async(req, res) => {
    const u = await db.topics_subtitles.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/topic_description/get/:id", async(req, res) => {
    const u = await db.topics_descriptions.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/topic_stat/get/:id", async(req, res) => {
    const u = await db.topics_stats.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/topic_visualization/get/:id", async(req, res) => {
    const u = await db.topics_visualizations.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/selector/get/:id", async(req, res) => {
    const u = await db.selectors.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/storytopic_subtitle/get/:id", async(req, res) => {
    const u = await db.storytopics_subtitles.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/storytopic_description/get/:id", async(req, res) => {
    const u = await db.storytopics_descriptions.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/storytopic_stat/get/:id", async(req, res) => {
    const u = await db.storytopics_stats.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  app.get("/api/cms/storytopic_visualization/get/:id", async(req, res) => {
    const u = await db.storytopics_visualizations.findOne({where: {id: req.params.id}});
    res.json(u);
  });

  /* END PIECEMEAL CMS API GETS */

  app.post("/api/cms/generator/new", isEnabled, async(req, res) => {
    const u = await db.generators.create(req.body);
    res.json(u);
  });

  app.post("/api/cms/generator/update", isEnabled, async(req, res) => {
    const u = await db.generators.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  // testme
  app.delete("/api/cms/generator/delete", isEnabled, async(req, res) => {
    const row = await db.generators.findOne({where: {id: req.query.id}});
    const del = await db.generators.destroy({where: {id: req.query.id}});
    const rows = await db.generators.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "name"]});
    res.json(rows);
  });

  app.post("/api/cms/materializer/new", isEnabled, async(req, res) => {
    const u = await db.materializers.create(req.body);
    res.json(u);
  });

  app.post("/api/cms/materializer/update", isEnabled, async(req, res) => {
    const u = await db.materializers.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  // testme
  app.delete("/api/cms/materializer/delete", isEnabled, async(req, res) => {
    const row = await db.materializers.findOne({where: {id: req.query.id}});
    const up = await db.materializers.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.materializers.destroy({where: {id: req.query.id}});
    const rows = await db.materializers.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "ordering", "name"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/profile/update", isEnabled, async(req, res) => {
    const u = await db.profiles.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/profile/new", isEnabled, async(req, res) => {
    const u = await db.profiles.create(req.body);
    res.json(u);
  });

  // testme
  app.delete("/api/cms/profile/delete", isEnabled, async(req, res) => {
    const row = await db.profiles.findOne({where: {id: req.query.id}});
    const up = await db.profiles.update({ordering: sequelize.literal("ordering -1")}, {where: {ordering: {[Op.gt]: row.ordering}}});
    const del = await db.profiles.destroy({where: {id: req.query.id}});
    let profiles = await db.profiles.findAll(profileReqTreeOnly);
    profiles = sortProfileTree(profiles);
    res.json(profiles);
  });

  app.post("/api/cms/story/update", isEnabled, async(req, res) => {
    const u = await db.stories.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/story/new", isEnabled, async(req, res) => {
    const u = await db.stories.create(req.body);
    res.json(u);
  });

  // testme
  app.delete("/api/cms/story/delete", isEnabled, async(req, res) => {
    const row = await db.stories.findOne({where: {id: req.query.id}})
    const up = await db.stories.update({ordering: sequelize.literal("ordering -1")}, {where: {ordering: {[Op.gt]: row.ordering}}});
    const del = await db.stories.destroy({where: {id: req.query.id}});      
    let stories = await db.stories.findAll(storyReqTreeOnly);
    stories = sortStoryTree(stories);
    res.json(stories);
  });

  app.post("/api/cms/author/update", isEnabled, async(req, res) => {
    const u = await db.authors.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/author/new", isEnabled, async(req, res) => {
    const u = await db.authors.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/author/delete", isEnabled, async(req, res) => {
    const row = await db.authors.findOne({where: {id: req.query.id}});
    const up = await db.authors.update({ordering: sequelize.literal("ordering -1")}, {where: {story_id: row.story_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.authors.destroy({where: {id: req.query.id}});
    const rows = await db.authors.findAll({where: {story_id: row.story_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/profile_description/update", isEnabled, async(req, res) => {
    const u = await db.profiles_descriptions.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/profile_description/new", isEnabled, async(req, res) => {
    const u = await db.profiles_descriptions.create(req.body);
    res.json(u);
  });

  // testme
  app.delete("/api/cms/profile_description/delete", isEnabled, async(req, res) => {
    const row = await db.profiles_descriptions.findOne({where: {id: req.query.id}});
    const up = await db.profiles_descriptions.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.profiles_descriptions.destroy({where: {id: req.query.id}});
    const rows = await db.profiles_descriptions.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/story_description/update", isEnabled, async(req, res) => {
    const u = await db.stories_descriptions.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/story_description/new", isEnabled, async(req, res) => {
    const u = await db.stories_descriptions.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/story_description/delete", isEnabled, async(req, res) => {
    const row = await db.stories_descriptions.findOne({where: {id: req.query.id}});
    const up = await db.stories_descriptions.update({ordering: sequelize.literal("ordering -1")}, {where: {story_id: row.story_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.stories_descriptions.destroy({where: {id: req.query.id}});
    const rows = await db.stories_descriptions.findAll({where: {story_id: row.story_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/story_footnote/update", isEnabled, async(req, res) => {
    const u = await db.stories_footnotes.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/story_footnote/new", isEnabled, async(req, res) => {
    const u = await db.stories_footnotes.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/story_footnote/delete", isEnabled, async(req, res) => {
    const row = await db.stories_footnotes.findOne({where: {id: req.query.id}});
    const up = await db.stories_footnotes.update({ordering: sequelize.literal("ordering -1")}, {where: {story_id: row.story_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.stories_footnotes.destroy({where: {id: req.query.id}});
    const rows = await db.stories_footnotes.findAll({where: {story_id: row.story_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/section/update", isEnabled, async(req, res) => {
    const u = await db.sections.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/section/new", isEnabled, async(req, res) => {
    const u = await db.sections.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/section/delete", isEnabled, async(req, res) => {
    const row = await db.sections.findOne({where: {id: req.query.id}});
    const up = await db.sections.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.sections.destroy({where: {id: req.query.id}});
    const rows = await db.sections.findAll({
      where: {profile_id: row.profile_id},
      attributes: ["id", "title", "slug", "ordering", "profile_id"],
      order: [["ordering", "ASC"]],
      include: [
        {association: "topics", attributes: ["id", "title", "slug", "ordering", "section_id"]}
      ]
    });
    res.json(rows);
  });

  app.post("/api/cms/section_subtitle/update", isEnabled, async(req, res) => {
    const u = await db.sections_subtitles.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/section_subtitle/new", isEnabled, async(req, res) => {
    const u = await db.sections_subtitles.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/section_subtitle/delete", isEnabled, async(req, res) => {
    const row = await db.sections_subtitles.findOne({where: {id: req.query.id}});
    const up = await db.sections_subtitles.update({ordering: sequelize.literal("ordering -1")}, {where: {section_id: row.section_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.sections_subtitles.destroy({where: {id: req.query.id}});
    const rows = await db.sections_subtitles.findAll({where: {section_id: row.section_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/section_description/update", isEnabled, async(req, res) => {
    const u = await db.sections_descriptions.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/section_description/new", isEnabled, async(req, res) => {
    const u = await db.sections_descriptions.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/section_description/delete", isEnabled, async(req, res) => {
    const row = await db.sections_descriptions.findOne({where: {id: req.query.id}});
    const up = await db.sections_descriptions.update({ordering: sequelize.literal("ordering -1")}, {where: {section_id: row.section_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.sections_descriptions.destroy({where: {id: req.query.id}});
    const rows = await db.sections_descriptions.findAll({where: {section_id: row.section_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/topic/update", isEnabled, async(req, res) => {
    const u = await db.topics.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/topic/new", isEnabled, async(req, res) => {
    const u = await db.topics.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/topic/delete", isEnabled, async(req, res) => {
    const row = await db.topics.findOne({where: {id: req.query.id}});
    const up = await db.topics.update({ordering: sequelize.literal("ordering -1")}, {where: {section_id: row.section_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.topics.destroy({where: {id: req.query.id}});
    const rows = await db.topics.findAll({where: {section_id: row.section_id}, attributes: ["id", "title", "slug", "ordering", "section_id", "type"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/storytopic/update", isEnabled, async(req, res) => {
    const u = await db.storytopics.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/storytopic/new", isEnabled, async(req, res) => {
    const u = await db.storytopics.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/storytopic/delete", isEnabled, async(req, res) => {
    const row = await db.storytopics.findOne({where: {id: req.query.id}});
    const up = await db.storytopics.update({ordering: sequelize.literal("ordering -1")}, {where: {story_id: row.story_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.storytopics.destroy({where: {id: req.query.id}});
    const rows = await db.storytopics.findAll({where: {story_id: row.story_id}, attributes: ["id", "title", "slug", "ordering", "story_id", "type"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/topic_subtitle/update", isEnabled, async(req, res) => {
    const u = await db.topics_subtitles.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/topic_subtitle/new", isEnabled, async(req, res) => {
    const u = await db.topics_subtitles.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/topic_subtitle/delete", isEnabled, async(req, res) => {
    const row = await db.topics_subtitles.findOne({where: {id: req.query.id}});
    const up = await db.topics_subtitles.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.topics_subtitles.destroy({where: {id: req.query.id}});
    const rows = await db.topics_subtitles.findAll({where: {topic_id: row.topic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/storytopic_subtitle/update", isEnabled, async(req, res) => {
    const u = await db.storytopics_subtitles.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/storytopic_subtitle/new", isEnabled, async(req, res) => {
    const u = await db.storytopics_subtitles.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/storytopic_subtitle/delete", isEnabled, async(req, res) => {
    const row = await db.storytopics_subtitles.findOne({where: {id: req.query.id}});
    const up = await db.storytopics_subtitles.update({ordering: sequelize.literal("ordering -1")}, {where: {storytopic_id: row.storytopic_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.storytopics_subtitles.destroy({where: {id: req.query.id}});
    const rows = await db.storytopics_subtitles.findAll({where: {storytopic_id: row.storytopic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/topic_description/update", isEnabled, async(req, res) => {
    const u = await db.topics_descriptions.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/topic_description/new", isEnabled, async(req, res) => {
    const u = await db.topics_descriptions.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/topic_description/delete", isEnabled, async(req, res) => {
    const row = await db.topics_descriptions.findOne({where: {id: req.query.id}});
    const up = await db.topics_descriptions.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.topics_descriptions.destroy({where: {id: req.query.id}});
    const rows = await db.topics_descriptions.findAll({where: {topic_id: row.topic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/storytopic_description/update", isEnabled, async(req, res) => {
    const u = await db.storytopics_descriptions.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/storytopic_description/new", isEnabled, async(req, res) => {
    const u = await db.storytopics_descriptions.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/storytopic_description/delete", isEnabled, async(req, res) => {
    const row = await db.storytopics_descriptions.findOne({where: {id: req.query.id}});
    const up = await db.storytopics_descriptions.update({ordering: sequelize.literal("ordering -1")}, {where: {storytopic_id: row.storytopic_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.storytopics_descriptions.destroy({where: {id: req.query.id}});
    const rows = await db.storytopics_descriptions.findAll({where: {storytopic_id: row.storytopic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/selector/update", isEnabled, async(req, res) => {
    const u = await db.selectors.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/selector/new", isEnabled, async(req, res) => {
    const u = await db.selectors.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/selector/delete", isEnabled, async(req, res) => {
    const row = await db.selectors.findOne({where: {id: req.query.id}});
    const up = await db.selectors.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.selectors.destroy({where: {id: req.query.id}});
    const rows = await db.selectors.findAll({where: {topic_id: row.topic_id}, order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/profile_stat/update", isEnabled, async(req, res) => {
    const u = await db.profiles_stats.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/profile_stat/new", isEnabled, async(req, res) => {
    const u = await db.profiles_stats.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/profile_stat/delete", isEnabled, async(req, res) => {
    const row = await db.profiles_stats.findOne({where: {id: req.query.id}});
    const up = await db.profiles_stats.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.profiles_stats.destroy({where: {id: req.query.id}});
    const rows = await db.profiles_stats.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/topic_stat/update", isEnabled, async(req, res) => {
    const u = await db.topics_stats.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/topic_stat/new", isEnabled, async(req, res) => {
    const u = await db.topics_stats.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/topic_stat/delete", isEnabled, async(req, res) => {
    const row = await db.topics_stats.findOne({where: {id: req.query.id}});
    const up = await db.topics_stats.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.topics_stats.destroy({where: {id: req.query.id}});
    const rows = await db.topics_stats.findAll({where: {topic_id: row.topic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/storytopic_stat/update", isEnabled, async(req, res) => {
    const u = await db.storytopics_stats.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/storytopic_stat/new", isEnabled, async(req, res) => {
    const u = await db.storytopics_stats.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/storytopic_stat/delete", isEnabled, async(req, res) => {
    const row = await db.storytopics_stats.findOne({where: {id: req.query.id}});
    const up = await db.storytopics_stats.update({ordering: sequelize.literal("ordering -1")}, {where: {storytopic_id: row.storytopic_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.storytopics_stats.destroy({where: {id: req.query.id}});
    const rows = await db.storytopics_stats.findAll({where: {storytopic_id: row.storytopic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/profile_visualization/update", isEnabled, async(req, res) => {
    const u = await db.profiles_visualizations.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/profile_visualization/new", isEnabled, async(req, res) => {
    const u = await db.profiles_visualizations.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/profile_visualization/delete", isEnabled, async(req, res) => {
    const row = await db.profiles_visualizations.findOne({where: {id: req.query.id}});
    const up = await db.profiles_visualizations.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.profiles_visualizations.destroy({where: {id: req.query.id}});
    const rows = await db.profiles_visualizations.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/topic_visualization/update", isEnabled, async(req, res) => {
    const u = await db.topics_visualizations.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/topic_visualization/new", isEnabled, async(req, res) => {
    const u = await db.topics_visualizations.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/topic_visualization/delete", isEnabled, async(req, res) => {
    const row = await db.topics_visualizations.findOne({where: {id: req.query.id}});
    const up = await db.topics_visualizations.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.topics_visualizations.destroy({where: {id: req.query.id}});
    const rows = await db.topics_visualizations.findAll({where: {topic_id: row.topic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

  app.post("/api/cms/storytopic_visualization/update", isEnabled, async(req, res) => {
    const u = await db.storytopics_visualizations.update(req.body, {where: {id: req.body.id}});
    res.json(u);
  });

  app.post("/api/cms/storytopic_visualization/new", isEnabled, async(req, res) => {
    const u = await db.storytopics_visualizations.create(req.body);
    res.json(u);
  });

  app.delete("/api/cms/storytopic_visualization/delete", isEnabled, async(req, res) => {
    const row = await db.storytopics_visualizations.findOne({where: {id: req.query.id}});
    const up = await db.storytopics_visualizations.update({ordering: sequelize.literal("ordering -1")}, {where: {storytopic_id: row.storytopic_id, ordering: {[Op.gt]: row.ordering}}});
    const del = await db.storytopics_visualizations.destroy({where: {id: req.query.id}});
    const rows = await db.storytopics_visualizations.findAll({where: {storytopic_id: row.storytopic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]});
    res.json(rows);
  });

};
