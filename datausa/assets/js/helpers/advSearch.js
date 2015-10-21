
var advSearch = {
  "depths": {
    "cip": 2
  },
  "history": [],
  "nesting": {
    "cip": [2, 4, 6]
  },
  "parent": false,
  "search": "",
  "type": "cip"
};

advSearch.toggle = function(attr_type) {

  var toggleAdvSearchBtn = d3.select("#advSearch")
  toggleAdvSearchBtn.classed("active", !toggleAdvSearchBtn.classed("active"));
  

  // Set the default attr_type if not given
  if (!attr_type) {
    attr_type = this.type;
    this.reload();
  }
  else if (attr_type !== this.type) {
    this.type = attr_type;
    this.reload();
  }

}

// advSearch.close = function() {
//   d3.select("#advSearch").classed("active", false);
// }

advSearch.reload = function() {

  d3.select("#advSearch-results").html("<div id='advSearch-loading'>Loading Results</div>");

  load(api + "/attrs/" + this.type, function(data) {

    d3.select("#advSearch-input").node().focus();

    d3.select("#advSearch-back").classed("active", this.history.length);

    var items = d3.select("#advSearch-results").html("")
      .selectAll(".advSearch-item")
      .data(this.filter(data), function(d){ return d.id; });

    items.enter().append("div").attr("class", "advSearch-item");

    items.html(this.item_html.bind(this));

    items.exit().remove();

  }.bind(this));

}

advSearch.filter = function(data) {

  if (this.nesting[this.type].constructor === Array) {

    if (this.search.length) {

      return data.filter(function(d){
        d.search_index = d.search.indexOf(this.search);
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

advSearch.item_html = function(d) {

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
    html += "<button class='advSearch-btn-children' onclick='advSearch.children(" + d.id + ")'>Children</button>";
  }

  html += "<button class='advSearch-btn-profile' onclick='advSearch.profile(" + d.id + ")'>Profile</button>";

  return html;

}

advSearch.children = function(attr_id) {

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

advSearch.back = function() {
  if (this.history.length) {
    var previous = this.history.pop();
    this.parent = previous.parent;
    this.depths[this.type] = previous.depth;
    this.search = "";
    d3.select("#advSearch-input").node().value = "";
    this.reload();
  }
}

advSearch.profile = function(attr_id) {
  window.location = "/profile/" + this.type + "/" + attr_id + "/";
}
