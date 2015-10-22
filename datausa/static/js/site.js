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
                data = {};
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
    str += s.dataset;
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
    build.config.color = function() {
      return build.color;
    };
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

  return {
    "data": {
      "stroke": {
        "width": 2
      }
    }
  };

}

viz.defaults = function(build) {

  var discrete = build.config.y && build.config.y.scale === "discrete" ? "y" : "x";

  var axis_style = function(axis) {

    return {
      "axis": {
        "color": "none",
        "value": false
      },
      "grid": false,
      "label": {
        "font": {
          "color": build.color,
          "family": "Palanquin",
          "size": 16,
          "weight": 700
        },
        "padding": 0,
        "value": build.config[axis] && build.config[axis].label ? build.config[axis].label : false
      },
      "ticks": {
        "color": "none",
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
        "color": "transparent",
        "stroke": {
          "width": 0
        }
      }
    },
    "format": {
      "text": function(text, params) {

        if (dictionary[text]) return dictionary[text];

        // All caps text
        if (["RCA"].indexOf(text) >= 0) {
          return text;
        }

        if (params.key) {

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
  var key = build.config.coords;
  delete build.config.coords;

  return {
    "color": {
      "heatmap": [d3plus.color.lighter(build.color), build.color, d3.rgb(build.color).darker()]
    },
    "coords": {
      "center": [0, 10],
      "key": key,
      "mute": ["79500US4804701"],
      "padding": 0,
      "projection": key === "countries" ? "equirectangular" : "albersUsa"
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
    load("/static/topojson/" + type + ".json", function(data){

      if (type === "countries" && !data.filtered) {
        data.objects[type].geometries = data.objects[type].geometries.filter(function(c){
          return c.matched;
        });
        data.filtered = true;
      }

      build.viz.coords(data);
      viz[next](build);
    })
  }
  else {
    viz[next](build);
  }

}

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
