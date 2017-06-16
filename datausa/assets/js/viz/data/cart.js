viz.addToCart = function(build, select) {

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

      var calcs = build.calcs || [],
          data = [],
          prof_attr = build.profile ? location.pathname.split("/")[2] : "geo",
          title = build.cart && build.cart.title ? build.cart.title : build.title_short.trim();

      title = title.replace(" Over Time", "");
      title = title.replace(" by Share", "");
      if (prof_attr === "geo") title = title.replace(" by Location", "");

      if (build.container && !build.cart) {
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
        delete params.sort;
        delete params.order;
        var shows = params.show.split(",");
        var sumlevels = params.sumlevel.split(",");
        var requireds = params.required ? params.required.split(",") : [];
        requireds = requireds.filter(function(r) { return !r.match(/_rank$/g) });
        var wheres = params.where ? params.where.split(",") : [];
        delete params.where;

        if (params.geo === "01000US" && build.profile && build.profile.id !== "01000US") return;

        var prof_sumlevel = build.profile ? build.profile.sumlevel || build.profile.level : false;
        if (d.subs && prof_attr in d.subs && prof_attr === "geo") {
          prof_sumlevel = d.subs[prof_attr].slice(0, 3);
        }
        if (prof_sumlevel) prof_sumlevel = sumlevelMap[prof_sumlevel] || prof_sumlevel;

        shows.forEach(function(show, i) {

          delete params[show];
          if (prof_attr !== "geo") sumlevels[i] = "all";

          if (show === prof_attr) {
            if (prof_attr === "geo" && sumlevels[i] === "all") sumlevels[i] = prof_sumlevel;
            if (title.indexOf(joiner + dictionary[show]) > 0) title = title.replace(joiner + dictionary[show], "");
            var suffix = prof_attr === "geo" ? (dictionary[prof_sumlevel] || d3plus.string.title(prof_sumlevel)) : dictionary[prof_attr];
            if (title.indexOf(suffix) < 0) title += joiner + suffix;
          }
          else if (build.config && build.config.type === "bar" && [build.config.x.value, build.config.y.value].indexOf(show) >= 0) {
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
          var suffix = prof_attr === "geo" ? (dictionary[prof_sumlevel] || d3plus.string.title(prof_sumlevel)) : dictionary[prof_attr];
          if (title.indexOf(suffix) < 0) title += joiner + suffix;
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

        if (select && select.size()) {
          var param = select.attr("data-param");
          delete params[param];
        }

        if (build.container && params.force) {
          var stats = d3.select(build.container.node().parentNode.parentNode).selectAll(".stat-span");
          if (stats.size()) {
            stats.each(function() {
              var u = d3.select(this).attr("data-url");
              if (u) {
                u = u.replace(/%2C/g, ",").replace(/%3A/g, ":").replace(/%5E/g, "^");
                var req = new RegExp("required=([A-z0-9_,]*)").exec(u);
                var ids = new RegExp(prof_attr + "=([A-z0-9_,]*)").exec(u);
                if (req && req[1].length && (!ids || ids[1].split(",").length === 1)) {
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
        params.year = "all";

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

}
