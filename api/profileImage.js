const axios = require("axios"),
      sequelize = require("sequelize");

const {CANON_API} = process.env;

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

  app.get("/api/profile/:pslug/:pid/:size", async(req, res) => {
    const {size, pid, pslug} = req.params;

    /** Sends the finally found image, and includes fallbacks */
    async function sendImage(image) {

      const id = image ? image
        : pslug === "university" ? "2032"
          : pslug === "cip" ? "2032"
            : "1849";

      if (size === "json") {
        const resp = await db.images.findOne({where: {id}});
        res.json(resp);
      }
      else {
        res.sendFile(`${process.cwd()}/static/images/profile/${size}/${id}.jpg`, err => {
          if (err && err.status) res.status(err.status);
          res.end();
        });
      }

    }

    const attr = await db.search
      .findOne({where: {[sequelize.Op.or]: {id: pid, slug: pid}, dimension: slugMap[pslug]}})
      .catch(err => {
        console.error(`[api/profileImage] search matching for ${pslug}/${pid}: (${err.status ? `${err.status} - ` : ""}${err.message})}`);
        return false;
      });

    if (!attr) sendImage(false);
    else {

      const {id, imageId} = attr;

      if (!imageId) {

        if (parents[pslug]) {

          const ids = parents[pslug][id];

          if (ids && ids.length) {

            const imageId = await db.search
              .findAll({where: {id: ids, dimension: slugMap[pslug]}})
              .then(parentAttrs => {
                const parentImage = parentAttrs
                  .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
                  .find(p => p.imageId);
                return parentImage ? parentImage.imageId : false;
              })
              .catch(err => {
                console.error(`[api/profileImage] parent cache error for ${pslug}/${pid}: (${err.status ? `${err.status} - ` : ""}${err.message})}`);
                return false;
              });

            sendImage(imageId);

          }
          else {
            sendImage(false);
          }

        }
        else if (pslug === "geo") {

          const parents = await axios.get(`${CANON_API}/api/parents/geo/${id}`)
            .then(d => d.data.reverse().map(p => p.id))
            .catch(err => {
              console.error(`[api/profileImage] geo parents error for ${pslug}/${pid}: (${err.status ? `${err.status} - ` : ""}${err.message})}`);
              return false;
            });

          if (parents) {

            const parentAttrs = await db.search
              .findAll({where: {id: parents, dimension: slugMap[pslug]}})
              .catch(() => []);

            const parentImage = parentAttrs
              .sort((a, b) => parents.indexOf(a.id) - parents.indexOf(b.id))
              .find(p => p.imageId);

            sendImage(parentImage ? parentImage.imageId : false);

          }
          else sendImage(false);

        }
        else sendImage(false);

      }
      else sendImage(imageId);

    }

  });

};
