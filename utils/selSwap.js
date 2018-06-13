const libs = require("./libs");

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
