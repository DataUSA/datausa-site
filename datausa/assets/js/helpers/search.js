var attrs_meta = {
  "geo": {
    "name": "Geography",
    "sumlevels": [
      {
        "name": "State",
        "id": "040",
        "children": ["050", "310", "160", "795"]
      },
      {
        "name": "County",
        "id": "050",
        "children": ["160"]
      },
      {
        "name": "Metro Area",
        "id": "310",
        "children": ["050", "160"]
      },
      {
        "name": "Place",
        "id": "160"
      },
      {
        "name": "PUMA",
        "id": "795"
      }
    ]
  },
  "naics": {
    "name": "Industry",
    "sumlevels": [
      {"name":"Industry Sector", "id":0, "children":[1, 2]},
      {"name":"Industry Subsector", "id":1, "children":[2]},
      {"name":"Industry Group", "id":2}
    ]
  },
  "soc": {
    "name": "Occupations",
    "sumlevels": [
      {"name":"Major Occupation Group", "id":0, "children":[1, 2, 3]},
      {"name":"Minor Occupation Group", "id":1, "children":[2, 3]},
      {"name":"Broad Occupation", "id":2, "children":[3]},
      {"name":"Detailed Occupation", "id":3}
    ]
  },
  "cip": {
    "name": "Degrees",
    "sumlevels": [
      {"name":"2 digit Course", "id":0, "children":[1, 2]},
      {"name":"4 digit Course", "id":1, "children":[2]},
      {"name":"6 digit Course", "id":2}
    ]
  }
}
sumlevels_cy_id = {}
for (var attr_type in attrs_meta){
  sumlevels_cy_id[attr_type] = {}
  attrs_meta[attr_type]["sumlevels"].forEach(function(sumlevel){
    sumlevel.results = 0
    sumlevels_cy_id[attr_type][sumlevel["id"]] = sumlevel
  })
}

function prettyUrl(d) {
  return (d.url_name ? d.url_name : d.id);
}

var search = {
  "advanced": false,
  "anchors": {},
  "click": false,
  "container": false,
  "current_depth": {
    "cip": null,
    "soc": null,
    "naics": null,
    "geo": null
  },
  "data": true,
  "depth": null,
  "max": 20,
  "nesting": {
    "cip": [0, 1, 2],
    "naics": [0, 1, 2],
    "soc": [0, 1, 2, 3],
    "geo": ["040", "050", "310", "160", "860", "795", "140"]
  },
  "parents": [],
  "stem_only": null,
  "term": "",
  "type": "",
  "children": {
    "geo": {
      "040": ["050", "310", ""]
    }
  },
  "zip": false
};

