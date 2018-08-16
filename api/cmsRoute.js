const sequelize = require("sequelize");
const shell = require("shelljs");
const Op = sequelize.Op;

const topicTypeDir = "app/toCanon/topics/";

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

  app.get("/api/cms/tree", (req, res) => {
    db.profiles.findAll(profileReqTreeOnly).then(profiles => {
      profiles = sortProfileTree(profiles);
      res.json(profiles).end();
    });
  });

  app.get("/api/cms/storytree", (req, res) => {
    db.stories.findAll(storyReqTreeOnly).then(stories => {
      stories = sortStoryTree(stories);
      res.json(stories).end();
    });
  });  

  app.get("/api/cms/profile/get/:id", (req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, profileReqProfileOnly, {where: {id}});
    db.profiles.findOne(reqObj).then(profile => {
      res.json(sortProfile(profile)).end();
    });
  });

  app.get("/api/cms/story/get/:id", (req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, storyReqStoryOnly, {where: {id}});
    db.stories.findOne(reqObj).then(story => {
      res.json(sortStory(story)).end();
    });
  });

  app.get("/api/cms/section/get/:id", (req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, sectionReqSectionOnly, {where: {id}});
    db.sections.findOne(reqObj).then(section => {
      res.json(sortSection(section)).end();
    });
  });

  app.get("/api/cms/topic/get/:id", (req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, topicReqTopicOnly, {where: {id}});
    db.topics.findOne(reqObj).then(topic => {
      const topicTypes = [];
      shell.ls(`${topicTypeDir}*.jsx`).forEach(file => {
        const compName = file.replace(topicTypeDir, "").replace(".jsx", "");
        topicTypes.push(compName);
      });
      topic = sortTopic(topic);
      topic.types = topicTypes;
      res.json(topic).end();
    });
  });

  app.get("/api/cms/storytopic/get/:id", (req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, storyTopicReqStoryTopicOnly, {where: {id}});
    db.storytopics.findOne(reqObj).then(storytopic => {
      const topicTypes = [];
      shell.ls(`${topicTypeDir}*.jsx`).forEach(file => {
        const compName = file.replace(topicTypeDir, "").replace(".jsx", "");
        topicTypes.push(compName);
      });
      storytopic = sortStoryTopic(storytopic);
      storytopic.types = topicTypes;
      res.json(storytopic).end();
    });
  });

  app.get("/api/cms/generator/get/:id", (req, res) => {
    db.generators.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/materializer/get/:id", (req, res) => {
    db.materializers.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/profile_stat/get/:id", (req, res) => {
    db.profiles_stats.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/profile_visualization/get/:id", (req, res) => {
    db.profiles_visualizations
      .findOne({where: {id: req.params.id}})
      .then(u => res.json(u).end());
  });

  app.get("/api/cms/profile_description/get/:id", (req, res) => {
    db.profiles_descriptions.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/story_description/get/:id", (req, res) => {
    db.stories_descriptions.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  // not sure if we need this - will footnote editing be a singular list, therefore not requiring piecemeal gets?
  app.get("/api/cms/story_footnote/get/:id", (req, res) => {
    db.stories_footnotes.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/author/get/:id", (req, res) => {
    db.authors.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/section_subtitle/get/:id", (req, res) => {
    db.sections_subtitles.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/section_description/get/:id", (req, res) => {
    db.sections_descriptions.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/topic_subtitle/get/:id", (req, res) => {
    db.topics_subtitles.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/topic_description/get/:id", (req, res) => {
    db.topics_descriptions.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/topic_stat/get/:id", (req, res) => {
    db.topics_stats.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/topic_visualization/get/:id", (req, res) => {
    db.topics_visualizations.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/selector/get/:id", (req, res) => {
    db.selectors.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/storytopic_subtitle/get/:id", (req, res) => {
    db.storytopics_subtitles.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/storytopic_description/get/:id", (req, res) => {
    db.storytopics_descriptions.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/storytopic_stat/get/:id", (req, res) => {
    db.storytopics_stats.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/storytopic_visualization/get/:id", (req, res) => {
    db.storytopics_visualizations.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  /* END PIECEMEAL CMS API GETS */

  app.post("/api/cms/generator/new", (req, res) => {
    db.generators.create(req.body).then(u => res.json(u));
  });

  app.post("/api/cms/generator/update", (req, res) => {
    db.generators.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.delete("/api/cms/generator/delete", (req, res) => {
    db.generators.findOne({where: {id: req.query.id}}).then(row => {
      db.generators.destroy({where: {id: req.query.id}}).then(() => {
        db.generators.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "name"]}).then(rows => {
          res.json(rows).end();
        });
      });
    });
  });

  app.post("/api/cms/materializer/new", (req, res) => {
    db.materializers.create(req.body).then(u => res.json(u));
  });

  app.post("/api/cms/materializer/update", (req, res) => {
    db.materializers.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.delete("/api/cms/materializer/delete", (req, res) => {
    db.materializers.findOne({where: {id: req.query.id}}).then(row => {
      db.materializers.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.materializers.destroy({where: {id: req.query.id}}).then(() => {
          db.materializers.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "ordering", "name"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/profile/update", (req, res) => {
    db.profiles.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/profile/new", (req, res) => {
    db.profiles.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/profile/delete", (req, res) => {
    // db.profiles.destroy({where: {id: req.query.id}}).then(u => res.json(u));
    db.profiles.findOne({where: {id: req.query.id}}).then(row => {
      db.profiles.update({ordering: sequelize.literal("ordering -1")}, {where: {ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.profiles.destroy({where: {id: req.query.id}}).then(() => {
          db.profiles.findAll(profileReqTreeOnly).then(profiles => {
            profiles = sortProfileTree(profiles);
            res.json(profiles).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/story/update", (req, res) => {
    db.stories.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/story/new", (req, res) => {
    db.stories.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/story/delete", (req, res) => {
    db.stories.findOne({where: {id: req.query.id}}).then(row => {
      db.stories.update({ordering: sequelize.literal("ordering -1")}, {where: {ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.stories.destroy({where: {id: req.query.id}}).then(() => {
          db.stories.findAll(storyReqTreeOnly).then(stories => {
            stories = sortStoryTree(stories);
            res.json(stories).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/author/update", (req, res) => {
    db.authors.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/author/new", (req, res) => {
    db.authors.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/author/delete", (req, res) => {
    db.authors.findOne({where: {id: req.query.id}}).then(row => {
      db.authors.update({ordering: sequelize.literal("ordering -1")}, {where: {story_id: row.story_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.authors.destroy({where: {id: req.query.id}}).then(() => {
          db.authors.findAll({where: {story_id: row.story_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/profile_description/update", (req, res) => {
    db.profiles_descriptions.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/profile_description/new", (req, res) => {
    db.profiles_descriptions.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/profile_description/delete", (req, res) => {
    db.profiles_descriptions.findOne({where: {id: req.query.id}}).then(row => {
      db.profiles_descriptions.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.profiles_descriptions.destroy({where: {id: req.query.id}}).then(() => {
          db.profiles_descriptions.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/story_description/update", (req, res) => {
    db.stories_descriptions.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/story_description/new", (req, res) => {
    db.stories_descriptions.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/story_description/delete", (req, res) => {
    db.stories_descriptions.findOne({where: {id: req.query.id}}).then(row => {
      db.stories_descriptions.update({ordering: sequelize.literal("ordering -1")}, {where: {story_id: row.story_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.stories_descriptions.destroy({where: {id: req.query.id}}).then(() => {
          db.stories_descriptions.findAll({where: {story_id: row.story_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/story_footnote/update", (req, res) => {
    db.stories_footnotes.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/story_footnote/new", (req, res) => {
    db.stories_footnotes.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/story_footnote/delete", (req, res) => {
    db.stories_footnotes.findOne({where: {id: req.query.id}}).then(row => {
      db.stories_footnotes.update({ordering: sequelize.literal("ordering -1")}, {where: {story_id: row.story_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.stories_footnotes.destroy({where: {id: req.query.id}}).then(() => {
          db.stories_footnotes.findAll({where: {story_id: row.story_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/section/update", (req, res) => {
    db.sections.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/section/new", (req, res) => {
    db.sections.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/section/delete", (req, res) => {
    db.sections.findOne({where: {id: req.query.id}}).then(row => {
      db.sections.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.sections.destroy({where: {id: req.query.id}}).then(() => {
          db.sections.findAll({
            where: {profile_id: row.profile_id},
            attributes: ["id", "title", "slug", "ordering", "profile_id"],
            order: [["ordering", "ASC"]],
            include: [
              {association: "topics", attributes: ["id", "title", "slug", "ordering", "section_id"]}
            ]
          }).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/section_subtitle/update", (req, res) => {
    db.sections_subtitles.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/section_subtitle/new", (req, res) => {
    db.sections_subtitles.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/section_subtitle/delete", (req, res) => {
    db.sections_subtitles.findOne({where: {id: req.query.id}}).then(row => {
      db.sections_subtitles.update({ordering: sequelize.literal("ordering -1")}, {where: {section_id: row.section_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.sections_subtitles.destroy({where: {id: req.query.id}}).then(() => {
          db.sections_subtitles.findAll({where: {section_id: row.section_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/section_description/update", (req, res) => {
    db.sections_descriptions.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/section_description/new", (req, res) => {
    db.sections_descriptions.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/section_description/delete", (req, res) => {
    db.sections_descriptions.findOne({where: {id: req.query.id}}).then(row => {
      db.sections_descriptions.update({ordering: sequelize.literal("ordering -1")}, {where: {section_id: row.section_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.sections_descriptions.destroy({where: {id: req.query.id}}).then(() => {
          db.sections_descriptions.findAll({where: {section_id: row.section_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/topic/update", (req, res) => {
    db.topics.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/topic/new", (req, res) => {
    db.topics.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/topic/delete", (req, res) => {
    db.topics.findOne({where: {id: req.query.id}}).then(row => {
      db.topics.update({ordering: sequelize.literal("ordering -1")}, {where: {section_id: row.section_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.topics.destroy({where: {id: req.query.id}}).then(() => {
          db.topics.findAll({where: {section_id: row.section_id}, attributes: ["id", "title", "slug", "ordering", "section_id", "type"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/storytopic/update", (req, res) => {
    db.storytopics.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/storytopic/new", (req, res) => {
    db.storytopics.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/storytopic/delete", (req, res) => {
    db.storytopics.findOne({where: {id: req.query.id}}).then(row => {
      db.storytopics.update({ordering: sequelize.literal("ordering -1")}, {where: {story_id: row.story_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.storytopics.destroy({where: {id: req.query.id}}).then(() => {
          db.storytopics.findAll({where: {story_id: row.story_id}, attributes: ["id", "title", "slug", "ordering", "story_id", "type"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/topic_subtitle/update", (req, res) => {
    db.topics_subtitles.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/topic_subtitle/new", (req, res) => {
    db.topics_subtitles.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/topic_subtitle/delete", (req, res) => {
    db.topics_subtitles.findOne({where: {id: req.query.id}}).then(row => {
      db.topics_subtitles.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.topics_subtitles.destroy({where: {id: req.query.id}}).then(() => {
          db.topics_subtitles.findAll({where: {topic_id: row.topic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/storytopic_subtitle/update", (req, res) => {
    db.storytopics_subtitles.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/storytopic_subtitle/new", (req, res) => {
    db.storytopics_subtitles.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/storytopic_subtitle/delete", (req, res) => {
    db.storytopics_subtitles.findOne({where: {id: req.query.id}}).then(row => {
      db.storytopics_subtitles.update({ordering: sequelize.literal("ordering -1")}, {where: {storytopic_id: row.storytopic_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.storytopics_subtitles.destroy({where: {id: req.query.id}}).then(() => {
          db.storytopics_subtitles.findAll({where: {storytopic_id: row.storytopic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/topic_description/update", (req, res) => {
    db.topics_descriptions.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/topic_description/new", (req, res) => {
    db.topics_descriptions.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/topic_description/delete", (req, res) => {
    db.topics_descriptions.findOne({where: {id: req.query.id}}).then(row => {
      db.topics_descriptions.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.topics_descriptions.destroy({where: {id: req.query.id}}).then(() => {
          db.topics_descriptions.findAll({where: {topic_id: row.topic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/storytopic_description/update", (req, res) => {
    db.storytopics_descriptions.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/storytopic_description/new", (req, res) => {
    db.storytopics_descriptions.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/storytopic_description/delete", (req, res) => {
    db.storytopics_descriptions.findOne({where: {id: req.query.id}}).then(row => {
      db.storytopics_descriptions.update({ordering: sequelize.literal("ordering -1")}, {where: {storytopic_id: row.storytopic_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.storytopics_descriptions.destroy({where: {id: req.query.id}}).then(() => {
          db.storytopics_descriptions.findAll({where: {storytopic_id: row.storytopic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/selector/update", (req, res) => {
    db.selectors.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/selector/new", (req, res) => {
    db.selectors.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/selector/delete", (req, res) => {
    db.selectors.findOne({where: {id: req.query.id}}).then(row => {
      db.selectors.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.selectors.destroy({where: {id: req.query.id}}).then(() => {
          db.selectors.findAll({where: {topic_id: row.topic_id}, order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/profile_stat/update", (req, res) => {
    db.profiles_stats.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/profile_stat/new", (req, res) => {
    db.profiles_stats.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/profile_stat/delete", (req, res) => {
    db.profiles_stats.findOne({where: {id: req.query.id}}).then(row => {
      db.profiles_stats.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.profiles_stats.destroy({where: {id: req.query.id}}).then(() => {
          db.profiles_stats.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/topic_stat/update", (req, res) => {
    db.topics_stats.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/topic_stat/new", (req, res) => {
    db.topics_stats.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/topic_stat/delete", (req, res) => {
    db.topics_stats.findOne({where: {id: req.query.id}}).then(row => {
      db.topics_stats.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.topics_stats.destroy({where: {id: req.query.id}}).then(() => {
          db.topics_stats.findAll({where: {topic_id: row.topic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/storytopic_stat/update", (req, res) => {
    db.storytopics_stats.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/storytopic_stat/new", (req, res) => {
    db.storytopics_stats.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/storytopic_stat/delete", (req, res) => {
    db.storytopics_stats.findOne({where: {id: req.query.id}}).then(row => {
      db.storytopics_stats.update({ordering: sequelize.literal("ordering -1")}, {where: {storytopic_id: row.storytopic_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.storytopics_stats.destroy({where: {id: req.query.id}}).then(() => {
          db.storytopics_stats.findAll({where: {storytopic_id: row.storytopic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/profile_visualization/update", (req, res) => {
    db.profiles_visualizations.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/profile_visualization/new", (req, res) => {
    db.profiles_visualizations.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/profile_visualization/delete", (req, res) => {
    db.profiles_visualizations.findOne({where: {id: req.query.id}}).then(row => {
      db.profiles_visualizations.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.profiles_visualizations.destroy({where: {id: req.query.id}}).then(() => {
          db.profiles_visualizations.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/topic_visualization/update", (req, res) => {
    db.topics_visualizations.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/topic_visualization/new", (req, res) => {
    db.topics_visualizations.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/topic_visualization/delete", (req, res) => {
    db.topics_visualizations.findOne({where: {id: req.query.id}}).then(row => {
      db.topics_visualizations.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.topics_visualizations.destroy({where: {id: req.query.id}}).then(() => {
          db.topics_visualizations.findAll({where: {topic_id: row.topic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/storytopic_visualization/update", (req, res) => {
    db.storytopics_visualizations.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/storytopic_visualization/new", (req, res) => {
    db.storytopics_visualizations.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/storytopic_visualization/delete", (req, res) => {
    db.storytopics_visualizations.findOne({where: {id: req.query.id}}).then(row => {
      db.storytopics_visualizations.update({ordering: sequelize.literal("ordering -1")}, {where: {storytopic_id: row.storytopic_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {
        db.storytopics_visualizations.destroy({where: {id: req.query.id}}).then(() => {
          db.storytopics_visualizations.findAll({where: {storytopic_id: row.storytopic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

};
