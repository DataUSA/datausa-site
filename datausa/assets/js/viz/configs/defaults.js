viz.defaults = function(build) {

  var discrete = build.config.y && build.config.y.scale === "discrete" ? "y" : "x";

  var axis_style = function(axis) {

    return {
      "axis": {
        "color": "none",
        "value": false
      },
      "label": {
        "font": {
          "color": build.color,
          "family": "Palanquin",
          "size": 16,
          "weight": 700
        },
        "padding": 0
      },
      "ticks": {
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
        "color": "transparent"
      }
    },
    "format": {
      "affixes": affixes,
      "text": function(text, params) {

        if (dictionary[text]) return dictionary[text];

        // All caps text
        if (["RCA"].indexOf(text) >= 0) {
          return text;
        }

        // Format income buckets
        if (text.indexOf("income") === 0 && text.length > 6) {
          text = text.slice(6);
          if (text.indexOf("to") > 0) {
            text = text.split("to").map(function(t){
              return "$" + t + "k";
            }).join("-");
          }
          else if (text.indexOf("less") === 0) {
            text = "< $" + text.slice(4) + "k";
          }
          else {
            text = "$" + text.slice(0, text.length - 4) + "k +";
          }
          return text;
        }

        if (params.key) {

        }

        return d3plus.string.title(text, params);

      }
    },
    "height": {
      "small": 10
    },
    "messages": {
      "style": "large"
    },
    "x": axis_style("x"),
    "y": axis_style("y")
  }
}
