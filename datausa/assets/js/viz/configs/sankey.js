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
