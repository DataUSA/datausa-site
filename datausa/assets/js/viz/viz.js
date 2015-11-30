var viz = function(build) {

  if (!build.colors) build.colors = vizStyles.defaults;

  delete build.config.height;

  if (build.config.y2 && build.config.y2.value === "01000US" && build.highlight === "01000US") {
    delete build.config.y2;
  }

  build.viz = d3plus.viz()
    .config(viz.defaults(build))
    .background("transparent")
    .container(build.container.select(".d3plus"))
    .error("Please Wait")
    .draw();

  if (build.highlight) {

    build.viz.class(function(d, viz){
      var attr = d[viz.id.value] + "";
      return build.highlight === "01000US" || attr === build.highlight ? "highlight" :
             build.highlight.length > attr.length ? "outline" : "";
    });

  }

  viz.loadCoords(build);

  return build;

};

viz.finish = function(build) {

  var source_text = d3plus.string.list(d3plus.util.uniques(build.sources.reduce(function(arr, s, i){
    if (s) {
      var t = s.dataset;
      if (s.link) {
        t = "<a class='source-link' href='" + s.link + "' target='_blank'>" + t + "</a>";
      }
      arr.push(t);
    }
    return arr;
  }, [])));

  d3.select(build.container.node().parentNode).select(".source")
    .html(source_text);

  if (!build.config.color) {
    if (build.viz.attrs()[build.highlight]) {
      build.config.color = function(d, viz) {
        return build.highlight === "01000US" || d[viz.id.value] === build.highlight ? build.colors.pri : build.colors.sec;
      };
    }
    else {
      build.config.color = function(d, viz) {
        return build.colors.pri;
      };
    }
    build.config.legend = false;
  }
  else if (build.config.color in attrStyles) {
    var attrs = build.attrs.map(function(a){
      var t = a.type;
      if (t in attrStyles && attrStyles[t].constructor === String) {
        return attrStyles[t];
      }
      return t;
    });
    build.color = build.config.color;
    if (attrs.indexOf(build.color) >= 0) {
      build.config.color = "color";
    }
    else {
      build.config.color = function(d) {
        if (!(d[build.color] in attrStyles[build.color])) {
          console.warn("Missing color for \"" + d[build.color] + "\"");
        }
        return attrStyles[build.color][d[build.color]];
      };
    }
  }

  build.viz
    .config(viz[build.config.type](build))
    .config(build.config)
    .depth(build.config.depth)
    .error(false)
    .draw();

};

viz.redraw = function(build) {
  build.viz.error(false).draw();
};
