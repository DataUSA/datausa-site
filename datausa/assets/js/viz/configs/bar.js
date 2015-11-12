viz.bar = function(build) {

  if (!d3plus.object.validate(build.config.y)) {
    build.config.y = {"value": build.config.y};
  }

  if (build.config.y2 && !d3plus.object.validate(build.config.y2)) {
    build.config.y2 = {"value": build.config.y2};
  }

  var discrete = build.config.y.scale === "discrete" ? "y" : "x";

  if (build.config.y2) {
    build.viz.data(build.viz.data().map(function(d){
      if (d[build.config.id] === build.config.y2.value) {
        d["y2_" + build.config.y.value] = d[build.config.y.value];
        delete d[build.config.y.value];
      }
      return d;
    }).sort(function(a, b){
      return a[build.config.id] === build.config.y2.value ? 1 : -1;
    }));
    build.config.y2.value = "y2_" + build.config.y.value;
  }

  var axis_style = function(axis) {

    var key = axis.length === 1 ? "pri" : "sec";

    return {
      "axis": {
        "color": discrete === axis ? "none" : chartStyles.zeroline.default[key].color,
        "value": discrete !== axis
      },
      "grid": discrete !== axis,
      "persist": {
        "position": true
      },
      "ticks": {
        "color": discrete === axis ? "none" : chartStyles.ticks.default[key].color,
        "labels": discrete !== axis || !build.config.labels,
        "size": discrete === axis ? 0 : chartStyles.ticks.default[key].size
      }
    }

  }

  return {
    "labels": {
      "align": "left",
      "resize": false,
      "value": false
    },
    "x": axis_style("x"),
    "x2": axis_style("x2"),
    "y": axis_style("y"),
    "y2": axis_style("y2")
  };

}
