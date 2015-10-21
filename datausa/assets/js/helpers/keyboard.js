window.onload = function() {

  d3.select("body").on("keyup.site", function(){

    // Site key events when search is closed
    if (!d3.select("#advSearch").classed("active") && document.activeElement.tagName.toLowerCase() !== "input") {

      // Press "s" for search
      if (d3.event.keyCode === 83) {
        advSearch.open();
      }

    }
    else {

      if (d3.event.keyCode === 27) {
        advSearch.close();
      }

    }

  });

  // Key events while the advSearch input is active
  var searchInterval = "", keywait = 300;
  d3.select("#advSearch-input").on("keyup.advSearch-input", function(){

    // ESC to close advSearch
    if (d3.event.keyCode === 27) {
      advSearch.close();
    }
    else {

      var q = this.value.toLowerCase();
      if (q !== advSearch.search) {
        clearInterval(searchInterval);
        advSearch.search = q;

        if (advSearch.length) {
          searchInterval = setTimeout(function(){
            advSearch.reload();
            clearInterval(searchInterval);
          }, keywait);
        }
        else {
          advSearch.reload();
        }
      }

    }

  });

}
