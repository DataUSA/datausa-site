const {CANON_LOGICLAYER_CUBE} = process.env;

const env = {
  CANON_LOGICLAYER_CUBE
};

module.exports = function(url, params) {

  const lookup = Object.assign(env, params);

  (url.match(/<[^\&\=\/>]+>/g) || []).forEach(variable => {
    let x = variable.slice(1, -1).split(".");
    if (lookup[x[0]]) x = x.reduce((o, i) => o[i], lookup);
    else x = false;
    if (x && typeof x !== "object") url = url.replace(variable, x);
  });

  return url;

};
