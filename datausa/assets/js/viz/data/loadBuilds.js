viz.loadBuilds = function(builds) {

  if (builds.length) {

    builds.forEach(function(build, i){
      build.container = d3.select(d3.selectAll(".viz")[0][i]);
      build.loaded = false;
      build.timer = false;
      build.index = i;
      build.colors = vizStyles[attr_type];

      var title = d3.select(build.container.node().parentNode.parentNode).select("h2");
      if (title.size()) {
        build.title = title.text().replace(" Show Data", "").replace(/\u00a0/g, "");
        build.title = d3plus.string.strip(build.title).replace("__", "_").toLowerCase();
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
          .focus({"callback": function(id){

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
                 if (param.length) {
                   url = url.replace(param + "=" + prev, param + "=" + id);
                 }
                 else {
                   url = url.replace("order=" + prev, "order=" + id);
                   url = url.replace("required=" + prev, "required=" + id);
                 }
                 d3.select(this).attr("data-url", url);

                 load(url, function(data){
                   d3.select(this.parentNode).classed("loading", false)
                   d3.select(this).html(data.value);
                 }.bind(this));

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

      var table = d3.select(build.container.node().parentNode).selectAll(".data-table");
      if (table.size()) {
        d3.select(build.container.node().parentNode.parentNode)
          .select(".data-btn")
          .on("click", function(){
            d3.event.preventDefault();
            table.classed("visible", !table.classed("visible"));
            var tbl_visible = table.classed("visible");
            var text = tbl_visible ? "Hide Data" : "Show Data";
            d3.select(this).select("span").text(text);
          });
        table.select(".csv-btn")
          .on("click", function(){
            d3.event.preventDefault();
            var urls = d3.select(this.parentNode).attr("data-urls").split("|"),
                limit_regex = new RegExp("&limit=([0-9]*)"),
                zip = new JSZip();

            function loadCSV() {
              var u = urls.pop(), r = limit_regex.exec(u);
              if (r) u = u.replace(r[0], "");
              u = u.replace("/api", "/api/csv");
              JSZipUtils.getBinaryContent(u, function(e, d){
                zip.file("data-" + (urls.length + 1) + ".csv", d);
                if (urls.length) {
                  loadCSV();
                }
                else {
                  saveAs(zip.generate({type:"blob"}), build.title + ".zip");
                }
              });
            }

            loadCSV();

          });
      }

    });

    function resizeApps() {

      builds.forEach(function(b, i){
        b.top = b.container.node().offsetTop;
        b.height = b.container.node().offsetHeight;
      });

    }
    resizeApps();
    resizeFunctions.push(resizeApps);

    var scrollBuffer = -200, n = [32];
    function buildInView(b) {
      var top = window.scrollY, height = window.innerHeight;
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
              // if (buildInView(build) && n.indexOf(build.index) >= 0) {
                current_build = viz(build);
                build.loaded = true;
              }
            }, ms, b);
          }
        }
      }
    }

    buildScroll();
    scrollFunctions.push(buildScroll);

  }

}
