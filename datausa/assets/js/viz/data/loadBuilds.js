viz.prepBuild = function(build, i) {

  if (!build.container) build.container = d3.select(d3.selectAll(".viz")[0][i]);
  build.loaded = false;
  build.timer = false;
  build.index = i;
  build.colors = vizStyles[attr_type];
  build.data.forEach(function(d) {
    d.orig_url = d.url;
  })
  build.orig_color = build.config.color;

  var title = d3.select(build.container.node().parentNode.parentNode).select("h2");
  if (title.size()) {
    if (title.select(".topic-title").size()) build.title = title.select(".topic-title").text();
    else build.title = title.select(".term").text();
    build.title_short = build.title;
    if (["top", "bottom"].indexOf(build.config.color) >= 0) {
      var cat = dictionary[build.attrs[0].type];
      if (cat.indexOf("y") === cat.length - 1) cat = cat.slice(0, cat.length - 1) + "ies";
      else cat = cat + "s";
      build.title = build.title + " " + cat;
    }
    var locale = d3plus.viz().format(Object).locale.value.visualization,
        type = locale[build.config.type] || d3plus.string.title(type);
    build.title = "Data USA - " + type + " of " + build.title;
    if (build.profile && location.href.indexOf("/story/") < 0 && !build.compare) {
      var joiner = build.profile_type === "geo" ? " in " : " for ";
      if (build.profile.id === "01000US") joiner = " in the ";
      build.title += joiner + d3plus.string.title(build.profile.name);
      if (build.profile_type === "cip") build.title += " Majors";
    }
  }
  else {
    build.title = "data";
  }

  var logo = d3.select(build.container.node().parentNode).select(".datausa-link");
  if (logo.size()) {
    try {
      parent.document;
      if (window.parent.location.host === window.location.host) logo.remove();
    }
    catch(e) {
      // not accessible
    }
  }

  var select = d3.select(build.container.node().parentNode).select("select");
  if (select.size()) {

    d3plus.form()
      .search(false)
      .ui({
        "margin": 0
      })
      .ui(vizStyles.ui)
      .focus({"callback": function(id, form){

        var param = this.getAttribute("data-param"),
            method = this.getAttribute("data-method"),
            prev = this.getAttribute("data-default");

        var tooltipValues = build.config.tooltip.value
          .filter(function(t) { return t !== "year" && t.indexOf(prev) < 0; });
        if (!tooltipValues.length) {
          build.config.tooltip.value = ["year", id, id + "_moe"];
          if (id in collectionyears) build.config.tooltip.value.push(id + "_collection");
        }
        if (build.viz) build.viz.tooltip(build.config.tooltip.value);

        var definition = d3.select(this.parentNode).select("p.definition");
        if (definition.size()) {
          var def = false;
          var g = glossary[id];
          if (g) {
            def = dictionary[id] + " is defined as " + g["def"].slice(0, 1).toLowerCase() + g["def"].slice(1);
            if (g["link"]) def += " " + "<a href='" + g["link"] + "'>Click for more info.</a>";
          }
          definition.html(def || "");
        }

        if (id !== prev) {

          d3.select(this).attr("data-default", id);

          var text = dictionary[id] ? viz.format.text(id) : d3.select(this).select("option[value='"+ id +"']").text();

          d3.select(this.parentNode).selectAll(".select-text")
           .html(text);

          d3.select(this.parentNode).selectAll("span[data-url]")
           .each(function(){

             d3.select(this.parentNode).classed("loading", true);
             var url = this.getAttribute("data-url");

             if (param && param.length && url.indexOf("show=" + param) > 0) {
               var attr = form.data().filter(function(d){ return d.value === id; });
               if (attr.length && attr[0].text) {
                 d3.select(this).html(attr[0].text);
               }
             }
             else {

               if (param && param.length) {
                 url = url.replace(param + "=" + prev, param + "=" + id);
               }
               else {
                 url = url.replace("order=" + prev, "order=" + id);
                 url = url.replace("required=" + prev, "required=" + id);
                 url = url.replace("col=" + prev, "col=" + id);
               }
               d3.select(this).attr("data-url", url);

               var rank = 1;
               if (url.indexOf("rank=") > 0) {
                 var rank = new RegExp("&rank=([0-9]*)").exec(url);
                 url = url.replace(rank[0], "");
                 rank = parseFloat(rank[1])
               }
               if (url.indexOf("limit=") > 0) {
                 var limit = new RegExp("&limit=([0-9]*)").exec(url);
                 url = url.replace(limit[0], "&limit=3");
               }

               load(url, function(data, u){
                 d3.select(this.parentNode).classed("loading", false)
                 var text = data.value.split("; ")[rank - 1];
                 if (!text) text = "N/A";
                 if (text.indexOf("and ") === 0) {
                   text = text.replace("and ", "");
                 }
                 d3.select(this).html(text);
               }.bind(this));

             }

           });

          if (param && param.length) {
            build.data.forEach(function(b){
              b.url = b.url.replace(param + "=" + prev, param + "=" + id);
            });
            if (method && method.length) {
              if (build.config[method].value) build.config[method].value = id;
              else build.config[method] = id;
              build.viz[method](id)
            }
            viz.loadData(build, "redraw");
          }
          else if (method.length) {
            build.viz[method](id).draw();
          }

        }

      }.bind(select.node())})
      .data(select)
      .width(select.node().parentNode.offsetWidth)
      .type("drop")
      .draw();

  }

  d3.select(build.container.node().parentNode.parentNode).selectAll("a.popover-btn")
    .on("click", function(){
      d3.event.preventDefault();
      dusa_popover.open([
        {"id": "view-table", "title":"View Data"},
        {"id": "save-image", "title":"Save Image"},
        {"id": "share", "title":"Share / Embed"},
        // {"id": "", "title":"Embed"},
        // {"id": "", "title":"API"}
      ],
      d3.select(this).attr("data-ga"),
      d3.select(this.parentNode.parentNode.parentNode).attr("data-url"),
      d3.select(this.parentNode.parentNode.parentNode).attr("data-embed"),
      build)
    });

  d3.select(build.container.node().parentNode.parentNode).select("a.add-to-cart")
    .on("click", function(){
      d3.event.preventDefault();

      if (d3.select(this).classed("disabled")) return;
      viz.addToCart(build, select);

    });

};

