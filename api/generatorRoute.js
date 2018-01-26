module.exports = function(app) {

  const {db} = app.settings;

  app.post("/api/generator/new", (req, res) => {
    db.generators.create(req.body).then(u => res.json(u));
  });

  app.post("/api/generator/update", (req, res) => {
    db.generators.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/materializer/new", (req, res) => {
    db.materializers.create(req.body).then(u => res.json(u));
  });

  app.post("/api/materializer/update", (req, res) => {
    db.materializers.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  });

  app.post("/api/profiles/update", (req, res) => {
    db.profiles.update(req.body, {where: {id: req.body.id}}).then(u => res.json(u));
  })

  app.post("/api/profiles/new", (req, res) => {
    db.profiles.create(req.body).then(u => res.json(u));
  });

};
