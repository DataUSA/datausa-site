const axios = require("axios"),
      slugMap = require("../utils/slugMap");

const {CUBE_URL} = process.env;

module.exports = function(app) {

  const {db} = app.settings;
  const {client} = app.settings.cache.cube;

  app.get("/api/profile/:pslug/:pid/:size", (req, res) => {
    const {size, pid, pslug} = req.params;

    function sendImage(image) {
      res.sendFile(`${process.cwd()}/static/images/profile/${size}/${image}.jpg`);
    }

    db.search.findOne({where: {id: pid, type: pslug}})
      .then(attr => {
        const {imageId, sumlevel} = attr;

        if (!imageId) {

          if (pslug === "geo") {

            axios.get(`${CUBE_URL}geoservice-api/relations/parents/${attr.id}`)
              .then(d => d.data.reverse())
              .then(d => d.map(p => p.geoid))
              .then(d => Promise.all([d, db.search.findAll({where: {id: d, type: "geo"}})]))
              .then(([ids, parents]) => {
                const parentImage = parents
                  .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
                  .find(p => p.imageId).imageId;
                sendImage(parentImage);
              });

          }
          else {

            const type = slugMap[pslug];

            client.cube("acs_yg_total_population_5")
              .then(cube => {

                const query = cube.query
                  .drilldown(type, sumlevel, sumlevel)
                  .cut(`[${type}].[${sumlevel}].[${sumlevel}].&[${attr.id}]`)
                  .option("parents", true);

                return client.query(query);

              })
              .then(d => d.data)
              .then(data => {

                const hierarchy = data.axes
                  .find(d => d.name === type);

                const ancestors = hierarchy.members[0].ancestors
                  .filter(d => d.level_name !== "(All)");

                const parentIds = ancestors.map(d => d.key).reverse();
                console.log(parentIds, pslug);
                return db.search.findAll({where: {id: parentIds, type: pslug}, raw: true});

              })
              .then(parents => {
                const firstImage = parents.find(d => d.imageId);
                if (firstImage && firstImage.imageId) sendImage(firstImage.imageId);
                else sendImage(imageId);
              });

          }
        }
        else sendImage(imageId);
      });
  });

};
