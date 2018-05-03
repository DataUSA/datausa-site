const axios = require("axios");

module.exports = function() {

  return axios.get("http://datausa-cube.datawheel.us:5000/cubes/")
    .then(d => d.data);

};
