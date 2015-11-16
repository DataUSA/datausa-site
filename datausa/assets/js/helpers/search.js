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
        "name": "MSA",
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
      {"name":"Industry Category", "id":0, "children":[1, 2]},
      {"name":"2 digit Industry", "id":1, "children":[2]},
      {"name":"3 digit Industry", "id":2}
    ]
  },
  "soc": {
    "name": "Occupations",
    "sumlevels": [
      {"name":"Top Level Occupation", "id":0, "children":[1, 2, 3]},
      {"name":"2 digit Occupation", "id":1, "children":[2, 3]},
      {"name":"3 digit Occupation", "id":2, "children":[3]},
      {"name":"4 digit Occupation", "id":3}
    ]
  },
  "cip": {
    "name": "College Majors",
    "sumlevels": [
      {"name":"2 digit Course", "id":0, "children":[1, 2]},
      {"name":"4 digit Course", "id":1, "children":[2]},
      {"name":"6 digit Course", "id":2}
    ]
  }
}
sumlevels_by_id = {}
for (var attr_type in attrs_meta){
  sumlevels_by_id[attr_type] = {}
  attrs_meta[attr_type]["sumlevels"].forEach(function(sumlevel){
    sumlevel.results = 0
    sumlevels_by_id[attr_type][sumlevel["id"]] = sumlevel
  })
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
  "nesting": {
    "cip": [0, 1, 2],
    "naics": [0, 1, 2],
    "soc": [0, 1, 2, 3],
    "geo": ["040", "050", "310", "160", "860", "795", "140"]
  },
  "parents": [],
  "term": "",
  "type": "",
  "children": {
    "geo": {
      "040": ["050", "310", ""]
    }
  }
};

search.reload = function() {

  this.container.select(".search-results").html("<div id='search-loading'>Loading Results</div>");
  
  var sumlevel = (this.type && this.current_depth[this.type]) ? this.nesting[this.type][this.current_depth[this.type]] : ""
  // var q_params = [['q', this.term], ['kind', this.type], ['sumlevel', sumlevel]]
  var q_params = [['q', this.term]]
                  .filter(function(q){ return q[1] || q[1]===0; })
                  .reduce(function(a, b, i){
                    var sep = i ? "&" : "";
                    return a+sep+b[0]+"="+b[1];
                  }, "?")
  
  // set URL query parameter to search query
  if(this.advanced){
    window.history.replaceState({}, "", "/search/"+q_params);
  }
  else {
    d3.select(".results-show-all a").attr("href", "/search/"+q_params)
  }
  
  // load(api + "/attrs/search?limit=100&q="+this.term+"&kind="+this.type+"&sumlevel="+sumlevel , function(data, url, raw) {
  load(api + "/attrs/search?limit=100&q="+this.term, function(data, url, raw) {
    // console.log(data, url, raw)
    
    d3.select(".search-suggestions").style("display", "block").text('');
    
    if(this.advanced){
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
            .style("display", "block")
            .text("Suggestions: ")
          var search_suggestions_a = search_suggestions.map(function(s, i){
            return "<a href='/search/?q="+s+"'>"+s+"</a>"
          })
          suggestions_span.append("span").html(search_suggestions_a.join(", "))
        }
      }
      this.update_refine(data);
    }
    else {
      if(data.length > 10){
        var left_over = data.length - 10;
        d3.select(".results-show-all a span.more").text("("+left_over+" more)")
      }
      else {
        d3.select(".results-show-all a span.more").text("")
      }
      data = data.slice(0, 10);
    }
    
    var items = this.container.select(".search-results").html("")
      .selectAll(".search-item")
      .data(this.filter(data), function(d){ return d.id; });

    var tag = this.advanced ? "div" : "a";
    items.enter().append(tag).attr("class", "search-item");

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
  var search_item = d3.select(this).on("click", search.open_details);
  var thumb = search_item.append("a").attr("href", "/profile/" + d.kind + "/" + d.id + "/").attr("class", 'thumb')
  var info = search_item.append("div").attr("class", 'info')
  var profile = search_item.append("div").attr("class", 'profile')
  
  // set thumbnail
  thumb.style("background", "url('/static/img/thumb/geo/01000US.jpg')")
  
  // set info
  var title = info.append("h2").text(d.display)
    .append("a").attr("href", "#").attr("class", "expand");
  title.append("i").attr("class", "fa fa-angle-down")
  title.append("i").attr("class", "fa fa-angle-up")
  if(sumlevels_by_id[d.kind][d.sumlevel]){
    info.append("p").attr("class", "subtitle").text(sumlevels_by_id[d.kind][d.sumlevel].name)
  }
  // xtra info
  var xtra = info.append("div").attr("class", "xtra")
  xtra.append("p").attr("class", "parents")
  if(search.anchors[d.kind].sections){
    var ul = xtra.append("ul")
    search.anchors[d.kind].sections.forEach(function(anchor){
      var li = ul.append("li");
      li.append("a")
        .attr("href", "/profile/" + d.kind + "/" + d.id + "/#" + anchor.anchor)
        .append("img")
        .attr("src", "/static/img/icons/" + anchor.anchor + "_b.svg")
      li.append("a")
        .attr("href", "/profile/" + d.kind + "/" + d.id + "/#" + anchor.anchor)
        .append("span")
        .text(anchor.title)
      // li.append("p")
      //   .text(anchor.description.replace("<<name>>", d.display))
    })
  }
  
  // set profile link
  profile.append("a").attr("href", "/profile/" + d.kind + "/" + d.id + "/").html("View Profile &raquo;")
}

