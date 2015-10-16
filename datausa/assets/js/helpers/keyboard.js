window.onload = function() {

  d3.select("body").on("keyup.site", function(){

    // Site key events when search is closed
    if (!d3.select("#selector").classed("active") && document.activeElement.tagName.toLowerCase() !== "input") {

      // Press "s" for search
      if (d3.event.keyCode === 83) {
        selector.open();
      }

    }
    else {

      if (d3.event.keyCode === 27) {
        selector.close();
      }

    }

  });

  // Key events while the selector input is active
  var searchInterval = "", keywait = 300;
  d3.select("#selector-input").on("keyup.selector-input", function(){

    // ESC to close selector
    if (d3.event.keyCode === 27) {
      selector.close();
    }
    else {

      var q = this.value.toLowerCase();
      if (q !== selector.search) {
        clearInterval(searchInterval);
        selector.search = q;

        if (selector.length) {
          searchInterval = setTimeout(function(){
            selector.reload();
            clearInterval(searchInterval);
          }, keywait);
        }
        else {
          selector.reload();
        }
      }

    }

  });

}
