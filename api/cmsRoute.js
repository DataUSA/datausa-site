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

const sortProfile = profile => {
  profile = profile.toJSON();
  ["materializers", "visualizations", "stats", "descriptions"].forEach(type => profile[type].sort(sorter));
  return profile;
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

module.exports = function(app) {

  const {db} = app.settings;

  /* BEGIN PIECEMEAL CMS API GETS */

  app.get("/api/cms/tree", (req, res) => {
    db.profiles.findAll(profileReqTreeOnly).then(profiles => {
      profiles = sortProfileTree(profiles);
      res.json(profiles).end();
    });
  });

  app.get("/api/cms/profile/get/:id", (req, res) => {
    const {id} = req.params;
    const reqObj = Object.assign({}, profileReqProfileOnly, {where: {id}});
    db.profiles.findOne(reqObj).then(profile => {
      res.json(sortProfile(profile)).end();
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
    db.topics_visualizations
      .findOne({where: {id: req.params.id}})
      .then(u => res.json(u).end());
  });

  app.get("/api/cms/selector/get/:id", (req, res) => {
    db.selectors.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
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

};
