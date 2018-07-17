const sequelize = require("sequelize");
const Op = sequelize.Op;

const profileReqTreeOnly = {
  attributes: ["id", "title", "slug", "ordering"],
  include: [
    { 
      association: "sections", attributes: ["id", "title", "slug", "ordering", "profile_id"],
      include: [
        {association: "topics", attributes: ["id", "title", "slug", "ordering", "section_id"]}
      ]
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
      res.json(sortTopic(topic)).end();
    });
  }); 

  app.get("/api/cms/generator/get/:id", (req, res) => {
    db.generators.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/materializer/get/:id", (req, res) => {
    db.materializers.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/stat_profile/get/:id", (req, res) => {
    db.stats_profiles.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/visualization_profile/get/:id", (req, res) => {
    db.visualizations_profiles.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
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

  app.get("/api/cms/stat_topic/get/:id", (req, res) => {
    db.stats_topics.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
  });

  app.get("/api/cms/visualization_topic/get/:id", (req, res) => {
    db.visualizations_topics.findOne({where: {id: req.params.id}}).then(u => res.json(u).end());
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
    db.profiles.destroy({where: {id: req.query.id}}).then(u => res.json(u));
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
    db.sections.destroy({where: {id: req.query.id}}).then(u => res.json(u));
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
    db.topics.destroy({where: {id: req.query.id}}).then(u => res.json(u));
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

  app.post("/api/cms/stat_profile/update", (req, res) => {
    db.stats_profiles.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/stat_profile/new", (req, res) => {
    db.stats_profiles.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/stat_profile/delete", (req, res) => {
    db.stats_profiles.findOne({where: {id: req.query.id}}).then(row => {
      db.stats_profiles.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {  
        db.stats_profiles.destroy({where: {id: req.query.id}}).then(() => {
          db.stats_profiles.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/stat_topic/update", (req, res) => {
    db.stats_topics.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/stat_topic/new", (req, res) => {
    db.stats_topics.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/stat_topic/delete", (req, res) => {
    db.stats_topics.findOne({where: {id: req.query.id}}).then(row => {
      db.stats_topics.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {  
        db.stats_topics.destroy({where: {id: req.query.id}}).then(() => {
          db.stats_topics.findAll({where: {topic_id: row.topic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/visualization_profile/update", (req, res) => {
    db.visualizations_profiles.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/visualization_profile/new", (req, res) => {
    db.visualizations_profiles.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/visualization_profile/delete", (req, res) => {
    db.visualizations_profiles.findOne({where: {id: req.query.id}}).then(row => {
      db.visualizations_profiles.update({ordering: sequelize.literal("ordering -1")}, {where: {profile_id: row.profile_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {  
        db.visualizations_profiles.destroy({where: {id: req.query.id}}).then(() => {
          db.visualizations_profiles.findAll({where: {profile_id: row.profile_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

  app.post("/api/cms/visualization_topic/update", (req, res) => {
    db.visualizations_topics.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/visualization_topic/new", (req, res) => {
    db.visualizations_topics.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/visualization_topic/delete", (req, res) => {
    db.visualizations_topics.findOne({where: {id: req.query.id}}).then(row => {
      db.visualizations_topics.update({ordering: sequelize.literal("ordering -1")}, {where: {topic_id: row.topic_id, ordering: {[Op.gt]: row.ordering}}}).then(() => {  
        db.visualizations_topics.destroy({where: {id: req.query.id}}).then(() => {
          db.visualizations_topics.findAll({where: {topic_id: row.topic_id}, attributes: ["id", "ordering"], order: [["ordering", "ASC"]]}).then(rows => {
            res.json(rows).end();
          });
        });
      });
    });
  });

};
