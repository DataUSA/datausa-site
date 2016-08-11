viz.tree_map = function(build) {
  return {
    "labels": {
      "align": "left",
      "valign": "top"
    },
    "legend": {
      "filters": true
    },
    "title": {
      "total": {
        "font": {
          "color": "#444",
          "family": "Palanquin",
          "size": 14,
          "transform": "uppercase",
          "weight": 700
        },
        "value": {
          "prefix": dictionary[build.config.size] + ": "
        }
      }
    }
  };
}
