const libs = require("./libs");

module.exports = (varInnerName, varOuterValue, logic, formatterFunctions) => {
  let vars = {};
  // Because logic is arbitrary javascript, it may be malformed. We need to wrap the
  // entire execution in a try/catch.
  try {
    if (varOuterValue) {
      eval(`
        let f = (${varInnerName}, libs, formatters) => {${logic}};
        vars = f(varOuterValue, libs, formatterFunctions);
      `);
      // A successfully run eval will return the vars generated
      return {vars, error: null};
    }
    else {
      // If varOuterValue was null, then the API that gave it to us was incorrect
      return {vars, error: "Invalid API Link"};
    }
  }
  catch (e) {
    // An unsuccessfully run eval returns the error
    return {vars, error: e.message};
  }
};
