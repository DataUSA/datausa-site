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
        if(d3.select("body").classed("home")){
          d3.select("#search-home").classed("open", true);
          var search_input = d3.select("#home-search-input");
          search_input.node().focus();
          search.container = d3.select("#search-" + search_input.attr("data-search"));
          search.reload();
        }
        else {
          d3.select(".search-box").classed("open", true);
          var search_input = d3.select("#nav-search-input");
          search_input.node().focus();
        //   d3.select("#search-simple-nav").classed("open", true);
        //   search_input.node().focus();
        //   if(search_input.property("value") !== ""){
        //     // d3.select(".search-box").classed("open", true);
        //   }
        //   d3.select(".search-box").classed("open", true);
        }
      }

    }
    else {

    }

    // "ESC" button
    if (d3.event.keyCode === 27) {
      // close all search results
      d3.selectAll(".search-body").classed("open", false);
      d3.selectAll(".search-input").each(function(){ this.blur(); });
      d3.select(".search-box").classed("open", false);
      d3.select("#search-simple-nav").classed("open", false)
    }

  });

  // Key events while the search input is active
  var searchInterval, keywait = 300;
  d3.selectAll(".search-input").on("keyup.search-input", function(){

    // "ESC" button
    if (d3.event.keyCode === 27) {
      d3.select(".search-box").classed("open", false);
      d3.select("#search-simple-nav").classed("open", false);
      d3.select(".search-box input").node().blur();
    }

    // Enter button
    if (d3.event.keyCode === 13) {
      var search_txt = d3.select(this).property("value");
      window.location = "/search/?q="+encodeURIComponent(search_txt);
    }

    var q = this.value.toLowerCase();

    if(this.id == "nav-search-input"){
      if(q === "") {
        // d3.select("#search-simple-nav").style("display", "none")
        d3.select("#search-simple-nav").classed("open", false)
        return;
      }
      else {
        // d3.select("#search-simple-nav").style("display", "block")
        d3.select("#search-simple-nav").classed("open", true)
      }
    }

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

  d3.selectAll(".search-input, .search-results").on("keyup.search-results", function(){

    // Up/Down Arrows
    if (d3.event.keyCode === 40 || d3.event.keyCode === 38) {
      var up = d3.event.keyCode === 38;

      // get current active element
      var curr_el = d3.select(this).select("a.search-item:focus").node();
      if(curr_el){
        var next_el = up ? curr_el.previousSibling : curr_el.nextSibling;
        if(!next_el){
          if(up){
            d3.select(this.parentNode.parentNode).select('input').node().focus();
          }
          else {
            next_el = document.querySelectorAll("a.search-item")[0];
          }
        }
      }
      else if(!up){
        var next_el = document.querySelectorAll(".search-item")[0];
      }

      if(next_el) next_el.focus();


      d3.event.preventDefault();
      return false;
    }

    // Enter
    if (d3.event.keyCode === 13) {
      var curr_el = d3.select(this).select("a.search-item:focus").node();
      if(!curr_el){
        var search_txt = d3.select(this).property("value");
        window.location = "/search/?q="+encodeURIComponent(search_txt);
      }
    }

  });

  d3.selectAll(".search-results").on("keydown.search-results", function(){
    // Up/Down Arrows
    if (d3.event.keyCode === 40 || d3.event.keyCode === 38) {
      d3.event.preventDefault();
      return false;
    }
  });


  d3.selectAll("[data-ga]").on("click.ga", function(){

    var _this = d3.select(this);
    var action = _this.attr("data-ga") || "click";
    var category = _this.attr("data-ga-cat") || "general";
    var label = _this.attr("data-ga-label") || "n/a";
    var target = _this.attr("data-ga-target") || false;
    var send = true;

    if(target){
      var parent = this.parentNode;
      if (action == "show data") {
        parent = parent.parentNode;
      }
      target = d3.select(parent).select(target);
      send = target.classed("visible") || target.classed("open");
    }

    if (send) {

      console.log("GA, action: ", action, "category: ", category, "label: ", label)

      ga('send', {
        hitType: 'event',
        eventCategory: category,
        eventAction: action,
        eventLabel: label
      });

    }

  })

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
        var data = load.cache[url];
        callback(load.datafold(data), url, data);
      }
      else {

        if (url in load.queue) {
          load.queue[url].push(callback);
        }
        else {
          load.queue[url] = [callback];

          if (load.storeLocal(url)) {

            localforage.getItem(url, function(error, data) {

              if (data) {
                load.callbacks(url, data);
              }
              else {
                d3.json(url, function(error, data){
                  load.rawData(error, data, url);
                });
              }

            });

          }
          else {
            d3.json(url, function(error, data){
              load.rawData(error, data, url);
            });
          }

        }

      }

    }

  });

}

load.cache = {};
load.queue = {};

load.callbacks = function(url, data) {
  var folded = load.datafold(data);
  while (load.queue[url].length) {
    var callback = load.queue[url].shift();
    callback(folded, url, data);
  }
  delete load.queue[url];
}

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

load.storeLocal = function(url) {
  return url.indexOf("attrs/") > 0 || url.indexOf("topojson/") > 0;
}

