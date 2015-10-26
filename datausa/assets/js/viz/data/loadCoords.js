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

    load("/static/topojson/" + type + ".json", function(data){

      if (type === "countries" && !data.filtered) {
        data.objects[type].geometries = data.objects[type].geometries.filter(function(c){
          return c.matched;
        });
        data.filtered = true;
      }

      build.viz.coords(data);
      viz[next](build);
    })
  }
  else {
    viz[next](build);
  }

}
