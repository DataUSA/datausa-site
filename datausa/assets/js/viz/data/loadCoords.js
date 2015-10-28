viz.loadCoords = function(build) {
  var next = "loadAttrs";

  build.viz.error("Loading Coordinates").draw();

  var type = build.config.coords;

  if (type) {

    if (type.constructor === String) {
      build.config.coords = {"key": type};
    }
    else {
      type = type.value;
      build.config.coords.key = type;
      delete build.config.coords.value;
    }

    if (build.config.coords.solo) {
      build.config.coords.solo = build.config.coords.solo.split(",");
    }

    var filename = type;
    if (["places", "tracts"].indexOf(type) >= 0) {
      filename += "_" + build.config.coords.solo[0].slice(7, 9);
    }

    load("/static/topojson/" + filename + ".json", function(data){

      build.viz.coords(data);
      viz[next](build);

    });

  }
  else {
    viz[next](build);
  }

}
