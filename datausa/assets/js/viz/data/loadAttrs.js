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
        var colorize = build.config.color === type && type in attrStyles ? attrStyles[type] : false;
        for (var i = 0; i < data.length; i++) {
          var d = data[i];
          if (colorize) {
            if (color_key in d) {
              d.color = colorize[d[color_key]].color;
            }
            else if (d.id in colorize) {
              d.color = colorize[d.id].color;
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
