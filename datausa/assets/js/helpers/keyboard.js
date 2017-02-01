window.onload = function() {

  d3.select("body").on("keyup.site", function(){

    // Site key events when not in an input box
    if (document.activeElement.tagName.toLowerCase() !== "input") {

      // Press "s" to highlight most recent search
      if (d3.event.keyCode === 83) {
        if(d3.select("body").classed("home")){
          d3.select("#search-home").classed("open", true);
          var search_input = d3.select("#home-search-input");
          search_input.node().focus();
          search.container = d3.select("#search-" + search_input.attr("data-search"));
          search.data = true;
          search.reload();
        }
        else {
          d3.select(".search-box").classed("open", true);
          var search_input = d3.select("#nav-search-input");
          search.data = false;
          search_input.node().focus();
        //   d3.select("#search-simple-nav").classed("open", true);
        //   search_input.node().focus();
        //   if(search_input.property("value") !== ""){
        //     // d3.select(".search-box").classed("open", true);
        //   }
        //   d3.select(".search-box").classed("open", true);
        }
      }

    }
    else {

    }

    // "ESC" button
    if (d3.event.keyCode === 27) {
      // close all search results
      d3.selectAll(".search-body").classed("open", false);
      d3.selectAll(".search-input").each(function(){ this.blur(); });
      d3.select(".search-box").classed("open", false);
      d3.select("#search-simple-nav").classed("open", false)
    }

  });

  // Key events while the search input is active
  var searchInterval, keywait = 300;
  d3.selectAll(".search-input").on("keyup.search-input", function(){

    // "ESC" button
    if (d3.event.keyCode === 27) {
      d3.select(".search-box").classed("open", false);
      d3.select("#search-simple-nav").classed("open", false);
      d3.select(".search-box input").node().blur();
    }

    // Enter button
    if (d3.event.keyCode === 13) {
      var curr_el = d3.select(this).select("a.search-item:focus").node() || d3.select("a.search-item").node();
      if(curr_el) {
        window.location = d3.select(curr_el).attr("href");
      }
      // var search_txt = d3.select(this).property("value");
      // window.location = "/search/?q="+encodeURIComponent(search_txt);
    }

    var q = this.value.toLowerCase();

    if(this.id == "nav-search-input"){
      if(q === "") {
        // d3.select("#search-simple-nav").style("display", "none")
        d3.select("#search-simple-nav").classed("open", false)
        return;
      }
      else {
        // d3.select("#search-simple-nav").style("display", "block")
        d3.select("#search-simple-nav").classed("open", true)
      }
    }

    // only execute search if it's a character not ctl, alt, arrows eventCategory
    var non_alpha_keys = [37, 38, 39, 40]
    if (d3.event.which !== 0 && String.fromCharCode(d3.event.keyCode) !== "" && non_alpha_keys.indexOf(d3.event.keyCode) < 0) {
      if (q !== search.term) {
        clearInterval(searchInterval);
        search.term = q;
        search.container = d3.select("#search-" + d3.select(this).attr("data-search"));

        if (q.length) {
          searchInterval = setTimeout(function(){
            search.reload();
            clearInterval(searchInterval);
          }, keywait);
        }
        else {
          search.reload();
        }
      }
    }

  });

  d3.selectAll(".search-input, .search-results").on("keyup.search-results", function(){
    d3.event.preventDefault();

    // Up/Down Arrows
    if (d3.event.keyCode === 40 || d3.event.keyCode === 38) {
      d3.event.preventDefault();
      var up = d3.event.keyCode === 38;

      // get current active element
      var curr_el = d3.select(this).select("a.search-item:focus").node();
      if(curr_el){
        var next_el = up ? curr_el.previousSibling : curr_el.nextSibling;
        if(!next_el){
          if(up){
            d3.select(this.parentNode.parentNode).select('input').node().focus();
          }
          else {
            next_el = document.querySelectorAll("a.search-item")[0];
          }
        }
      }
      else if(!up){
        var next_el = document.querySelectorAll(".search-item")[0];
      }

      if(next_el) {
        d3.select(next_el)
          .on("focus", function(){
            d3.select("body").style("overflow", "hidden");
          })
          .on("blur", function(){
            d3.select("body").style("overflow", null);
          })
        next_el.focus();
      }


      return false;
    }

    // Enter
    // if (d3.event.keyCode === 13) {
    //   var curr_el = d3.select(this).select("a.search-item:focus").node() || document.querySelectorAll("a.search-item")[0];
    //   console.log(curr_el)
    //   if(!curr_el){
    //     // var search_txt = d3.select(this).property("value");
    //     // window.location = "/search/?q="+encodeURIComponent(search_txt);
    //   }
    // }

  });

  d3.selectAll(".search-results").on("keydown.search-results", function(){
    // Up/Down Arrows
    if (d3.event.keyCode === 40 || d3.event.keyCode === 38) {
      d3.event.preventDefault();
      return false;
    }
  });


  d3.selectAll("[data-ga]").on("click.ga", function(){

    var _this = d3.select(this);
    var action = _this.attr("data-ga") || "click";
    var category = _this.attr("data-ga-cat") || "general";
    var label = _this.attr("data-ga-label") || "n/a";
    var target = _this.attr("data-ga-target") || false;
    var send = true;

    if(target){
      var parent = this.parentNode;
      if (action == "show data") {
        parent = parent.parentNode;
      }
      target = d3.select(parent).select(target);
      send = target.classed("visible") || target.classed("open");
    }

    if (send) {

      // console.log("GA, action: ", action, "category: ", category, "label: ", label)

      ga('send', {
        hitType: 'event',
        eventCategory: category,
        eventAction: action,
        eventLabel: label
      });

    }

  })

}
