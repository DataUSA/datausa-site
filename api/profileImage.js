module.exports = function(app) {

  app.get("/api/profile/:pslug/:pid/:image", (req, res) => {
    const {image, pid, pslug} = req.params;
    res.sendFile(`${process.cwd()}/static/images/${image}/${pslug}/${pid}.jpg`);
  });

};
