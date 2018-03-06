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
    db.visualization_topics.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/visualization_topic/new", (req, res) => {
    db.visualization_topics.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/visualization_topic/delete", (req, res) => {
    db.visualization_topics.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

};
