dusa_popover = function() {
  
}

dusa_popover.close = function() {
  d3.selectAll(".overlay").remove();
  d3.select("body").on("keyup.popover", null);
}

dusa_popover.open = function(panels, active_panel_id, url, build) {
  
  d3.select("body")
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
  
  modal
    .append("i")
      .attr("class", "fa fa-times close")
      .on("click", dusa_popover.close)
  
  var header = modal
    .append("div")
      .attr("class", "header")
  
  header
    .append("h2")
      .text("Share")
  
  var body = modal
    .append("div")
      .attr("class", "body")
  
  var nav = body
    .append("div")
      .attr("class", "nav")
  
  var active_panel = null;
  
  panels.forEach(function(p, i){
    var panel_link = nav
      .append("span")
        .attr("class", "change_share")
        .attr("id", p.title.toLowerCase())
        .attr("data-target-id", p.title.toLowerCase())
        .text(p.title)
        .on("click", function(){
          var target_id = d3.select(d3.event.srcElement).attr("data-target-id");
          var this_tab = d3.select(".change_share#"+target_id)
          var pos = this_tab.node().offsetLeft;
          var w = this_tab.node().offsetWidth;
          d3.select(".panels")
            .classed("noslide", this === window)
            .style("transform", "translateX("+(i*560)*-1+"px)")
          d3.select("span.highlight")
            .classed("noslide", this === window)
            .style("width", w+"px")
            .style("left", pos+"px")
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

  panels.forEach(function(p){
    var panel = panel_divs
      .append("div")
        .attr("class", "panel")
        .attr("id", p.title.toLowerCase())
    
    if(p.title.toLowerCase() == "social"){    
      var social = panel.append("div")
        .attr("class", "social")
    
      social.append("span")
        .on("click", function(){})
        .append("i")
        .attr("class", "fa fa-facebook")
    
      social.append("span")
        .on("click", function(){})
        .append("i")
        .attr("class", "fa fa-twitter")
    
      panel.append("input")
        .attr("type", "text")
        .attr("readonly", true)
        .attr("class", "share-link")
        .property("value", url)
        .on("click", function(){ this.select(); })
    }
    else if(p.title.toLowerCase() == "embed"){
      panel.append("input")
        .attr("type", "text")
        .attr("readonly", true)
        .attr("class", "embed-link")
        .property("value", '<iframe width="360px" height="240px" src="'+url+'?viz=True" frameborder="0" ></iframe>')
        .on("click", function(){ this.select(); })
      
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
      option.append("label").text("Description")
      
      var sizes = options.append("select")
      sizes.append("option").attr("value", "360|240").text("Small 360 x 240")
      sizes.append("option").attr("value", "720|480").text("Medium 720 x 480")
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
    }
    else if(p.title.toLowerCase() == "download"){
      var social = panel.append("div")
        .attr("class", "filetypes")
    
      var file_svg = social.append("div")
        .on("click", function(){
          save(build.container.select(".d3plus").select("svg"), {"mode": "svg", "name":build.title})
        })
      file_svg.append("i")
        .attr("class", "fa fa-file-code-o")
      file_svg.append("span")
        .text("SVG")
    
      var file_pdf = social.append("div")
        .on("click", function(){
          save(build.container.select(".d3plus").select("svg"), {"mode": "pdf", "name":build.title})
        })
      file_pdf.append("i")
        .attr("class", "fa fa-file-pdf-o")
      file_pdf.append("span")
        .text("PDF")
    
      var file_img = social.append("div")
        .on("click", function(){
          save(build.container.select(".d3plus").select("svg"), {"mode": "png", "name":build.title})
        })
      file_img.append("i")
        .attr("class", "fa fa-file-image-o")
      file_img.append("span")
        .text("Image")
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
  
}