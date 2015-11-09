/* Only edit javascript files in the assets/js directory */

d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) {
          if (nextNodes.indexOf(link.target) < 0) {
            nextNodes.push(link.target);
          }
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};

window.onload = function() {

  d3.select("body").on("keyup.site", function(){

    // Site key events when not in an input box
    if (document.activeElement.tagName.toLowerCase() !== "input") {

      // Press "s" to highlight most recent search
      if (d3.event.keyCode === 83) {
        if (!search.container) search.container = d3.select("#search-global");
        search.container.select(".search-input").node().focus();
      }

    }
    else {

      // "ESC" button
      if (d3.event.keyCode === 27) {

      }

    }

  });

  // Key events while the search input is active
  var searchInterval, keywait = 300;
  d3.selectAll(".search-input").on("keyup.search-input", function(){

    var q = this.value.toLowerCase();
    if (q !== search.term) {
      clearInterval(searchInterval);
      search.term = q;
      search.container = d3.select("#search-" + d3.select(this).attr("data-search"));

      if (q.length) {
        searchInterval = setTimeout(function(){
          search.reload();
          clearInterval(searchInterval);
        }, keywait);
      }
      else {
        search.reload();
      }
    }

  });

}

var load = function(url, callback) {

  localforage.getItem("cache_version", function(error, c){

    if (c !== cache_version) {
      localforage.clear();
      localforage.setItem("cache_version", cache_version, loadUrl);
    }
    else {
      loadUrl();
    }

    function loadUrl() {

      if (load.cache[url]) {
          data = load.cache[url];
          callback(load.datafold(data), url, data);
      }
      else if (url.indexOf("attrs/") > 0 || url.indexOf("topojson/") > 0) {

        localforage.getItem(url, function(error, data) {

          if (data) {
            callback(load.datafold(data), url, data);
          }
          else {
            d3.json(url, function(error, data){

              if (error) {
                console.log(error);
                console.log(url);
                data = {"headers": [], "data": []};
              }

              // if (data.headers) {
              //   for (var i = 0; i < data.data.length; i++) {
              //     data.data[i].push(data.data[i].map(function(d){ return (d + "").toLowerCase(); }).join("_"));
              //   }
              //   data.headers.push("search");
              // }

              localforage.setItem(url, data);
              load.cache[url] = data;
              callback(load.datafold(data), url, data);
            });
          }

        });

      }
      else {

        d3.json(url, function(error, data){
          if (error) {
            console.log(error);
            console.log(url);
            data = {"headers": [], "data": []};
          }
          load.cache[url] = data;
          callback(load.datafold(data), url, data);
        });

      }

    }

  });

}

load.cache = {};

load.datafold = function(data) {
  if (data.data && data.headers) {
    return data.data.map(function(d){
      return d.reduce(function(obj, v, i){
        if (data.headers[i] === "value_rca") v = v < 1 ? 0 : v;
        obj[data.headers[i]] = v;
        return obj;
      }, {});
    })
  }
  else {
    return data;
  }
}

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
  var q_params = [['q', this.term], ['kind', this.type], ['sumlevel', sumlevel]]
                  .filter(function(q){ return q[1] || q[1]===0; })
                  .reduce(function(a, b, i){
                    var sep = i ? "&" : "";
                    return a+sep+b[0]+"="+b[1];
                  }, "?")
  
  // set URL query parameter to search query
  // console.log("params:", q_params)
  window.history.pushState("", "", "/search/"+q_params);
  
  load(api + "/attrs/search?limit=100&q="+this.term+"&kind="+this.type+"&sumlevel="+sumlevel , function(data, url, raw) {
    console.log(data, url, raw)
    
    d3.select(".search-suggestions").style("display", "block").text('');
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
      else{
        this.clear_details();
      }
    }

    var format = this.advanced ? this.btnExplore : this.btnProfile;
    items.html(format.bind(this));

    items.exit().remove();

  }.bind(this));

}

