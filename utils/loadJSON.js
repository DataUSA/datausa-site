const fs = require("fs"),
      path = require("path");

module.exports = function(filename) {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), filename), "utf8"));
};
