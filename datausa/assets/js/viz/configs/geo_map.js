viz.geo_map = function(build) {
  return {
    "color": {
      "heatmap": [d3plus.color.lighter(build.color), build.color, d3.rgb(build.color).darker()]
    },
    "coords": {
      "key": "counties",
      "projection": "albersUsa",
      "value": "/static/topojson/counties.json"
    }
  };
}
