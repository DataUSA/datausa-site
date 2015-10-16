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
        obj[data.headers[i]] = v;
        return obj;
      }, {});
    })
  }
  else {
    return data;
  }
}
