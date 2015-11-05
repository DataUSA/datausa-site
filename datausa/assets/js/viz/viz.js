var viz = function(build) {

  build.viz = d3plus.viz()
    .container(build.container)
    .error("Please Wait")
    .draw();

  viz.loadCoords(build);

  return build;

};

viz.finish = function(build) {

  var source_text = d3plus.util.uniques(build.sources).reduce(function(str, s, i){
    if (s) str += s.dataset;
    return str;
  }, "");

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

  var default_config = viz.defaults(build),
      type_config = viz[build.config.type](build);

  build.viz
    .config(build.config)
    .depth(build.config.depth)
    .config(default_config)
    .config(type_config)
    .error(false)
    .draw();

};

viz.redraw = function(build) {
  build.viz.error(false).draw();
};
