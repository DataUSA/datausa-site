var search = {
  "advanced": false,
  "container": false,
  "depths": {
    "cip": 2
  },
  "history": [],
  "nesting": {
    "cip": [2, 4, 6]
  },
  "parent": false,
  "term": "",
  "type": "cip"
};

search.reload = function() {

  this.container.select(".search-results").html("<div id='search-loading'>Loading Results</div>");

  load(api + "/attrs/" + this.type, function(data) {

    this.container.select(".search-input").node().focus();

    this.container.select(".search-back").classed("active", this.history.length);

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

  var html = d.id + ". " + d.name,
      children = false,
      nesting = this.nesting[this.type];

  if (nesting.constructor === Array) {
    children = this.depths[this.type] < nesting[nesting.length - 1];
  }
  else {
    // TODO: Logic for non-nested attributes (like geo)
  }

  if (children) {
    html += "<button class='search-btn-children' onclick='search.loadChildren(" + d.id + ")'>Children</button>";
  }

  html += "<a class='search-btn-profile' href='/profile/" + this.type + "/" + d.id + "/'>Profile</a>";

  return html;

}

search.btnProfile = function(d) {

  return d.name;

}

search.filter = function(data) {

  if (this.nesting[this.type].constructor === Array) {

    if (this.term.length) {

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

      return data.filter(function(d){

        return (!this.parent || d.id.indexOf(this.parent) === 0) &&
               d.id.length === this.depths[this.type];

      }.bind(this)).sort(function(a, b) {
        return a.id - b.id;
      });

    }

  }
  else {
    // TODO: Logic for non-nested attributes (like geo)
    return data;
  }



}

search.loadChildren = function(attr_id) {

  var nesting = nesting = this.nesting[this.type];

  if (nesting.constructor === Array) {
    this.history.push({
      "parent": this.parent,
      "depth": this.depths[this.type]
    });
    this.parent = attr_id;
    this.depths[this.type] = nesting[nesting.indexOf(this.depths[this.type]) + 1];
    this.reload();
  }
  else {
    // TODO: Logic for non-nested attributes (like geo)
  }

}

search.back = function() {
  if (this.history.length) {
    var previous = this.history.pop();
    this.parent = previous.parent;
    this.depths[this.type] = previous.depth;
    this.term = "";
    this.container.select(".search-input").node().value = "";
    this.reload();
  }
}
