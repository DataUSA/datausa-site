const axios = require("axios");
const {merge} = require("d3-array");
const {nest} = require("d3-collection");
const {CANON_LOGICLAYER_CUBE} = process.env;
const prefix = `${CANON_LOGICLAYER_CUBE}${CANON_LOGICLAYER_CUBE.slice(-1) === "/" ? "" : "/"}`;

module.exports = async function() {

  return axios.get(`${prefix}cubes`)
    .then(resp => resp.data)
    .then(data => nest()
      .key(d => d.source_name)
      .entries(data.cubes.map(d => d.annotations))
      .map(group => ({
        title: group.key,
        desc: Array.from(new Set(group.values.map(d => d.source_description))),
        datasets: nest()
          .key(d => d.dataset_name)
          .entries(group.values.filter(d => d.dataset_name))
          .map(g => ({
            title: g.key,
            link: g.values[0].dataset_link,
            tables: Array.from(new Set(merge(g.values.map(d => (d.table_id || "").split(",").filter(n => n.length)))))
          }))
      }))
      .sort((a, b) => a.title.localeCompare(b.title)))
    .catch(err => {
      console.error(` 🌎  Dataset Cache Error: ${err.message}`);
      if (err.config) console.error(err.config.url);
      return [];
    });

};
