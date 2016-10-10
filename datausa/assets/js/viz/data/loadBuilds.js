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
    build.title = title.text().replace(" Options", "").replace(/\u00a0/g, "");
    if (["top", "bottom"].indexOf(build.config.color) >= 0) {
      var cat = dictionary[build.attrs[0].type];
      if (cat.indexOf("y") === cat.length - 1) cat = cat.slice(0, cat.length - 1) + "ies";
      else cat = cat + "s";
      build.title = build.title + " " + cat;
    }
    var locale = d3plus.viz().format(Object).locale.value.visualization,
        type = locale[build.config.type] || d3plus.string.title(type);
    build.title = "Data USA - " + type + " of " + build.title;
    if (build.profile && location.href.indexOf("/story/") < 0) {
      var joiner = build.profile_type === "geo" ? " in " : " for ";
      if (build.profile.id === "01000US") joiner = " in the ";
      build.title += joiner + d3plus.string.title(build.profile.name);
      if (build.profile_type === "cip") build.title += " Majors";
    }
  }
  else {
    build.title = "data";
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

        if (id !== prev) {

          d3.select(this).attr("data-default", id);

          d3.select(this.parentNode).selectAll(".select-text")
           .html(d3.select(this).select("option[value='"+ id +"']").text());

          d3.select(this.parentNode).selectAll("span[data-url]")
           .each(function(){

             d3.select(this.parentNode).classed("loading", true);
             var url = this.getAttribute("data-url");

             if (param.length && url.indexOf("show=" + param) > 0) {
               var attr = form.data().filter(function(d){ return d.value === id; });
               if (attr.length && attr[0].text) {
                 d3.select(this).html(attr[0].text);
               }
             }
             else {

               if (param.length) {
                 url = url.replace(param + "=" + prev, param + "=" + id);
               }
               else {
                 url = url.replace("order=" + prev, "order=" + id);
                 url = url.replace("required=" + prev, "required=" + id);
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

          if (param.length) {
           build.data.forEach(function(b){
             b.url = b.url.replace(param + "=" + prev, param + "=" + id);
           });
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

  d3.select(build.container.node().parentNode.parentNode).select("a.share-embed")
    .on("click", function(){
      d3.event.preventDefault();
      dusa_popover.open([
        {"title":"Share"},
        {"title":"Embed"},
        {"title":"Download"},
        {"title":"Data"},
        {"title":"API"}
      ],
      d3.select(this).attr("data-target-id"),
      d3.select(this).attr("data-url"),
      d3.select(this).attr("data-embed"),
      build)
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
