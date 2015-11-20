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
          d3.select("#search-simple-nav").classed("open", true);
          var search_input = d3.select("#nav-search-input");
          search_input.node().focus();
          d3.select(".search-box").classed("open", true);
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
      window.location = "/search/?q="+search_txt;
    }

    var q = this.value.toLowerCase();
    
    if(this.id == "nav-search-input"){
      if(q === "") {
        d3.select("#search-simple-nav").style("display", "none")
        return;
      }
      else {
        d3.select("#search-simple-nav").style("display", "block")
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
        window.location = "/search/?q="+search_txt;
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
    var target = _this.attr("data-ga-target");
  
    if(action == "show data"){
      target = d3.select(this.parentNode.parentNode).select(target).node();
    }
    
    console.log("GA, action: ", action, "category: ", category, "label: ", label)

    ga('send', {
      hitType: 'event',
      eventCategory: category,
      eventAction: action,
      eventLabel: label
    });
  
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

  this.container.select(".search-results").html("<div id='search-loading'><p>Loading Results...</p></div>");
  
  this.type = this.type || "";
  var sumlevel = (this.type && this.current_depth[this.type]) ? this.nesting[this.type][this.current_depth[this.type]] : ""
  // var q_params = [['q', this.term], ['kind', this.type], ['sumlevel', sumlevel]]
  var q_params = [['q', this.term], ['kind', this.type]]
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
  
  // if contrained, show "clear refinements"
  if(this.type){
    d3.select(".clear").style("display", "block")
  }
  
  load(api + "/attrs/search?limit=100&q="+this.term+"&kind="+this.type, function(data, url, raw) {
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
  var thumb = search_item.append("span").attr("href", "/profile/" + d.kind + "/" + d.id + "/").attr("class", 'thumb');
  var info = search_item.append("div").attr("class", 'info').on("click", search.open_details);
  var profile = search_item.append("div").attr("class", 'profile');
  
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
        .attr("href", "/profile/" + d.kind + "/" + d.id + "/#" + anchor.anchor)
        .append("img")
        .attr("src", "/static/img/icons/" + anchor.anchor + "_b.svg")
        .on("click", function(){ d3.event.stopPropagation(); })
      li.append("a")
        .attr("href", "/profile/" + d.kind + "/" + d.id + "/#" + anchor.anchor)
        .append("span")
        .text(anchor.title)
        .on("click", function(){ d3.event.stopPropagation(); })
    })
  }
  xtra.append("p").attr("class", "parents")
  
  // set profile link
  profile.append("a").attr("href", "/profile/" + d.kind + "/" + d.id + "/").html("View Profile &raquo;")
}

