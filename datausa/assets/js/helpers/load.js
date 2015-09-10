var load = function(url, callback) {

  if (url) {

    d3.json(url, function(data) {
      data = data.data.map(function(d){
        return d.reduce(function(obj, v, i){
          obj[data.headers[i]] = v;
          return obj;
        }, {});
      })
      callback(data);
    });

  }
  else {
    callback([]);
  }

}
