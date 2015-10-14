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

      if (url.indexOf("attrs/") > 0) {

        localforage.getItem(url, function(error, data) {

          if (data) {
            callback(load.datafold(data), url, data.source);
          }
          else {
            d3.json(url, function(error, data){
              localforage.setItem(url, data);
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
          callback(load.datafold(data), url, data.source);
        });
      }

    }

  });

}

load.strings = [
  "sector"
];

load.datafold = function(data) {
  if (data.data && data.headers) {
    return data.data.map(function(d){
      return d.reduce(function(obj, v, i){
        var h = data.headers[i]
        obj[h] = load.strings.indexOf(h) >= 0 ? v + "" : v;
        return obj;
      }, {});
    })
  }
  else {
    return data;
  }
}
