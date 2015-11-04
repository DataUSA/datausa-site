var attrs_meta = {
  "geo": {
    "name": "Geography",
    "sumlevels": [
      {
        "name": "States",
        "id": "040",
        "children": ["050", "310", "160", "795"]
      },
      {
        "name": "Counties",
        "id": "050",
        "children": ["160"]
      },
      {
        "name": "MSAs",
        "id": "310",
        "children": ["050", "160"]
      },
      {
        "name": "Places",
        "id": "160"
      },
      {
        "name": "PUMAs",
        "id": "795"
      }
    ]
  },
  "naics": {
    "name": "Industry",
    "sumlevels": [
      {"name":"Top Level", "id":0, "children":[1, 2]},
      {"name":"2 digit", "id":1, "children":[2]},
      {"name":"3 digit", "id":2}
    ]
  },
  "soc": {
    "name": "Occupations",
    "sumlevels": [
      {"name":"Top Level", "id":0, "children":[1, 2, 3]},
      {"name":"2 digit", "id":1, "children":[2, 3]},
      {"name":"3 digit", "id":2, "children":[3]},
      {"name":"4 digit", "id":3}
    ]
  },
  "cip": {
    "name": "College Majors",
    "sumlevels": [
      {"name":"2 digit", "id":0, "children":[1, 2]},
      {"name":"4 digit", "id":1, "children":[2]},
      {"name":"6 digit", "id":2}
    ]
  }
}
sumlevels_by_id = {}
for (var attr_type in attrs_meta){
  sumlevels_by_id[attr_type] = {}
  attrs_meta[attr_type]["sumlevels"].forEach(function(sumlevel){
    sumlevels_by_id[attr_type][sumlevel["id"]] = sumlevel
  })
}
console.log(sumlevels_by_id)
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
  "history": [],
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
  // console.log(this.type, this.nesting[this.type], this.current_depth[this.type])
  load(api + "/attrs/search?limit=100&q="+this.term+"&kind="+this.type+"&sumlevel="+sumlevel , function(data) {
    // console.log(data)

    var crumbs = this.container.select(".search-crumbs")
      .classed("active", this.parents.length > 0);

    var input = this.container.select(".search-input")
      .classed("inactive", this.parents.length > 0);

    if (!this.parents.length) {
      input.node().focus();
    }
    else {
      var crumb = crumbs.selectAll(".search-crumb")
        .data(this.parents, function(d){
          return d.id;
        });

      crumb.enter().append("div")
        .attr("class", "search-crumb")
        .on("click", function(d, i){
          if (i !== this.parents.length - 1) {
            this.back(i + 1);
          }
        }.bind(this));

      crumb.text(function(d){ return d.name; });

      crumb.exit().remove();
    }

    var items = this.container.select(".search-results").html("")
      .selectAll(".search-item")
      .data(this.filter(data), function(d){ return d.id; });

    var tag = this.advanced ? "div" : "a";
    items.enter().append(tag).attr("class", "search-item");

    if (tag === "a") {
      items.attr("href", function(d){ return "/profile/" + this.type + "/" + d.id + "/"; }.bind(this));
    }
    else {
      // click first item
      items.on("click", search.open_details.bind(this));
      var first_item = items.filter(function(d, i){ return i===0 });
      if(!first_item.empty()){
        first_item.on("click")(first_item.datum());
      }
    }

    var format = this.advanced ? this.btnExplore : this.btnProfile;
    items.html(format.bind(this));

    items.exit().remove();

  }.bind(this));

}

