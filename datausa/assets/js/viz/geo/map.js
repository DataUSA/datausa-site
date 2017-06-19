viz.map = function() {

  // setup default vars, mimicing D3plus
  var vars = {
    attrs: {objectOnly: true, value: {}},
    background: {value: "transparent"},
    class: {value: false},
    color: {value: false},
    container: {value: false},
    coords: {value: false, solo: [], mute: []},
    data: {value: []},
    depth: {value: 0},
    error: {value: false},
    form: false,
    format: {
      value: function(value, opts){
        if (typeof value === "number") {
          return this.number(value, opts);
        }
        else if (typeof value === "string") {
          return this.text(value, opts);
        }
        return JSON.stringify(value);
      },
      number: viz.format.number,
      text: viz.format.text
    },
    height: {value: false},
    highlight: {value: false},
    id: {value: false},
    messages: {value: true},
    mouse: {value: true},
    pins: {value: []},
    scale: false,
    text: {value: "name"},
    tiles: {value: true},
    time: {value: false, solo: false, years: false},
    translate: false,
    tooltip: {url: false, value: []},
    width: {value: false},
    zoom: {pan: false, scroll: false, set: false, value: true, reset: true}
  };

  // the drawing function
  vars.self = function() {

    if (vars.data.value.length && !vars.time.years) {
      vars.time.years = d3plus.util.uniques(vars.data.value.filter(function(d) { return typeof d[vars.color.value] === "number"; }), function(d) { return d.year; }).sort(function(a, b) { return a - b; });
      vars.data.value = vars.data.value.filter(function(d) { return vars.time.years.indexOf(d.year) >= 0; });
    }

    var time = vars.time.years && vars.time.years.length > 1;

    var toggle = vars.container.value.selectAll(".year-toggle").data([null]);
    toggle.enter().append("div")
        .attr("class", "year-toggle")
      .append("span")
        .attr("class", "legend-label");
    toggle.select(".legend-label").text(vars.color.value ? vars.format.text(vars.color.value) : "");
    toggle.transition().duration(600).style("opacity", time ? 1 : 0);

    if (time) {
      if (!vars.time.solo) vars.time.solo = vars.time.years[vars.time.years.length - 1];
      vars.data.filtered = vars.data.value.filter(function(d) { return d.year === vars.time.solo });

      if (!vars.form) {
        vars.form = d3plus.form()
          .container(toggle)
          .id("value")
          .focus(vars.time.solo, function(d) {
            if (d !== vars.time.solo) {
              vars.time.solo = d;
              vars.self.draw();
            }
          })
          .text("text")
          .type("toggle")
          .ui({margin: 0})
          .ui(vizStyles.ui)
          // .title("Year")
          .draw();
      }
      vars.form
        .data(vars.time.years.map(function(d) { return {value: d, text: d + ""}; }))
        .focus(vars.time.solo)
        .draw();
    }
    else vars.data.filtered = vars.data.value;

    viz.mapDraw(vars);
    vars.color.changed = false;
    return vars.self;
  }

  // default logic for setting a var key
  var methodSet = function(method, _) {
    if (!vars[method]) vars[method] = {};
    if (_.constructor === Object && _.type === "Topology") {
      vars[method].changed = true;
      vars[method].value = _;
    }
    else if (_.constructor === Object && vars[method].objectOnly !== true) {
      for (var k in _) {
        vars[method][k] = _[k];
      }
    }
    else {
      vars[method].changed = true;
      vars[method].value = _;
    }
  }

  // attach simple set/get methods for all keys in vars
  for (var key in vars) {
    vars.self[key] = (function(method){
      return function(_) {
        if (arguments.length) {
          if (_ === Object) return vars[method];
          methodSet(method, _);
          return vars.self;
        }
        return vars[method].value;
      }
    })(key);
  }

  // method for passing multiple methods in one function
  vars.self.config = function(_) {
    for (var method in _) {
      methodSet(method, _[method]);
    }
    return vars.self;
  }

  vars.self.draw = vars.self;
  return vars.self;

}