load.rawData = function(error, data, url) {
  if (error) {
    console.log(error);
    console.log(url);
    data = {"headers": [], "data": []};
  }
  localforage.setItem(url, data);
  load.cache[url] = data;
  load.callbacks(url, data);
}

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
    "name": "Education",
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

  this.container.select(".search-results").html("<div id='search-loading'><p><i class='fa fa-circle-o-notch fa-spin'></i> Loading Results...</p></div>");

  this.type = this.type || "";
  // var sumlevel = (this.type && this.current_depth[this.type]) ? this.nesting[this.type][this.current_depth[this.type]] : ""
  // var q_params = [['q', this.term], ['kind', this.type], ['sumlevel', sumlevel]]
  var q_params = [['q', this.term], ['kind', this.type]]
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
    d3.select(".results-show-all a").attr("href", "/search/"+q_params)
  }

  // if contrained, show "clear refinements"
  if(this.type){
    d3.select(".clear").style("display", "block")
  }

  var query_sumlevel = !this.term && this.depth ? "&sumlevel="+this.depth : "";
  load(api + "/attrs/search?limit=100&q="+this.term+"&kind="+this.type+query_sumlevel, function(data, url, raw) {
    // console.log(data, url, raw)

    this.zip = raw.zip_search;

    d3.select(".search-suggestions").style("display", "block").text('');

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
    items.enter().append(tag).attr("class", "search-item");

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

  // set thumbnail
  // thumb.style("background", "url('/search/"+d.kind+"/"+d.id+"/img/')")
  thumb.append("img")
    .attr("src", "/static/img/icons/"+d.kind+"_b.svg")

  // set info
  var title = info.append("h2")
                .append("a")
                .text(d.display)
                .attr("href", "/profile/" + d.kind + "/" + prettyUrl(d) + "/");
  // title.append("i").attr("class", "fa fa-angle-down")
  // title.append("i").attr("class", "fa fa-angle-up")
  if(sumlevels_by_id[d.kind][d.sumlevel]){
    info.append("p").attr("class", "subtitle").text(sumlevels_by_id[d.kind][d.sumlevel].name)
  }
  if(search.zip){
    info.append("span")
      .attr("class", "zip")
      .text("Based on zip code: " + d.zipcode.slice(7))
  }
  // xtra info
  var xtra = info.append("div").attr("class", "xtra")
  if(search.anchors[d.kind].sections){
    var ul = xtra.append("ul")
    search.anchors[d.kind].sections.forEach(function(anchor){
      var li = ul.append("li");
      li.append("a")
        .attr("href", "/profile/" + d.kind + "/" + prettyUrl(d) + "/#" + anchor.anchor)
        .append("img")
        .attr("src", "/static/img/icons/" + anchor.anchor + "_b.svg")
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
    .html("View Sections")
    .on("click", search.open_details);
}

search.btnProfile = function(d) {
  var search_item = d3.select(this).attr("href", function(d){
                      return "/profile/" + d.kind + "/" + prettyUrl(d) + "/";
                    });
  search_item.append("img").attr("src", "/static/img/icons/" + d.kind + "_b.svg")
  var search_item_text = search_item.append("div").attr("class", "search-item-t")
  search_item_text.append("h2").text(d.display);
  search_item_text.append("p").attr("class", "subtitle").text(function(d){
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

var attrStyles = {

  "nationality": {
    "us": {
        "color": "#41a392",
        "icon": "thing_passportusa.png"
    },
    "foreign": {
        "color": "#455a7d",
        "icon": "thing_passportwld.png"
    }
},

  "sex": {
    "1": {
        "color": "#1a486f",
        "icon": "gender_mars.png"
    },
    "2": {
        "color": "#ef6145",
        "icon": "gender_venus.png"
    },
    "men": {
        "color": "#1a486f",
        "icon": "gender_mars.png"
    },
    "women": {
        "color": "#ef6145",
        "icon": "gender_venus.png"
    },
    "male": {
        "color": "#1a486f",
        "icon": "gender_mars.png"
    },
    "female": {
        "color": "#ef6145",
        "icon": "gender_venus.png"
    }
},

  "sector": {
    "0": {
        "color": "#49418e",
        "icon": "person_admin.png"
    },
    "1": {
        "color": "#ffd3a6",
        "icon": "thing_bigdot.png"
    },
    "2": {
        "color": "#72f5c4",
        "icon": "thing_stripewheel.png"
    },
    "3": {
        "color": "#17c0c0",
        "icon": "thing_stripewheel.png"
    },
    "4": {
        "color": "#ff8166",
        "icon": "thing_bigdot.png"
    },
    "5": {
        "color": "#1fc1ad",
        "icon": "thing_stripewheel.png"
    },
    "6": {
        "color": "#2e6695",
        "icon": "thing_stripewheel.png"
    },
    "7": {
        "color": "#d1685e",
        "icon": "thing_bigdot.png"
    },
    "8": {
        "color": "#2b5652",
        "icon": "thing_stripewheel.png"
    },
    "9": {
        "color": "#33425b",
        "icon": "thing_stripewheel.png"
    }
},

  "race": {
    "1": {
        "color": "#ff8166",
        "icon": "person_profile.png"
    },
    "white": {
        "color": "#ff8166",
        "icon": "person_profile.png"
    },
    "2": {
        "color": "#ffb563",
        "icon": "person_profile.png"
    },
    "black": {
        "color": "#ffb563",
        "icon": "person_profile.png"
    },
    "3": {
        "color": "#c19a1f",
        "icon": "person_profile.png"
    },
    "4": {
        "color": "#f33535",
        "icon": "person_profile.png"
    },
    "5": {
        "color": "#82a8e7",
        "icon": "person_profile.png"
    },
    "native": {
        "color": "#82a8e7",
        "icon": "person_profile.png"
    },
    "6": {
        "color": "#1a9b9a",
        "icon": "person_profile.png"
    },
    "asian": {
        "color": "#1a9b9a",
        "icon": "person_profile.png"
    },
    "7": {
        "color": "#bf168e",
        "icon": "person_profile.png"
    },
    "hawaiian": {
        "color": "#bf168e",
        "icon": "person_profile.png"
    },
    "8": {
        "color": "#2f1fc1",
        "icon": "person_profile.png"
    },
    "other": {
        "color": "#2f1fc1",
        "icon": "person_profile.png"
    },
    "unknown": {
        "color": "#2f1fc1",
        "icon": "person_profile.png"
    },
    "9": {
        "color": "#336a81",
        "icon": "person_profile.png"
    },
    "multi": {
        "color": "#336a81",
        "icon": "person_profile.png"
    },
    "2ormore": {
        "color": "#336a81",
        "icon": "person_profile.png"
    },
    "hispanic": {
        "color": "#49418e",
        "icon": "person_profile.png"
    },
    "latino": {
        "color": "#49418e",
        "icon": "person_profile.png"
    }
},

  "skill_key": "parent",
  "skill": {
    "Complex Problem Solving": {
        "color": "#ff8166",
        "icon": "thing_atom.png"
    },
    "Resource Management Skills": {
        "color": "#ffb563",
        "icon": "thing_hourglass.png"
    },
    "System Skills": {
        "color": "#1a9b9a",
        "icon": "app_network.png"
    },
    "Basic Skills": {
        "color": "#336a81",
        "icon": "thing_book.png"
    },
    "Judgment Skills": {
        "color": "#49418e",
        "icon": "thing_gavel.png"
    },
    "Social Skills": {
        "color": "#2f1fc1",
        "icon": "thing_talkbubble.png"
    }
},

  "student_pool": {
    "Degrees Awarded": {
        "color": "#41a392",
        "icon": "thing_gradcap.png"
    },
    "Workforce": {
        "color": "#455a7d",
        "icon": "person_business.png"
    }
},

  // SOC coloring
  "soc_key": ["great_grandparent", "grandparent", "parent"],
  "soc": {
    "110000-290000": {
        "color": "#ff8166",
        "icon": "thing_computer.png"
    },
    "310000-390000": {
        "color": "#ffb563",
        "icon": "thing_utensils.png"
    },
    "410000-430000": {
        "color": "#1a9b9a",
        "icon": "thing_box.png"
    },
    "450000-490000": {
        "color": "#336a81",
        "icon": "thing_wrench.png"
    },
    "510000-530000": {
        "color": "#49418e",
        "icon": "thing_truck.png"
    },
    "550000": {
        "color": "#2f1fc1",
        "icon": "thing_airplace.png"
    }
},

  "acs_occ_2": {
    "00": {
        "color": "#ff8166",
        "icon": "thing_computer.png"
    },
    "01": {
        "color": "#ffb563",
        "icon": "thing_utensils.png"
    },
    "02": {
        "color": "#1a9b9a",
        "icon": "thing_box.png"
    },
    "03": {
        "color": "#336a81",
        "icon": "thing_wrench.png"
    },
    "04": {
        "color": "#49418e",
        "icon": "thing_truck.png"
    }
},

"bls_soc": {
    "000000": {
        "color": "#7a8896",
        "icon": "app_geo_map.png"
    },
    "110000": {
        "color": "#2c5753",
        "icon": "person_business.png"
    },
    "130000": {
        "color": "#bf168e",
        "icon": "place_moneyhouse.png"
    },
    "150000": {
        "color": "#336a81",
        "icon": "thing_computer.png"
    },
    "170000": {
        "color": "#5a1d28",
        "icon": "thing_textile.png"
    },
    "190000": {
        "color": "#82a8e7",
        "icon": "thing_leaf.png"
    },
    "210000": {
        "color": "#ffb587",
        "icon": "person_family.png"
    },
    "230000": {
        "color": "#0072cd",
        "icon": "thing_gavel.png"
    },
    "250000": {
        "color": "#1f304c",
        "icon": "thing_book.png"
    },
    "270000": {
        "color": "#1fc1ad",
        "icon": "thing_theater.png"
    },
    "290000": {
        "color": "#f33535",
        "icon": "thing_medic.png"
    },
    "310000": {
        "color": "#ff8166",
        "icon": "person_nurse.png"
    },
    "330000": {
        "color": "#5467de",
        "icon": "person_military.png"
    },
    "350000": {
        "color": "#17c0c0",
        "icon": "thing_utensils.png"
    },
    "370000": {
        "color": "#2f1fc1",
        "icon": "thing_waterdrop.png"
    },
    "390000": {
        "color": "#e6d26e",
        "icon": "person_wheelchair.png"
    },
    "410000": {
        "color": "#72f5c4",
        "icon": "place_store.png"
    },
    "430000": {
        "color": "#acb57e",
        "icon": "person_admin.png"
    },
    "450000": {
        "color": "#aee0ae",
        "icon": "thing_wheat.png"
    },
    "470000": {
        "color": "#c1461f",
        "icon": "thing_trafficcone.png"
    },
    "490000": {
        "color": "#92407c",
        "icon": "thing_wrench.png"
    },
    "510000": {
        "color": "#ffd3a6",
        "icon": "thing_sqruler.png"
    },
    "530000": {
        "color": "#418e84",
        "icon": "thing_truck.png"
    },
    "550000": {
        "color": "#8e7b41",
        "icon": "thing_airplane.png"
    }
},

  // NAICS coloring
  "naics_key": ["grandparent", "parent"],
  "naics": {
    "11-21": {
        "color": "#49418e",
        "icon": "thing_wheat.png"
    },
    "23": {
        "color": "#c19a1f",
        "icon": "thing_trafficcone.png"
    },
    "31-33": {
        "color": "#fdf18d",
        "icon": "place_factory.png"
    },
    "42": {
        "color": "#5467de",
        "icon": "thing_box.png"
    },
    "44-45": {
        "color": "#1f304c",
        "icon": "place_store.png"
    },
    "48-49, 22": {
        "color": "#c1461f",
        "icon": "thing_truck.png"
    },
    "51": {
        "color": "#5b1e29",
        "icon": "thing_computer.png"
    },
    "52-53": {
        "color": "#bf168e",
        "icon": "place_moneyhouse.png"
    },
    "54-56": {
        "color": "#2c5753",
        "icon": "person_business.png"
    },
    "61-62": {
        "color": "#f33535",
        "icon": "thing_medic.png"
    },
    "71-72": {
        "color": "#1fc1ad",
        "icon": "thing_theater.png"
    },
    "81": {
        "color": "#82a8e7",
        "icon": "person_general.png"
    },
    "92": {
        "color": "#ffb587",
        "icon": "person_family.png"
    },
    "928110": {
        "color": "#2f1fc1",
        "icon": "thing_airplane.png"
    }
},

  "acs_ind_2": {
    "00": {
        "color": "#49418e",
        "icon": "thing_wheat.png"
    },
    "01": {
        "color": "#c19a1f",
        "icon": "thing_trafficcone.png"
    },
    "02": {
        "color": "#fdf18d",
        "icon": "place_factory.png"
    },
    "03": {
        "color": "#5467de",
        "icon": "thing_box.png"
    },
    "04": {
        "color": "#1f304c",
        "icon": "place_store.png"
    },
    "05": {
        "color": "#c1461f",
        "icon": "thing_truck.png"
    },
    "06": {
        "color": "#5b1e29",
        "icon": "thing_computer.png"
    },
    "07": {
        "color": "#bf168e",
        "icon": "place_moneyhouse.png"
    },
    "08": {
        "color": "#2c5753",
        "icon": "thing_recycle.png"
    },
    "09": {
        "color": "#f33535",
        "icon": "thing_medic.png"
    },
    "10": {
        "color": "#1fc1ad",
        "icon": "thing_theater.png"
    },
    "11": {
        "color": "#82a8e7",
        "icon": "person_general.png"
    },
    "12": {
        "color": "#ffb587",
        "icon": "person_family.png"
    }
},

"bls_naics": {
    "000000": {
        "color": "#7a8896",
        "icon": "app_geo_map.png"
    },
    "11": {
        "color": "#49418e",
        "icon": "thing_wheat.png"
    },
    "21": {
        "color": "#c19a1f",
        "icon": "thing_pickaxe.png"
    },
    "22": {
        "color": "#8e7b41",
        "icon": "thing_waterdrop.png"
    },
    "23": {
        "color": "#5467de",
        "icon": "thing_trafficcone.png"
    },
    "31-33": {
        "color": "#1f304c",
        "icon": "place_factory.png"
    },
    "42": {
        "color": "#c1461f",
        "icon": "thing_box.png"
    },
    "44-45": {
        "color": "#5b1e29",
        "icon": "place_store.png"
    },
    "48-49": {
        "color": "#c0178f",
        "icon": "thing_truck.png"
    },
    "51": {
        "color": "#1f304c",
        "icon": "thing_computer.png"
    },
    "52": {
        "color": "#f33535",
        "icon": "place_moneyhouse.png"
    },
    "53": {
        "color": "#1fc1ad",
        "icon": "place_home.png"
    },
    "54": {
        "color": "#0072cd",
        "icon": "thing_wrench.png"
    },
    "55": {
        "color": "#ffd3a6",
        "icon": "person_business.png"
    },
    "56": {
        "color": "#2c5753",
        "icon": "thing_recycle.png"
    },
    "61": {
        "color": "#92407c",
        "icon": "thing_gradcap.png"
    },
    "62": {
        "color": "#ff8166",
        "icon": "thing_medic.png"
    },
    "71": {
        "color": "#72f5c4",
        "icon": "thing_theater.png"
    },
    "72": {
        "color": "#82a8e7",
        "icon": "thing_utensils.png"
    },
    "81": {
        "color": "#ffb563",
        "icon": "person_general.png"
    },
    "92": {
        "color": "#2f1fc1",
        "icon": "person_family.png"
    }
},

"iocode_key": "parent",
"iocode": {
    "11": {
        "color": "#49418e",
        "icon": "thing_wheat.png"
    },
    "21": {
        "color": "#c19a1f",
        "icon": "thing_pickaxe.png"
    },
    "22": {
        "color": "#aee0ae",
        "icon": "thing_waterdrop.png"
    },
    "23": {
        "color": "#4B9DCD",
        "icon": "thing_trafficcone.png"
    },
    "31G": {
        "color": "#8e7b41",
        "icon": "place_factory.png"
    },
    "42": {
        "color": "#E6D26E",
        "icon": "thing_box.png"
    },
    "44RT": {
        "color": "#5467de",
        "icon": "place_store.png"
    },
    "48TW": {
        "color": "#1f304c",
        "icon": "thing_truck.png"
    },
    "51": {
        "color": "#c1461f",
        "icon": "thing_computer.png"
    },
    "55": {
        "color": "#FEF28E",
        "icon": "person_business.png"
    },
    "6": {
        "color": "#5b1e29",
        "icon": "thing_medic.png"
    },
    "7": {
        "color": "#c0178f",
        "icon": "thing_theater.png"
    },
    "81": {
        "color": "#33426b",
        "icon": "person_general.png"
    },
    "F": {
        "color": "#89BFEA",
        "icon": "person_general.png"
    },
    "F020": {
        "color": "#1f304c",
        "icon": "place_moneyhouse.png"
    },
    "F100": {
        "color": "#f33535",
        "icon": "app_stacked.png"
    },
    "FIRE": {
        "color": "#1fc1ad",
        "icon": "place_home.png"
    },
    "G": {
        "color": "#0072cd",
        "icon": "place_government.png"
    },
    "HS": {
        "color": "#418E84",
        "icon": "place_home.png"
    },
    "ORE": {
        "color": "#003651",
        "icon": "place_home.png"
    },
    "Other": {
        "color": "#ffd3a6",
        "icon": "thing_guage.png"
    },
    "PROF": {
        "color": "#2c5753",
        "icon": "person_business.png"
    },
    "TOTCOMOUT": {
        "color": "#BD9B97",
        "icon": "app_geo_map.png"
    },
    "TOTFU": {
        "color": "#979BBD",
        "icon": "app_geo_map.png"
    },
    "TOTII": {
        "color": "#7072A0",
        "icon": "app_geo_map.png"
    },
    "TOTINDOUT": {
        "color": "#92407c",
        "icon": "export_val.png"
    },
    "TOTVA": {
        "color": "#ff8166",
        "icon": "import_val.png"
    },
    "Used": {
        "color": "#72f5c4",
        "icon": "thing_recycle.png"
    },
    "V001": {
        "color": "#82a8e7",
        "icon": "person_admin.png"
    },
    "V002": {
        "color": "#ffb563",
        "icon": "thing_documentscroll.png"
    },
    "V003": {
        "color": "#2f1fc1",
        "icon": "app_occugrid.png"
    }
},

  "cip_2": {
    "01": {
        "color": "#aee0ae",
        "icon": "thing_wheat.png"
    },
    "03": {
        "color": "#979bbd",
        "icon": "thing_recycle.png"
    },
    "04": {
        "color": "#5a1d28",
        "icon": "thing_textile.png"
    },
    "05": {
        "color": "#c0451e",
        "icon": "place_earth.png"
    },
    "09": {
        "color": "#bf168e",
        "icon": "thing_documentscroll.png"
    },
    "10": {
        "color": "#d1685e",
        "icon": "thing_radiotower.png"
    },
    "11": {
        "color": "#336a81",
        "icon": "thing_computer.png"
    },
    "12": {
        "color": "#17c0c0",
        "icon": "thing_utensils.png"
    },
    "13": {
        "color": "#4b9dcd",
        "icon": "thing_gradcap.png"
    },
    "14": {
        "color": "#fdf18d",
        "icon": "place_factory.png"
    },
    "15": {
        "color": "#8c567c",
        "icon": "thing_gears.png"
    },
    "16": {
        "color": "#b36a52",
        "icon": "export_val.png"
    },
    "19": {
        "color": "#e6d26e",
        "icon": "person_wheelchair.png"
    },
    "22": {
        "color": "#0072cd",
        "icon": "thing_gavel.png"
    },
    "23": {
        "color": "#1f304c",
        "icon": "thing_book.png"
    },
    "24": {
        "color": "#7072a0",
        "icon": "app_rings.png"
    },
    "25": {
        "color": "#acb57e",
        "icon": "person_admin.png"
    },
    "26": {
        "color": "#ffb563",
        "icon": "thing_dna.png"
    },
    "27": {
        "color": "#89bfea",
        "icon": "thing_pi.png"
    },
    "29": {
        "color": "#8e7b41",
        "icon": "thing_airplane.png"
    },
    "30": {
        "color": "#33425b",
        "icon": "thing_arrows.png"
    },
    "31": {
        "color": "#72f5c4",
        "icon": "thing_shoe.png"
    },
    "38": {
        "color": "#003651",
        "icon": "thing_question.png"
    },
    "39": {
        "color": "#2f1fc1",
        "icon": "thing_moon.png"
    },
    "40": {
        "color": "#82a8e7",
        "icon": "thing_leaf.png"
    },
    "41": {
        "color": "#d8e9f0",
        "icon": "thing_flask.png"
    },
    "42": {
        "color": "#5467de",
        "icon": "thing_talkbubble.png"
    },
    "43": {
        "color": "#ff8166",
        "icon": "thing_policeshield.png"
    },
    "44": {
        "color": "#ffb587",
        "icon": "person_family.png"
    },
    "45": {
        "color": "#c19a1f",
        "icon": "app_network.png"
    },
    "46": {
        "color": "#bc9a96",
        "icon": "thing_trafficcone.png"
    },
    "47": {
        "color": "#92407c",
        "icon": "thing_wrench.png"
    },
    "48": {
        "color": "#ffd3a6",
        "icon": "thing_sqruler.png"
    },
    "49": {
        "color": "#418e84",
        "icon": "thing_truck.png"
    },
    "50": {
        "color": "#1fc1ad",
        "icon": "thing_theater.png"
    },
    "51": {
        "color": "#f33535",
        "icon": "thing_medic.png"
    },
    "52": {
        "color": "#2c5753",
        "icon": "person_business.png"
    },
    "54": {
        "color": "#49418e",
        "icon": "app_stacked.png"
    },
    "GS": {
        "color": "#853b3c",
        "icon": "thing_flask.png"
    }
  }

}

var chartStyles = {

  "background": {
    "color": "transparent",
    "stroke": 1
  },

  "labels": {
    "default": {
      "pri": {
        "color": "#6F6F6F",
        "family": "Palanquin",
        "size": 12,
        "weight": 400,
        "transform": "uppercase",
        // "spacing": 1
      },
      "sec": {
        "color": "#6F6F6F",
        "family": "Palanquin",
        "size": 12,
        "weight": 400,
        "transform": "uppercase",
        // "spacing": 1
      }
    },
    "discrete": {
      "pri": {
        "color": "#6F6F6F",
        "family": "Palanquin",
        "size": 12,
        "weight": 400,
        "transform": "uppercase",
        "spacing": 1
      },
      "sec": {
        "color": "#6F6F6F",
        "family": "Palanquin",
        "size": 12,
        "weight": 400,
        "transform": "uppercase",
        "spacing": 1
      }
    }
  },

  "lines": {
    "color": "#333",
    "dasharray": "4",
    "font": {
      "color": "#211f1a",
      "family": "Palanquin",
      "size": 12,
      "weight": 400
    }
  },

  "ticks": {
    "default": {
      "pri": {
        "color": "#ccc",
        "font": {
          "color": "#a8a8a8",
          "family": "Source Sans Pro",
          "size": 12,
          "weight": 300
        },
        "size": 10
      },
      "sec": {
        "color": "#ccc",
        "font": {
          "color": "#a8a8a8",
          "family": "Source Sans Pro",
          "size": 12,
          "weight": 300
        },
        "size": 10
      }
    },
    "discrete": {
      "pri": {
        "color": "#ccc",
        "font": {
          "color": "#211f1a",
          "family": "Palanquin",
          "size": 12,
          "weight": 400
        },
        "size": 10
      },
      "sec": {
        "color": "#ccc",
        "font": {
          "color": "#211f1a",
          "family": "Palanquin",
          "size": 12,
          "weight": 400
        },
        "size": 10
      }
    }
  },

  "zeroline": {
    "default": {
      "pri": {
        "color": "#ccc"
      },
      "sec": {
        "color": "#ccc"
      }
    },
    "discrete": {
      "pri": {
        "color": "#ccc"
      },
      "sec": {
        "color": "#ccc"
      }
    }
  }

}

var vizStyles = {

  "top": "#ffb563", // top 5 bars
  "bottom": "#455a7d", // bottom 5 bars

  "default": {
    "pri": "#ef6145",
    "sec": "#d0d1d5"
  },
  "geo": {
    "pri": "#ef6145",
    "sec": "#d0d1d5"
  },
  "cip": {
    "pri": "#ef6145",
    "sec": "#d0d1d5"
  },
  "soc": {
    "pri": "#ef6145",
    "sec": "#d0d1d5"
  },
  "naics": {
    "pri": "#ef6145",
    "sec": "#d0d1d5"
  },

    // "pri": "#ffb563",
    // "sec": "#455a7d"

  "tooltip": {
    "background": "white",
    "font": {
      "color": "#888",
      "family": "Palanquin",
      "size": 18,
      "weight": 300
    },
    "small": 250
  },

  "ui": {
    "border": 1,
    "color": {
      "primary": "#fff",
      "secondary": "#6F6F6F"
    },
    "font": {
      "color": "#888",
      "family": "Palanquin",
      "size": 12,
      "transform": "none",
      "weight": 300,
      "secondary": {
        "color": "#888",
        "family": "Palanquin",
        "size": 12,
        "transform": "none",
        "weight": 300
      }
    }
  },

  "ui_map": {
    "border": 1,
    "color": {
      "primary": "#fff",
      "secondary": "#6F6F6F"
    },
    "font": {
      "color": "#888",
      "family": "Palanquin",
      "size": 12,
      "transform": "none",
      "weight": 300,
      "secondary": {
        "color": "#888",
        "family": "Palanquin",
        "size": 12,
        "transform": "none",
        "weight": 300
      }
    }
  },

  "background": "transparent",
  "color": {
    "missing": "#efefef",
    "heatmap": ["#374b98", "#84D3B6", "#E8EA94", "#e88577", "#992E3F"],
    "primary": "#aaa",
    "range": ["#374b98", "#84D3B6", "#E8EA94", "#e88577", "#992E3F"]
  },
  "edges": {
    "color": "#d0d0d0"
  },
  "labels": {
    "font": {
      // add keys for any visualization type you want to overwrite
      "default": {
        "family": "Pathway Gothic One",
        "size": 13
      },
      "tree_map": {
        "family": "Pathway Gothic One",
        "size": 13
      }
    }
  },
  "legend": {
    "font": {
      "color": "#211f1a",
      "family": "Palanquin",
      "size": 12,
      "weight": 400
    }
  },
  "lines": {
    "interpolation": "monotone",
    "stroke-width": 2
  },
  "messages": {
    "font": {
      "color": "#888",
      "family": "Palanquin",
      "size": 16,
      "weight": 300
    }
  },
  "sankey": {
    "padding": 5,
    "width": 150
  },
  "shapes": {
    "padding": 0,
    "stroke": {
      "width": 1
    }
  },

  "pin": {
    // "color": "#F33535",
    "color": "transparent",
    "stroke": "#d5614d",
    "path": "M0.001-53.997c-9.94,0-18,8.058-18,17.998l0,0l0,0c0,2.766,0.773,5.726,1.888,8.066C-13.074-20.4,0.496,0,0.496,0s12.651-20.446,15.593-27.964v-0.061l0.021,0.005c-0.007,0.019-0.016,0.038-0.021,0.056c0.319-0.643,0.603-1.306,0.846-1.985c0.001-0.003,0.003-0.006,0.004-0.009c0.001-0.001,0.001-0.003,0.002-0.005c0.557-1.361,1.059-3.054,1.059-6.035c0,0,0,0,0-0.001l0,0C17.999-45.939,9.939-53.997,0.001-53.997z M0.001-29.874c-3.763,0-6.812-3.05-6.812-6.812c0-3.762,3.05-6.812,6.812-6.812c3.762,0,6.812,3.05,6.812,6.812C6.812-32.924,3.763-29.874,0.001-29.874z",
    "scale": 0.5
  },

  "tiles": "light_all" // either light_all or dark_all

}

var viz = function(build) {

  if (!build.colors) build.colors = vizStyles.defaults;

  delete build.config.height;

  if (build.config.y2 && build.config.y2.value === "01000US" && build.highlight === "01000US") {
    delete build.config.y2;
    if (build.config.x.persist) {
      build.config.x.persist.position = false;
    }
  }

  build.viz = build.config.type === "geo_map" ? viz.map() : d3plus.viz();

  build.viz
    .messages(!build.container.classed("thumbprint"))
    .config(viz.defaults(build))
    .background("transparent")
    .container(build.container.select(".d3plus"))
    .error("Please Wait")
    .draw();

  if (build.highlight) {

    build.viz.class(function(d, viz){
      var attr = d[viz.id.value] + "";
      return build.highlight === "01000US" || attr === build.highlight ? "highlight" :
             build.highlight.length > attr.length ? "outline" : "";
    });

  }

  viz.loadCoords(build);

  return build;

};

viz.finish = function(build) {

  var source_text = d3plus.string.list(d3plus.util.uniques(build.sources.reduce(function(arr, s, i){
    if (s) {
      var t = s.dataset;
      if (s.link) {
        t = "<a class='source-link' href='" + s.link + "' target='_blank'>" + t + "</a>";
      }
      arr.push(t);
    }
    return arr;
  }, [])));

  d3.select(build.container.node().parentNode).select(".source")
    .html(source_text);

  var org_text = d3plus.string.list(d3plus.util.uniques(build.sources.reduce(function(arr, s, i){
    if (s) {
      arr.push(s.org);
    }
    return arr;
  }, [])));

  d3.select(build.container.node().parentNode).select(".org")
    .html(org_text);

  if (!build.config.color) {
    if (build.viz.attrs()[build.highlight]) {
      build.config.color = function(d, viz) {
        return d[viz.id.value] === build.highlight ? build.colors.pri : build.colors.sec;
      };
    }
    else {
      build.config.color = function(d, viz) {
        return build.colors.pri;
      };
    }
    build.config.legend = false;
  }
  else if (build.config.color in attrStyles) {
    var attrs = build.attrs.map(function(a){
      var t = a.type;
      if (t in attrStyles && attrStyles[t].constructor === String) {
        return attrStyles[t];
      }
      return t;
    });
    build.color = build.config.color;
    if (attrs.indexOf(build.color) >= 0 && build.color !== "race") {
      build.config.color = "color";
      build.config.icon = "icon";
    }
    else {
      build.config.color = function(d) {
        if (!(d[build.color] in attrStyles[build.color])) {
          console.warn("Missing color for \"" + d[build.color] + "\"");
          return false;
        }
        else {
          return attrStyles[build.color][d[build.color]].color;
        }
      };
      build.config.icon = function(d) {
        if (!(d[build.color] in attrStyles[build.color])) {
          console.warn("Missing icon for \"" + d[build.color] + "\"");
          return false;
        }
        else {
          return "/static/img/attrs/" + attrStyles[build.color][d[build.color]].icon;
        }
      };
    }
  }
  else if (build.config.color in vizStyles) {
    build.color = build.config.color;
    build.config.color = function() {
      return vizStyles[build.color];
    };
  }

  build.viz
    .config(viz[build.config.type](build))
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

    var key = axis.length === 1 ? "pri" : "sec";

    return {
      "axis": {
        "color": discrete === axis ? "none" : chartStyles.zeroline.default[key].color,
        "value": discrete !== axis
      },
      "grid": discrete !== axis,
      "ticks": {
        "color": discrete === axis ? "none" : chartStyles.ticks.default[key].color,
        "labels": discrete !== axis || !build.config.labels,
        "size": discrete === axis ? 0 : chartStyles.ticks.default[key].size
      }
    }

  }

  return {
    "labels": {
      "align": "left",
      "resize": false,
      "value": false
    },
    "order": {
      "agg": "max"
    },
    "x": axis_style("x"),
    "x2": axis_style("x2"),
    "y": axis_style("y"),
    "y2": axis_style("y2")
  };

}

var all_caps = ["cip", "naics", "rca", "soc", "usa"],
    attr_ids = ["geo", "cip", "soc", "naics"];

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
        else if (a.bucket.indexOf("more") >= 0 || a.bucket.indexOf("over") >= 0) {
          return 100000;
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

    var key = build.config[axis] || false, label = false;
    if (d3plus.object.validate(key)) {
      key = key.value;
    }
    else if (key) {
      build.config[axis] = {"value": key};
    }

    if (key) {
      label = build.config[axis].label ? build.config[axis].label : axis.indexOf("y") === 0 && attr_ids.indexOf(key) >= 0 ? false : true;
      if (label in dictionary) label = dictionary[label];
      build.config[axis].label = label;
    }

    if (build.config[axis] && build.config[axis].ticks && build.config[axis].ticks.value) {
      build.config[axis].ticks.value = JSON.parse(build.config[axis].ticks.value);
    }

    var range = proportions.indexOf(key) >= 0 && key !== "pct_total" ? [0, 1] : false;

    var key = axis.length === 1 ? "pri" : "sec",
        style = axis === discrete ? "discrete" : "default",
        labelFont = chartStyles.labels[style][key];

    if (build.config.y2 && ["y", "y2"].indexOf(axis) >= 0) {
      if (build.config.y2.value === "01000US" || build.config.y2.label === "National Average" || build.config.y2.label === "USA") {
        if (axis === "y") labelFont.color = build.colors.pri;
        else if (axis === "y2") labelFont.color = build.colors.sec;
      }
      else if (build.config.color in attrStyles) {
        var colors = attrStyles[build.config.color];
        if (colors[build.config[axis].value]) labelFont.color = colors[build.config[axis].value].color;
        else if (colors[build.config[axis].label]) labelFont.color = colors[build.config[axis].label].color;
      }
    }

    return {
      "label": {
        "font": chartStyles.labels[style][key],
        "padding": 0
      },
      "lines": chartStyles.lines,
      "range": range,
      "ticks": chartStyles.ticks[style][key]
    };
  };

  var messageBg = vizStyles.background;
  if (!build.container.classed("thumbprint") && messageBg === "transparent") {
    function findSection(node) {
      if (node.tagName.toLowerCase() === "section") {
        var bg = d3.select(node).style("background-color");
        return bg !== "rgba(0, 0, 0, 0)" ? bg : "white";
      }
      else if (node.tagName.toLowerCase() === "body") {
        return messageBg;
      }
      else {
        return findSection(node.parentNode);
      }
    }
    messageBg = findSection(build.container.node());
  }

  return {
    "axes": {
      "background": chartStyles.background,
      "ticks": false
    },
    "background": vizStyles.background,
    "color": vizStyles.color,
    "data": vizStyles.shapes,
    "edges": vizStyles.edges,
    "format": {
      "number": viz.format.number,
      "text": function(text, params) {

        viz.format.text(text, params, build);

      }
    },
    "height": {
      "small": 10
    },
    "icon": {
      "style": "knockout"
    },
    "labels": {
      "font": vizStyles.labels.font[build.config.type] || vizStyles.labels.font.default
    },
    "legend": {
      "font": vizStyles.legend.font,
      "labels": false,
      "order": {
        "sort": "desc",
        "value": "size"
      }
    },
    "messages": {
      "background": messageBg,
      "font": vizStyles.messages.font,
      "style": "large"
    },
    "tooltip": vizStyles.tooltip,
    "ui": vizStyles.ui,
    "x": axis_style("x"),
    "x2": axis_style("x2"),
    "y": axis_style("y"),
    "y2": axis_style("y2")
  }
}

viz.geo_map = function(build) {

  var key = build.config.coords.key;

  return {
    "coords": {
      "center": [0, 0],
      "key": key,
      "padding": 0,
      "projection": key === "birthplace" ? "equirectangular" : "albersUsa",
      "simplify": false
    },
    "labels": false,
    "mouse": {
      "click": false
    },
    "zoom": {
      "scroll": false
    }
  };
}

viz.line = function(build) {
  return {
    "shape": {
      "interpolate": vizStyles.lines.interpolation
    },
    "size": vizStyles.lines["stroke-width"]
  };
}

viz.radar = function(build) {
  return {
    "mouse": {
      "click": false
    }
  };
}

viz.sankey = function(build) {

  build.sankeyInit = false;
  network = viz.sankeyData(build);
  build.sankeyInit = true;

  return {
    "data": {
      "padding": vizStyles.sankey.padding
    },
    "edges": {
      "strength": "value_millions",
      "value": network.edges
    },
    "focus": {
      "tooltip": false,
      "value": network.focus
    },
    "labels": {
      "resize": false
    },
    "mouse": {
      "click": function(d, v) {
        if (d.id !== v.focus()[0]) {
          v.error("Loading...").draw();
          build.data.forEach(function(data){
            data.url = data.url.replace(build.highlight, d.id);
          });
          viz.loadData(build, "sankeyData");
        }
      }
    },
    "nodes": network.nodes,
    "size": vizStyles.sankey.width
  };
}

viz.sankeyData = function(b) {

  var nodes = {}, focus, data = b.viz.data();
  var edges = data.map(function(e, i){
    if (!(e.id in nodes)) {
      nodes[e.id] = {"id": e.id};
      focus = e.id;
    }
    if ("use" in e) {
      if (!(e.use in nodes)) nodes[e.use] = {"id": e.use};
      var s = nodes[e.use], t = nodes[e.id];
    }
    else if ("make" in e) {
      if (!(e.make in nodes)) nodes[e.make] = {"id": e.make};
      var s = nodes[e.id], t = nodes[e.make];
    }
    return {
      "source": s,
      "target": t,
      "value_millions": e.value_millions
    };
  });

  data = data.filter(function(d){

    if ("use" in d) {
      d.id = d.use;
      delete d.use;
    }
    if ("make" in d) {
      d.id = d.make;
      delete d.make;
    }

    return d.id !== focus;

  })
  b.viz.data(data);

  if (!b.sankeyInit) {
    return {
      "edges": edges,
      "focus": focus,
      "nodes": d3.values(nodes)
    }
  }
  else {
    b.highlight = focus;
    b.viz
      .nodes(d3.values(nodes))
      .edges(edges)
      .focus(focus)
      .error(false)
      .draw();
  }

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
    "legend": {
      "filters": true
    }
  };
}

viz.format = {
  "number": function(number, params) {

    var prefix = "";

    if (params.key) {

      var key = params.key;
      delete params.key;

      if (key.indexOf("_moe") > 0) {
        prefix = "<span class='plus-minus'>±</span> ";
        key = key.replace("_moe", "");
      }

      if (key.indexOf("emp_thousands") >= 0) {
        number = number * 1000;
      }
      else if (key == "value_millions") {
        number = number * 1000000;
      }
      else if (key == "output") {
        number = number * 1000000000;
      }

      if (key.indexOf("y2_") === 0) {
        key = key.slice(3);
      }

      if (proportions.indexOf(key) >= 0 || percentages.indexOf(key) >= 0) {
        if (proportions.indexOf(key) >= 0) number = number * 100;
        return prefix + d3plus.number.format(number, params) + "%";
      }
      else {
        number = d3plus.number.format(number, params);
        if (key in affixes) {
          var a = affixes[key];
          number = a[0] + number + a[1];
        }
        return prefix + number;
      }

    }

    return prefix + d3plus.number.format(number, params);

  },
  "text": function(text, params, build) {

    if (text.indexOf("_moe") > 0) {
      return "&nbsp;&nbsp;&nbsp;&nbsp;Margin of Error";
    }
    else if (text.indexOf("_rank") > 0) {
      return "Rank";
    }

    if (text.indexOf("y2_") === 0) {
      text = text.slice(3);
    }

    if (build && text === "bucket") {
      ["x", "y", "x2", "y2"].forEach(function(axis){
        if (d3plus.object.validate(build.config[axis]) &&
            build.config[axis].value === "bucket" &&
            build.config[axis].label &&
            build.config[axis].label !== true) {
          text = build.config[axis].label;
        }
      });
    }

    if (dictionary[text]) return dictionary[text];

    // All caps text
    if (all_caps.indexOf(text.toLowerCase()) >= 0) {
      return text.toUpperCase();
    }

    if (params.key) {

      if (params.key === "name") {
        return text;
      }

      // Format buckets
      if (params.key === "bucket") {

        var key = false;

        if (text.indexOf("_") > 0) {
          text = text.split("_");
          key = text.shift();
          text = text.join("_");
        }

        if (build && key === false) {
          ["x", "y", "x2", "y2"].forEach(function(axis){
            if (d3plus.object.validate(build.config[axis]) &&
                build.config[axis].value === "bucket" &&
                build.config[axis].label &&
                build.config[axis].label !== true) {
              key = build.config[axis].label;
            }
          });
        }

        var a = key && key in affixes ? affixes[key].slice() : ["", ""];
        var thousands = ["income"];
        for (var i = thousands.length; i > 0; i--) {
          var t = thousands[i - 1];
          if (t in dictionary) {
            thousands.push(dictionary[t]);
          }
        }
        if (thousands.indexOf(key) >= 0) a[1] = "k";

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
        else if (text.toLowerCase() === "none") {
          return a[0] + "0" + a[1];
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

      var attrs = build && build.viz ? build.viz.attrs() : false;
      if (attrs && text in attrs) {
        return d3plus.string.title(attrs[text].name, params);
      }

      if (attr_ids.indexOf(params.key) >= 0) return text.toUpperCase();

    }

    return d3plus.string.title(text, params);

  }
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
        var type = a.type === "university" ? "sector" : a.type, color_key = type;
        if (type + "_key" in attrStyles) {
          color_key = attrStyles[type + "_key"];
        }
        if (!(color_key instanceof Array)) color_key = [color_key];
        var colorize = build.config.color === type && type in attrStyles ? attrStyles[type] : false;
        for (var i = 0; i < data.length; i++) {
          var d = data[i];
          if (type === "iocode") {
            if (!d.parent && d.id.charAt(0) === "F") d.parent = "F";
            else if (!d.parent) d.parent = d.id;
          }
          if (colorize) {
            var lookup = false;
            color_key.forEach(function(k){
              if (k in d && d[k] && d[k] in colorize) {
                lookup = colorize[d[k]];
              }
            })
            if (!lookup && d.id in colorize) {
              lookup = colorize[d.id];
            }
            if (lookup) {
              d.color = lookup.color;
              d.icon = "/static/img/attrs/" + lookup.icon;
            }
          }
          attrs[d.id] = d;
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

viz.loadBuilds = function(builds) {

  if (builds.length) {

    builds.forEach(function(build, i){
      build.container = d3.select(d3.selectAll(".viz")[0][i]);
      build.loaded = false;
      build.timer = false;
      build.index = i;
      build.colors = vizStyles[attr_type];

      var title = d3.select(build.container.node().parentNode.parentNode).select("h2");
      if (title.size()) {
        build.title = title.text().replace(" Show Data", "").replace(/\u00a0/g, "");
        build.title = d3plus.string.strip(build.title).replace("__", "_").toLowerCase();
      }
      else {
        build.title = "data";
      }

      var select = d3.select(build.container.node().parentNode).select("select");
      if (select.size()) {

        d3plus.form()
          .search(false)
          .ui({
            "margin": 0
          })
          .ui(vizStyles.ui)
          .focus({"callback": function(id){

            var param = this.getAttribute("data-param"),
                method = this.getAttribute("data-method"),
                prev = this.getAttribute("data-default");

            if (id !== prev) {

              d3.select(this).attr("data-default", id);

              d3.select(this.parentNode).selectAll(".select-text")
               .html(d3.select(this).select("option[value='"+ id +"']").text());

              d3.select(this.parentNode).selectAll("span[data-url]")
               .each(function(){

                 d3.select(this.parentNode).classed("loading", true);
                 var url = this.getAttribute("data-url");
                 if (param.length) {
                   url = url.replace(param + "=" + prev, param + "=" + id);
                 }
                 else {
                   url = url.replace("order=" + prev, "order=" + id);
                   url = url.replace("required=" + prev, "required=" + id);
                 }
                 d3.select(this).attr("data-url", url);

                 var rank = 1;
                 if (url.indexOf("rank=") > 0) {
                   var rank = new RegExp("&rank=([0-9]*)").exec(url);
                   url = url.replace(rank[0], "");
                   rank = parseFloat(rank[1])
                 }

                 load(url, function(data, u){
                   d3.select(this.parentNode).classed("loading", false)
                   var text = data.value.split("; ")[rank - 1];
                   if (!text) text = "N/A";
                   if (text.indexOf("and ") === 0) {
                     text = text.replace("and ", "");
                   }
                   d3.select(this).html(text);
                 }.bind(this));

               });

              if (param.length) {
               build.data.forEach(function(b){
                 b.url = b.url.replace(param + "=" + prev, param + "=" + id);
               });
               viz.loadData(build, "redraw");
              }
              else if (method.length) {
               build.viz[method](id).draw();
              }

            }

          }.bind(select.node())})
          .data(select)
          .width(select.node().parentNode.offsetWidth)
          .type("drop")
          .draw();

      }

      var shares = d3.select(build.container.node().parentNode.parentNode).select(".share-section");
      if (shares.size()) {
        shares.selectAll("a").on("click.share", function(){
          d3.event.preventDefault();
          var type = d3.select(this).attr("data-ga").split(" ")[0];
          if (type === "embed") {
            var link_open = shares.select(".embed-input").classed("open");
            shares.select(".embed-input").classed("open", !link_open);
          }
          else {
            alert("Sharing not enabled in beta.");
          }
        });
        shares.select(".viz_only").on("change", function(){
          var link = shares.select(".embed-link").node();
          if (this.checked) {
            link.value = link.value + "?viz=True";
          }
          else {
            link.value = link.value.split("?")[0];
          }
        })
      }

      var table = d3.select(build.container.node().parentNode).selectAll(".data-table");
      if (table.size()) {
        d3.select(build.container.node().parentNode.parentNode)
          .select(".data-btn")
          .on("click", function(){
            d3.event.preventDefault();
            table.classed("visible", !table.classed("visible"));
            var tbl_visible = table.classed("visible");
            var text = tbl_visible ? "Hide Data" : "Show Data";
            d3.select(this).select("span").text(text);
          });
        table.select(".csv-btn")
          .on("click", function(){
            d3.event.preventDefault();
            var urls = d3.select(this.parentNode.parentNode).attr("data-urls").split("|"),
                limit_regex = new RegExp("&limit=([0-9]*)"),
                zip = new JSZip();

            function loadCSV() {
              var u = urls.pop(), r = limit_regex.exec(u);
              if (r) u = u.replace(r[0], "");
              u = u.replace("/api", "/api/csv");
              JSZipUtils.getBinaryContent(u, function(e, d){
                zip.file("data-" + (urls.length + 1) + ".csv", d);
                if (urls.length) {
                  loadCSV();
                }
                else {
                  saveAs(zip.generate({type:"blob"}), build.title + ".zip");
                }
              });
            }

            loadCSV();

          });

      }

    });

    function resizeApps() {

      builds.forEach(function(b, i){
        b.top = b.container.node().offsetTop;
        b.height = b.container.node().offsetHeight;
      });

    }
    resizeApps();
    resizeFunctions.push(resizeApps);

    var scrollBuffer = -200, n = [32];
    function buildInView(b) {
      var top = d3plus.client.scroll.y(), height = window.innerHeight;
      return top+height > b.top+scrollBuffer && top+scrollBuffer < b.top+b.height;
    }

    function buildScroll(ms) {
      if (ms === undefined) ms = 0;
      for (var i = 0; i < builds.length; i++) {
        var b = builds[i];
        if (!b.timer && !b.loaded) {
          if (buildInView(b)) {
            b.timer = setTimeout(function(build){
              clearTimeout(build.timer);
              build.timer = false;
              if (buildInView(build)) {
              // if (buildInView(build) && n.indexOf(build.index) >= 0) {
                current_build = viz(build);
                build.loaded = true;
              }
            }, ms, b);
          }
        }
      }
    }

    buildScroll();
    scrollFunctions.push(buildScroll);

  }

}

var excludedGeos = ["79500US4804701", "16000US0641278", "XXATA"];

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

    if (type === "nations") {
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
    build.config.coords.solo = build.config.coords.solo.filter(function(c){
      return excludedGeos.indexOf(c) < 0;
    });
    build.config.coords.mute = excludedGeos;

    var filename = type;
    if (["places", "tracts"].indexOf(type) >= 0) {
      if (build.config.coords.solo.length) {
        filename += "_" + build.config.coords.solo[0].slice(7, 9);
        build.config.coords.solo.push("040" + build.config.coords.solo[0].slice(3, 9));
      }
      else {
        filename += "_" + build.highlight.slice(7, 9);
      }
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
    "23": "18",
    "24": "17"
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
          if ("delete" in d.map) {
            var deleteMap = d.map.delete;
            delete d.map.delete;
          }
          else {
            var deleteMap = true;
          }
          for (var i = 0; i < data.length; i++) {
            for (var k in d.map) {
              data[i][k] = data[i][d.map[k]];
              if (deleteMap) delete data[i][d.map[k]];
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

              if (keys[ii] + "_moe" in dat) {
                dd[d.split.value + "_moe"] = dat[keys[ii] + "_moe"];
              }

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
                delete dd[keys[iii] + "_moe"];
              }
              split_data.push(dd);
            }
          }
          data = split_data;
        }

        if (d.share) {
          var share = d.share.split("."), share_id = share[1] || false;
          share = share[0];
          if (share_id) {
            var totals = d3plus.util.uniques(data, share_id).reduce(function(obj, id){
              obj[id] = d3.sum(data, function(dat){
                return dat[share_id] === id ? dat[share] : 0;
              });
              return obj;
            }, {});
            for (var i = 0; i < data.length; i++) {
              data[i].share = data[i][share]/totals[data[i][share_id]] * 100;
            }
          }
          else {
            var total = d3.sum(data, function(dat){ return dat[share]; });
            for (var i = 0; i < data.length; i++) {
              data[i].share = data[i][share]/total * 100;
            }
          }
        }

        for (var i = 0; i < build.attrs.length; i++) {
          var type = build.attrs[i].type,
              nesting = attrNesting[type];

          if (nesting && nesting.constructor === Array) {
            for (var ii = 0; ii < data.length; ii++) {
              var datum = data[ii];
              for (var iii = 0; iii < nesting.length; iii++) {
                var length = nesting[iii];
                var k = type + "_" + length;
                datum[k] = datum[type].slice(0, length);
                if (k === build.config.color && k in attrStyles && datum[k] in attrStyles[k]) {
                  datum.color = attrStyles[k][datum[k]].color;
                }
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
          var table = build.container.select(".data-table");

          if (table.size()) {

            table.attr("data-urls", build.data.map(function(bd){
              return bd.url;
            }).join("|"));

            var headerKeys = d3.keys(dataArray[0]),
                format = build.viz.format(Object),
                textFormat = format.text.value || format.text,
                numFormat = format.number.value || format.number;

            format = function(v, key) {
              if (v === undefined || v === null) {
                return "N/A";
              }
              else if (v.constructor === Number) {
                return numFormat(v, {"key": key});
              }
              else {
                return textFormat(v, {"key": key});
              }
            }

            var headers = table.select("thead > tr").selectAll("th")
              .data(headerKeys);
            headers.enter().append("th");
            headers.text(function(d){
              return format(d).replace(/&nbsp;/g, "");
            });
            headers.exit().remove();

            var rowData = dataArray.map(function(d){
              return headerKeys.map(function(h){
                return d[h];
              });
            });

            var rows = table.select("tbody").selectAll("tr")
              .data(rowData);
            rows.enter().append("tr");
            rows.each(function(d){
              var cols = d3.select(this).selectAll("td")
                .data(d);
              cols.enter().append("td")
              cols.html(function(d, i){
                return format(d, headerKeys[i]);
              })
              cols.exit().remove();
            });
            rows.exit().remove();

            var apis = table.select(".download-btns").selectAll(".api-btn")
              .data(build.data, function(d, i){
                return i;
              });

            apis.enter().append("a")
              .attr("class", "api-btn")
              .attr("target", "_blank");

            apis
              .attr("href", function(d){
                return d.url;
              })
              .text(function(d, i){
                if (build.data.length === 1) {
                  return "View API Call";
                }
                return "View API Call #" + (i + 1);
              });

          }

          viz[next](build);
        }
      })
    }
  }
  else {
    viz[next](build);
  }

}

d3.geo.albersUsaPr = function() {
  var ε = 1e-6;

  var lower48 = d3.geo.albers();

  // EPSG:3338
  var alaska = d3.geo.conicEqualArea()
      .rotate([154, 0])
      .center([-2, 58.5])
      .parallels([55, 65]);

  // ESRI:102007
  var hawaii = d3.geo.conicEqualArea()
      .rotate([157, 0])
      .center([-3, 19.9])
      .parallels([8, 18]);

  // XXX? You should check that this is a standard PR projection!
  var puertoRico = d3.geo.conicEqualArea()
      .rotate([66, 0])
      .center([0, 18])
      .parallels([8, 18]);

  var point,
      pointStream = {point: function(x, y) { point = [x, y]; }},
      lower48Point,
      alaskaPoint,
      hawaiiPoint,
      puertoRicoPoint;

  function albersUsa(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    point = null;
    (lower48Point(x, y), point)
        || (alaskaPoint(x, y), point)
        || (hawaiiPoint(x, y), point)
        || (puertoRicoPoint(x, y), point);
    return point;
  }

  albersUsa.invert = function(coordinates) {
    var k = lower48.scale(),
        t = lower48.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;
    return (y >= .120 && y < .234 && x >= -.425 && x < -.214 ? alaska
        : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii
        : y >= .204 && y < .234 && x >= .320 && x < .380 ? puertoRico
        : lower48).invert(coordinates);
  };

  // A naïve multi-projection stream.
  // The projections must have mutually exclusive clip regions on the sphere,
  // as this will avoid emitting interleaving lines and polygons.
  albersUsa.stream = function(stream) {
    var lower48Stream = lower48.stream(stream),
        alaskaStream = alaska.stream(stream),
        hawaiiStream = hawaii.stream(stream),
        puertoRicoStream = puertoRico.stream(stream);
    return {
      point: function(x, y) {
        lower48Stream.point(x, y);
        alaskaStream.point(x, y);
        hawaiiStream.point(x, y);
        puertoRicoStream.point(x, y);
      },
      sphere: function() {
        lower48Stream.sphere();
        alaskaStream.sphere();
        hawaiiStream.sphere();
        puertoRicoStream.sphere();
      },
      lineStart: function() {
        lower48Stream.lineStart();
        alaskaStream.lineStart();
        hawaiiStream.lineStart();
        puertoRicoStream.lineStart();
      },
      lineEnd: function() {
        lower48Stream.lineEnd();
        alaskaStream.lineEnd();
        hawaiiStream.lineEnd();
        puertoRicoStream.lineEnd();
      },
      polygonStart: function() {
        lower48Stream.polygonStart();
        alaskaStream.polygonStart();
        hawaiiStream.polygonStart();
        puertoRicoStream.polygonStart();
      },
      polygonEnd: function() {
        lower48Stream.polygonEnd();
        alaskaStream.polygonEnd();
        hawaiiStream.polygonEnd();
        puertoRicoStream.polygonEnd();
      }
    };
  };

  albersUsa.precision = function(_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_);
    alaska.precision(_);
    hawaii.precision(_);
    puertoRico.precision(_);
    return albersUsa;
  };

  albersUsa.scale = function(_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_);
    alaska.scale(_ * .35);
    hawaii.scale(_);
    puertoRico.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function(_) {
    if (!arguments.length) return lower48.translate();
    var k = lower48.scale(), x = +_[0], y = +_[1];

    lower48Point = lower48
        .translate(_)
        .clipExtent([[x - .455 * k, y - .238 * k], [x + .455 * k, y + .238 * k]])
        .stream(pointStream).point;

    alaskaPoint = alaska
        .translate([x - .307 * k, y + .201 * k])
        .clipExtent([[x - .425 * k + ε, y + .120 * k + ε], [x - .214 * k - ε, y + .234 * k - ε]])
        .stream(pointStream).point;

    hawaiiPoint = hawaii
        .translate([x - .205 * k, y + .212 * k])
        .clipExtent([[x - .214 * k + ε, y + .166 * k + ε], [x - .115 * k - ε, y + .234 * k - ε]])
        .stream(pointStream).point;

    puertoRicoPoint = puertoRico
        .translate([x + .350 * k, y + .224 * k])
        .clipExtent([[x + .320 * k, y + .204 * k], [x + .380 * k, y + .234 * k]])
        .stream(pointStream).point;

    return albersUsa;
  };

  return albersUsa.scale(1070);
}

viz.mapDraw = function(vars) {

  var cartodb = vizStyles.tiles,
      defaultZoom = vars.id && vars.id.value === "birthplace" ? 1 : 0.95,
      pathOpacity = 0.25,
      pathStroke = 1,
      scaleAlign = "middle",
      scaleHeight = 10,
      scalePadding = 5,
      timing = 600,
      zoomFactor = 2;

  var scaleText = {
    "fill": vizStyles.legend.font.color,
    "font-family": vizStyles.legend.font.family,
    "font-size": vizStyles.legend.font.size,
    "font-weight": vizStyles.legend.font.weight
  }

  var borderColor = function(c) {
    return d3plus.color.legible(c);
  }

  var elementSize = function(element, s) {

    if (element.tagName === undefined || ["BODY","HTML"].indexOf(element.tagName) >= 0) {

      var val  = window["inner"+s.charAt(0).toUpperCase()+s.slice(1)];
      var elem = document !== element ? d3.select(element) : false;

      if (elem) {
        if (s === "width") {
          val -= parseFloat(elem.style("margin-left"), 10);
          val -= parseFloat(elem.style("margin-right"), 10);
          val -= parseFloat(elem.style("padding-left"), 10);
          val -= parseFloat(elem.style("padding-right"), 10);
        }
        else {
          val -= parseFloat(elem.style("margin-top"), 10);
          val -= parseFloat(elem.style("margin-bottom"), 10);
          val -= parseFloat(elem.style("padding-top"), 10);
          val -= parseFloat(elem.style("padding-bottom"), 10);
        }
      }
      vars[s].value = val;
    }
    else {
      val = parseFloat(d3.select(element).style(s), 10);
      if (typeof val === "number" && val > 0) {
        vars[s].value = val;
      }
      else if (element.tagName !== "BODY") {
        elementSize(element.parentNode, s);
      }
    }
  }

  vars.container.value
    .style("position", function() {
      var current = d3.select(this).style("position");
      var remain  = ["absolute","fixed"].indexOf(current) >= 0;
      return remain ? current : "relative"
    });

  // detect size on first draw
  if (!vars.width.value) elementSize(vars.container.value.node(), "width");
  if (!vars.height.value) elementSize(vars.container.value.node(), "height");

  var width = vars.width.value,
      height = vars.height.value,
      center = [width/2, height/2];

  var svg = vars.container.value.selectAll("svg").data([0]);
  svg.enter().append("svg")
    .attr("width", width)
    .attr("height", height);

  var coords = vars.coords.value;
  if (coords && vars.coords.key) {

    var projection = "mercator";
    if (vars.coords.key === "states" && location.href.indexOf("/map/") < 0) {
      projection = "albersUsaPr";
      vars.tiles.value = false;
    }

    if (vars.tiles.value) {

      svg.style("background-color", vars.messages.background)
        .transition().duration(timing)
        .style("background-color", "#cdd1d3");

      var attribution = vars.container.value.selectAll(".attribution").data([0]);

      attribution.enter().append("div")
        .attr("class", "attribution")
        .html('Map tiles by <a target="_blank" href="http://cartodb.com/attributions">CartoDB</a>')
        // .html('&copy; <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a target="_blank" href="http://cartodb.com/attributions">CartoDB</a>')

    }

    var tileGroup = svg.selectAll("g.tiles").data([0]);
    tileGroup.enter().append("g").attr("class", "tiles")
      .attr("opacity", 0).transition().duration(timing).attr("opacity", 1);

    var polyGroup = svg.selectAll("g.paths").data([0]);
    polyGroup.enter().append("g").attr("class", "paths")
      .attr("opacity", 0).transition().duration(timing).attr("opacity", 1);

    var pinGroup = svg.selectAll("g.pins").data([0]);
    pinGroup.enter().append("g").attr("class", "pins")
      .attr("opacity", 0).transition().duration(timing).attr("opacity", 1);

    var data_range = d3plus.util.uniques(vars.data.value, vars.color.value).filter(function(d){
      return d !== null && typeof d === "number";
    });

    if (data_range.length > 1) {

      var color_range = vizStyles.color.heatmap;
      data_range = d3plus.util.buckets(d3.extent(data_range), color_range.length);

      var colorScale = d3.scale.sqrt()
        .domain(data_range)
        .range(color_range)
        .interpolate(d3.interpolateRgb)

    }
    else if (data_range.length) {
      var colorScale = function(d){ return vizStyles.color.heatmap; }
    }
    else {
      var colorScale = false;
    }

    var dataMap = vars.data.value.reduce(function(obj, d){
      obj[d[vars.id.value]] = d;
      return obj;
    }, {});

    if (colorScale) {

      var scale = svg.selectAll("g.scale").data([0]);
      scale.enter().append("g")
        .attr("class", "scale")
        .attr("opacity", 0);

      var values = colorScale.domain(),
          colors = colorScale.range();

      var heatmap = scale.selectAll("#d3plus_legend_heatmap")
        .data(["heatmap"]);

      heatmap.enter().append("linearGradient")
        .attr("id", "d3plus_legend_heatmap")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");

      var stops = heatmap.selectAll("stop")
        .data(d3.range(0, colors.length));

      stops.enter().append("stop")
        .attr("stop-opacity",1);

      stops
        .attr("offset",function(i){
          return Math.round((i/(colors.length-1))*100)+"%";
        })
        .attr("stop-color",function(i){
          return colors[i];
        });

      stops.exit().remove();

      var heatmap2 = scale.selectAll("#d3plus_legend_heatmap_legible")
        .data(["heatmap"]);

      heatmap2.enter().append("linearGradient")
        .attr("id", "d3plus_legend_heatmap_legible")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");

      var stops = heatmap2.selectAll("stop")
        .data(d3.range(0, colors.length));

      stops.enter().append("stop")
        .attr("stop-opacity",1);

      stops
        .attr("offset",function(i){
          return Math.round((i/(colors.length-1))*100)+"%";
        })
        .attr("stop-color",function(i){
          return borderColor(colors[i]);
        });

      stops.exit().remove();

      var gradient = scale.selectAll("rect#gradient")
        .data(["gradient"]);

      gradient.enter().append("rect")
        .attr("id","gradient")
        .attr("x",function(d){
          if (scaleAlign == "middle") {
            return Math.floor(width/2);
          }
          else if (scaleAlign == "end") {
            return width;
          }
          else {
            return 0;
          }
        })
        .attr("y", scalePadding)
        .attr("width", 0)
        .attr("height", scaleHeight)
        // .attr("stroke", scaleText.fill)
        .style("stroke", "url(#d3plus_legend_heatmap_legible)")
        .attr("stroke-width",1)
        .attr("fill-opacity", pathOpacity)
        .style("fill", "url(#d3plus_legend_heatmap)");

      var text = scale.selectAll("text.d3plus_tick")
        .data(d3.range(0, values.length));

      text.enter().append("text")
        .attr("class","d3plus_tick")
        .attr("x",function(d){
          if (scaleAlign === "middle") {
            return Math.floor(width/2);
          }
          else if (scaleAlign === "end") {
            return width;
          }
          else {
            return 0;
          }
        })
        .attr("y",function(d){
          return this.getBBox().height + scaleHeight + scalePadding * 2;
        });

      var label_width = 0;

      text
        .order()
        .style("text-anchor", "middle")
        .attr(scaleText)
        .text(function(d){
          return vars.format.number(values[d], {"key": vars.color.value, "vars": vars});
        })
        .attr("y",function(d){
          return this.getBBox().height+scaleHeight+scalePadding*2;
        })
        .each(function(d){
          var w = this.offsetWidth;
          if (w > label_width) label_width = w;
        });

      label_width += scalePadding*2;

      var key_width = label_width * (values.length-1);

      if (key_width+label_width < width/2) {
        key_width = width/2;
        label_width = key_width/values.length;
        key_width -= label_width;
      }

      var start_x;
      if (scaleAlign == "start") {
        start_x = scalePadding;
      }
      else if (scaleAlign == "end") {
        start_x = width - scalePadding - key_width;
      }
      else {
        start_x = width/2 - key_width/2;
      }

      text.transition().duration(timing)
        .attr("x",function(d){
          return Math.floor(start_x + (label_width * d));
        });

      text.exit().transition().duration(timing)
        .attr("opacity", 0)
        .remove();

      var ticks = scale.selectAll("rect.d3plus_tick")
        .data(values, function(d, i){ return i; });

      function tickStyle(tick) {
        tick
          .attr("y", function(d, i){
            if (i === 0 || i === values.length - 1) {
              return scalePadding;
            }
            return scalePadding + scaleHeight;
          })
          .attr("height", function(d, i){
            if (i !== 0 && i !== values.length - 1) {
              return scalePadding;
            }
            return scalePadding + scaleHeight;
          })
          // .attr("fill", scaleText.fill)
          .attr("fill", function(d){
            return borderColor(colorScale(d));
          });
      }

      ticks.enter().append("rect")
        .attr("class", "d3plus_tick")
        .attr("x", function(d){
          if (scaleAlign == "middle") {
            return Math.floor(width/2);
          }
          else if (scaleAlign == "end") {
            return width;
          }
          else {
            return 0;
          }
        })
        .attr("width", 0)
        .call(tickStyle);

      ticks.transition().duration(timing)
        .attr("x",function(d, i){
          var mod = i === 0 ? 1 : 0;
          return Math.floor(start_x + (label_width * i) - mod);
        })
        .attr("width", 1)
        .call(tickStyle);

      ticks.exit().transition().duration(timing)
        .attr("width",0)
        .remove();

      gradient.transition().duration(timing)
        .attr("x",function(d){
          if (scaleAlign === "middle") {
            return Math.floor(width/2 - key_width/2);
          }
          else if (scaleAlign === "end") {
            return Math.floor(width - key_width - scalePadding);
          }
          else {
            return Math.floor(scalePadding);
          }
        })
        .attr("y", scalePadding)
        .attr("width", key_width)
        .attr("height", scaleHeight);

      var label = scale.selectAll("text.scale_label").data([0]);
      label.enter().append("text").attr("class", "scale_label")

      label
        .attr("text-anchor", scaleAlign)
        .attr("x",function(d){
          if (scaleAlign === "middle") {
            return Math.floor(width/2);
          }
          else if (scaleAlign === "end") {
            return width;
          }
          else {
            return 0;
          }
        })
        .attr("y", -scalePadding)
        .text(vars.format.text(vars.color.value))
        .attr(scaleText);

      var key_box = scale.node().getBBox(),
          key_height = key_box.height + key_box.y;

      // key_height += attribution.node().offsetHeight;
      key_height += scalePadding;

      scale.attr("transform" , "translate(0, " + (height - key_height) + ")")
        .transition().duration(timing).attr("opacity", 1);

      key_height += scalePadding;

    }
    else {
      key_height = 0;
    }

    var pinData = [];
    coords.objects[vars.coords.key].geometries = coords.objects[vars.coords.key].geometries.filter(function(c){
      if (vars.pins.value.indexOf(c.id) >= 0) pinData.push(c);
      return vars.coords.solo.length ? vars.coords.solo.indexOf(c.id) >= 0 :
             vars.coords.mute.length ? vars.coords.mute.indexOf(c.id) < 0 : true;
    })
    var coordData = topojson.feature(coords, coords.objects[vars.coords.key]);

    if (!vars.zoom.set) {

      vars.zoom.projection = d3.geo[projection]()
        .scale(1)
        .translate([0, 0]);

    }

    projection = vars.zoom.projection;

    var path = d3.geo.path()
      .projection(projection);

    var b = path.bounds(coordData),
        s = defaultZoom / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / (height - key_height)),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2 - key_height/2];

    // Update the projection to use computed scale & translate.
    if (!vars.zoom.set) {

      projection.scale(s).translate(t);

      vars.zoom.behavior = d3.behavior.zoom()
        .scale(s * 2 * Math.PI)
        .scaleExtent([1 << 9, 1 << 22])
        .translate(t)
        .on("zoom", zoomed);

      // With the center computed, now adjust the projection such that
      // it uses the zoom behavior’s translate and scale.
      projection
        .scale(1 / 2 / Math.PI)
        .translate([0, 0]);

    }

    var zoom = vars.zoom.behavior;

    pinData = pinData.map(function(d){ return path.centroid(topojson.feature(coords, d)); });

    if (vars.zoom.value) {

      var controls = vars.container.value.selectAll(".map-controls").data([0]);
      var controls_enter = controls.enter().append("div")
        .attr("class", "map-controls");

      function zoomMath(factor) {

        var scale = zoom.scale(),
            extent = zoom.scaleExtent(),
            translate = zoom.translate(),
            x = translate[0], y = translate[1],
            target_scale = scale * factor;

        // If we're already at an extent, done
        if (target_scale === extent[0] || target_scale === extent[1]) { return false; }

        // If the factor is too much, scale it down to reach the extent exactly
        var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale));
        if (clamped_target_scale != target_scale){
            target_scale = clamped_target_scale;
            factor = target_scale / scale;
        }

        // Center each vector, stretch, then put back
        x = (x - center[0]) * factor + center[0];
        y = (y - center[1]) * factor + center[1];

        zoom.scale(target_scale).translate([x, y]);
        zoomed(timing);
      }

      controls_enter.append("div").attr("class", "zoom-in").on("click", function(){
        zoomMath(zoomFactor);
      });

      controls_enter.append("div").attr("class", "zoom-out").on("click", function(){
        zoomMath(1/zoomFactor);
      });

      controls_enter.append("div").attr("class", "zoom-reset").on("click", function(){
        zoom.scale(s * 2 * Math.PI).translate(t);
        zoomed(timing);
      });

    }

    var polyStyle = function(p) {
      p
        .attr("fill", function(d) {
          var dat = dataMap[d.id];
          var val = dat && vars.color.value in dat ? dat[vars.color.value] : null;
          d.color = colorScale && val !== null && typeof val === "number" ? colorScale(val) : vizStyles.color.missing;
          return d.color;
        })
        .attr("fill-opacity", pathOpacity)
        .attr("stroke", function(d){
          return borderColor(d.color);
        });
    }

    var polys = polyGroup.selectAll("path")
      .data(coordData.features, function(d){
        return d.id;
      });

    polys.exit().remove();

    polys.enter().append("path")
      .attr("d", path)
      .attr("vector-effect", "non-scaling-stroke")
      .attr("stroke-width", pathStroke)
      .attr("class", function(d){
        var o = {};
        o[vars.id.value] = d.id;
        var c = vars.class.value ? vars.class.value(o, vars) : "";
        return "d3plus_coordinates " + c;
      })
      .attr("id", function(d){
        return d.id;
      })
      .call(polyStyle);

    if (vars.mouse.value) {

      var createTooltip = function(d) {
        var dat = dataMap[d.id];

        var mouse = d3.mouse(d3.select("html").node()), tooltip_data = [];

        var tooltip_data = vars.tooltip.value.reduce(function(arr, t){
          if (dat && t in dat && dat[t] !== null && dat[t] !== undefined) {
            arr.push({
              "group": "",
              "name": vars.format.text(t, {}),
              "value": vars.format.value(dat[t], {"key": t}),
              "highlight": t === vars.color.value
            });
          }
          return arr;
        }, []);

        d3plus.tooltip.remove("geo_map");
        d3plus.tooltip.create({
          "arrow": true,
          "background": vizStyles.tooltip.background,
          "fontcolor": vizStyles.tooltip.font.color,
          "fontfamily": vizStyles.tooltip.font.family,
          "fontsize": vizStyles.tooltip.font.size,
          "fontweight": vizStyles.tooltip.font.weight,
          "data": tooltip_data,
          "color": d.color,
          "id": "geo_map",
          "max_width": vizStyles.tooltip.small,
          "offset": 3,
          "parent": d3.select("body"),
          "title": vars.format.text(vars.attrs.value[d.id].name, {"key": vars.id.value}),
          "width": vizStyles.tooltip.small,
          "x": mouse[0],
          "y": mouse[1]
        });
      }

      polys
        .on(d3plus.client.pointer.over, function(d){
          d3.select(this).attr("fill-opacity", pathOpacity * 2).style("cursor", "pointer");
          createTooltip(d);
        })
        .on(d3plus.client.pointer.move, function(d){
          d3.select(this).attr("fill-opacity", pathOpacity * 2).style("cursor", "pointer");
          createTooltip(d);
        })
        .on(d3plus.client.pointer.out, function(d){
          d3.select(this).attr("fill-opacity", pathOpacity);
          d3plus.tooltip.remove("geo_map");
        });

    }

    polys
      .transition().duration(timing)
      .call(polyStyle);

    var pins = pinGroup.selectAll(".pin").data(pinData);
    pins.enter().append("path")
      .attr("class", "pin")
      .attr("vector-effect", "non-scaling-stroke")
      .attr("stroke-width", 1)
      .attr("d", vizStyles.pin.path)
      .attr("fill", vizStyles.pin.color)
      .attr("stroke", vizStyles.pin.stroke);

    if (vars.tiles.value) {
      var tile = d3.geo.tile()
        .size([width, height]);
    }

    function zoomed(zoomtiming) {

      if (vars.tiles.value) {

        var tileData = tile
          .scale(zoom.scale())
          .translate(zoom.translate())
          ();
      }
      else {
        var tileData = [];
      }

      polyGroup.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
      pinGroup.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
        .selectAll(".pin")
        .attr("transform", function(d){
          return "translate(" + d + ")scale(" + (1/zoom.scale()*vizStyles.pin.scale) + ")";
        });

      if (vars.tiles.value) {
        tileGroup.attr("transform", "scale(" + tileData.scale + ")translate(" + tileData.translate + ")");
      }

      var tilePaths = tileGroup.selectAll("image.tile")
          .data(tileData, function(d) { return d; });

      tilePaths.exit().remove();

      tilePaths.enter().append("image")
        .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 3 | 0] + ".basemaps.cartocdn.com/" + cartodb + "/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
        .attr("width", 1)
        .attr("height", 1)
        .attr("x", function(d) { return d[0]; })
        .attr("y", function(d) { return d[1]; });

    }

    if (vars.zoom.value) {
      svg.call(zoom)
        .on("mousewheel.zoom",null)
        .on("MozMousePixelScroll.zoom",null)
        .on("wheel.zoom",null);
    }

    if (!vars.zoom.set) {
      zoomed();
      vars.zoom.set = true;
    }

  }

  return vars.self;

}

