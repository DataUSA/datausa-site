dusa_popover = function() {

}

dusa_popover.close = function() {
  d3.selectAll(".close-btn .b").classed("close", !d3.selectAll(".close-btn .b").classed("close"));
  d3.selectAll(".overlay").remove();
  d3.select("body").on("keyup.popover", null);
  d3.select("body").style("overflow", "visible");
  d3.select(window).on("resize.popover", null);
}

function getElDimensions(el) {
  if(el === undefined){
    return [window.innerWidth, window.innerHeight];
  }
  return [
    Math.max(el.scrollWidth, el.offsetWidth, el.clientWidth),
    Math.max(el.scrollHeight, el.offsetHeight, el.clientHeight)
  ];
}


function getLinkPath(href) {
    var l = document.createElement("a");
    l.href = href;
    var tmp_url = l.pathname + l.search;
    if (tmp_url[0] != '/') {
      tmp_url = '/' + tmp_url;
    }
    return tmp_url;
}

dusa_popover.open = function(panels, active_panel_id, url, embed_url, build) {
  var active_panel = null;

  embed_url = "http://datausa.io" + embed_url;

  d3.select("body")
    .style("overflow", "hidden")
    .append("div")
      .attr("class", "overlay")
      .attr("id", "bg")

  var view = d3.select("body")
    .append("div")
      .attr("class", "overlay")
      .attr("id", "view")
      .on("click", dusa_popover.close)

  var modal = view
    .append("div")
      .attr("class", "modal")
      .on("click", function(){ d3.event.stopPropagation() })

  modal.append("div")
    .attr("class", "close-btn")
    .html('<div class="in"><div class="bd"><div class="b-1 b close"><span></span></div><div class="b-2 b close"><span></span></div><div class="b-3 b close"><span></span></div></div></div>')
    .on("click", dusa_popover.close)

  var header = modal
    .append("div")
      .attr("class", "header")

  header
    .append("h2")
      .text("Options")

  var body = modal
    .append("div")
      .attr("class", "body")

  var nav = body
    .append("div")
      .attr("class", "nav")

  var s = 250;
  panels.forEach(function(p, i){
    var panel_link = nav
      .append("span")
        .attr("class", "change_share")
        .attr("id", p.title.toLowerCase())
        .attr("data-target-id", p.title.toLowerCase())
        .text(p.title)
        .on("click", function(){
          var src = d3.event.srcElement || d3.event.target;
          if(src === window){
            var target_id = active_panel.attr("data-target-id");
          }
          else {
            var target_id = d3.select(src).attr("data-target-id");
            if (!target_id || typeof(target_id) != "string") target_id = d3.select(src.parentNode).attr("data-target-id");
          }
          var this_tab = d3.select(".change_share#"+target_id)
          var pos = this_tab.node().offsetLeft;
          var w = this_tab.node().offsetWidth;
          d3.select(".panels")
            .classed("noslide", this === window)
            .style("transform", "translateX("+(i*80)*-1+"vw)")
          d3.select("span.highlight")
            .classed("noslide", this === window)
            .style("width", w+"px")
            .style("left", pos+"px")
          if(target_id === "data"){
            var window_h = getElDimensions()[1];
            var el_h = getElDimensions(d3.select("div.panel#data").node())[1];
            var new_h = Math.round(Math.max(250, (Math.min(window_h, el_h) * 0.8)));
            d3.selectAll(".panel").style("height", new_h+"px")
          }
          else {
            d3.selectAll(".panel").style("height", 250+"px")
          }
        })
    if(p.title.toLowerCase() == active_panel_id){
      active_panel = panel_link;
    }
  })
  nav
    .append("span")
      .attr("class", "highlight")

  var panel_divs = body
    .append("div")
      .attr("class", "panels")
      // .style("width", (panels.length+1)*100+"%")

  panels.forEach(function(p){
    var panel = panel_divs
      .append("div")
        .attr("class", "panel")
        .attr("id", p.title.toLowerCase())

    if(p.title.toLowerCase() == "share"){
      var social = panel.append("div")
        .attr("class", "social")

      social.append("a")
        .attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(embed_url))
        .attr("target", "_blank")
        .attr("class", "fa fa-facebook")

      social.append("a")
        .attr("href", "https://twitter.com/home?status=" + encodeURIComponent(embed_url))
        .attr("target", "_blank")
        .attr("class", "fa fa-twitter")

      panel.append("input")
        .attr("type", "text")
        .attr("readonly", true)
        .attr("class", "share-link")
        .property("value", embed_url)
        .on("click", function(){ this.select(); })
    }
    else if(p.title.toLowerCase() == "embed"){
      var embed_options = panel.append("div")
        .attr("class", "embed_options")

      var demo = embed_options.append("div")
        .attr("class", "demo")
        .append("img")
          .attr("src", "/static/img/profiles/embed_viz.svg")

      var options = embed_options.append("div")
        .attr("class", "options")

      var option = options.append("div").attr("class", "option")
      option.append("input")
        .attr("type", "checkbox")
        .on("change", function(){
          var demo_img = d3.select(".demo img");
          var embed_link_input = d3.select(".embed-link");
          var old_embed_link = embed_link_input.property("value")
          if(this.checked){
            demo_img.attr("src", "/static/img/profiles/embed.svg")
            embed_link_input.property("value", old_embed_link.replace("?viz=True", "?"))
          }
          else {
            demo_img.attr("src", "/static/img/profiles/embed_viz.svg")
            embed_link_input.property("value", old_embed_link.replace("?", "?viz=True"))
          }
        })
      option.append("label").text("Include visualization description")

      var sizes = options.append("select")
      sizes.append("option").attr("value", "720|480").text("Small 720 x 480")
      sizes.append("option").attr("value", "1440|1080").text("Large 1440 x 1080")
      sizes.append("option").attr("value", "").text("Fullscreen")

      sizes.on("change", function(){
        var dimensions = this[this.selectedIndex].value.split("|");
        var w = dimensions.length == 2 ? dimensions[0]+"px" : "100%";
        var h = dimensions.length == 2 ? dimensions[1]+"px" : "100%";
        d3.select(".embed-link").property("value", function(){
          var cur_val = d3.select(this).property("value")
          cur_val = cur_val.replace(/width="([px0-9%]+)"/, 'width="'+w+'"')
          cur_val = cur_val.replace(/height="([px0-9%]+)"/, 'height="'+h+'"')
          return cur_val;
        })
      })


      panel.append("input")
        .attr("type", "text")
        .attr("readonly", true)
        .attr("class", "embed-link")
        .property("value", '<iframe width="720px" height="480px" src="http://embed.datausa.io'+getLinkPath(url)+'?viz=True" frameborder="0" ></iframe>')
        .on("click", function(){ this.select(); })
    }
    else if(p.title.toLowerCase() == "download"){
      var social = panel.append("div")
        .attr("class", "filetypes")

      var container = build.container.select(".d3plus")
      if (container.size()) {
        container = container.select("svg");
      }
      else {
        container = build.container.select("svg");
      }

      var file_svg = social.append("div")
        .on("click", function(){
          save(container, {"mode": "svg", "name":build.title})
        })
      file_svg.append("i")
        .attr("class", "fa fa-file-code-o")
      file_svg.append("span")
        .text("SVG")

      var file_pdf = social.append("div")
        .on("click", function(){
          save(container, {"mode": "pdf", "name":build.title})
        })
      file_pdf.append("i")
        .attr("class", "fa fa-file-pdf-o")
      file_pdf.append("span")
        .text("PDF")

      var file_img = social.append("div")
        .on("click", function(){
          save(container, {"mode": "png", "name":build.title})
        })
      file_img.append("i")
        .attr("class", "fa fa-file-image-o")
      file_img.append("span")
        .text("Image")

      var file_csv = social.append("div")
        .on("click", function(){
          // save(container, {"mode": "png", "name":build.title})

          d3.event.preventDefault();
          var urls = build.data.reduce(function(arr, dataobj){ return arr.concat(dataobj.url) }, []),
              limit_regex = new RegExp("&limit=([0-9]*)"),
              zip = new JSZip();

          function loadCSV() {
            var u = urls.pop(), r = limit_regex.exec(u);
            if (r) u = u.replace(r[0], "");
            u = u.replace("/api", "/api/csv");
            JSZipUtils.getBinaryContent(u, function(e, d){
              var csv_title = build.title;
              if (build.data.length > 1) {
                csv_title += ("-" + (urls.length + 1));
              }
              zip.file(csv_title + ".csv", d);
              if (urls.length) {
                loadCSV();
              }
              else {
                saveAs(zip.generate({type:"blob"}), build.title + ".zip");
              }
            });
          }

          loadCSV();

        })
      file_csv.append("i")
        .attr("class", "fa fa-file-text-o")
      file_csv.append("span")
        .text("CSV")
    }
    else if(p.title.toLowerCase() == "data"){
      var data_panel = panel.append("div")
        .attr("class", "data")

      if (build.data.length) {
        var loaded = 0, dataArray = [], headers = [], tblData = [];
        var format = build.viz.format(Object),
            textFormat = format.text.value || format.text,
            numFormat = format.number.value || format.number;

        format = function(v, key) {
          if (v === undefined || v === null) {
            return "N/A";
          }
          else if (v.constructor === Number) {
            return numFormat(v, {"key": key});
          }
          else {
            return textFormat(v, {"key": key});
          }
        }

        var tbl = data_panel.html("<table><thead><tr></tr></thead><tbody></tbody></table>").select("table")

        for (var i = 0; i < build.data.length; i++) {
          var dataURL = build.data[i].url.replace(/\?limit=[0-9]+&/gi, "?").replace(/&limit=[0-9]+/gi, "")
          load(dataURL, function(data, url, return_data){
            headers = headers.concat(return_data.headers);
            dataArray = dataArray.concat(data);
            loaded++;
            if(loaded === build.data.length){
              headers = d3plus.util.uniques(headers);
              dataArray.forEach(function(dArr){
                var newArr = [];
                headers.forEach(function(header){
                  var datum = dArr[header] || " - ";
                  newArr.push(datum);
                })
                tblData.push(newArr);
              })
              // console.log(headers, tblData);

              /*
               *  Table Headers
               */
              var thead = tbl.select("thead > tr").selectAll("th")
                .data(headers);
              thead.enter().append("th");
              thead.text(function(d){
                return format(d).replace(/&nbsp;/g, "");
              });
              thead.exit().remove();

              // set new width of table based on headers
              // var tbl_w = 0;
              // tbl.selectAll("th").each(function() { tbl_w += this.offsetWidth });
              // data_panel.style("width", tbl_w+"px");

              /*
               *  Table Rows
               */
              var rows = tbl.select("tbody").selectAll("tr")
                .data(tblData);
              rows.enter().append("tr");
              rows.each(function(d){
                var cols = d3.select(this).selectAll("td")
                  .data(d);
                cols.enter().append("td")
                cols.html(function(d, i){
                  return format(d, headers[i]);
                })
                cols.exit().remove();
              });
              rows.exit().remove();

            }
          })
        }
      }

    }
    else if(p.title.toLowerCase() == "api"){
      var api_panel = panel.append("div")
        .attr("class", "api");

      build.data.forEach(function(d, i){
        api_panel.append("h3")
          .text(function(){
            if(build.data.length === 1){
              return "API URL"
            }
            return "API URL #"+(i+1);
          })

        api_panel.append("input")
          .attr("type", "text")
          .attr("readonly", true)
          .property("value", "http://api.datausa.io" + getLinkPath(d.url))
          .on("click", function(){ this.select(); })
      })

    }
  })

  if(active_panel){
    active_panel.on("click")()
  }

  // "ESC" button will close popover
  d3.select("body").on("keyup.popover", function(){
    if (d3.event.keyCode === 27) {
      dusa_popover.close();
    }
  })

  d3.select(window).on("resize.popover", function(){
    active_panel.on("click")();
  })

}
