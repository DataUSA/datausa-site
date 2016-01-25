viz.loadAttrs = function(build) {
  var next = "loadData";

  build.viz.error("Loading Attributes").draw();

  if (build.attrs.length) {
    var loaded = 0, attrs = {};
    for (var i = 0; i < build.attrs.length; i++) {
      load(build.attrs[i].url, function(data, url){
        var a = build.attrs.filter(function(a){ return a.url === url; })[0];
        a.data = data;
        var type = a.type === "university" ? "sector" : a.type, color_key = type;
        if (type + "_key" in attrStyles) {
          color_key = attrStyles[type + "_key"];
        }
        if (!(color_key instanceof Array)) color_key = [color_key];
        var colorize = build.config.color === type && type in attrStyles ? attrStyles[type] : false;
        for (var i = 0; i < data.length; i++) {
          var d = data[i];
          if (type === "iocode") {
            if (!d.parent && d.id.charAt(0) === "F" && d.id !== "FIRE") d.parent = "F";
            else if (!d.parent) d.parent = d.id;
          }
          if (colorize) {
            var lookup = false;
            color_key.forEach(function(k){
              if (k in d && d[k] && d[k] in colorize) {
                lookup = colorize[d[k]];
              }
            })
            if (!lookup && d.id in colorize) {
              lookup = colorize[d.id];
            }
            if (lookup) {
              d.color = lookup.color;
              d.icon = "/static/img/attrs/" + lookup.icon;
            }
          }
          attrs[d.id] = d;
        }
        loaded++;
        if (loaded === build.attrs.length) {
          build.viz.attrs(attrs);
          viz[next](build);
        }
      })
    }
  }
  else {
    viz[next](build);
  }

};
