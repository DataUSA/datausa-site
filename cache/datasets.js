const axios = require("axios");
const {merge} = require("d3-array");
const {nest} = require("d3-collection");
const {CANON_CONST_TESSERACT} = process.env;
const prefix = `${CANON_CONST_TESSERACT}${CANON_CONST_TESSERACT.slice(-1) === "/" ? "" : "/"}`;

module.exports = async function() {

  return axios.get(`${prefix}tesseract/cubes`)
    .then(resp => resp.data)
    .then(data => {
      const annotations = data.cubes
        .map(d => d.annotations)
        .filter(Boolean)

        return nest()
        .key(d => d.source_name)
        .entries(annotations)
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
        .sort((a, b) => a.title.localeCompare(b.title));
    })
    .catch(err => {
      console.error(` 🌎  Dataset Cache Error: ${err.message}`);
      if (err.config) console.error(err.config.url);
      return [];
    });
};
