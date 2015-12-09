viz.loadAttrs = function(build) {
  var next = "loadData";

  build.viz.error("Loading Attributes").draw();

  if (build.attrs.length) {
    var loaded = 0, attrs = {};
    for (var i = 0; i < build.attrs.length; i++) {
      load(build.attrs[i].url, function(data, url){
        var a = build.attrs.filter(function(a){ return a.url === url; })[0];
        a.data = data;
        var color_key = a.type;
        if (a.type + "_key" in attrStyles) {
          color_key = attrStyles[a.type];
        }
        var colorize = build.config.color === a.type && a.type in attrStyles ? attrStyles[a.type] : false;
        for (var i = 0; i < data.length; i++) {
          var d = data[i];
          if (colorize) {
            if (color_key in d) {
              d.color = colorize[d[color_key]];
            }
            else if (d.id in colorize) {
              d.color = colorize[d.id];
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
