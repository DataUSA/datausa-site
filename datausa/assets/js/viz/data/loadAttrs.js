viz.loadAttrs = function(build) {
  var next = "loadData";

  build.viz.error("Loading Attributes").draw();

  if (build.attrs.length) {
    var loaded = 0, attrs = {};
    for (var i = 0; i < build.attrs.length; i++) {
      load(build.attrs[i].url, function(data, url){
        var a = build.attrs.filter(function(a){ return a.url === url; })[0];
        a.data = data;
        var color = a.type;
        if (a.type in attrStyles && attrStyles[a.type].constructor === String) {
          color = attrStyles[color];
        }
        var colorize = build.config.color == color && build.config.color in attrStyles ? attrStyles[build.config.color] : false;
        for (var i = 0; i < data.length; i++) {
          var d = data[i];
          if (colorize) {
            if (build.config.color in d) {
              d.color = colorize[d[build.config.color]];
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
