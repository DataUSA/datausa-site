module.exports = function(app) {

  const {db} = app.settings;

  app.post("/api/generator/update", (req, res) => {
    db.generators.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/materializer/update", (req, res) => {
    db.materializers.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/stat/update", (req, res) => {
    db.stats.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  })

};
