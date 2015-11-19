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

            var headerKeys = d3.keys(dataArray[0]);

            var headers = table.select("thead > tr").selectAll("th")
              .data(headerKeys);
            headers.enter().append("th");
            headers.text(function(d){
              return d;
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
              cols.text(function(d){
                return d;
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
