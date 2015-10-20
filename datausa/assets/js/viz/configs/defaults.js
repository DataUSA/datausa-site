viz.defaults = function(build) {

  var discrete = build.viz.axes(Object).discrete || "x";

  var axis_style = function(axis) {
    return {
      "axis": {
        "color": "none",
        "value": false
      },
      "grid": false,
      "label": {
        "font": {
          "color": build.color,
          "family": "Palanquin",
          "size": 16,
          "weight": 700
        },
        "padding": 0,
        "value": false
      },
      "ticks": {
        "color": "none",
        "font": {
          "color": discrete === axis ? "#211f1a" : "#a8a8a8",
          "family": "Palanquin",
          "size": 16,
          "weight": 700
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
    "format": {
      "text": function(text, params) {

        if (dictionary[text]) return dictionary[text];

        // All caps text
        if (["RCA"].indexOf(text) >= 0) {
          return text;
        }

        if (params.key) {

        }

        return d3plus.string.title(text, params);

      }
    },
    "height": {
      "small": 100
    },
    "x": axis_style("x"),
    "y": axis_style("y")
  }
}
