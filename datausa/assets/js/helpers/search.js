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
    "name": "Education",
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
  "container": false,
  "current_depth": {
    "cip": null,
    "soc": null,
    "naics": null,
    "geo": null
  },
  "depth": null,
  "max": 10,
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
  if(this.advanced){
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
    // console.log(data, url, raw)
    // console.log(url)

    this.zip = raw.zip_search;

    d3.select(".search-suggestions").style("display", "inline-block").text('');

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

    var items = this.container.select(".search-results").html("")
      .selectAll(".search-item")
      .data(this.filter(data), function(d){ return d.id; });

    var tag = this.advanced ? "div" : "a";
    items.enter().append(tag).attr("class", function(d) {
      return "search-item " + d.kind;
    });

    if(items.empty()){
      d3.selectAll(".no-search-results").style("display", "block")
    }
    else {
      d3.selectAll(".no-search-results").style("display", "none")
    }

    // click first item
    // items.selectAll("a.expand").on("click", search.open_details);
    // var first_item = items.filter(function(d, i){ return i===0 });
    // if(!first_item.empty()){
    //   first_item.on("click")(first_item.datum());
    // }
    // else{
    //   this.clear_details();
    // }

    var format = this.advanced ? this.btnExplore : this.btnProfile;
    items.each(format);

    items.exit().remove();

  }.bind(this));

}

search.btnExplore = function(d) {
  var search_item = d3.select(this);
  var thumb = search_item.append("span").attr("class", 'thumb');
  var info = search_item.append("div").attr("class", 'info');
  var profile = search_item.append("div").attr("class", 'profile');
  var xtra = search_item.append("div").attr("class", 'xtra');

  // set thumbnail
  thumb.append("img").attr("src", "/static/img/icons/"+d.kind+"_c.svg")

  // set info
  var title = info.append("h2")
                .append("a")
                .text(d.display)
                .attr("href", "/profile/" + d.kind + "/" + prettyUrl(d) + "/");
  // title.append("i").attr("class", "fa fa-angle-down")
  // title.append("i").attr("class", "fa fa-angle-up")
  if(sumlevels_cy_id[d.kind][d.sumlevel]){
    var subtitle = info.append("p").attr("class", "subtitle").text(sumlevels_cy_id[d.kind][d.sumlevel].name);
    if(d.is_stem > 0){
      subtitle.append("span").attr("class", "stem").text("STEM");
    }
  }
  if(search.zip){
    info.append("span")
      .attr("class", "zip")
      .text("Based on zip code: " + d.zipcode.slice(7))
  }
  // xtra info
  // var xtra = info.append("div").attr("class", "xtra")
  if(search.anchors[d.kind].sections){
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
  xtra.append("p").attr("class", "parents")

  // set profile link
  profile.append("a")
    .attr("href", "#")
    .html("Details")
    .on("click", search.open_details);
}

search.btnProfile = function(d) {
  var search_item = d3.select(this).attr("href", function(d){
                      return "/profile/" + d.kind + "/" + prettyUrl(d) + "/";
                    });
  search_item.append("img").attr("src", "/static/img/icons/" + d.kind + "_c.svg")
  var search_item_text = search_item.append("div").attr("class", "search-item-t")
  search_item_text.append("h2").text(d.display);
  search_item_text.append("p").attr("class", "subtitle").text(function(d){
    if(sumlevels_cy_id[d.kind][d.sumlevel]){
      return sumlevels_cy_id[d.kind][d.sumlevel].name;
    }
  });
}

search.filter = function(data) {
  if(this.type){
    data = data.filter(function(d){ return d.kind == this.type; }.bind(this))
  }
  if(this.depth){
    data = data.filter(function(d){ return d.sumlevel == this.depth; }.bind(this))
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
  var current_state = search_item.classed("open")
  d3.selectAll(".search-item").classed("open", false)
  search_item.classed("open", !current_state)

  // set parents
  var p_container = search_item.select(".xtra .parents");
  if(!p_container.text()){
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
