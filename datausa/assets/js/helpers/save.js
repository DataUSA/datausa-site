var save = function(svg, options) {

  options = options ? options : {};

  if (!options.mode) options.mode = "png";
  if (!options.name) options.name = "download";
  options.filename = options.name + "." + options.mode;

  if (options.mode === "svg") {
    var outer = d3plus.client.ie ? (new XMLSerializer()).serializeToString(svg.node()) : svg.node().outerHTML;
    saveAs(new Blob([outer], {type:"application/svg+xml"}), options.filename)
    return;
  }

  var upscale = 2;

  var canvas = document.createElement("canvas");
  canvas.width = parseFloat(svg.attr("width"), 10) * upscale;
  canvas.height = parseFloat(svg.attr("height"), 10) * upscale;

  var context = canvas.getContext('2d');
  context.scale(upscale, upscale);
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (options.mode === "pdf") {
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.fill();
  }

  var imageTiles = {},
      tileGroup = svg.select("g.tiles");

  if (tileGroup.size()) {
    var scale = Math.round(parseFloat(tileGroup.attr("transform").match(/scale\(([^a-z]+)\)/i)[1])),
        translate = tileGroup.attr("transform").match(/translate\(([^a-z]+)\)/i)[1];

    translate = translate.replace(/([^a-z])\s([^a-z])/gi, "$1,$2");
    translate = translate.split(",").map(function(d){
        return Math.round(parseFloat(d) * scale);
      });

    svg.select("g.tiles").selectAll("image").each(function(){
      var x = parseFloat(d3.select(this).attr("x")) * scale + translate[0],
          y = parseFloat(d3.select(this).attr("y")) * scale + translate[1],
          url = d3.select(this).attr("href");

      imageTiles[url] = {"loaded": false};

      var img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function(){
          var canvas2 = document.createElement('CANVAS');
          var ctx2 = canvas2.getContext('2d');
          canvas2.height = scale;
          canvas2.width = scale;
          ctx2.drawImage(this, 0, 0, scale, scale);
          var himg = document.createElement('img');
          himg.src = canvas2.toDataURL('image/png');
          imageTiles[url] = {
            "img": himg,
            "loaded": true,
            "x": x,
            "y": y
          };
      };
      img.src = url;

    });
  }

  var legendIcons = svg.selectAll("#key rect");

  if (legendIcons.size()) {
    var keyBox = d3.select("#key").node().getBBox();

    var translate = d3.select("#key").attr("transform").match(/translate\(([^a-z]+)\)/i)[1];
    translate = translate.replace(/([^a-z])\s([^a-z])/gi, "$1,$2").split(",").map(Number);
    keyBox.y += translate[1];

    legendIcons.each(function(d, i){
      var pattern = d3.select(this).attr("fill").split("#")[1];
      pattern = svg.select("#" + pattern.substring(0, pattern.length-1));
      var size = parseFloat(pattern.select("image").attr("width"));

      var x = keyBox.x + (i * (size + 5)), y = keyBox.y;

      var rect = pattern.select("rect").node();
      rect = d3plus.client.ie ? (new XMLSerializer()).serializeToString(rect) : rect.outerHTML;
      context.drawSvg(rect, x, y);

      var img = document.createElement('img');
      img.src = pattern.select("image").attr("href");

      context.save();
      context.translate(x, y);
      context.drawImage(img, 0, 0, size, size);
      context.restore();
    });
  }

  // Wait for all the tiles to download
  checkStatus();

  function checkStatus() {

    var allDone = true;
    for (var key in imageTiles) {
      if (!imageTiles[key].loaded) {
        allDone = false;
        break;
      }
    }

    if (allDone) {
      finish();
    } else {
      setTimeout(function(){ checkStatus(); }, 500);
    }
  }

  function finish() {
    // draw image tiles
    for (var key in imageTiles) {
      var tile = imageTiles[key];
      context.save();
      context.translate(tile.x, tile.y);
      context.drawImage(tile.img, 0, 0);
      context.restore();
    }

    // // draw svg path
    svg.selectAll("svg > *").each(function(){
      if (!d3.select(this).classed("tiles") && d3.select(this).attr("id") !== "key") {
        var outer = d3plus.client.ie ? (new XMLSerializer()).serializeToString(this) : this.outerHTML;
        context.drawSvg(outer);
      }
    });

    // var outer = d3plus.client.ie ? (new XMLSerializer()).serializeToString(svg.node()) : svg.node().outerHTML;
    // canvg(canvas, outer);

    // save the canvas
    render();

  }

  function render() {

    if (options.mode === "pdf") {

      var outputWidth = 8.5,
          outputHeight = 11,
          outputUnit = "in";

      var aspect = canvas.width / canvas.height;

      var orientation = aspect > 1 ? "landscape" : "portrait";

      var pdf = new jsPDF(orientation, outputUnit, [outputWidth, outputHeight]);

      var width = orientation === "landscape" ? outputHeight : outputWidth,
          height = orientation === "landscape" ? outputWidth : outputHeight,
          top, left, margin = 0.5;

      if (aspect < width/height) {
        height -= (margin * 2);
        var tempWidth = height * aspect;
        top = margin;
        left = (width - tempWidth) / 2;
        width = tempWidth;
      }
      else {
        width -= (margin * 2);
        var tempHeight = width / aspect;
        left = margin;
        top = (height - tempHeight) / 2;
        height = tempHeight;
      }

      pdf.addImage(canvas, "canvas", left, top, width, height);
      pdf.save(options.filename);

    }
    else canvas.toBlob(function(blob) { saveAs(blob, options.filename); });

  }

}
