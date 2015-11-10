viz.geo_map = function(build) {

  var key = build.config.coords.key;

  return {
    "color": {
      "heatmap": [build.colors.sec, build.colors.pri]
    },
    "coords": {
      "center": [0, 0],
      "key": key,
      "padding": 0,
      "projection": key === "birthplace" ? "equirectangular" : "albersUsa"
    },
    "labels": false,
    "zoom": {
      "scroll": false
    }
  };
}
