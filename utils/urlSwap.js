module.exports = function(url, params) {

  (url.match(/<[^\&\=\/>]+>/g) || []).forEach(variable => {
    let x = variable.slice(1, -1).split(".");
    if (params[x[0]]) x = x.reduce((o, i) => o[i], params);
    else x = false;
    if (x && typeof x !== "object") url = url.replace(variable, x);
  });

  return url;

};
