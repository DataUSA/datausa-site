var load = function(url, callback) {

  localforage.getItem("cache_version", function(error, c){
    if (c !== cache_version) {
      localforage.getItem("cart", function(error, cart) {
        localforage.clear(function() {
          localforage.setItem("cart", cart, function() {
            localforage.setItem("cache_version", cache_version, loadUrl);
          });
        });
      });
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
                data = JSON.parse(LZString.decompressFromUTF16(data));
                load.callbacks(url, data);
              }
              else {
                d3.json(url, function(error, json){
                  load.rawData(error, json, url);
                });
              }

            });

          }
          else {
            d3.json(url, function(error, data){
              if (error) console.log(error);
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
  return (url.indexOf("/attrs") > 0 && url.indexOf("/search") < 0) || url.indexOf("/topojson") > 0;
}

load.rawData = function(error, data, url) {
  if (error) {
    console.log(error);
    console.log(url);
    data = {"headers": [], "data": []};
  }
  if (load.storeLocal(url)) {
    var zip = LZString.compressToUTF16(JSON.stringify(data));
    localforage.setItem(url, zip);
  }
  // load.cache[url] = data;
  load.callbacks(url, data);
}
