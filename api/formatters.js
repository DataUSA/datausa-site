const buble = require("buble");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/formatters", (req, res) => {

    db.formatters.findAll()
      .then(results => {
        results = results.map(r => {
          r = r.toJSON();
          if (r.logic) {
            // Formatters may be malformed. Wrap in a try/catch to avoid js crashes.
            try {
              let code = buble.transform(r.logic, {objectAssign: "Object.assign"}).code; 
              if (code.startsWith("!")) code = code.slice(1);
              r.logic = code;
            }
            catch (e) {
              console.log("Error in Formatter Syntax: ", e.message);
              r.logic = "return \"N/A\";";
            }
          }
          return r;
        });
        res.json(results).end();
      });
  });
};
