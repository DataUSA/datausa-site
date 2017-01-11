viz.format = {
  "number": function(number, params) {

    var prefix = "";

    if (params.key) {

      var key = params.key + "";
      delete params.key;

      if (key === "year") return number;

      if (key.indexOf("_moe") > 0) {
        prefix = "<span class='plus-minus'>±</span> ";
        key = key.replace("_moe", "");
      }

      if (key.indexOf("emp_thousands") >= 0) {
        number = number * 1000;
      }
      else if (key == "value_millions") {
        number = number * 1000000;
      }
      else if (key == "output") {
        number = number * 1000000000;
      }

      if (key.indexOf("y2_") === 0) {
        key = key.slice(3);
      }

      if (proportions.indexOf(key) >= 0) number = number * 100;

      if ((params.output !== "x" || number < 1000) && number < 999999.99 && number >= 0.1) {
        var prec = params.cart || ["gini"].indexOf(key) >= 0 ? "3" : key.indexOf("_rca") > 0 || key in affixes ? "2" : "1";
        number = d3.format(",." + prec + "f")(number);
        number = prec === "3" ? number.replace(".000", "") : prec === "2" ? number.replace(".00", "") : number.replace(".0", "");
      }
      else {
        number = d3plus.number.format(number, params);
      }

      if (key in affixes) {
        var a = affixes[key];
        number = a[0] + number + a[1];
      }

      if (proportions.indexOf(key) >= 0 || percentages.indexOf(key) >= 0) {
        number = number + "%";
      }
      return prefix + number;

    }

    return prefix + d3plus.number.format(number, params);

  },
  "text": function(text, params, build) {

    if (params === void 0) params = {};

    if (params.cart && text.match(/_id$/g)) {
      return viz.format.text(text.substring(0, text.length - 3), params, build) + " ID"
    }
    if (params.cart && text.match(/_name$/g)) {
      return viz.format.text(text.substring(0, text.length - 5), params, build) + " Name"
    }

    var yearMatch = text.match(/_(\d{4})$/g);
    if (yearMatch) {
      return viz.format.text(text.substring(0, text.length - 5), params, build) + " (" + yearMatch[0].slice(1, 5) + ")"
    }
    if (text.indexOf("_moe") > 0) {
      if (params && params.cart) {
        return viz.format.text(text.split("_moe")[0], params, build) + " Margin of Error";
      }
      return "&nbsp;&nbsp;&nbsp;&nbsp;Margin of Error";
    }
    else if (text.indexOf("_rank") > 0) {
      return "Rank";
    }
    else if (text.indexOf("_pct_calc") > 0) {
      return "Percentage of " + viz.format.text(text.split("_pct_calc")[0]);
    }

    if (text.indexOf("y2_") === 0) {
      text = text.slice(3);
    }

    if (build && text === "bucket") {
      ["x", "y", "x2", "y2"].forEach(function(axis){
        if (d3plus.object.validate(build.config[axis]) &&
            build.config[axis].value === "bucket" &&
            build.config[axis].label &&
            build.config[axis].label !== true) {
          text = build.config[axis].label;
        }
      });
    }

    if (dictionary[text]) {
      if (per1000.indexOf(text) >= 0) return dictionary[text] + " per 1,000 People";
      if (per10000.indexOf(text) >= 0) return dictionary[text] + " per 10,000 People";
      if (per100000.indexOf(text) >= 0) return dictionary[text] + " per 100,000 People";
      return dictionary[text];
    }

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

        if (build && key === false) {
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
        text = text.slice(12);
        var num = text.slice(0, 4), suffix = text.slice(4);
        suffix = suffix === "00" ? "" : "." + suffix;
        return "Census Tract " + num + suffix;
      }

      var attrs = build && build.viz ? build.viz.attrs() : false;
      if (attrs && text in attrs) {
        return d3plus.string.title(attrs[text].name, params);
      }

      if (attr_ids.indexOf(params.key) >= 0) return text.toUpperCase();

    }

    return d3plus.string.title(text, params);

  }
}
