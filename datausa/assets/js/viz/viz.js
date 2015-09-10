var viz = function(build, container) {
  console.log(build);

  var nesting;
  if (build.attr_type !== "age") {
    nesting = [build.attr_type];
    if (build.color) {
      nesting.shift(build.color);
    }
  }
  else {
    nesting = ["cip"]
  }

  var app = d3plus.viz()
    .container(d3.select(container))
    .id(nesting)
    .depth(nesting.length - 1)
    // .color(build.color)
    // .size(build.size)
    .x(build.x)
    .y(build.y)
    // .y({"scale": "discrete"})
    .text("name")
    .tooltip(build.tooltip)
    .order(build.order)
    .order({"sort": "asc"})
    .shape({"interpolate": "monotone"})
    .type(build.type);

  load(build.attr_url, function(attrs){

    if (attrs.length) {
      attrs.forEach(function(a){
        a[build.attr_type] = a.id;
      })
      app.attrs(attrs);
    }
    console.log(build.data_url);
    load(build.data_url, function(data){
      app.data(data).draw();
      console.log(data)
      // console.log(attrs[0], data[0])
    })

  })

  return app;

}
