const libs = require("./libs");

module.exports = (sourceObj, selectors) => {
  const obj = Object.assign({}, sourceObj);
  for (const skey in obj) {
    if (obj.hasOwnProperty(skey) && typeof obj[skey] === "string") {
      for (let i = 0; i < selectors.length; i++) {
        if (i === 0) {
          obj[skey] = obj[skey].replace(/\[\[select\]\]/g, selectors[i]);  
          obj[skey] = obj[skey].replace(/\[\[select1\]\]/g, selectors[i]);  
        }
        else {
          const re = new RegExp(`\\[\\[select${i + 1}\\]\\]`, "g");
          obj[skey] = obj[skey].replace(re, selectors[i]);   
        }
      } 
    }
  }
  return obj;
};
