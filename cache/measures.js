const axios = require("axios");
const {CANON_CONST_TESSERACT} = process.env;
const prefix = `${CANON_CONST_TESSERACT}${CANON_CONST_TESSERACT.slice(-1) === "/" ? "" : "/"}`;

module.exports = async function () {

  return axios.get(`${prefix}tesseract/cubes`)
    .then(resp => resp.data)
    .then(resp => {
      const obj = {};
      const measureMap = resp.cubes.reduce((acc, cube) => {
        const cubeMeasureMap = cube.measures.reduce((mAcc, measure) => {
          mAcc[measure.name] = measure.annotations;
          return mAcc;
        }, {});

        return {...acc, ...cubeMeasureMap};
      }, {})

      Object.keys(measureMap).forEach(m => {
        const measure = measureMap[m];
        if (measure && measure.error_for_measure) {
          const ref = measureMap[measure.error_for_measure];
          obj[m] = ref && ref.units_of_measurement ? ref.units_of_measurement : undefined;
        } else {
          obj[m] = measure && measure.units_of_measurement ? measure.units_of_measurement : undefined;
        }
      });

      return obj;
    })
    .catch(err => {
      console.error(` 🌎  Measures Cache Error: ${err.message}`);
      if (err.config) console.error(err.config.url);
    });
};
