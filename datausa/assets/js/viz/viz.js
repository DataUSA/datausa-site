var viz = function(build) {

  build.viz = d3plus.viz()
    .container(build.container)
    .error("Please Wait")
    .draw();

  viz.loadCoords(build);

  return build;

};

viz.finish = function(build) {

  var source_text = d3plus.string.list(d3plus.util.uniques(build.sources).reduce(function(arr, s, i){
    if (s) arr.push(s.dataset);
    return arr;
  }, []));

  if (location.href.indexOf("/profile/") > 0) {
    d3.select(build.container.node().parentNode).select(".source")
      .text(source_text);
  }
  else {
    build.viz.footer(source_text);
  }

  if (!build.config.color) {
    if (build.viz.attrs()[build.highlight]) {
      var lighter = d3plus.color.lighter(build.color);
        build.config.color = function(d, viz) {
          return d[viz.id.value] === build.highlight ? build.color : lighter;
        };
    }
    else {
      build.config.color = function(d, viz) {
        return build.color;
      };
    }
    build.config.legend = false;
  }
  else if (build.config.color in staticAttrs) {
    build.color = build.config.color;
    build.config.color = function(d) {
      return staticAttrs[build.color][d[build.color]];
    };
  }

  var default_config = viz.defaults(build),
      type_config = viz[build.config.type](build);

  build.viz
    .config(default_config)
    .config(type_config)
    .config(build.config)
    .depth(build.config.depth)
    .error(false)
    .draw();

};

viz.redraw = function(build) {
  build.viz.error(false).draw();
};
