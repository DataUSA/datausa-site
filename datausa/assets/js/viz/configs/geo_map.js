viz.geo_map = function(build) {
  return {
    "coords": {
      "key": "counties",
      "projection": "albersUsa",
      "value": "/static/topojson/counties.json"
    },
    "height": 400
  };
}
