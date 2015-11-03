viz.bar = function(build) {

  var axis_style = function(axis) {
    return {
      "grid": false,
      "label": build.config[axis] && build.config[axis].label ? build.config[axis].label : false,
      "ticks": {
        "color": "none"
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
    "x": axis_style("x"),
    "y": axis_style("y")
  };

}
