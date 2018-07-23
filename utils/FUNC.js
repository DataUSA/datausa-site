/**

  @name FUNC
  @desc Similar to the JSON.parse and JSON.stringify methods, these functions
  convert functions to and from object representations of themselves:
  @example object representation: {vars: ["d", "i"], logic: "return d.x * i;"}

*/

const {isObject} = require("d3plus-common"),
      {trim} = require("d3plus-text"),
      buble = require("buble"),
      libs = require("./libs");

module.exports = {
  objectify,
  parse
};

function objectify(obj) {
  if (obj.vars && obj.logic) return obj;
  for (const key in obj) {
    if (typeof obj[key] === "function") {
      obj[key] = func2obj(obj[key]);
    }
    else if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map(d => {
        if (typeof d === "function") return func2obj(d);
        else if (isObject(d) && !obj.vars && !obj.logic) return objectify(d);
        return d;
      });
    }
    else if (isObject(obj[key])) objectify(obj[key]);
  }
  return obj;
}

function func2obj(func) {

  let s = buble.transform(`${func}`).code;
  if (s.startsWith("!")) s = s.slice(1);

  const vars = s
    .replace(/function[\sA-z]*\(([A-z0-9\s\,]*)\)[\s\S]*/g, "$1")
    .split(",")
    .map(trim);
  const logic = s
    .replace(/function[\sA-z]*\([A-z0-9\s\,]*\)[\s]*\{([\s\S]*)\}$/g, "$1");

  return {vars, logic};

}

function parse(config, formatters = {}) {

  const globals = {
    formatters,
    libs
  };

  function parseFunction(obj) {
    return Function("globals", ...obj.vars, `with (globals) { ${obj.logic} }`)
      .bind(globals, globals);
  }

  function makeFunctions(obj) {
    if (obj.vars && obj.logic) {
      return parseFunction(obj);
    }
    else {
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          obj[key] = obj[key].map(d => {
            if (isObject(d)) return makeFunctions(d);
            return d;
          });
        }
        else if (isObject(obj[key])) obj[key] = makeFunctions(obj[key]);
      }
      return obj;
    }
  }

  return makeFunctions(config);

}
