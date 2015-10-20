viz.loadCoords = function(build) {
  var next = "loadAttrs";

  build.viz.error("Loading Coordinates").draw();

  if (build.config.coords) {
    load("/static/topojson/" + build.config.coords + ".json", function(data){
      data.objects[build.config.coords].geometries = data.objects[build.config.coords].geometries.filter(function(c){
        if (c.id.indexOf("id_") < 0) return false;
        c.id = c.id.slice(3);
        return true;
      });
      build.viz.coords(data);
      viz[next](build);
    })
  }
  else {
    viz[next](build);
  }

}