viz.map = function() {

  // setup default vars, mimicing D3plus
  var vars = {
    "attrs": {"objectOnly": true, "value": {}},
    "background": {"value": "transparent"},
    "class": {"value": false},
    "color": {"value": false},
    "container": {"value": false},
    "coords": {"value": false, "solo": [], "mute": []},
    "data": {"value": []},
    "depth": {"value": 0},
    "error": {"value": false},
    "format": {
      "value": function(value, opts){
        if (typeof value === "number") {
          return this.number(value, opts);
        }
        else if (typeof value === "string") {
          return this.text(value, opts);
        }
        return JSON.stringify(value);
      },
      "number": viz.format.number,
      "text": viz.format.text
    },
    "height": {"value": false},
    "highlight": {"value": false},
    "id": {"value": false},
    "messages": {"value": true},
    "mouse": {"value": true},
    "pins": {"value": []},
    "text": {"value": "name"},
    "tiles": {"value": true},
    "tooltip": {"value": []},
    "width": {"value": false},
    "zoom": {"set": false, "value": true}
  };

  // the drawing function
  vars.self = function() {
    viz.mapDraw(vars);
    return vars.self;
  }

  // default logic for setting a var key
  var methodSet = function(method, _) {
    if (!vars[method]) vars[method] = {};
    if (_.constructor === Object && _.type === "Topology") {
      vars[method].value = _;
    }
    else if (_.constructor === Object && vars[method].objectOnly !== true) {
      for (var k in _) {
        vars[method][k] = _[k];
      }
    }
    else {
      vars[method].value = _;
    }
  }

  // attach simple set/get methods for all keys in vars
  for (var key in vars) {
    vars.self[key] = (function(method){
      return function(_) {
        if (arguments.length) {
          if (_ === Object) return vars[method];
          methodSet(method, _);
          return vars.self;
        }
        return vars[method].value;
      }
    })(key);
  }

  // method for passing multiple methods in one function
  vars.self.config = function(_) {
    for (var method in _) {
      methodSet(method, _[method]);
    }
    return vars.self;
  }

  vars.self.draw = vars.self;
  return vars.self;

}

