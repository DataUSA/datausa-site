var all_caps = ["cip", "naics", "rca", "soc", "usa"],
    attr_ids = ["geo", "cip", "soc", "naics"],
    range100 = ["non_eng_speakers_pct", "owner_occupied_housing_units", "us_citizens", "grads_total_growth"];

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

    var range = range100.indexOf(key) >= 0 ? [0, 1] : false;

    var key = axis.length === 1 ? "pri" : "sec",
        style = axis === discrete ? "discrete" : "default",
        labelFont = chartStyles.labels[style][key];

    if (build.config.y2 && ["y", "y2"].indexOf(axis) >= 0) {
      if (build.config.y2.value === "01000US" || build.config.y2.label === "National Average" || build.config.y2.label === "USA") {
        if (axis === "y") labelFont.color = build.colors.pri;
        else if (axis === "y2") labelFont.color = build.colors.sec;
      }
      else if (build.config.color in attrStyles) {
        var colors = attrStyles[build.config.color];
        if (colors[build.config[axis].value]) labelFont.color = colors[build.config[axis].value].color;
        else if (colors[build.config[axis].label]) labelFont.color = colors[build.config[axis].label].color;
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

  var messageBg = vizStyles.background;
  if (!build.container.classed("thumbprint") && messageBg === "transparent") {
    function findSection(node) {
      if (node.tagName.toLowerCase() === "section") {
        var bg = d3.select(node).style("background-color");
        return bg !== "rgba(0, 0, 0, 0)" ? bg : d3.select("body").style("background-color");
      }
      else if (node.tagName.toLowerCase() === "body") {
        return messageBg;
      }
      else {
        return findSection(node.parentNode);
      }
    }
    messageBg = findSection(build.container.node());
  }

  function noAgg(k) {
    return function(leaves) {
      if (leaves.length === 1) return leaves[0][k];
      else return null;
    }
  }

  return {
    "aggs": {
      "avg_wage": noAgg("avg_wage"),
      "avg_wage_moe": noAgg("avg_wage_moe"),
      "avg_wage_rank": noAgg("avg_wage_rank"),
      "avg_wage_ft": noAgg("avg_wage_ft"),
      "avg_wage_ft_moe": noAgg("avg_wage_ft_moe"),
      "avg_wage_ft_rank": noAgg("avg_wage_ft_rank"),
      "avg_wage_pt": noAgg("avg_wage_pt"),
      "avg_wage_pt_moe": noAgg("avg_wage_pt_moe"),
      "avg_wage_pt_rank": noAgg("avg_wage_pt_rank"),
      "avg_hrs": noAgg("avg_hrs"),
      "avg_hrs_moe": noAgg("avg_hrs_moe"),
      "avg_hrs_rank": noAgg("avg_hrs_rank"),
      "avg_hrs_ft": noAgg("avg_hrs_ft"),
      "avg_hrs_ft_moe": noAgg("avg_hrs_ft_moe"),
      "avg_hrs_ft_rank": noAgg("avg_hrs_ft_rank"),
      "avg_hrs_pt": noAgg("avg_hrs_pt"),
      "avg_hrs_pt_moe": noAgg("avg_hrs_pt_moe"),
      "avg_hrs_pt_rank": noAgg("avg_hrs_pt_rank"),
      "avg_age": noAgg("avg_age"),
      "avg_age_moe": noAgg("avg_age_moe"),
      "avg_age_rank": noAgg("avg_age_rank"),
      "med_earnings": noAgg("med_earnings"),
      "med_earnings_moe": noAgg("med_earnings_moe")
    },
    "axes": {
      "background": chartStyles.background,
      "ticks": false
    },
    "background": vizStyles.background,
    "color": vizStyles.color,
    "data": vizStyles.shapes,
    "edges": vizStyles.edges,
    "format": {
      "number": viz.format.number,
      "text": function(text, params) {
        return viz.format.text(text, params, build);
      }
    },
    "height": {
      "small": 10
    },
    "icon": {
      "style": "knockout"
    },
    "labels": {
      "font": vizStyles.labels.font[build.config.type] || vizStyles.labels.font.default
    },
    "legend": {
      "font": vizStyles.legend.font,
      "labels": false,
      "order": {
        "sort": "desc",
        "value": "size"
      }
    },
    "messages": {
      "background": messageBg,
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
