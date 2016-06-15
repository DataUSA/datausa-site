var save = function(svg, options) {

  options = options ? options : {};

  if (!options.mode) options.mode = "png";
  if (!options.name) options.name = "download";
  if (!options.padding) options.padding = 15;
  if (!options.scale) options.scale = 2;
  options.filename = options.name + "." + options.mode;

  if (options.mode === "svg") {
    svg.each(function(){
      var outer = d3plus.client.ie ? (new XMLSerializer()).serializeToString(this) : this.outerHTML;
      saveAs(new Blob([outer], {type:"application/svg+xml"}), options.filename);
    })
    return;
  }

  var parent = d3.select("body.map");
  if (!parent.size()) parent = d3.select(svg.node().parentNode.parentNode.parentNode.parentNode);
  var sources = parent.selectAll(".sub-source"),
      footerHeight = options.padding,
      sourceData = [],
      title = d3.select(parent.node().parentNode).select(".embed-title"),
      titleHeight = title.size() ? title.node().offsetHeight + options.padding : 0,
      sub = d3.select(parent.node().parentNode).select(".sub-title"),
      subHeight = sub.size() ? sub.node().offsetHeight + 5 : 0;
  if (sources.size()) {
    sources.each(function(d){
      sourceData.push({"y": footerHeight, "loaded": false});
      footerHeight += this.offsetHeight;
    });
  }

  var svgWidth = parseFloat(svg.attr("width"), 10),
      svgHeight = parseFloat(svg.attr("height"), 10);

  var ui = d3.select(svg.node().parentNode).select("#d3plus_drawer");
  if (ui.size()) {
    svgHeight -= ui.node().offsetHeight;
  }

  var canvas = document.createElement("canvas");
  canvas.width = (svgWidth + (options.padding * 2)) * options.scale;
  canvas.height = ((options.padding * 2) + titleHeight + subHeight + (svgHeight * svg.size()) + footerHeight) * options.scale;

  var context = canvas.getContext('2d');
  context.scale(options.scale, options.scale);
  context.clearRect(0, 0, canvas.width / 2, canvas.height / 2);

  if (options.mode === "pdf") {
    context.beginPath();
    context.rect(0, 0, canvas.width / 2, canvas.height / 2);
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
    var keyBox = svg.select("#key").node().getBBox();

    var translate = svg.select("#key").attr("transform").match(/translate\(([^a-z]+)\)/i)[1];
    translate = translate.replace(/([^a-z])\s([^a-z])/gi, "$1,$2").split(",").map(Number);
    var startY = keyBox.y + translate[1];

    legendIcons.each(function(d, i){
      var pattern = d3.select(this).attr("fill");
      var image = pattern.indexOf("url") === 0;
      if (image) {
        pattern = pattern.split("#")[1];
        pattern = svg.select("#" + pattern.substring(0, pattern.length-1));
        var size = parseFloat(pattern.select("image").attr("width"));
        var rect = pattern.select("rect").node();
      }
      else {
        var rect = d3.select(this).attr("stroke", "none").node();
        var size = parseFloat(d3.select(this).attr("width"));
      }

      var x = options.padding + keyBox.x + (i * (size + 5)), y = options.padding + titleHeight + subHeight + startY;

      rect = d3plus.client.ie ? (new XMLSerializer()).serializeToString(rect) : rect.outerHTML;
      context.drawSvg(rect, x, y);

      context.save();
      if (image) {
        var img = document.createElement('img');
        img.src = pattern.select("image").attr("href");
        context.translate(x, y);
        context.drawImage(img, 0, 0, size, size);
      }
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

    // if (allDone) {
    //   for (var i = 0; i < sources.size(); i++) {
    //     if (!sourceData[i].loaded) {
    //       allDone = false;
    //       break;
    //     }
    //   }
    // }

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
      context.beginPath();
      context.translate(options.padding, options.padding + titleHeight + subHeight);
      context.rect(0, 0, svgWidth, svgHeight * svg.size());
      context.clip();
      context.drawImage(tile.img, tile.x, tile.y);
      context.restore();
    }

    // // draw svg path
    svg.each(function(d, i){
      d3.select(this).selectAll("svg > *").each(function(){
        if (!d3.select(this).classed("tiles") && d3.select(this).attr("id") !== "key") {
          var outer = d3plus.client.ie ? (new XMLSerializer()).serializeToString(this) : this.outerHTML;
          context.save();
          context.translate(options.padding, options.padding + titleHeight + subHeight + (svgHeight * i));
          context.rect(0, 0, svgWidth, svgHeight);
          context.clip();
          context.drawSvg(outer);
          context.restore();
        }
      });
    });

    function text2svg(text, title) {
      text = d3.select(text);
      title = title || text.text().replace(" Options", "").trim();
      title = title
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      var fC = text.style("color"),
          fF = text.style("font-family").split(",")[0],
          fS = text.style("font-size");

      if (fF.indexOf("'") !== 0) fF = "'" + fF + "'";
      return "<text stroke='none' dy='" + fS + "' fill='" + fC + "' font-family=" + fF + " font-size='" + fS + "'>" + title + "</text>";
    }

    sources.each(function(d, i){

      var text = text2svg(this);
      context.save();
      context.translate(options.padding, options.padding + titleHeight + subHeight + (svgHeight * svg.size()) + sourceData[i].y);
      context.drawSvg(text);
      context.restore();

    });

    if (title.size()) {
      var titleText = text2svg(title.node(), options.name.split(" of ").slice(1).join(" of "));
      context.save();
      context.translate(options.padding, options.padding);
      context.drawSvg(titleText);
      context.restore();
    }

    if (sub.size()) {
      var subText = text2svg(sub.node());
      context.save();
      context.translate(options.padding, titleHeight + 5);
      context.drawSvg(subText);
      context.restore();
    }

    var logo = d3.select(".datausa-link").select("img"),
        logoHeight = logo.node().offsetHeight,
        logoWidth = logo.node().offsetWidth,
        logoX = canvas.width/options.scale - logoWidth - options.padding,
        logoY = canvas.height/options.scale - logoHeight - options.padding - 10;

    context.save();
    context.translate(logoX, logoY);
    context.drawImage(logo.node(), 0, 0, logoWidth, logoHeight);
    context.restore();

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
