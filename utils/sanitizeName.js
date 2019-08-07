/** sanitizes a name for search matching */
module.exports = function(str) {
  return str.toLowerCase()
    .replace(/[^a-zA-Z0-9 -]/g, "")
    .replace(/\s\s+/g, " ");
};
