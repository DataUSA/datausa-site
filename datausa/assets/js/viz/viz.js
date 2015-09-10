var viz = function(build, container) {
  console.log(build);
  var app = d3plus.viz()
    .container(d3.select(container))
    .id([build.color, build.attr_type])
    .depth(1)
    .color(build.color)
    .size(build.size)
    .text("name")
    .type(build.type);

  load(build.attr_url, function(attrs){
    attrs.forEach(function(a){
      a[build.attr_type] = a.id;
    })
    app.attrs(attrs);

    load(build.data_url, function(data){
      app.data(data).draw();
      // console.log(attrs[0], data[0])
    })

  })

}