search.reload = function() {

  this.container.select(".search-results").html("<div id='search-loading'><p><i class='fa fa-spinner fa-spin'></i> Searching...</p></div>");

  this.type = this.type || "";
  // var sumlevel = (this.type && this.current_depth[this.type]) ? this.nesting[this.type][this.current_depth[this.type]] : ""
  // var q_params = [['q', this.term], ['kind', this.type], ['sumlevel', sumlevel]]
  var q_params = [['q', this.term], ['kind', this.type], ['stem_only', this.stem_only]]
                  .filter(function(q){ return q[1] || q[1]===0; })
                  .reduce(function(a, b, i){
                    var sep = i ? "&" : "";
                    return a+sep+b[0]+"="+encodeURIComponent(b[1]);
                  }, "?")

  // set URL query parameter to search query
  if (this.advanced) {
    window.history.replaceState({}, "", "/search/"+q_params);
  }
  else {
    d3.selectAll(".results-show-all a").attr("href", "/search/"+q_params).classed("pri-link", true);
  }

  // if contrained, show "clear refinements"
  if(this.type){
    d3.select(".clear").style("display", "inline-block")
  }

  var query_sumlevel = !this.term && this.depth ? "&sumlevel="+this.depth : "";
  var query_is_stem = this.stem_only ? "&is_stem=2" : "";
  load(api + "/attrs/search?limit=100&q="+this.term+"&kind="+this.type+query_is_stem+query_sumlevel, function(data, url, raw) {

    // console.log(data, url, raw);

    this.zip = raw.zip_search;

    d3.select(".search-suggestions").style("display", "inline-block").text("");

    if(this.advanced){
      this.max = null;
      if(raw.suggestions){
        var search_suggestions = raw.suggestions.slice();
        if(raw.autocorrected){
          d3.select(".search-autocorrected").style("display", "block")
          d3.select(".search-autocorrected span.result").text(search_suggestions.shift())
        }
        else {
          d3.select(".search-autocorrected").style("display", "none")
        }
        if(search_suggestions.length){
          var suggestions_span = d3.select(".search-suggestions")
            .style("display", "inline-block")
            .text("Did you mean: ")
          var search_suggestions_a = search_suggestions.map(function(s, i){
            return "<a class='suggestion-link' href='/search/?q="+s+"'>"+s+"</a>"
          })
          suggestions_span.append("span").html(search_suggestions_a.join(", "))
          suggestions_span.append("span").text("?")
        }
      }
      this.update_refine(data);
    }

    // set cutoff
    if(this.max){
      if(data.length > this.max){
        var left_over = data.length - this.max;
        d3.selectAll(".results-show-all a span.more").text("("+left_over+" more)")
      }
      else {
        d3.selectAll(".results-show-all a span.more").text("")
      }
      data = data.slice(0, this.max);
    }


    search.vars = raw.related_vars || [];
    if (search.data) {

      search.vars.forEach(function(v) {
        v.related_attrs.forEach(function(a) {

          var results = data.filter(function(d) { return d.kind === a; });
          var ids = results.map(function(d) { return d.id; });
          var extra_url = api + "/api/?show=" + a + "&" + a + "=" + ids.join(",") + "&required=" + v.related_vars.join(",");
          if (v.params) {
            for (var p in v.params) {
              extra_url += "&" + p + "=" + v.params[p];
            }
          }
          if (extra_url.indexOf("sumlevel") < 0) {
            extra_url += "&sumlevel=all";
          }
          load(extra_url, function(var_data, var_url, var_raw) {
            // if (var_raw.subs && var_raw.subs[a]) {
            //   var sub_ids = var_raw.subs[a].split(",");
            // }
            // else var sub_ids = false;
            if (var_data instanceof Array) {
              v.loaded = var_data.reduce(function(obj, vd) {
                // obj[sub_ids ? ids[sub_ids.indexOf(vd[a])] : vd[a]] = vd;
                obj[vd[a]] = vd;
                return obj;
              }, {});
            }
            else v.loaded = {error: true};
            search.render();
          });

        });
      });

    }

    var items = this.container.select(".search-results").html("")
      .selectAll(".search-item")
      .data(this.filter(data), function(d){ return d.id; });

    items.enter().append(this.advanced ? "div" : "a")
      .attr("class", function(d) {
        return "search-item " + d.kind;
      });

    d3.selectAll(".no-search-results")
      .style("display", items.empty() ? "block" : "none");

    // click first item
    // items.selectAll("a.expand").on("click", search.open_details);
    // var first_item = items.filter(function(d, i){ return i===0 });
    // if(!first_item.empty()){
    //   first_item.on("click")(first_item.datum());
    // }
    // else{
    //   this.clear_details();
    // }

    items.exit().remove();

    search.render();

  }.bind(this));

}

search.render = function() {
  this.container.select(".search-results").selectAll(".search-item")
    .each(this.advanced ? this.btnLarge : this.btnSmall);
}

