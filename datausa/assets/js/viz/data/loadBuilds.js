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

  var select = d3.select(build.container.node().parentNode).select("select");
  if (select.size()) {

    var tooltipDefault = build.config.tooltip.value.slice();
    d3plus.form()
      .search(false)
      .ui({
        "margin": 0
      })
      .ui(vizStyles.ui)
      .focus({"callback": function(id, form){

        if (!tooltipDefault.length) build.config.tooltip.value = [id, id + "_moe"];

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

          if (param.length) {
            build.data.forEach(function(b){
              b.url = b.url.replace(param + "=" + prev, param + "=" + id);
            });
            if (method.length) {
              if (build.config[method].value) build.config[method].value = id;
              else build.config[method] = id;
              build.viz[method](id)
            }
            viz.loadData(build, "redraw");
          }
          else if (method.length) {
            build.viz[method](id)
              .tooltip(!tooltipDefault.length ? [id, id + "_moe"] : tooltipDefault)
              .draw();
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

  function serialize(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }

  var sumlevelMap = {
    "010": "nation",
    "040": "state",
    "050": "county",
    "310": "msa",
    "160": "place",
    "860": "zip",
    "140": "tract",
    "795": "puma"
  };

  d3.select(build.container.node().parentNode.parentNode).select("a.add-to-cart")
    .on("click", function(){
      d3.event.preventDefault();

      if (d3.select(this).classed("disabled")) return;

      localforage.getItem("cart", function(error, cart) {

        var index = cart.builds.indexOf(build.slug);
        var remove = index >= 0;

        if (remove) {

          cart.builds.splice(index, 1);
          cart.datasets.splice(d3.sum(cart.datasets.map(function(d, i) {
            return d.slug === build.slug ? i : 0;
          })), 1);

        }
        else {

          var calcs = [],
              data = [],
              prof_attr = location.pathname.split("/")[2],
              title = build.cart && build.cart.title ? build.cart.title : build.title_short.trim();

          title = title.replace(" Over Time", "");
          title = title.replace(" by Share", "");
          if (prof_attr === "geo") title = title.replace(" by Location", "");

          if (!build.cart) {
            d3.select(build.container.node().parentNode.parentNode)
              .selectAll(".cart-percentage").each(function() {
                var den = this.getAttribute("data-den"), num = this.getAttribute("data-num");
                calcs.push({
                  key: num + "_pct_calc",
                  func: "pct",
                  num: num,
                  den: den
                });
              });
          }

          var calcKeys = calcs.map(function(d) { return d.key; });
          calcs = calcs.filter(function(d, i) { return i === calcKeys.indexOf(d.key); });

          var joiner = " by ";

          function parseData(d) {
            if (title.indexOf(" by ") > 0) joiner = " and ";
            var params = d3plus.object.merge({}, d.params);
            delete params.limit;
            delete params.exclude;
            var shows = params.show.split(",");
            var sumlevels = params.sumlevel.split(",");
            var requireds = params.required ? params.required.split(",") : [];
            var wheres = params.where ? params.where.split(",") : [];
            delete params.where;

            var prof_sumlevel = build.profile.sumlevel || build.profile.level;
            if (d.subs && prof_attr in d.subs && prof_attr === "geo") {
              prof_sumlevel = d.subs[prof_attr].slice(0, 3);
            }
            prof_sumlevel = sumlevelMap[prof_sumlevel] || prof_sumlevel;

            shows.forEach(function(show, i) {

              if (show in params) delete params[show];

              if (show === prof_attr) {
                if (sumlevels[i] === "all") sumlevels[i] = prof_sumlevel;
                if (title.indexOf(joiner + dictionary[show]) > 0) title = title.replace(joiner + dictionary[show], "");
                title += joiner + (dictionary[sumlevels[i]] || d3plus.string.title(sumlevels[i]));
              }
              else if (build.config.type === "bar" && [build.config.x.value, build.config.y.value].indexOf(show) >= 0) {
                sumlevels.splice(sumlevels.indexOf(sumlevels[i]), 1);
                shows.splice(shows.indexOf(show), 1);
                var forText = new RegExp("( for [A-z ]*) by|( for [A-z ]*)$").exec(title);
                if (forText) title = title.replace(forText[0], "");
              }

            });

            delete params[prof_attr + "_level"];

            if (prof_attr in params) {
              sumlevels.unshift(prof_attr === "geo" ? prof_sumlevel : "all");
              shows.unshift(prof_attr);
              delete params[prof_attr];
              var suffix = joiner + (prof_attr === "geo" ? (dictionary[prof_sumlevel] || d3plus.string.title(prof_sumlevel)) : dictionary[prof_attr]);
              if (title.indexOf(suffix) < 0) title += suffix;
            }

            if (requireds.indexOf("wage_bin") >= 0) {
              requireds.splice(requireds.indexOf("wage_bin"), 1);
              requireds.push("gini");
              title = title.replace("Distribution", "GINI");
            }

            if (requireds.indexOf("num_ppl") >= 0 && requireds.indexOf("avg_wage") < 0) {
              requireds.push("avg_wage");
              requireds.push("avg_wage_moe");
            }
            else if (requireds.indexOf("avg_wage") >= 0 && requireds.indexOf("num_ppl") < 0) {
              requireds.push("num_ppl");
              requireds.push("num_ppl_moe");
            }

            if (select.size()) {
              var param = select.attr("data-param");
              delete params[param];
            }

            if (params.force) {
              var stats = d3.select(build.container.node().parentNode.parentNode).selectAll(".stat-span");
              if (stats.size()) {
                stats.each(function() {
                  var u = d3.select(this).attr("data-url");
                  if (u) {
                    u = u.replace(/%2C/g, ",").replace(/%3A/g, ":").replace(/%5E/g, "^");
                    var req = new RegExp("required=([A-z0-9_,]*)").exec(u);
                    var ids = new RegExp(prof_attr + "=([A-z0-9_,]*)").exec(u);
                    if (req && (!ids || ids[1].split(",").length === 1)) {
                      requireds = requireds.concat(req[1].split(","));
                      delete params.force;
                    }
                  }
                });
              }
            }

            wheres = wheres.filter(function(where) {
              return shows.indexOf(where.split(":")[0]) < 0;
            });

            params.show = shows.join(",");
            params.sumlevel = sumlevels.join(",");
            params.required = d3plus.util.uniques(requireds).join(",");
            if (wheres.length) params.where = wheres.join(",");

            if ("year" in params) params.year = "all";

            data.push(api + "/api/?" + serialize(params));
            console.log(params);

          }

          if (build.cart && build.cart.params) parseData(build.cart);
          else build.data.forEach(parseData);

          data = d3plus.util.uniques(data);

          console.log(title);
          console.log(data);

          cart.builds.push(build.slug);

          cart.datasets.push({
            calcs: calcs,
            data: data,
            slug: build.slug,
            title: title
          });

        }

        localforage.setItem("cart", cart, updateCart);

      });

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
