viz.defaults = function(build) {
  return {
    "format": {
      "text": function(text, params) {

        if (dictionary[text]) return dictionary[text];

        if (params.key) {

        }

        return d3plus.string.title(text, params);

      }
    },
    "height": {
      "small": 100
    }
  }
}
