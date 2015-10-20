viz.loadCoords = function(build) {
  var next = "loadAttrs";

  build.viz.error("Loading Coordinates").draw();

  var type = build.config.coords;

  if (type) {
    load("/static/topojson/" + type + ".json", function(data){

      if (type === "countries") {
        data.objects[type].geometries = data.objects[type].geometries.filter(function(c){
          if (c.id.indexOf("id_") < 0) return false;
          c.id = c.id.slice(3);
          return true;
        });
      }

      build.viz.coords(data);
      viz[next](build);
    })
  }
  else {
    viz[next](build);
  }

}