search.btnLarge = function(d) {

  var search_item = d3.select(this);

  var thumb = search_item.selectAll(".thumb").data([0]);
  thumb.enter()
    .append("span").attr("class", "thumb")
    .append("img").attr("src", "/static/img/icons/" + d.kind + "_c.svg");

  var info = search_item.selectAll(".info").data([0]);
  var infoEnter = info.enter().append("div").attr("class", "info");
  var title = infoEnter.append("h2")
    .append("a")
    .text(d.display)
    .attr("href", "/profile/" + d.kind + "/" + prettyUrl(d) + "/");
  // title.append("i").attr("class", "fa fa-angle-down")
  // title.append("i").attr("class", "fa fa-angle-up")

  var profile = search_item.selectAll(".profile").data([0]);
  profile.enter().append("div").attr("class", "profile")
    .append("a").attr("href", "#")
    .html("Sections")
    .on("click", search.open_details);

  var xtra = search_item.selectAll(".xtra").data([0]);
  xtra = xtra.enter().append("div").attr("class", "xtra");

  if (d.id === "01000US") {
    var subtitle = infoEnter.append("p").attr("class", "subtitle").text("Nation");
  }
  else if (sumlevels_cy_id[d.kind] && sumlevels_cy_id[d.kind][d.sumlevel]) {
    var subtitle = infoEnter.append("p").attr("class", "subtitle");
    if (d.is_stem > 0) subtitle.append("span").attr("class", "stem").text("STEM");
    subtitle.append("span").text(sumlevels_cy_id[d.kind][d.sumlevel].name);
  }
  else {
    var subtitle = infoEnter.append("p").attr("class", "subtitle");
    if (d.is_stem > 0) subtitle.append("span").attr("class", "stem").text("STEM");
    subtitle.append("span").text(d.kind);
  }

  if (search.zip) {
    infoEnter.append("span")
      .attr("class", "zip")
      .text("Based on zip code: " + d.zipcode.slice(7))
  }
  // xtra info
  // var xtra = infoEnter.append("div").attr("class", "xtra")
  if (search.anchors[d.kind].sections) {
    var ul = xtra.append("ul")
    search.anchors[d.kind].sections.forEach(function(anchor){
      var li = ul.append("li");
      li.append("a")
        .attr("href", "/profile/" + d.kind + "/" + prettyUrl(d) + "/#" + anchor.anchor)
        .append("img")
        .attr("src", "/static/img/icons/" + anchor.anchor + ".svg")
        .on("click", function(){ d3.event.stopPropagation(); })
      li.append("a")
        .attr("href", "/profile/" + d.kind + "/" + prettyUrl(d) + "/#" + anchor.anchor)
        .append("span")
        .text(anchor.title)
        .on("click", function(){ d3.event.stopPropagation(); })
    })
  }
  // xtra.append("p").attr("class", "parents")

  var sections = search.vars.filter(function(v) {
    return v.related_attrs.indexOf(d.kind) >= 0;
  });

  var vars = search.data ? sections.reduce(function(arr, v) {
    v.related_vars.forEach(function(k, i) {
      if (!v.loaded || (v.loaded && v.loaded[d.id])) {
        arr.push({
          description: v.description[i],
          data: v.loaded ? v.loaded[d.id] : false,
          key: k
        });
      }
    });
    return arr;
  }, []) : [];

  var section = info.selectAll(".section").data(search.click ? [] : [0]);
  section.enter().append("p").attr("class", "section").append("a");
  section.exit().remove();
  section.select("a")
    .attr("href", search.click ? "#"
      : "/profile/" + d.kind + "/" + prettyUrl(d) + "/"
      + (sections.length
          ? "#" + sections[0].section
          : ""))
    .text(sections.length ? "Jump to " + sections[0].section_title : "");

  var stats = info.selectAll(".search-stats").data(vars.length ? [0] : []);
  stats.enter().append("div").attr("class", "search-stats");
  stats.exit().remove();

  var stat = stats.selectAll(".search-stat").data(vars, function(v) {
    return v.key;
  });
  stat.exit().remove();
  var statEnter = stat.enter().append("div").attr("class", "search-stat");
  statEnter.append("div").attr("class", "stat-title");
  statEnter.append("div").attr("class", "stat-value");
  stat.select(".stat-title").text(function(s, i) {
    return s.description || dictionary[s.key] || s.key;
  });

  stat.select(".stat-value")
    .html(function(s) {
      return s.data
           ? viz.format.number(s.data[s.key], {key: s.key})
           : "<i class='fa fa-spinner fa-spin fa-lg'></i>";
    });

}

