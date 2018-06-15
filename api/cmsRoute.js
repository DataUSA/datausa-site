module.exports = function(app) {

  const {db} = app.settings;

  app.post("/api/cms/generator/new", (req, res) => {
    db.generators.create(req.body).then(u => res.json(u));
  });

  app.post("/api/cms/generator/update", (req, res) => {
    db.generators.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.delete("/api/cms/generator/delete", (req, res) => {
    db.generators.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/materializer/new", (req, res) => {
    db.materializers.create(req.body).then(u => res.json(u));
  });

  app.post("/api/cms/materializer/update", (req, res) => {
    db.materializers.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.delete("/api/cms/materializer/delete", (req, res) => {
    db.materializers.destroy({where: {id: req.query.id}}).then(u => res.json(u));
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
    db.profiles_descriptions.destroy({where: {id: req.query.id}}).then(u => res.json(u));
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
    db.sections_subtitles.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/section_description/update", (req, res) => {
    db.sections_descriptions.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/section_description/new", (req, res) => {
    db.sections_descriptions.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/section_description/delete", (req, res) => {
    db.sections_descriptions.destroy({where: {id: req.query.id}}).then(u => res.json(u));
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
    db.topics_subtitles.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/topic_description/update", (req, res) => {
    db.topics_descriptions.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/topic_description/new", (req, res) => {
    db.topics_descriptions.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/topic_description/delete", (req, res) => {
    db.topics_descriptions.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/selector/update", (req, res) => {
    db.selectors.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/selector/new", (req, res) => {
    db.selectors.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/selector/delete", (req, res) => {
    db.selectors.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/stat_profile/update", (req, res) => {
    db.stats_profiles.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/stat_profile/new", (req, res) => {
    db.stats_profiles.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/stat_profile/delete", (req, res) => {
    db.stats_profiles.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/stat_topic/update", (req, res) => {
    db.stats_topics.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/stat_topic/new", (req, res) => {
    db.stats_topics.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/stat_topic/delete", (req, res) => {
    db.stats_topics.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/visualization_profile/update", (req, res) => {
    db.visualizations_profiles.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/visualization_profile/new", (req, res) => {
    db.visualizations_profiles.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/visualization_profile/delete", (req, res) => {
    db.visualizations_profiles.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/visualization_topic/update", (req, res) => {
    db.visualizations_topics.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/visualization_topic/new", (req, res) => {
    db.visualizations_topics.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/visualization_topic/delete", (req, res) => {
    db.visualizations_topics.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

};
