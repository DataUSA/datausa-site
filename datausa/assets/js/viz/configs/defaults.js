var all_caps = ["cip", "naics", "rca", "soc", "usa"],
    attr_ids = ["geo", "cip", "soc", "naics"];

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
        else if (a.bucket.indexOf("more") >= 0 || a.bucket.indexOf("over") >= 0) {
          return 100000;
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

    var key = build.config[axis] || false, label = false;
    if (d3plus.object.validate(key)) {
      key = key.value;
    }
    else if (key) {
      build.config[axis] = {"value": key};
    }

    if (key) {
      label = build.config[axis].label ? build.config[axis].label : axis.indexOf("y") === 0 && attr_ids.indexOf(key) >= 0 ? false : true;
      if (label in dictionary) label = dictionary[label];
      build.config[axis].label = label;
    }

    if (build.config[axis] && build.config[axis].ticks && build.config[axis].ticks.value) {
      build.config[axis].ticks.value = JSON.parse(build.config[axis].ticks.value);
    }

    var range = proportions.indexOf(key) >= 0 && key !== "pct_total" ? [0, 1] : false;

    var key = axis.length === 1 ? "pri" : "sec",
        style = axis === discrete ? "discrete" : "default",
        labelFont = chartStyles.labels[style][key];

    if (build.config.y2 && ["y", "y2"].indexOf(axis) >= 0) {
      if (build.config.y2.value === "01000US") {
        if (axis === "y") labelFont.color = build.colors.pri;
        else if (axis === "y2") labelFont.color = build.colors.sec;
      }
      else if (build.config.color in attrStyles) {
        var colors = attrStyles[build.config.color];
        if (colors[build.config[axis].value]) labelFont.color = colors[build.config[axis].value];
        else if (colors[build.config[axis].label]) labelFont.color = colors[build.config[axis].label];
      }
    }

    return {
      "label": {
        "font": chartStyles.labels[style][key],
        "padding": 0
      },
      "lines": chartStyles.lines,
      "range": range,
      "ticks": chartStyles.ticks[style][key]
    };
  };

  return {
    "axes": {
      "background": chartStyles.background,
      "ticks": false
    },
    "background": vizStyles.background,
    "color": vizStyles.color,
    "data": vizStyles.shapes,
    "edges": vizStyles.edges,
    "format": {
      "number": function(number, params) {

        var prefix = "";

        if (params.key) {

          if (params.key.indexOf("_moe") > 0) {
            prefix = "<span class='plus-minus'>±</span> ";
            params.key = params.key.replace("_moe", "");
          }

          if (params.key == "emp_thousands") {
            number = number * 1000;
          }
          else if (params.key == "value_millions") {
            number = number * 1000000;
          }
          else if (params.key == "output") {
            number = number * 1000000000;
          }

          if (params.key.indexOf("y2_") === 0) {
            params.key = params.key.slice(3);
          }

          if (proportions.indexOf(params.key) >= 0 || percentages.indexOf(params.key) >= 0) {
            if (proportions.indexOf(params.key) >= 0) number = number * 100;
            return prefix + d3plus.number.format(number, params) + "%";
          }
          else {
            number = d3plus.number.format(number, params);
            if (params.key in affixes) {
              var a = affixes[params.key];
              number = a[0] + number + a[1];
            }
            return prefix + number;
          }

        }

        return prefix + d3plus.number.format(number, params);

      },
      "text": function(text, params) {

        if (text.indexOf("_moe") > 0) {
          return "&nbsp;&nbsp;&nbsp;&nbsp;Margin of Error";
        }
        else if (text.indexOf("_rank") > 0) {
          return "Rank";
        }

        if (text.indexOf("y2_") === 0) {
          text = text.slice(3);
        }

        if (text === "bucket") {
          ["x", "y", "x2", "y2"].forEach(function(axis){
            if (d3plus.object.validate(build.config[axis]) &&
                build.config[axis].value === "bucket" &&
                build.config[axis].label &&
                build.config[axis].label !== true) {
              text = build.config[axis].label;
            }
          });
        }

        if (dictionary[text]) return dictionary[text];

        // All caps text
        if (all_caps.indexOf(text.toLowerCase()) >= 0) {
          return text.toUpperCase();
        }

        if (params.key) {

          if (params.key === "name") {
            return text;
          }

          // Format buckets
          if (params.key === "bucket") {

            var key = false;

            if (text.indexOf("_") > 0) {
              text = text.split("_");
              key = text.shift();
              text = text.join("_");
            }

            if (key === false) {
              ["x", "y", "x2", "y2"].forEach(function(axis){
                if (d3plus.object.validate(build.config[axis]) &&
                    build.config[axis].value === "bucket" &&
                    build.config[axis].label &&
                    build.config[axis].label !== true) {
                  key = build.config[axis].label;
                }
              });
            }

            var a = key && key in affixes ? affixes[key].slice() : ["", ""];
            var thousands = ["income"];
            for (var i = thousands.length; i > 0; i--) {
              var t = thousands[i - 1];
              if (t in dictionary) {
                thousands.push(dictionary[t]);
              }
            }
            if (thousands.indexOf(key) >= 0) a[1] = "k";

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
            else if (text.toLowerCase() === "none") {
              return a[0] + "0" + a[1];
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

          var attrs = build.viz ? build.viz.attrs() : false;
          if (attrs && text in attrs) {
            return d3plus.string.title(attrs[text].name, params);
          }

          if (attr_ids.indexOf(params.key) >= 0) return text.toUpperCase();

        }

        return d3plus.string.title(text, params);

      }
    },
    "height": {
      "small": 10
    },
    "labels": {
      "font": vizStyles.labels.font
    },
    "legend": {
      "font": vizStyles.legend.font,
      "labels": false
    },
    "messages": {
      "font": vizStyles.messages.font,
      "style": "large"
    },
    "tooltip": vizStyles.tooltip,
    "ui": vizStyles.ui,
    "x": axis_style("x"),
    "x2": axis_style("x2"),
    "y": axis_style("y"),
    "y2": axis_style("y2")
  }
}