d3.geo.tile = function() {
  var size = [960, 500],
      scale = 256,
      translate = [size[0] / 2, size[1] / 2],
      zoomDelta = 0;

  function tile() {
    var z = Math.max(Math.log(scale) / Math.LN2 - 8, 0),
        z0 = Math.round(z + zoomDelta),
        k = Math.pow(2, z - z0 + 8),
        origin = [(translate[0] - scale / 2) / k, (translate[1] - scale / 2) / k],
        tiles = [],
        cols = d3.range(Math.max(0, Math.floor(-origin[0])), Math.max(0, Math.ceil(size[0] / k - origin[0]))),
        rows = d3.range(Math.max(0, Math.floor(-origin[1])), Math.max(0, Math.ceil(size[1] / k - origin[1])));

    rows.forEach(function(y) {
      cols.forEach(function(x) {
        tiles.push([x, y, z0]);
      });
    });

    tiles.translate = origin;
    tiles.scale = k;

    return tiles;
  }

  tile.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return tile;
  };

  tile.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return tile;
  };

  tile.translate = function(_) {
    if (!arguments.length) return translate;
    translate = _;
    return tile;
  };

  tile.zoomDelta = function(_) {
    if (!arguments.length) return zoomDelta;
    zoomDelta = +_;
    return tile;
  };

  return tile;
};
