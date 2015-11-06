viz.bar = function(build) {

  var discrete = build.config.y && build.config.y.scale === "discrete" ? "y" : "x";

  var axis_style = function(axis) {

    return {
      "axis": {
        "color": discrete === axis ? "none" : "#ccc",
        "value": discrete !== axis
      },
      "grid": discrete !== axis,
      "label": build.config[axis] && build.config[axis].label ? build.config[axis].label : false,
      "persist": {
        "position": true
      },
      "ticks": {
        "color": discrete === axis ? "none" : "#ccc",
        "labels": discrete !== axis || !build.config.labels,
        "size": discrete === axis ? 0 : 10
      }
    }

  }

  return {
    "axes": {
      "background": {
        "stroke": {
          "width": 0
        }
      }
    },
    "data": {
      "stroke": {
        "width": 1
      }
    },
    "labels": {
      "align": "left",
      "resize": false,
      "value": false
    },
    "x": axis_style("x"),
    "y": axis_style("y")
  };

}
