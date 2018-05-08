const {Client} = require("mondrian-rest-client");
const {CUBE_URL} = process.env;

module.exports = function() {
  return new Client(CUBE_URL);
};
