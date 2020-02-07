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
    if (value === undefined) {
      return "N/A";
    }
    // The user-created formatter may be malformed. Wrap in a try/catch so bad js in a
    // formatter doesn't cause the CMS to crash.
    else {
      try {
        return formatter(value, libs, formatterFunctions);
      }
      catch (e) {
        console.error(`Error using formatter ${formatter.name}`);
        console.error(`Error message: ${e.message}`);
        return "N/A";
      }
    }

  });
  return sourceString;
};