search.btnSmall = function(d) {

  var sections = search.vars.filter(function(v) {
    return v.related_attrs.indexOf(d.kind) >= 0;
  });

  var search_item = d3.select(this)
    .attr("href", search.click ? "#"
      : "/profile/" + d.kind + "/" + prettyUrl(d) + "/"
      + (sections.length
          ? "#" + sections[0].section
          : ""));

  if (search.click) {
    d3.select(this).on("click", function(d) {
      d3.event.preventDefault();
      search.click(d);
    })
  }

  var icon = search_item.selectAll("img").data([0]);
  icon.enter().append("img");
  icon.attr("src", "/static/img/icons/" + d.kind + "_c.svg");


  var text = search_item.selectAll(".search-item-t").data([0]);
  text.enter().append("div").attr("class", "search-item-t");

  var title = text.selectAll("h2").data([0]);
  title.enter().append("h2")
  title.text(d.display);

  var sub = text.selectAll(".subtitle").data([0]);
  sub.enter().append("p").attr("class", "subtitle")
  sub.text(d.id === "01000US" ? "Nation"
    : sumlevels_cy_id[d.kind] ? sumlevels_cy_id[d.kind][d.sumlevel]
    ? sumlevels_cy_id[d.kind][d.sumlevel].name
    : d.kind : d.kind);

  var vars = search.data ? sections.reduce(function(arr, v) {
    v.related_vars.forEach(function(k, i) {
      if (!v.loaded || (v.loaded && v.loaded[d.id])) {
        arr.push({
          description: v.description[i],
          data: v.loaded ? v.loaded[d.id] : false,
          key: k
        });
      }
    });
    return arr;
  }, []) : [];

  var section = text.selectAll(".section").data(search.click || !search.data ? [] : [0]);
  section.enter().append("p").attr("class", "section");
  section.exit().remove();
  section.text(sections.length ? "Jump to " + sections[0].section_title : "");

  var stats = text.selectAll(".search-stats").data(vars.length ? [0] : []);
  stats.enter().append("div").attr("class", "search-stats");
  stats.exit().remove();

  var stat = stats.selectAll(".search-stat").data(vars, function(v) {
    return v.key;
  });
  stat.exit().remove();
  var statEnter = stat.enter().append("div").attr("class", "search-stat");
  statEnter.append("div").attr("class", "stat-title");
  statEnter.append("div").attr("class", "stat-value");
  stat.select(".stat-title").text(function(s, i) {
    return s.description || dictionary[s.key] || s.key;
  });

  stat.select(".stat-value")
    .html(function(s) {
      return s.data
           ? viz.format.number(s.data[s.key], {key: s.key})
           : "<i class='fa fa-spinner fa-spin fa-lg'></i>";
    });

}

search.filter = function(data) {
  if(this.type){
    data = data.filter(function(d){ return d.kind == this.type; }.bind(this))
  }
  if(this.depth){
    data = data.filter(function(d){ return d.sumlevel == this.depth; }.bind(this))
  }
  if (this.filterID) {
    data = data.filter(function(d){ return d.id !== this.filterID && d.url_name !== this.filterID; }.bind(this));
  }
  return data;
}

search.back = function(index) {
  if (index === undefined) index = this.history.length - 1;
  if (this.history.length) {
    var previous = this.history[index];
    this.history = this.history.slice(0, index);
    this.parents = previous.parents;
    this.current_depth[this.type] = previous.depth;
    this.reload();
  }
}

search.open_details = function(d){

  // prevent default anchor link behavior
  d3.event.preventDefault();

  // toggle xtra div
  var search_item = d3.select(this.parentNode.parentNode);
  var current_state = search_item.classed("open");
  d3.selectAll(".search-item").classed("open", false);
  search_item.classed("open", !current_state);

  // set parents
  var p_container = search_item.select(".xtra .parents");
  if( p_container.size() && !p_container.text()) {
    var parents_api_url = api + "/attrs/"+d.kind+"/"+d.id+"/parents"
    load(parents_api_url, function(parents) {
      parents.forEach(function(p){
        p_container.append("a")
          .attr("href", "/profile/" + d.kind + "/" + prettyUrl(p) + "/")
          .text(p.name)
      })
    })
  }
}

search.clear_details = function(){
  d3.select(".search-details .details-title").text('');
  d3.select(".search-details .details-sumlevels").html('');
  d3.select(".search-details .details-sumlevels-results").html('');
  d3.select(".search-details .details-anchors").html('');
}

search.update_refine = function(data){

  if(this.term === ""){
    // reset defaults
    d3.selectAll(".search-refine div").classed("no-results", false);
    d3.selectAll(".search-refine li a").classed("no-results", false);
    d3.selectAll(".num_res").text(function(){ return d3.select(this).attr("data-default") });
  }
  else {
    // reset defaults
    d3.selectAll(".search-refine div").classed("no-results", true);
    d3.selectAll(".search-refine li a").classed("no-results", true);
    d3.selectAll(".num_res").text("0");

    data.forEach(function(d){
      var attr_div = d3.select(".search-refine div."+d.kind)
      var total_res = attr_div.select("h2 .num_res").text();
      total_res = parseInt(total_res) + 1
      attr_div.select("h2 .num_res").text(total_res)
      attr_div.select("h2 a").classed("no-results", false);
      attr_div.classed("no-results", false);

      var sumlevel_a = attr_div.select("a[data-depth='"+d.sumlevel+"']");
      sumlevel_a.classed("no-results", false);
      var sumlevel_span = sumlevel_a.select(".num_res");
      if(!sumlevel_span.empty()){
        sumlevel_res = parseInt(sumlevel_span.text()) + 1
        sumlevel_span.text(sumlevel_res)
      }
      else {
        //console.log(d.sumlevel, d.kind)
      }
    })
  }

}
