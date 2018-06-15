const libs = require("./libs");

/* Given an object, a hashtable of formatting functions, and a lookup object full of variables
 * Replace every instance of {{var}} with its true value from the lookup object, and
 * apply the appropriate formatter
 * TODO: maybe make this recursive in the future, crawling down the object?
*/

module.exports = (sourceString, formatterFunctions, variables) => {  
  // Find all instances of the following type:  FormatterName{{VarToReplace}}
  sourceString = sourceString.replace(/([A-z0-9]*)\{\{([^\}]+)\}\}/g, (match, g1, keyMatch) => {

    // Get the function from the hash table using the lookup key FormatterName (or no-op if not found)
    let formatter = d => d;
    if (g1) {
      const formatTitle = g1.replace(/^\w/g, chr => chr.toLowerCase());
      if (formatTitle in formatterFunctions) formatter = formatterFunctions[formatTitle];
    }

    const value = variables[keyMatch];
    if (value === undefined) return "N/A";
    else return formatter(value, libs, formatterFunctions);

  });
  return sourceString;
};
