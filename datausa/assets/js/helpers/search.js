var search = {
  "advanced": false,
  "container": false,
  "current_depth": {
    "cip": 0,
    "soc": 0,
    "naics": 0,
    "geo": 0
  },
  "history": [],
  "nesting": {
    // "cip": [2, 4, 6],
    "cip": [0, 1, 2],
    "naics": [0, 1, 2],
    "soc": [0, 1, 2, 3],
    "geo": ["040", "050", "310", "160", "860", "795", "140"]
  },
  "parents": [],
  "term": "",
  "type": "cip"
};

search.reload = function() {

  this.container.select(".search-results").html("<div id='search-loading'>Loading Results</div>");

  console.log(this.term, this.type)
  var sumlevel = this.type ? this.nesting[this.type][this.current_depth[this.type]] : ""
  load(api + "/attrs/search?limit=100&q="+this.term+"&kind="+this.type+"&sumlevel="+sumlevel , function(data) {
    console.log(data)

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

    if (tag === "a") items.attr("href", function(d){ return "/profile/" + this.type + "/" + d.id + "/"; }.bind(this));

    var format = this.advanced ? this.btnExplore : this.btnProfile;
    items.html(format.bind(this));

    items.exit().remove();

  }.bind(this));

}

search.btnExplore = function(d) {
  console.log(d)

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

  if (children) {
    var str = d.id + "|" + d.name;
    html += "<button class='search-btn-children' onclick='search.loadChildren(\"" + str + "\")'>Children</button>";
  }

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
