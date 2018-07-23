const selSwap = require("./selSwap");
const varSwap = require("./varSwap");

/* Given an object, a hashtable of formatting functions, and a lookup object full of variables
 * Replace every instance of {{var}} with its true value from the lookup object, and
 * apply the appropriate formatter
*/

const varSwapRecursive = (sourceObj, formatterFunctions, variables, query = {}, selectors = []) => {
  const allowed = obj => variables[obj.allowed] || obj.allowed === null || obj.allowed === undefined || obj.allowed === "always";
  const obj = Object.assign({}, sourceObj);
  // If I'm a topic and have selectors, extract and prep them for use
  if (obj.selectors) {
    selectors = obj.selectors.map(s => {
      const selector = {};
      if (s.options.map(s => s.option).includes(query[s.name])) {
        selector[s.name] = query[s.name];
        return selector;
      }
      else {
        selector[s.name] = varSwap(s.default, formatterFunctions, variables);
        return selector;
      }
    });
  }
  for (const skey in obj) {
    if (obj.hasOwnProperty(skey)) {
      // If this property is a string, replace all the vars
      if (typeof obj[skey] === "string") {
        // First, do a selector replace of the pattern [[Selector]]
        obj[skey] = selSwap(obj[skey], selectors);
        // Replace all instances of the following pattern:  FormatterName{{VarToReplace}}
        obj[skey] = varSwap(obj[skey], formatterFunctions, variables);
      }
      // If this property is an array, recursively swap all elements
      else if (Array.isArray(obj[skey])) {
        obj[skey] = obj[skey].filter(allowed).map(o => varSwapRecursive(o, formatterFunctions, variables, query, selectors));
      }
      // If this property is an object, recursively do another swap
      else if (typeof obj[skey] === "object" && obj[skey] !== null) {
        obj[skey] = varSwapRecursive(obj[skey], formatterFunctions, variables, query, selectors);
      }
    }
  }
  return obj;
};

module.exports = varSwapRecursive;
