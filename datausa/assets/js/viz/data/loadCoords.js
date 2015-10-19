viz.loadCoords = function(build) {
  var next = "loadAttrs";

  if (build.config.type === "geo_map") {
    load("/static/topojson/counties.json", function(data){
      build.viz.coords(data);
      viz[next](build);
    })
  }
  else {
    viz[next](build);
  }

}
