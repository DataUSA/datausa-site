const axios = require("axios");

const {CANON_LOGICLAYER_CUBE} = process.env;

const slugMap = {
  cip: "CIP",
  geo: "Geography",
  naics: "PUMS Industry",
  napcs: "NAPCS",
  soc: "PUMS Occupation",
  university: "University"
};

module.exports = function(app) {

  const {db} = app.settings;
  const {parents} = app.settings.cache;

  app.get("/api/profile/:pslug/:pid/:size", (req, res) => {
    const {size, pid, pslug} = req.params;

    /** Sends the finally found image, and includes fallbacks */
    function sendImage(image) {
      if (image) res.sendFile(`${process.cwd()}/static/images/profile/${size}/${image}.jpg`);
      else if (pslug === "university") res.sendFile(`${process.cwd()}/static/images/profile/${size}/2032.jpg`);
      else res.sendFile(`${process.cwd()}/static/images/profile/${size}/1849.jpg`);
    }

    db.search.findOne({where: {id: pid, dimension: slugMap[pslug]}})
      .then(attr => {

        if (!attr) sendImage(false);
        else {

          const {imageId} = attr;

          if (!imageId) {

            if (parents[pslug]) {

              const ids = parents[pslug][pid];

              db.search.findAll({where: {id: ids, dimension: slugMap[pslug]}})
                .then(parentAttrs => {
                  const parentImage = parentAttrs
                    .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
                    .find(p => p.imageId).imageId;
                  sendImage(parentImage);
                });

            }
            else if (pslug === "geo") {

              axios.get(`${CANON_LOGICLAYER_CUBE}geoservice-api/relations/parents/${attr.id}`)
                .then(d => d.data.reverse())
                .then(d => d.map(p => p.geoid))
                .then(d => {
                  const attrs = db.search.findAll({where: {id: d, dimension: slugMap[pslug]}});
                  return Promise.all([d, attrs]);
                })
                .then(([ids, parentAttrs]) => {
                  const parentImage = parentAttrs
                    .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
                    .find(p => p.imageId).imageId;
                  sendImage(parentImage);
                });

            }
            else sendImage();

          }
          else sendImage(imageId);

        }

      });
  });

};
