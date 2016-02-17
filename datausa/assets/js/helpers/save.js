var save = function(svg, options) {

  options = options ? options : {};

  var canvas = document.createElement("canvas");
  canvas.width = parseFloat(svg.attr("width"), 10);
  canvas.height = parseFloat(svg.attr("height"), 10);

  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  var imageTiles = {},
      tileGroup = svg.select("g.tiles");

  if (tileGroup.size()) {
    var transform = tileGroup.attr("transform").split(")translate("),
        scale = parseFloat(transform[0].split("scale(")[1]),
        translate = transform[1].split(")")[0].split(",").map(function(d){
          return parseFloat(d) * scale;
        });

    svg.select("g.tiles").selectAll("image").each(function(){
      var x = parseFloat(d3.select(this).attr("x")) * 256 + translate[0],
          y = parseFloat(d3.select(this).attr("y")) * 256 + translate[1],
          url = d3.select(this).attr("href");

      imageTiles[url] = {"loaded": false};

      var img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function(){
          var canvas2 = document.createElement('CANVAS');
          var ctx2 = canvas2.getContext('2d');
          canvas2.height = this.height;
          canvas2.width = this.width;
          ctx2.drawImage(this, 0, 0);
          var himg = document.createElement('img');
          himg.src = canvas2.toDataURL('image/png');
          // console.log(himg)
          // cachedTiles[url] = [params, himg];
          // canvas2 = null;
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
      if (!d3.select(this).classed("tiles")) {
        var outer = d3plus.client.ie ? (new XMLSerializer()).serializeToString(this) : this.outerHTML;
        console.log(this)
        context.drawSvg(outer);
      }
    });

    // var outer = d3plus.client.ie ? (new XMLSerializer()).serializeToString(svg.node()) : svg.node().outerHTML;
    // canvg(canvas, outer);

    // save the canvas
    render();

  }

  function render() {

    var mode = options.mode ? options.mode : "png",
        filename = options.name ? options.name : "download";

    filename = filename + "." + mode;

    if (mode === "pdf") {

      var orientation = canvas.width > canvas.height ? "landscape" : "portrait";

      // A4 page size is 210 × 297
      var pdf = new jsPDF(orientation);
      var aspect = canvas.width / canvas.height;
      // zaspect = aspect;

      var width, height;
      if (orientation === "landscape") {
         height = Math.min(210, canvas.height);
         width = height * aspect;
      }
      else {
         width = 210;
         height = 297 * aspect;
      }

      pdf.addImage(canvas, "canvas", 0, 0, width, height);
      // zcanvas=canvas;
      pdf.save(filename);

    }
    else canvas.toBlob(function(blob) { saveAs(blob, filename); });

  }

}
