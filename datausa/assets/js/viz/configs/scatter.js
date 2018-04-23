viz.scatter = function(build) {

  function getRange(axis) {

    var h = build.viz.height(),
        w = build.viz.width();

    var max = Math.floor(d3.max([d3.min([w, h])/15, 6]));

    if (build.config[axis]) {
      var k = build.config[axis].value;
      if (k !== build.config.id) {
        var d = axis.indexOf("x") === 0 ? w : h,
            range = d3.extent(build.viz.data(), function(d) { return d[k]; });
        range[0] -= range[0] * (max / d);
        range[1] += range[1] * (max / d);
        return range;
      }
    }
    return false;
  }

  var retObj = {};
  if (build.config.x.scale !== "discrete") retObj.x = {range: getRange("x")};
  if (build.config.y.scale !== "discrete") retObj.y = {range: getRange("y")};
  return retObj;
}