search.btnProfile = function(d) {
  var search_item = d3.select(this).attr("href", function(d){ 
                      return "/profile/" + d.kind + "/" + d.id + "/"; 
                    });
  search_item.append("h3").text(d.display);
  search_item.append("span").text(function(d){
    if(sumlevels_by_id[d.kind][d.sumlevel]){
      return sumlevels_by_id[d.kind][d.sumlevel].name;
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
  // toggle xtra div
  var search_item = d3.select(this);
  var current_state = search_item.classed("open")
  d3.selectAll(".search-item").classed("open", false)
  search_item.classed("open", !current_state)
  
  // set parents
  var p_container = xtra_div.select(".parents");
  if(!p_container.text()){
    var parents_api_url = api + "/attrs/"+d.kind+"/"+d.id+"/parents"
    load(parents_api_url, function(parents) {
      parents.forEach(function(p){
        p_container.append("a")
          .attr("href", "/profile/" + d.kind + "/" + p.id + "/")
          .text(p.name)
      })
    })
  }
  
  // prevent default anchor link behavior
  d3.event.preventDefault();
}

search.clear_details = function(){
  d3.select(".search-details .details-title").text('');
  d3.select(".search-details .details-sumlevels").html('');
  d3.select(".search-details .details-sumlevels-results").html('');
  d3.select(".search-details .details-anchors").html('');  
}

search.update_refine = function(data){
  
  d3.selectAll(".search-refine div").style("display", "none");
  //d3.selectAll(".search-refine li a, .search-refine h2 a").style("display", "none");
  
  d3.selectAll(".num_res").text("0")
  data.forEach(function(d){
    var attr_div = d3.select(".search-refine div."+d.kind)
    var total_res = attr_div.select("h2 .num_res").text();
    total_res = parseInt(total_res) + 1
    attr_div.select("h2 .num_res").text(total_res)
    attr_div.select("h2 a").style("display", "inline-block")
    attr_div.style("display", "block")
    
    attr_div.select("a[data-depth='"+d.sumlevel+"']").style("display", "inline-block");
    var sumlevel_span = attr_div.select("a[data-depth='"+d.sumlevel+"'] .num_res");
    if(!sumlevel_span.empty()){
      sumlevel_res = parseInt(sumlevel_span.text()) + 1
      sumlevel_span.text(sumlevel_res)
    }
    else {
      //console.log(d.sumlevel, d.kind)
    }
  })
  
}