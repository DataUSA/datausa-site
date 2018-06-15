const libs = require("./libs");

/* Given an object and an array of selectors of the format 
 * {name: ThingToReplace, option: ThingToReplaceItWith}
 * Replace every instance of [[name]] with its option. Note that this means whoever calls
 * this function must already know which option has been selected from a list of possible options.
 * TODO: maybe make this recursive in the future, crawling down the object?
*/

module.exports = (sourceObj, selectors) => {
  const obj = Object.assign({}, sourceObj);
  for (const skey in obj) {
    if (obj.hasOwnProperty(skey) && typeof obj[skey] === "string") {
      selectors.map(selector => {
        const re = new RegExp(`\\[\\[${selector.name}\\]\\]`, "g");
        obj[skey] = obj[skey].replace(re, selector.option);
      });
    }
  }
  return obj;
};
