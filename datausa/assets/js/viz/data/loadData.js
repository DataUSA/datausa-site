var attrNesting = {
  "acs_ind": [2, 4, 6],
  "acs_occ": [2, 4, 6, 8, 10],
  "cip": [2, 4, 6]
};

// var attrMapping = {
//   "degree": {
//     "20": "3",
//     "21": "5",
//     "22": "7",
//     "23": "18",
//     "24": "17"
//   }
// }

viz.formatData = function(data, d, build) {

  // if (d.params.show in attrMapping) {
  //   var show = d.params.show, map = attrMapping[show];
  //   if (return_data.source.dataset.indexOf("PUMS") >= 0) {
  //     for (var i = 0; i < data.length; i++) {
  //       data[i][show] = map[data[i][show]];
  //     }
  //   }
  //
  // }

  if (d.join) {
    for (var i = 0; i < data.length; i++) {
      for (var k in data[i]) {
        var key = k.split(".").pop();
        if (key !== "year") data[i][key] = data[i][k];
        delete data[i][k];
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
    var shareData = data.reduce(function(obj, s) {
      if (!obj[s.year]) obj[s.year] = [];
      obj[s.year].push(s);
      return obj;
    }, {});
    for (var year in shareData) {
      if (share_id) {
        shareData[year] = d3plus.util.uniques(shareData[year], share_id).reduce(function(obj, id){
          obj[id] = d3.sum(shareData[year], function(dat){
            return dat[share_id] === id ? dat[share] : 0;
          });
          return obj;
        }, {});
      }
      else {
        shareData[year] = d3.sum(shareData[year], function(dat){ return dat[share]; });
      }
    }
    if (share_id) {
      for (var i = 0; i < data.length; i++) {
        data[i].share = data[i][share]/shareData[data[i].year][data[i][share_id]] * 100;
      }
    }
    else {
      for (var i = 0; i < data.length; i++) {
        data[i].share = data[i][share]/shareData[data[i].year] * 100;
      }
    }
  }

  for (var i = 0; i < build.attrs.length; i++) {
    var type = build.attrs[i].type,
        nesting = attrNesting[type],
        attr_key = attrStyles[type + "_key"];

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
    else if (build.config.type === "sankey") {

      var attrs = build.viz.attrs();
      for (var ii = 0; ii < data.length; ii++) {
        var datum = data[ii];
        type = "use" in datum ? "use" : "make";
        datum.icon = attrs[datum[type]].icon;
      }

    }
    else if (build.config.id instanceof Array) {

      nesting = build.config.id;
      type = nesting[nesting.length - 1];
      var attrs = build.viz.attrs();
      for (var ii = 0; ii < data.length; ii++) {
        var datum = data[ii];
        for (var iii = 0; iii < nesting.length; iii++) {
          var id = nesting[iii];
          if (attrs[datum[type]] && attrs[datum[type]][id]) {
            var a = attrs[datum[type]];
            datum[id] = a[id];
            datum.icon = a.icon;
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

  return data;

}

viz.loadData = function(build, next) {
  if (!next) next = "finish";

  if (build.viz.data().length === 0) build.viz.error("Loading Data").draw();

  build.sources = [];

  if (build.data.length) {
    var loaded = 0, dataArray = [];
    for (var i = 0; i < build.data.length; i++) {
      load(build.data[i].url, function(data, url, return_data){

        if (build.compare && return_data.subs) {
          for (var type in return_data.subs) {
            var show = new RegExp("&" + type + "=([%a-zA-Z0-9]*)").exec(url);
            var subIndex = show[1].split("%2C").indexOf(build.compare);
            if (subIndex >= 0) build.compare = return_data.subs[type].split(",")[subIndex];
          }
        }

        var d = build.data.filter(function(d){ return d.url === url; })[0];

        d.data = viz.formatData(data, d, build);
        d.source = return_data.source;
        build.sources.push(return_data.source);
        d.subs = return_data.subs || {};
        dataArray = dataArray.concat(d.data);
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
