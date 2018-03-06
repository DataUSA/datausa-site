module.exports = function(app) {

  app.get("/api/search", (req, res) => {
    res.json({
      results: [
        {
          id: "04000US25",
          name: "Massachusetts",
          sumlevel: "State",
          type: "geo"
        }
      ]
    }).end();
  });

};
