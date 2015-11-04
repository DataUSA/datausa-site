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
          callback(load.datafold(data), url, data.source);
      }
      else if (url.indexOf("attrs/") > 0 || url.indexOf("topojson/") > 0) {

        localforage.getItem(url, function(error, data) {

          if (data) {
            callback(load.datafold(data), url, data.source);
          }
          else {
            d3.json(url, function(error, data){

              if (error) {
                console.log(error);
                console.log(url);
                data = {"headers": [], "data": []};
              }

              if (data.headers) {
                for (var i = 0; i < data.data.length; i++) {
                  data.data[i].push(data.data[i].map(function(d){ return (d + "").toLowerCase(); }).join("_"));
                }
                data.headers.push("search");
              }

              localforage.setItem(url, data);
              load.cache[url] = data;
              callback(load.datafold(data), url, data.source);
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
          callback(load.datafold(data), url, data.source);
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

var viz = function(build) {

  build.viz = d3plus.viz()
    .container(build.container)
    .error("Please Wait")
    .draw();

  viz.loadCoords(build);

  return build;

};

viz.finish = function(build) {

  var source_text = d3plus.util.uniques(build.sources).reduce(function(str, s, i){
    if (s) str += s.dataset;
    return str;
  }, "");

  if (location.href.indexOf("/profile/") > 0) {
    d3.select(build.container.node().parentNode).select(".source")
      .text(source_text);
  }
  else {
    build.viz.footer(source_text);
  }

  if (!build.config.color) {
    if (app.viz.attrs()[app.highlight]) {
      var lighter = d3plus.color.lighter(build.color);
        build.config.color = function(d, viz) {
          return d[viz.id.value] === build.highlight ? build.color : lighter;
        };
    }
    else {
      build.config.color = function(d, viz) {
        return build.color;
      };
    }
    build.config.legend = false;
  }

  var default_config = viz.defaults(build),
      type_config = viz[build.config.type](build);

  build.viz
    .config(build.config)
    .depth(build.config.depth)
    .config(default_config)
    .config(type_config)
    .error(false)
    .draw();

};

viz.redraw = function(build) {
  build.viz.error(false).draw();
};

viz.bar = function(build) {

  var axis_style = function(axis) {
    return {
      "grid": false,
      "label": build.config[axis] && build.config[axis].label ? build.config[axis].label : false,
      "ticks": {
        "color": "none"
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
    "x": axis_style("x"),
    "y": axis_style("y")
  };

}

var all_caps = ["cip", "naics", "rca", "soc"],
    pcts = ["owner_occupied_housing_units", "pct_total", "us_citizens"];

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

    return {
      "axis": {
        "color": "none",
        "value": false
      },
      "label": {
        "font": {
          "color": build.color,
          "family": "Palanquin",
          "size": 16,
          "weight": 700
        },
        "padding": 0
      },
      "ticks": {
        "font": {
          "color": discrete === axis ? "#211f1a" : "#a8a8a8",
          "family": "Palanquin",
          "size": 16,
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
    "format": {
      "affixes": affixes,
      "number": function(number, params) {

        if (params.key && params.key.constructor === String) {

          if (params.key.indexOf("growth") >= 0 || pcts.indexOf(params.key) >= 0) {
            number = number * 100;
            return d3plus.number.format(number, params) + "%";
          }

        }

        return d3plus.number.format(number, params);

      },
      "text": function(text, params) {

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

            var a = key && key in affixes ? affixes[key] : ["", ""];
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
    "messages": {
      "style": "large"
    },
    "x": axis_style("x"),
    "y": axis_style("y")
  }
}

viz.geo_map = function(build) {

  var key = build.config.coords.key;

  return {
    "color": {
      "heatmap": [d3plus.color.lighter(build.color), build.color, d3.rgb(build.color).darker()]
    },
    "coords": {
      "center": [0, 0],
      "key": key,
      "mute": ["79500US4804701"],
      "padding": 0,
      "projection": key === "birthplace" ? "equirectangular" : "albersUsa"
    },
    "labels": false
  };
}

viz.line = function(build) {
  return {
    "shape": {
      "interpolate": "monotone"
    }
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
    "labels": {
      "align": "left",
      "valign": "top"
    },
    "legend": false
  };
}

viz.loadAttrs = function(build) {
  var next = "loadData";

  build.viz.error("Loading Attributes").draw();

  if (build.attrs.length) {
    var loaded = 0, attrs = {};
    for (var i = 0; i < build.attrs.length; i++) {
      load(build.attrs[i].url, function(data, url, source){
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

    if (build.config.coords.solo) {
      build.config.coords.solo = build.config.coords.solo.split(",");
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

viz.loadData = function(build, next) {
  if (!next) next = "finish";

  build.viz.error("Loading Data").draw();

  build.sources = [];

  if (build.data.length) {
    var loaded = 0, dataArray = [];
    for (var i = 0; i < build.data.length; i++) {
      load(build.data[i].url, function(data, url, source){
        var d = build.data.filter(function(d){ return d.url === url; })[0];
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
              var k = keys[ii];
              var dd = d3plus.util.copy(dat);
              dd[d.split.id] = k;
              dd[d.split.value] = dat[k];

              if (d.split.map) {
                for (var sk in d.split.map) {
                  var mapex = d.split.map[sk].exec(k);
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

        for (var i = 0; i < app.attrs.length; i++) {
          var type = app.attrs[i].type,
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
        d.source = source;
        build.sources.push(source)
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