viz.resizeBuild = function(b) {
  b.top = b.container.node().offsetTop;
  b.height = b.container.node().offsetHeight;
  if (!b.height) {
    b.top = b.container.node().parentNode.parentNode.parentNode.offsetTop;
    b.height = b.container.node().parentNode.offsetHeight;
  }
  if (b.loaded) {
    b.container.select(".d3plus")
      .style("height", "auto")
      .style("width", "auto");
    b.viz
      .height(false)
      .width(false)
      .draw();
  }
}

viz.loadBuilds = function() {

  if (builds.length) {

    builds.forEach(viz.prepBuild);
    builds.forEach(viz.resizeBuild);

    function resizeApps() {
      builds.forEach(viz.resizeBuild);
    }
    resizeFunctions.push(resizeApps);

    var scrollBuffer = -200, n = [32];
    function buildInView(b) {
      var top = d3plus.client.scroll.y(), height = window.innerHeight;
      return top+height > b.top+scrollBuffer && top+scrollBuffer < b.top+b.height;
    }

    function buildScroll(ms) {
      if (ms === undefined) ms = 0;
      for (var i = 0; i < builds.length; i++) {
        var b = builds[i];
        if (!b.timer && !b.loaded) {
          if (buildInView(b)) {
            b.timer = setTimeout(function(build){
              clearTimeout(build.timer);
              build.timer = false;
              if (buildInView(build)) {
                current_build = viz(build);
                build.loaded = true;
              }
            }, ms, b);
          }
        }
      }
    }

    scrollFunctions.push(buildScroll);

  }

}
