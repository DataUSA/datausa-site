viz.geo_map = function(build) {

  var key = build.config.coords.key;

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
      "scroll": false
    }
  };
}
