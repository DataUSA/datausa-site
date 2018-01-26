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
  })

  app.post("/api/cms/profile/new", (req, res) => {
    db.profiles.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/profile/delete", (req, res) => {
    db.profiles.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/stat/update", (req, res) => {
    db.stats.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  })

  app.post("/api/cms/stat/new", (req, res) => {
    db.stats.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/stat/delete", (req, res) => {
    db.stats.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

  app.post("/api/cms/visualization/update", (req, res) => {
    db.visualizations.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  })

  app.post("/api/cms/visualization/new", (req, res) => {
    db.visualizations.create(req.body).then(u => res.json(u));
  });

  app.delete("/api/cms/visualization/delete", (req, res) => {
    db.visualizations.destroy({where: {id: req.query.id}}).then(u => res.json(u));
  });

};
