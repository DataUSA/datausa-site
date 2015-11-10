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

    if (type === "uss") {
      build.config.coords.key = "states";
      type = "states";
    }

    var solo = build.config.coords.solo;
    if (solo && solo.length) {
      build.config.coords.solo = solo.split(",");
    }
    else {
      build.config.coords.solo = [];
    }

    var excluded = ["79500US4804701", "16000US4817000"];
    build.config.coords.solo = build.config.coords.solo.filter(function(c){
      return excluded.indexOf(c) < 0;
    });
    build.config.coords.mute = excluded;

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
