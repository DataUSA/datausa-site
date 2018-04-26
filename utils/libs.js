const d3TimeFormat = require("d3-time-format"),
      d3plusAxis = require("d3plus-axis");

module.exports = {
  d3: Object.assign({}, d3TimeFormat),
  d3plus: Object.assign({}, d3plusAxis)
};
