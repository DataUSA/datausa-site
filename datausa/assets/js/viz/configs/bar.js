viz.bar = function(build) {

  var discrete = build.viz.axes(Object).discrete || "x"

  var axis_style = function(axis) {
    return {
      "grid": false,
      "ticks": {
        "color": "none",
        "font": {
          "color": discrete === axis ? "#211f1a" : "#a8a8a8",
          "family": "Palanquin",
          "size": 16
        }
      }
    };
  };

  return {
    "axes": {
      "background": {
        "color": "transparent",
        "stroke": {
          "width": 0
        }
      }
    },
    "x": axis_style("x"),
    "y": axis_style("y")
  };

}