search.btnExplore = function(d) {
  // console.log(d)

  var html = d.id + ". " + d.name,
      children = false,
      nesting = this.nesting[this.type];

  if (nesting && nesting.constructor === Array) {
    var max = nesting[nesting.length - 1];
    children = this.nesting[this.current_depth[this.type]] < max && d.id.length < max;
  }
  else {
    // TODO: Logic for non-nested attributes (like geo)
  }

  // if (children) {
  //   var str = d.id + "|" + d.name;
  //   html += "<button class='search-btn-children' onclick='search.loadChildren(\"" + str + "\")'>Children</button>";
  // }
  html = "<span>[" + d.kind.toUpperCase() + "]</span> " + html;

  html += "<a class='search-btn-profile' href='/profile/" + this.type + "/" + d.id + "/'>Profile</a>";

  return html;

}

search.btnProfile = function(d) {

  return d.name;

}

search.filter = function(data) {

  if (this.parents.length > 0) {

    var parent = this.parents[this.parents.length - 1].id;

    if (this.nesting[this.type].constructor === Array) {

      return data.filter(function(d){

        return d.id.indexOf(parent) === 0 &&
               d.id.length === this.nesting[this.current_depth[this.type]];

      }.bind(this)).sort(function(a, b) {
        return a.id - b.id;
      });

    }
    else {
      // TODO: Logic for non-nested attributes (like geo)
      return data;
    }

  }
  else if (this.term.length) {

    return data.filter(function(d){
      d.search_index = d.search.indexOf(this.term);
      return d.search_index >= 0;
    }.bind(this)).sort(function(a, b) {
      var s = a.search_index - b.search_index;
      if (s) return s;
      return a.id - b.id;
    });

  }
  else {
    return data.sort(function(a, b) {
      return a.id - b.id;
    });
  }

}

search.loadChildren = function(attr) {

  var split = attr.split("|");
  attr = {
    "id": split.shift(),
    "name": split.join("|")
  };

  var nesting = this.nesting[this.type];

  if (nesting.constructor === Array) {
    this.history.push({
      "parents": this.parents.slice(),
      "depth": this.current_depth[this.type]
    });
    this.parents.push(attr);
    this.current_depth[this.type] = nesting[nesting.indexOf(this.depths[this.type]) + 1];
    this.reload();
  }
  else {
    // TODO: Logic for non-nested attributes (like geo)
  }

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
  var details_div = d3.select(".search-details");

  // set title of details
  details_div.select("h2.details-title").text(d.display)

  // set href of "go to profile" link
  details_div.select("a.details-profile").attr("href", "/profile/" + d.kind + "/" + d.id + "/");
  
  // set anchors for this section (if there are any)
  var anchors_container = d3.select(".details-anchors");
  anchors_container.html("");
  if(this.anchors[d.kind]){
    this.anchors[d.kind].forEach(function(anchor){
      anchors_container.append("a")
        .attr("href", "#")
        .text(anchor)
    })
  }

  // set sumlevels
  var details_sumlevels = details_div.select(".details-sumlevels").html('');
  var attr_meta = sumlevels_by_id[d.kind][d.sumlevel]
  if(attr_meta.children){
    attr_meta.children.forEach(function(sumlevel){
      var sumlevel_meta = sumlevels_by_id[d.kind][sumlevel]
      var current_sumlevels_html = details_sumlevels.html()
      current_sumlevels_html += "<button class='search-btn-children' data-sumlevel='"+sumlevel+"'>"+sumlevel_meta.name+"</button>";
      details_sumlevels.html(current_sumlevels_html)
    })
  }

  details_div.select(".details-sumlevels-results").html('');
  details_sumlevels.selectAll("button").on("click", function(){
    var sumlevel = d3.select(this).attr("data-sumlevel");
    var sumlevels_results = details_div.select(".details-sumlevels-results");
    var children_api_url = api + "/attrs/"+d.kind+"/"+d.id+"/children?sumlevel="+sumlevel
    sumlevels_results.html('')
    load(children_api_url, function(children) {
      children.forEach(function(child){
        sumlevels_results.append("a")
          .attr("href", "/profile/" + d.kind + "/" + child.id + "/")
          .attr("data-id", child.id)
          .text(child.name)
      })
    })
  })
}