search.btnExplore = function(d) {
  // console.log(d)

  var html = d.display,
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

  html += "<a class='search-btn-profile' href='/profile/" + d.kind + "/" + d.id + "/'>Profile</a>";

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

    return data.sort(function(a, b) {
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
  if(this.anchors[d.kind].sections){
    this.anchors[d.kind].sections.forEach(function(anchor){
      anchors_container.append("a")
        .attr("href", "/profile/" + d.kind + "/" + d.id + "/#" + anchor.anchor)
        .text(anchor.title)
        .append("span")
        .text(anchor.description)
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

search.clear_details = function(){
  d3.select(".search-details .details-title").text('');
  d3.select(".search-details .details-sumlevels").html('');
  d3.select(".search-details .details-sumlevels-results").html('');
  d3.select(".search-details .details-anchors").html('');  
}

var viz = function(build) {

  if (!build.colors) build.colors = staticColors.viz.defaults;

  build.viz = d3plus.viz()
    .background("transparent")
    .container(build.container)
    .error("Please Wait")
    .draw();

  if (build.highlight) {

    build.viz.class(function(d, viz){
      return build.highlight === "01000US" || d[viz.id.value] === build.highlight ? "highlight" : "";
    });

  }

  viz.loadCoords(build);

  return build;

};

viz.finish = function(build) {

  var source_text = d3plus.string.list(d3plus.util.uniques(build.sources).reduce(function(arr, s, i){
    if (s) arr.push(s.dataset);
    return arr;
  }, []));

  if (location.href.indexOf("/profile/") > 0) {
    d3.select(build.container.node().parentNode).select(".source")
      .text(source_text);
  }
  else {
    build.viz.footer(source_text);
  }

  if (!build.config.color) {
    if (build.viz.attrs()[build.highlight]) {
      build.config.color = function(d, viz) {
        return build.highlight === "01000US" || d[viz.id.value] === build.highlight ? build.colors.pri : build.colors.sec;
      };
    }
    else {
      build.config.color = function(d, viz) {
        return build.colors.pri;
      };
    }
    build.config.legend = false;
  }
  else if (build.config.color in staticColors) {
    build.color = build.config.color;
    build.config.color = function(d) {
      return staticColors[build.color][d[build.color]];
    };
  }

  var default_config = viz.defaults(build),
      type_config = viz[build.config.type](build);

  build.viz
    .config(default_config)
    .config(type_config)
    .config(build.config)
    .depth(build.config.depth)
    .error(false)
    .draw();

};

viz.redraw = function(build) {
  build.viz.error(false).draw();
};

viz.bar = function(build) {

  if (!d3plus.object.validate(build.config.y)) {
    build.config.y = {"value": build.config.y};
  }

  if (build.config.y2 && !d3plus.object.validate(build.config.y2)) {
    build.config.y2 = {"value": build.config.y2};
  }

  var discrete = build.config.y.scale === "discrete" ? "y" : "x";

  if (build.config.y2) {
    build.viz.data(build.viz.data().map(function(d){
      if (d[build.config.id] === build.config.y2.value) {
        d["y2_" + build.config.y.value] = d[build.config.y.value];
        delete d[build.config.y.value];
      }
      return d;
    }).sort(function(a, b){
      return a[build.config.id] === build.config.y2.value ? 1 : -1;
    }));
    build.config.y2.value = "y2_" + build.config.y.value;
  }

  var axis_style = function(axis) {

    return {
      "axis": {
        "color": discrete === axis ? "none" : "#ccc",
        "value": discrete !== axis
      },
      "grid": discrete !== axis,
      "label": build.config[axis] && build.config[axis].label ? build.config[axis].label : false,
      "persist": {
        "position": true
      },
      "ticks": {
        "color": discrete === axis ? "none" : "#ccc",
        "labels": discrete !== axis || !build.config.labels,
        "size": discrete === axis ? 0 : 10
      }
    }

  }

  return {
    "axes": {
      "background": {
        "stroke": {
          "width": 0
        }
      }
    },
    "data": {
      "stroke": {
        "width": 1
      }
    },
    "labels": {
      "align": "left",
      "resize": false,
      "value": false
    },
    "x": axis_style("x"),
    "x2": axis_style("x2"),
    "y": axis_style("y"),
    "y2": axis_style("y2")
  };

}

var all_caps = ["cip", "naics", "rca", "soc"];

viz.defaults = function(build) {

  var discrete = build.config.y && build.config.y.scale === "discrete" ? "y" : "x";

  if (build.config.order === "bucket") {
    build.config.order = {
      "sort": "asc",
      "value": function(a) {
        if (a.bucket.indexOf("none") >= 0) {
          return -1;
        }
        else if (a.bucket.indexOf("under") >= 0 || a.bucket.indexOf("less") >= 0) {
          return 0;
        }
        else {
          var b = a.bucket;
          if (b.indexOf("_") > 0) b = b.split("_")[1];
          return parseFloat(b, 10);
        }
      }
    }
  }

  var axis_style = function(axis) {

    var key = build.config[axis];
    if (d3plus.object.validate(key)) key = key.value;
    var range = percentages.indexOf(key) >= 0 ? [0, 1] : false;

    return {
      "label": {
        "font": {
          "color": axis.length === 1 ? build.colors.pri : build.colors.sec,
          "family": "Palanquin",
          "size": 16,
          "weight": 700
        },
        "padding": 0
      },
      "range": range,
      "ticks": {
        "font": {
          "color": discrete === axis ? "#211f1a" : "#a8a8a8",
          "family": "Palanquin",
          "size": discrete === axis ? 14 : 14,
          "weight": 700
        }
      }
    };
  };

  return {
    "axes": {
      "background": {
        "color": "transparent"
      }
    },
    "background": "transparent",
    "format": {
      "number": function(number, params) {

        if (params.key) {

          if (params.key.indexOf("y2_") === 0) {
            params.key = params.key.slice(3);
          }

          if (params.key.indexOf("growth") >= 0 || percentages.indexOf(params.key) >= 0) {
            number = number * 100;
            return d3plus.number.format(number, params) + "%";
          }
          else {
            number = d3plus.number.format(number, params);
            if (params.key in affixes) {
              var a = affixes[params.key];
              number = a[0] + number + a[1];
            }
            return number;
          }

        }

        return d3plus.number.format(number, params);

      },
      "text": function(text, params) {

        if (text.indexOf("y2_") === 0) {
          text = text.slice(3);
        }

        if (dictionary[text]) return dictionary[text];

        // All caps text
        if (all_caps.indexOf(text.toLowerCase()) >= 0) {
          return text.toUpperCase();
        }

        if (params.key) {

          // Format buckets
          if (params.key === "bucket") {

            var key = false;
            if (text.indexOf("_") > 0) {
              text = text.split("_");
              key = text.shift();
              text = text.join("_");
            }

            var a = key && key in affixes ? affixes[key].slice() : ["", ""];
            if (key === "income") a[1] = "k";

            if (text.indexOf("to") > 0) {
              return text.split("to").map(function(t){
                return a[0] + t + a[1];
              }).join("-");
            }
            else if (text.indexOf("less") === 0) {
              return "< " + a[0] + text.slice(4) + a[1];
            }
            else if (text.indexOf("under") === 0) {
              return "< " + a[0] + text.slice(5) + a[1];
            }
            else if (text.indexOf("over") > 0 || text.indexOf("more") > 0) {
              return a[0] + text.slice(0, text.length - 4) + a[1] + " +";
            }
            else {
              return a[0] + d3plus.string.title(text) + a[1];
            }
          }

          if (params.key === "geo" && text.indexOf("140") === 0) {
            text = text.slice(13);
            var num = text.slice(0, 3), suffix = text.slice(3);
            suffix = suffix === "00" ? "" : "." + suffix;
            return "Census Tract " + num + suffix;
          }

          if (params.vars.attrs.value && text in params.vars.attrs.value) {
            return d3plus.string.title(params.vars.attrs.value[text].name, params);
          }

        }

        return d3plus.string.title(text, params);

      }
    },
    "height": {
      "small": 10
    },
    "labels": {
      "font": {
        "family": "Palanquin",
        "size": 13
      }
    },
    "legend": {
      "font": {
        "color": "#211f1a",
        "family": "Palanquin",
        "weight": 700
      }
    },
    "messages": {
      "style": "large"
    },
    "x": axis_style("x"),
    "x2": axis_style("x2"),
    "y": axis_style("y"),
    "y2": axis_style("y2")
  }
}

viz.geo_map = function(build) {

  var key = build.config.coords.key;

  return {
    "color": {
      "heatmap": [build.colors.sec, build.colors.pri]
    },
    "coords": {
      "center": [0, 0],
      "key": key,
      "mute": ["79500US4804701"],
      "padding": 0,
      "projection": key === "birthplace" ? "equirectangular" : "albersUsa"
    },
    "labels": false,
    "zoom": {
      "scroll": false
    }
  };
}

viz.line = function(build) {
  return {
    "shape": {
      "interpolate": "monotone"
    },
    "size": 2
  };
}

viz.radar = function(build) {
  return {
    "axes": {
      "background": {
        "color": "#fafafa"
      }
    },
    "x": {
      "grid": {
        "color": "#ccc",
        "value": true
      },
      "ticks": {
        "font": {
          "size": 12
        }
      }
    }
  };
}

viz.scatter = function(build) {
  return {};
}

viz.tree_map = function(build) {
  return {
    "data": {
      "padding": 0
    },
    "labels": {
      "align": "left",
      "valign": "top"
    }
  };
}

viz.loadAttrs = function(build) {
  var next = "loadData";

  build.viz.error("Loading Attributes").draw();

  if (build.attrs.length) {
    var loaded = 0, attrs = {};
    for (var i = 0; i < build.attrs.length; i++) {
      load(build.attrs[i].url, function(data, url){
        var a = build.attrs.filter(function(a){ return a.url === url; })[0];
        a.data = data;
        for (var i = 0; i < data.length; i++) {
          attrs[data[i].id] = data[i];
        }
        loaded++;
        if (loaded === build.attrs.length) {
          build.viz.attrs(attrs);
          viz[next](build);
        }
      })
    }
  }
  else {
    viz[next](build);
  }

};

viz.loadCoords = function(build) {
  var next = "loadAttrs";

  build.viz.error("Loading Coordinates").draw();

  var type = build.config.coords;

  if (type) {

    if (type.constructor === String) {
      build.config.coords = {"key": type};
    }
    else {
      type = type.value;
      build.config.coords.key = type;
      delete build.config.coords.value;
    }

    if (type === "uss") {
      build.config.coords.key = "states";
      type = "states";
    }

    var solo = build.config.coords.solo;
    if (solo && solo.length) {
      build.config.coords.solo = solo.split(",");
    }
    else {
      build.config.coords.solo = [];
    }

    var filename = type;
    if (["places", "tracts"].indexOf(type) >= 0) {
      filename += "_" + build.config.coords.solo[0].slice(7, 9);
    }

    load("/static/topojson/" + filename + ".json", function(data){

      build.viz.coords(data);
      viz[next](build);

    });

  }
  else {
    viz[next](build);
  }

}

var attrNesting = {
  "acs_ind": [2, 4, 6],
  "acs_occ": [2, 4, 6, 8, 10],
  "cip": [2, 4, 6]
};

var attrMapping = {
  "degree": {
    "20": "3",
    "21": "5",
    "22": "7",
    "23": "10",
    "24": "9"
  }
}

viz.loadData = function(build, next) {
  if (!next) next = "finish";

  build.viz.error("Loading Data").draw();

  build.sources = [];

  if (build.data.length) {
    var loaded = 0, dataArray = [];
    for (var i = 0; i < build.data.length; i++) {
      load(build.data[i].url, function(data, url, return_data){

        var d = build.data.filter(function(d){ return d.url === url; })[0];

        if (d.params.show in attrMapping) {
          var show = d.params.show, map = attrMapping[show];
          if (return_data.source.dataset.indexOf("PUMS") >= 0) {
            for (var i = 0; i < data.length; i++) {
              data[i][show] = map[data[i][show]];
            }
          }

        }

        if (d.static) {
          for (var i = 0; i < data.length; i++) {
            for (var k in d.static) {
              data[i][k] = d.static[k];
            }
          }
        }

        if (d.map) {
          for (var i = 0; i < data.length; i++) {
            for (var k in d.map) {
              data[i][k] = data[i][d.map[k]];
              delete data[i][d.map[k]];
            }
          }
        }

        if (d.split) {

          var split_data = [],
              regex = new RegExp(d.split.regex),
              keys = d3.keys(data[0]).filter(function(k){
                return regex.exec(k);
              });

          if (d.split.map) {
            for (var k in d.split.map) {
              d.split.map[k] = new RegExp(d.split.map[k]);
            }
          }

          for (var i = 0; i < data.length; i++) {
            var dat = data[i];
            for (var ii = 0; ii < keys.length; ii++) {
              var dd = d3plus.util.copy(dat);
              dd[d.split.id] = regex.exec(keys[ii])[1];
              dd[d.split.value] = dat[keys[ii]];

              if (d.split.map) {
                for (var sk in d.split.map) {
                  var mapex = d.split.map[sk].exec(keys[ii]);
                  if (mapex) {
                    dd[sk] = mapex[1];
                  }
                }
              }

              for (var iii = 0; iii < keys.length; iii++) {
                delete dd[keys[iii]];
              }
              split_data.push(dd);
            }
          }
          data = split_data;
        }

        for (var i = 0; i < build.attrs.length; i++) {
          var type = build.attrs[i].type,
              nesting = attrNesting[type];

          if (nesting && nesting.constructor === Array) {
            for (var ii = 0; ii < data.length; ii++) {
              var datum = data[ii];
              for (var iii = 0; iii < nesting.length; iii++) {
                var length = nesting[iii];
                datum[type + "_" + length] = datum[type].slice(0, length);
              }
            }
          }
        }

        if (data.length && "university" in data[0]) {
          var attrs = build.viz.attrs();
          for (var i = 0; i < data.length; i++) {
            data[i].sector = attrs[data[i].university].sector;
          }
        }

        d.data = data;
        d.source = return_data.source;
        build.sources.push(return_data.source)
        dataArray = dataArray.concat(data);
        loaded++;
        if (loaded === build.data.length) {
          build.viz.data(dataArray);
          viz[next](build);
        }
      })
    }
  }
  else {
    viz[next](build);
  }

}

var staticColors = {

  "nationality": {
    "foreign": "#ccd",
    "us": "#c00"
  },

  "profile": {
    "geo": {
      "pri": "#006ea8",
      "sec": "#71bbe2"
    },
    "cip": {
      "pri": "#006ea8",
      "sec": "#71bbe2"
    },
    "soc": {
      "pri": "#006ea8",
      "sec": "#71bbe2"
    },
    "naics": {
      "pri": "#006ea8",
      "sec": "#71bbe2"
    }
  },

  "sex": {
    "men": "blue",
    "male": "blue",
    "1": "blue",
    "women": "pink",
    "female": "pink",
    "2": "pink"
  },

  "student_pool": {
    "Degrees Awarded": "orange",
    "Workforce": "navy"
  },

  "viz": {
    "default": {
      "pri": "#006ea8",
      "sec": "#71bbe2"
    }
  }

}
