viz.geo_map = function(build) {

  var key = build.config.coords.key;

  var profile = (d3.select("body").classed("profile") || d3.select("body").classed("story")) && !d3.select("body").classed("embed");

  return {
    "coords": {
      "center": [0, 0],
      "key": key,
      "padding": 0,
      "projection": key === "birthplace" ? "equirectangular" : "albersUsa",
      "simplify": false
    },
    "labels": false,
    "mouse": {
      "click": false
    },
    "zoom": {
      "pan": profile ? false : true,
      "scroll": profile ? false : true
    }
  };
}
