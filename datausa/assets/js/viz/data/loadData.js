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
