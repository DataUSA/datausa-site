module.exports = function(app) {

  app.get("/api/search", (req, res) => {
    res.json({
      results: [
        {
          id: "04000US25",
          name: "Massachusetts",
          sumlevel: "State",
          type: "geo"
        },
        {
          id: "24",
          name: "Banking",
          sumlevel: "Industry Group",
          type: "naics"
        },
        {
          id: "04000US34",
          name: "New York, NY",
          sumlevel: "Place",
          type: "geo"
        }
      ]
    }).end();
  });

};
