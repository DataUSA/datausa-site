var all_caps = ["cip", "naics", "rca", "soc"];

viz.defaults = function(build) {

  var discrete = build.config.y && build.config.y.scale === "discrete" ? "y" : "x";

  if (build.config.order === "bucket") {
    build.config.order = {
      "sort": "asc",
      "value": function(a) {
        if (a.bucket.indexOf("none") >= 0) {
          return -1;
        }
        else if (a.bucket.indexOf("under") >= 0 || a.bucket.indexOf("less") >= 0) {
          return 0;
        }
        else {
          var b = a.bucket;
          if (b.indexOf("_") > 0) b = b.split("_")[1];
          return parseFloat(b, 10);
        }
      }
    }
  }

  var axis_style = function(axis) {

    var key = build.config[axis];
    if (d3plus.object.validate(key)) key = key.value;
    var range = percentages.indexOf(key) >= 0 ? [0, 1] : false;

    return {
      "label": {
        "font": {
          "color": axis.length === 1 ? build.color : d3plus.color.lighter(build.color),
          "family": "Palanquin",
          "size": 16,
          "weight": 700
        },
        "padding": 0
      },
      "range": range,
      "ticks": {
        "font": {
          "color": discrete === axis ? "#211f1a" : "#a8a8a8",
          "family": "Palanquin",
          "size": discrete === axis ? 14 : 14,
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
    "background": "transparent",
    "format": {
      "number": function(number, params) {

        if (params.key) {

          if (params.key.indexOf("y2_") === 0) {
            params.key = params.key.slice(3);
          }

          if (params.key.indexOf("growth") >= 0 || percentages.indexOf(params.key) >= 0) {
            number = number * 100;
            return d3plus.number.format(number, params) + "%";
          }
          else {
            number = d3plus.number.format(number, params);
            if (params.key in affixes) {
              var a = affixes[params.key];
              number = a[0] + number + a[1];
            }
            return number;
          }

        }

        return d3plus.number.format(number, params);

      },
      "text": function(text, params) {

        if (text.indexOf("y2_") === 0) {
          text = text.slice(3);
        }

        if (dictionary[text]) return dictionary[text];

        // All caps text
        if (all_caps.indexOf(text.toLowerCase()) >= 0) {
          return text.toUpperCase();
        }

        if (params.key) {

          // Format buckets
          if (params.key === "bucket") {

            var key = false;
            if (text.indexOf("_") > 0) {
              text = text.split("_");
              key = text.shift();
              text = text.join("_");
            }

            var a = key && key in affixes ? affixes[key].slice() : ["", ""];
            if (key === "income") a[1] = "k";

            if (text.indexOf("to") > 0) {
              return text.split("to").map(function(t){
                return a[0] + t + a[1];
              }).join("-");
            }
            else if (text.indexOf("less") === 0) {
              return "< " + a[0] + text.slice(4) + a[1];
            }
            else if (text.indexOf("under") === 0) {
              return "< " + a[0] + text.slice(5) + a[1];
            }
            else if (text.indexOf("over") > 0 || text.indexOf("more") > 0) {
              return a[0] + text.slice(0, text.length - 4) + a[1] + " +";
            }
            else {
              return a[0] + d3plus.string.title(text) + a[1];
            }
          }

          if (params.key === "geo" && text.indexOf("140") === 0) {
            text = text.slice(13);
            var num = text.slice(0, 3), suffix = text.slice(3);
            suffix = suffix === "00" ? "" : "." + suffix;
            return "Census Tract " + num + suffix;
          }

          if (params.vars.attrs.value && text in params.vars.attrs.value) {
            return d3plus.string.title(params.vars.attrs.value[text].name, params);
          }

        }

        return d3plus.string.title(text, params);

      }
    },
    "height": {
      "small": 10
    },
    "labels": {
      "font": {
        "family": "Palanquin",
        "size": 13
      }
    },
    "messages": {
      "style": "large"
    },
    "x": axis_style("x"),
    "x2": axis_style("x2"),
    "y": axis_style("y"),
    "y2": axis_style("y2")
  }
}
