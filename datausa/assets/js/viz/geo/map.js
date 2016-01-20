viz.map = function() {

  // setup default vars, mimicing D3plus
  var vars = {
    "attrs": {"objectOnly": true, "value": {}},
    "background": {"value": "transparent"},
    "class": {"value": false},
    "color": {"value": false},
    "container": {"value": false},
    "coords": {"value": false, "solo": [], "mute": []},
    "data": {"value": []},
    "depth": {"value": 0},
    "error": {"value": false},
    "format": {
      "value": function(value, opts){
        if (typeof value === "number") {
          return this.number(value, opts);
        }
        else if (typeof value === "string") {
          return this.text(value, opts);
        }
        return JSON.stringify(value);
      },
      "number": viz.format.number,
      "text": viz.format.text
    },
    "height": {"value": false},
    "highlight": {"value": false},
    "id": {"value": false},
    "messages": {"value": true},
    "mouse": {"value": true},
    "pins": {"value": []},
    "text": {"value": "name"},
    "tiles": {"value": true},
    "tooltip": {"value": []},
    "width": {"value": false},
    "zoom": {"set": false, "value": true}
  };

  // the drawing function
  vars.self = function() {
    viz.mapDraw(vars);
    return vars.self;
  }

  // default logic for setting a var key
  var methodSet = function(method, _) {
    if (!vars[method]) vars[method] = {};
    if (_.constructor === Object && _.type === "Topology") {
      vars[method].value = _;
    }
    else if (_.constructor === Object && vars[method].objectOnly !== true) {
      for (var k in _) {
        vars[method][k] = _[k];
      }
    }
    else {
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
