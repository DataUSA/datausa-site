viz.line = function(build) {

  var id = current_build.profile ? current_build.profile.id : false;
  if (!build.config.order && id) {
    build.viz.data(build.viz.data().map(function(d){
      d.focus = d[build.config.id] === id ? 1 : 0;
      return d;
    }));
    build.config.order = {
      sort: "asc",
      value: "focus"
    };
  }

  return {
    "shape": {
      "interpolate": vizStyles.lines.interpolation
    },
    "size": vizStyles.lines["stroke-width"]
  };
}