search.btnProfile = function(d) {
  var search_item = d3.select(this).attr("href", function(d){ 
                      return "/profile/" + d.kind + "/" + d.id + "/"; 
                    });
  search_item.append("h2").text(d.display);
  search_item.append("p").attr("class", "subtitle").text(function(d){
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
  var search_item = d3.select(this.parentNode);
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
  
  d3.selectAll(".search-refine div").classed("no-results", true);
  d3.selectAll(".search-refine li a").classed("no-results", true);
  
  d3.selectAll(".num_res").text("0")
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
var attrStyles = {

  "nationality": {
    "foreign": "#7c90d8",
    "us": "#69b9a7"
  },

  "sex": {

    "men": "#b8ccf5",
    "male": "#b8ccf5",
    "1": "#b8ccf5",

    "women": "#fdc8b8",
    "female": "#fdc8b8",
    "2": "#fdc8b8"

  },

  "sector": {
    "0": "#e8ea94",
    "1": "#ef6145",
    "2": "#6d8a50",
    "3": "#004994",
    "4": "#e88577",
    "5": "#9ccd73",
    "6": "#86abeb",
    "7": "#f29888",
    "8": "#e0ffbf",
    "9": "#cfedff"
  },

  "race": {

    "1": "#ef6145",
    "white": "#ef6145",

    "2": "#386f8e",
    "black": "#386f8e",

    "3": "#418277",
    "3": "#418277",

    "4": "#6d8a50",
    "4": "#6d8a50",

    "5": "#808019",
    "native": "#808019",

    "6": "#004994",
    "asian": "#004994",

    "7": "#2a8ec9",
    "hawaiian": "#2a8ec9",

    "8": "#c5c5c5",
    "other": "#c5c5c5",
    "unknown": "#c5c5c5",

    "9": "#888888",
    "multi": "#888888",
    "2ormore": "#888888",

    "hispanic": "#e3d1db",
    "latino": "#e3d1db"

  },

  "skill": "parent",
  "parent": {
    "Complex Problem Solving": "#cea1ba",
    "Resource Management Skills": "#5ea1c7",
    "System Skills": "#386f8e",
    "Basic Skills": "#e8ea94",
    "Systems Skills": "#9ccd73",
    "Social Skills": "#e88577"
  },

  "student_pool": {
    "Degrees Awarded": "#9ccd73",
    "Workforce": "#004994"
  },

  // SOC coloring
  "soc": "great_grandparent",
  "great_grandparent": {
    "110000-290000": "#ef6145",
    "310000-390000": "#beede7",
    "410000-430000": "#e8ea94",
    "450000-490000": "#006947",
    "510000-530000": "#2a8ec9",
    "550000": "#6d8a50"
  },

  "acs_occ_2": {
    "00": "#ef6145",
    "01": "#beede7",
    "02": "#e8ea94",
    "03": "#006947",
    "04": "#2a8ec9"
  },

  // NAICS coloring
  "naics": "grandparent",
  "grandparent": {
    "11-21": "#006947",
    "23": "#54541f",
    "31-33": "#004035",
    "42": "#b8ccf5",
    "44-45": "#82bab1",
    "48-49, 22": "#2a8ec9",
    "51": "#9ccd73",
    "52-53": "#0c9a6e",
    "54-56": "#e8ea94",
    "61-62": "#cc3e54",
    "71-72": "#ef6145",
    "81": "#beede7",
    "92": "#7d93ff",
    "928110": "#6d8a50"
  },

  "acs_ind_2": {
    "00": "#006947",
    "01": "#54541f",
    "02": "#004035",
    "03": "#b8ccf5",
    "04": "#82bab1",
    "05": "#2a8ec9",
    "06": "#9ccd73",
    "07": "#0c9a6e",
    "08": "#e8ea94",
    "09": "#cc3e54",
    "10": "#ef6145",
    "11": "#beede7",
    "12": "#7d93ff"
  },

  "cip_2": {
    "01": "#006947",
    "03": "#004035",
    "04": "#3b4d2a",
    "05": "#b8ccf5",
    "09": "#b6debf",
    "10": "#e0ffbf",
    "11": "#9ccd73",
    "12": "#beede7",
    "13": "#cc3e54",
    "14": "#386f8e",
    "15": "#5ea1c7",
    "16": "#d18979",
    "19": "#fdc8b8",
    "22": "#0c9a6e",
    "23": "#f29888",
    "24": "#ef6145",
    "25": "#b8ba5e",
    "26": "#992e3f",
    "27": "#cea1ba",
    "29": "#6d8a50",
    "30": "#c5c5c5",
    "31": "#9dd1eb",
    "38": "#0f2e4d",
    "39": "#374b98",
    "40": "#5ea1c7",
    "41": "#5ab7ed",
    "42": "#0d5275",
    "43": "#808019",
    "44": "#7d93ff",
    "45": "#8ad4ff",
    "46": "#54541f",
    "47": "#112aa8",
    "48": "#2c49d8",
    "49": "#2a8ec9",
    "50": "#e88577",
    "51": "#cc3e54",
    "52": "#e8ea94",
    "54": "#99572e"
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
        "family": "Roboto",
        "size": 14,
        "weight": 700,
        "transform": "uppercase",
        "spacing": 1
      },
      "sec": {
        "color": "#6F6F6F",
        "family": "Roboto",
        "size": 14,
        "weight": 700,
        "transform": "uppercase",
        "spacing": 1
      }
    },
    "discrete": {
      "pri": {
        "color": "#6F6F6F",
        "family": "Roboto",
        "size": 14,
        "weight": 700,
        "transform": "uppercase",
        "spacing": 1
      },
      "sec": {
        "color": "#6F6F6F",
        "family": "Roboto",
        "size": 14,
        "weight": 700,
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
      "family": "Roboto",
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
          "family": "lato",
          "size": 12,
          "weight": 700
        },
        "size": 10
      },
      "sec": {
        "color": "#ccc",
        "font": {
          "color": "#a8a8a8",
          "family": "lato",
          "size": 12,
          "weight": 700
        },
        "size": 10
      }
    },
    "discrete": {
      "pri": {
        "color": "#ccc",
        "font": {
          "color": "#211f1a",
          "family": "Roboto",
          "size": 12,
          "weight": 400
        },
        "size": 10
      },
      "sec": {
        "color": "#ccc",
        "font": {
          "color": "#211f1a",
          "family": "Roboto",
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

  "default": {
    "pri": "#006ea8",
    "sec": "#71bbe2"
  },
  "geo": {
    "pri": "#B5D2C8",
    "sec": "#B5B5B5"
  },
  "cip": {
    "pri": "#CEB6BA",
    "sec": "#C5C5C5"
  },
  "soc": {
    "pri": "#799DD3",
    "sec": "#C5C5C5"
  },
  "naics": {
    "pri": "#CFD4A4",
    "sec": "#C5C5C5"
  },

  "tooltip": {
    "background": "white",
    "font": {
      "color": "#888",
      "family": "Roboto",
      "size": 16,
      "weight": 300
    }
  },

  "ui": {
    "border": 1,
    "color": {
      "primary": "#fff",
      "secondary": "#6F6F6F"
    },
    "font": {
      "color": "#888",
      "family": "Roboto",
      "size": 12,
      "transform": "none",
      "weight": 300
    }
  },

  "background": "transparent",
  "color": {
    "missing": "#efefef",
    // "heatmap": ["#71bbe2", "#006ea8", "#dc5137"],
    "heatmap": ["#374b98", "#84D3B6", "#E8EA94", "#e88577", "#992E3F"],
    "primary": "#aaa", // used for coloring edge connections in Sankey
    "range": ["#374b98", "#84D3B6", "#E8EA94", "#e88577", "#992E3F"]
  },
  "edges": {
    "color": "#d0d0d0"
  },
  "labels": {
    "font": {
      "family": "Roboto",
      "size": 12
    }
  },
  "legend": {
    "font": {
      "color": "#211f1a",
      "family": "lato",
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
      "family": "Playfair Display",
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
  }

}

var viz = function(build) {

  if (!build.colors) build.colors = vizStyles.defaults;

  delete build.config.height;

  build.viz = d3plus.viz()
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
  else if (build.config.color in attrStyles) {
    var attrs = build.attrs.map(function(a){
      var t = a.type;
      if (t in attrStyles && attrStyles[t].constructor === String) {
        return attrStyles[t];
      }
      return t;
    });
    build.color = build.config.color;
    if (attrs.indexOf(build.color) >= 0) {
      build.config.color = "color";
    }
    else {
      build.config.color = function(d) {
        if (!(d[build.color] in attrStyles[build.color])) {
          console.warn("Missing color for \"" + d[build.color] + "\"");
        }
        return attrStyles[build.color][d[build.color]];
      };
    }
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
      "persist": {
        "position": true
      },
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

    var range = proportions.indexOf(key) >= 0 && key !== "pct_total" ? [0, 1] : false;

    var key = axis.length === 1 ? "pri" : "sec",
        style = axis === discrete ? "discrete" : "default";

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
      "number": function(number, params) {

        var prefix = "";

        if (params.key) {

          if (params.key.indexOf("_moe") > 0) {
            prefix = "<span class='plus-minus'>±</span> ";
            params.key = params.key.replace("_moe", "");
          }

          if (params.key == "emp_thousands") {
            number = number * 1000;
          }
          else if (params.key == "value_millions") {
            number = number * 1000000;
          }
          else if (params.key == "output") {
            number = number * 1000000000;
          }

          if (params.key.indexOf("y2_") === 0) {
            params.key = params.key.slice(3);
          }

          if (proportions.indexOf(params.key) >= 0 || percentages.indexOf(params.key) >= 0) {
            if (proportions.indexOf(params.key) >= 0) number = number * 100;
            return prefix + d3plus.number.format(number, params) + "%";
          }
          else {
            number = d3plus.number.format(number, params);
            if (params.key in affixes) {
              var a = affixes[params.key];
              number = a[0] + number + a[1];
            }
            return prefix + number;
          }

        }

        return prefix + d3plus.number.format(number, params);

      },
      "text": function(text, params) {

        if (text.indexOf("_moe") > 0) {
          return "&nbsp;&nbsp;&nbsp;&nbsp;Margin of Error";
        }
        else if (text.indexOf("_rank") > 0) {
          return "Rank";
        }

        if (text.indexOf("y2_") === 0) {
          text = text.slice(3);
        }

        if (text === "bucket") {
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

          // Format buckets
          if (params.key === "bucket") {

            var key = false;

            if (text.indexOf("_") > 0) {
              text = text.split("_");
              key = text.shift();
              text = text.join("_");
            }

            if (key === false) {
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

          var attrs = build.viz ? build.viz.attrs() : false;
          if (attrs && text in attrs) {
            return d3plus.string.title(attrs[text].name, params);
          }

          if (attr_ids.indexOf(params.key) >= 0) return text.toUpperCase();

        }

        return d3plus.string.title(text, params);

      }
    },
    "height": {
      "small": 10
    },
    "labels": {
      "font": vizStyles.labels.font
    },
    "legend": {
      "font": vizStyles.legend.font,
      "labels": false
    },
    "messages": {
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

viz.loadAttrs = function(build) {
  var next = "loadData";

  build.viz.error("Loading Attributes").draw();

  if (build.attrs.length) {
    var loaded = 0, attrs = {};
    for (var i = 0; i < build.attrs.length; i++) {
      load(build.attrs[i].url, function(data, url){
        var a = build.attrs.filter(function(a){ return a.url === url; })[0];
        a.data = data;
        var color = a.type;
        if (a.type in attrStyles && attrStyles[a.type].constructor === String) {
          color = attrStyles[color];
        }
        var colorize = build.config.color == color && build.config.color in attrStyles ? attrStyles[build.config.color] : false;
        for (var i = 0; i < data.length; i++) {
          var d = data[i];
          if (colorize) {
            if (build.config.color in d) {
              d.color = colorize[d[build.config.color]];
            }
            else if (d.id in colorize) {
              d.color = colorize[d.id];
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

                 load(url, function(data){
                   d3.select(this.parentNode).classed("loading", false)
                   d3.select(this).html(data.value);
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
            var urls = d3.select(this.parentNode).attr("data-urls").split("|"),
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
      var top = window.scrollY, height = window.innerHeight;
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
                if (k === build.config.color && k in attrStyles) {
                  datum.color = attrStyles[k][datum[k]];
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
                textFormat = format.text.value,
                numFormat = format.number.value;

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
