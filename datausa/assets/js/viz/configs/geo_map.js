viz.geo_map = function(build) {

  var key = build.config.coords.key;

  return {
    "color": {
      "heatmap": [build.colors.sec, build.colors.pri]
    },
    "coords": {
      "center": [0, 0],
      "key": key,
      "mute": ["79500US4804701"],
      "padding": 0,
      "projection": key === "birthplace" ? "equirectangular" : "albersUsa"
    },
    "labels": false,
    "zoom": {
      "scroll": false
    }
  };
}
