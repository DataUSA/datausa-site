viz.mapDraw = function(vars) {

  var hiddenTopo = ["04000US69", "04000US66", "04000US60", "04000US78", "05000US60050", "05000US60010", "05000US60020", "05000US66010", "05000US69100", "05000US69110", "05000US69120", "05000US69085", "79500US6600100"];
  var us_bounds = [[-0.6061309513487787,-0.9938707206384574],[0.40254429811306913,-0.44220355964829655]];

  var fullscreen = d3.select("#map-filters").size(),
      cartodb = fullscreen ? vizStyles.tiles_map : vizStyles.tiles_viz,
      defaultRotate = vars.id && vars.id.value === "birthplace" ? [0, 0] : [90, 0],
      defaultZoom = vars.id && vars.id.value === "birthplace" ? 1 : 0.95,
      ocean = cartodb === "light_all" ? "#cdd1d3" : "#242426",
      pathOpacity = 0.75,
      pathStroke = 1,
      polyZoom = 20000,
      scaleAlign = "middle",
      scaleHeight = 10,
      scalePadding = 10,
      strokeOpacity = 0.35,
      timing = 600,
      zoomFactor = 2;

  var scaleText = {
    "fill": vizStyles.legend.font.color,
    "font-family": vizStyles.legend.font.family,
    "font-size": vizStyles.legend.font.size,
    "font-weight": vizStyles.legend.font.weight,
    "stroke": "transparent"
  }

  var borderColor = function(c) {
    // return "transparent";
    if (c === vizStyles.color.missing) return "#b9b9b9";
    return d3.rgb(c).darker(0.5);
    return d3plus.color.legible(c);
  }

  var elementSize = function(element, s) {

    if (element.tagName === undefined || ["BODY","HTML"].indexOf(element.tagName) >= 0) {

      var val  = window["inner"+s.charAt(0).toUpperCase()+s.slice(1)];
      var elem = document !== element ? d3.select(element) : false;

      if (elem) {
        if (s === "width") {
          val -= parseFloat(elem.style("margin-left"), 10);
          val -= parseFloat(elem.style("margin-right"), 10);
          val -= parseFloat(elem.style("padding-left"), 10);
          val -= parseFloat(elem.style("padding-right"), 10);
        }
        else {
          val -= parseFloat(elem.style("margin-top"), 10);
          val -= parseFloat(elem.style("margin-bottom"), 10);
          val -= parseFloat(elem.style("padding-top"), 10);
          val -= parseFloat(elem.style("padding-bottom"), 10);
        }
      }
      vars[s].value = val;
    }
    else {
      val = parseFloat(d3.select(element).style(s), 10);
      if (typeof val === "number" && val > 0) {
        vars[s].value = val;
      }
      else if (element.tagName !== "BODY") {
        elementSize(element.parentNode, s);
      }
    }
  }

  vars.container.value
    .style("position", function() {
      var current = d3.select(this).style("position");
      var remain  = ["absolute","fixed"].indexOf(current) >= 0;
      return remain ? current : "relative"
    });

  // detect size on first draw
  if (!vars.width.value) elementSize(vars.container.value.node(), "width");
  if (!vars.height.value) elementSize(vars.container.value.node(), "height");

  var width = vars.width.value,
      height = vars.height.value,
      center = [width/2, height/2];

  vars.container.value
    .style("width", width + "px")
    .style("height", height + "px");

  var svg = vars.container.value.selectAll("svg").data([0]);
  svg.enter().append("svg")

  svg
    .attr("width", width)
    .attr("height", height);

  var coords = vars.coords.value;
  if (coords && vars.coords.key) {

    var projectionType = "mercator";
    if (vars.coords.key === "states" && location.href.indexOf("/map/") < 0) {
      projectionType = "albersUsaPr";
      vars.tiles.value = false;
    }

    if (vars.tiles.value) {

      svg.style("background-color", vars.messages.background)
        .transition().duration(timing)
        .style("background-color", ocean);

      var attribution = vars.container.value.selectAll(".attribution").data([0]);

      var attr_text =  "";
      if (vars.zoom.value) {
        attr_text += "Hold <b>SHIFT</b> for box zoom<br />";
      }
      attr_text += "Map tiles by <a target='_blank' href='http://cartodb.com/attributions'>CartoDB</a>";

      attribution.enter().append("div")
        .attr("class", "attribution")
        .html(attr_text)
        // .html('&copy; <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a target="_blank" href="http://cartodb.com/attributions">CartoDB</a>')

    }

    var tileGroup = svg.selectAll("g.tiles").data([0]);
    tileGroup.enter().append("g").attr("class", "tiles")
      .attr("opacity", 0).transition().duration(timing).attr("opacity", 1);

    var polyGroup = svg.selectAll("g.paths").data([0]);
    polyGroup.enter().append("g").attr("class", "paths")
      .attr("opacity", 0).transition().duration(timing).attr("opacity", 1);

    var pinGroup = svg.selectAll("g.pins").data([0]);
    pinGroup.enter().append("g").attr("class", "pins")
      .attr("opacity", 0).transition().duration(timing).attr("opacity", 1);

    var brushGroup = svg.selectAll("g.brush").data([0]);
    brushGroup.enter().append("g").attr("class", "brush");

    var xBrush = d3.scale.identity().domain([0, width]),
        yBrush = d3.scale.identity().domain([0, height]);

    function brushended(e) {
      if (!d3.event.sourceEvent) return;

      var extent = brush.extent();
      brushGroup.call(brush.clear());

      var zs = zoom.scale(), zt = zoom.translate();

      var pos1 = extent[0].map(function(p, i){return (p - zt[i])/(zs/polyZoom); })
      var pos2 = extent[1].map(function(p, i){return (p - zt[i])/(zs/polyZoom); })

      zoomToBounds([pos1, pos2]);

    }

    var brush = d3.svg.brush()
      .x(xBrush)
      .y(yBrush)
      .on("brushend", brushended);

    if (vars.zoom.value) brushGroup.call(brush);

    var data_range = d3plus.util.uniques(vars.data.filtered, vars.color.value).filter(function(d){
      return d !== null && typeof d === "number";
    });

    if (data_range.length > 1) {

      var color_range = vizStyles.color.heatmap;
      if (!(color_range instanceof Array)) color_range = makeColorArray(color_range);

      function lighter(color, number) {
        var c = d3plus.color.lighter(color, number);
        c = d3.hsl(c);
        c.s += 0.3 * number;
        if (c.s > 1) c.s = 1;
        return c.toString();
      }

      function darker(color, number) {
        var c = d3.rgb(color).darker(number).hsl();
        c.s += 0.5 * number;
        if (c.s > 1) c.s = 1;
        return c.toString();
      }

      function makeColorArray(color) {
        return [
          lighter(color, 0.9),
          lighter(color, 0.75),
          lighter(color, 0.6),
          lighter(color, 0.45),
          lighter(color, 0.30),
          lighter(color, 0.15),
          color,
          darker(color, 2),
          // d3.rgb(color).darker(0.75).toString()
        ];
      }

      var badIndicators = [
        "income_below_poverty:pop_poverty_status",
        "unemployment",
        "children_in_poverty",

        "uninsured",
        "uninsured_adults",
        "uninsured_children",
        "could_not_see_doctor_due_to_cost",

        "adult_obesity",
        "diabetes",
        "sexually_transmitted_infections",
        "hiv_prevalence_rate",
        "alcoholimpaired_driving_deaths",
        "excessive_drinking",
        "adult_smoking",
        "homicide_rate",
        "violent_crime",
        "motor_vehicle_crash_deaths",

        "premature_death",
        "poor_or_fair_health",
        "poor_physical_health_days",
        "poor_mental_health_days",
        "low_birthweight",
        "food_environment_index",
        "physical_inactivity",
        "access_to_exercise_opportunities",
        "teen_births",
        "social_associations",
        "injury_deaths",
        "polution_ppm",
        "drinking_water_violations",
        "premature_ageadjusted_mortality",
        "infant_mortality",
        "child_mortality",
        "food_insecurity",
        "limited_access_to_healthy_foods",
        "drug_overdose_deaths",
        "children_eligible_for_free_lunch",

        "severe_housing_problems"
      ];

      if (badIndicators.indexOf(vars.color.value) >= 0) color_range = makeColorArray("#CA3434");
      else {
        for (var attr in attrStyles) {
          var match = false;
          for (var key in attrStyles[attr]) {
            var re = new RegExp("_" + key + "$", "g");
            if (vars.color.value.match(re)) {
              match = attrStyles[attr][key].color;
              break;
            }
          }
          if (match) {
            color_range = makeColorArray(match);
            break;
          }
        }
      }

      var jenksData = vars.data.filtered
        .filter(function(d){ return d[vars.color.value] !== null && typeof d[vars.color.value] === "number"; })
        .map(function(d) { return d[vars.color.value]; });

      if (jenksData.length < color_range.length) {
        var step = (jenksData.length - 1) / (color_range.length - 1);
        var ts = d3.scale.linear()
          .domain(d3.range(0, jenksData.length + step, step))
          .interpolate(d3.interpolateHsl)
          .range(color_range);

        color_range = jenksData.map(function(d, i) { return ts(i);});
      }

      var jenks = ss.ckmeans(jenksData, color_range.length);
      jenks = d3.merge(jenks.map(function(c, i) { return i === jenks.length - 1 ? [c[0], c[c.length - 1]] : [c[0]]; }));
      var colorScale = d3.scale.threshold()
        .domain(jenks)
        .range(["black"].concat(color_range).concat(color_range[color_range.length - 1]));

    }
    else if (data_range.length) {
      var colorScale = function(d){ return color_range[color_range.length - 1]; }
    }
    else {
      var colorScale = false;
    }

    var dataMap = vars.data.filtered.reduce(function(obj, d){
      obj[d[vars.id.value]] = d;
      return obj;
    }, {});

    var scale = svg.selectAll("g.scale").data(colorScale && colorScale.domain ? [0] : []);
    scale.exit().transition().duration(600).attr("opacity", 0).remove();
    var scaleEnter = scale.enter().append("g")
      .attr("class", "scale")
      .attr("opacity", 0);

    if (colorScale && colorScale.domain) {

      var values = colorScale.domain(),
          colors = color_range;

      var keyPadding = 10;
      var key_width = d3.min([width - keyPadding * 8, 800]);

      var xScale = d3.scale.linear()
        .domain(d3.extent(values))
        .range([0, key_width]);

      var smallLast = xScale(values[values.length - 1]) - xScale(values[values.length - 2]) < 2;

      var key_offset = width / 2 - key_width / 2;

      var background = scale.selectAll("rect.d3plus_legend_background")
        .data([0]);
      var backgroundEnter = background.enter().append("rect")
        .attr("class", "d3plus_legend_background")
        .attr("fill", "white")
        .attr("fill-opacity", 0.75)
        .attr("stroke", "#999")
        .attr("stroke-width", 1)
        .attr("x", key_offset - keyPadding * 3)
        .attr("y", -keyPadding);

      var heatmap = scale.selectAll("rect.d3plus_legend_break")
        .data(colors);

      function breakStyle(b) {
        b
          .attr("height", scaleHeight)
          .attr("fill", String)
          .attr("stroke", scaleText.fill)
          .attr("stroke-width", 1)
          .attr("y", 0);
      }

      heatmap.enter().append("rect")
        .attr("class", "d3plus_legend_break")
        .attr("x", width / 2)
        .attr("width", 0)
        .attr("fill-opacity", pathOpacity)
        .call(breakStyle);

      heatmap.transition().duration(timing)
        .attr("x", function(d, i) {
          return (key_offset) + xScale(values[i]);
        })
        .attr("width", function(d, i) {
          return xScale(values[i + 1]) - xScale(values[i]) + (smallLast && i === colors.length - 1 ? 3 : 0);
        })
        .call(breakStyle);

      var text = scale.selectAll("text.d3plus_tick")
        .data(values);

      var textHeight = scaleText["font-size"];

      function textY(d, i) {
        return textHeight + scalePadding * 0.5 + scaleHeight + (i % 2 ? textHeight : 0);
      }

      text.enter().append("text")
        .attr("class","d3plus_tick")
        .attr("x",function(d){
          if (scaleAlign === "middle") return Math.floor(key_width/2);
          else if (scaleAlign === "end") return key_width;
          else return 0;
        })
        .attr("dx", key_offset)
        .attr("y", textY)
        .style("text-anchor", "middle");

      text
        .order()
        .attr(scaleText)
        .text(function(d){
          return vars.format.number(d, {"key": vars.color.value, "vars": vars, output: "x"});
        })
        .attr("y", textY)
        .transition().duration(timing)
          .attr("x", xScale)
          .attr("dx", key_offset)
          .attr("opacity", function(d, i) { return smallLast && i === values.length - 1 ? 0 : 1; });

      text.exit().transition().duration(timing)
        .attr("opacity", 0)
        .remove();

      var tick = scale.selectAll("line.d3plus_tick")
        .data(values);

      function tickStyle(t) {
        t
          .attr("y1", scalePadding)
          .attr("y2", function(d, i){
            return scalePadding * 0.75 + scaleHeight + (i % 2 ? textHeight : 0);
          })
          .attr("stroke", scaleText.fill)
          .attr("stroke-width", 1)
      }

      tick.enter().append("line")
        .attr("class","d3plus_tick")
        .attr("x1",function(d){
          if (scaleAlign === "middle") return key_offset + Math.floor(key_width/2);
          else if (scaleAlign === "end") return key_offset + key_width;
          else return key_offset;
        })
        .attr("x2",function(d){
          if (scaleAlign === "middle") return key_offset + Math.floor(key_width/2);
          else if (scaleAlign === "end") return key_offset + key_width;
          else return key_offset;
        })
        .attr("opacity", 0)
        .call(tickStyle);

      tick
        .order()
        .transition().duration(timing)
          .attr("x1", function(d) { return key_offset + xScale(d); })
          .attr("x2", function(d) { return key_offset + xScale(d); })
          .attr("opacity", function(d, i) { return smallLast && i === values.length - 1 ? 0 : 1; })
          .call(tickStyle);

      tick.exit().transition().duration(timing)
        .attr("opacity", 0)
        .remove();

      var key_box = scale.node().getBBox(),
          key_height = key_box.height;

      var yearHeight = d3.select(".year-toggle");
      if (yearHeight.size()) yearHeight = parseFloat(yearHeight.style("height")) + 5;
      else yearHeight = 0;
      // key_height += attribution.node().offsetHeight;
      key_height += scalePadding;

      if (backgroundEnter.size()) key_height += yearHeight + scalePadding * 2;

      backgroundEnter
        .attr("width", key_width + keyPadding * 6)
        .attr("height", key_height - keyPadding)

      background.transition().duration(timing)
        .attr("width", key_width + keyPadding * 6)

      scaleEnter
        .attr("transform" , "translate(0, " + (height - key_height + keyPadding) + ")");
      scale.transition().duration(timing)
        .attr("transform" , "translate(0, " + (height - key_height + keyPadding) + ")")
        .attr("opacity", 1);

      key_height += scalePadding;

    }
    else {
      key_height = 0;
    }
    var thumb = d3.select(vars.container.value.node().parentNode).classed("thumbprint");
    var pinData = [];
    var coordTopo = d3plus.util.copy(coords.objects[vars.coords.key]);
    coordTopo.geometries = coordTopo.geometries.filter(function(c){
      if (vars.pins.value.indexOf(c.id) >= 0) pinData.push(c);
      if (hiddenTopo.indexOf(c.id) >= 0) return false;
      if (!thumb && vars.coords.key !== "states" && c.id.indexOf("040") === 0) return false;
      return vars.coords.solo.length ? vars.coords.solo.indexOf(c.id) >= 0 :
             vars.coords.mute.length ? vars.coords.mute.indexOf(c.id) < 0 : true;
    })
    var coordData = topojson.feature(coords, coordTopo);

    if (!vars.zoom.set) {

      vars.zoom.projection = d3.geo[projectionType]()
        .scale((1 * polyZoom) / 2 / Math.PI)
        .translate([0, 0]);

      if (projectionType === "mercator") vars.zoom.projection.rotate(defaultRotate);

    }

    var projection = vars.zoom.projection;

    var path = d3.geo.path()
      .projection(projection);

    var showUS = projectionType === "mercator" && vars.id.value === "geo" && !vars.coords.solo.length;

    var coordBounds = path.bounds(coordData),
        b = showUS ? us_bounds : coordBounds,
        s = defaultZoom / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / (height - key_height)),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2 - key_height/2];

    var minZoom = defaultZoom / Math.max((coordBounds[1][0] - coordBounds[0][0]) / width, (coordBounds[1][1] - coordBounds[0][1]) / (height - key_height));

    // Update the projection to use computed scale & translate.
    if (!vars.zoom.set) {

      // projection.scale(s).translate(t);
      var zs = s;
      if (!(projectionType === "mercator" && vars.id.value === "geo" && !vars.coords.solo.length)) {
        zs = (s/Math.PI/2) * polyZoom;
      }
      zs = zs * 2 * Math.PI;

      var ds = zs, dt = t;
      var params = window.location.search;
      if (params.indexOf("translate") > 0) {
        dt = /translate=([0-9-.,]+)/g.exec(params)[1].split(",").map(Number);
        ds = parseFloat(/scale=([0-9-.]+)/g.exec(params)[1]);
      }

      vars.zoom.behavior = d3.behavior.zoom()
        .scale(ds)
        .scaleExtent([1 << 9, 1 << 25])
        .translate(dt)
        .on("zoom", zoomed)
        .on("zoomend", zoomEnd);

      // With the center computed, now adjust the projection such that
      // it uses the zoom behavior’s translate and scale.
      // projection.scale((1 * polyZoom) / 2 / Math.PI);

    }

    var zoom = vars.zoom.behavior;

    pinData = pinData.map(function(d){ return path.centroid(topojson.feature(coords, d)); });

    if (vars.zoom.value) {

      var controls = vars.container.value.selectAll(".map-controls").data([0]);
      var controls_enter = controls.enter().append("div")
        .attr("class", "map-controls");

      function zoomMath(factor) {

        var scale = zoom.scale(),
            extent = zoom.scaleExtent(),
            translate = zoom.translate(),
            x = translate[0], y = translate[1],
            target_scale = scale * factor;

        // If we're already at an extent, done
        if (target_scale === extent[0] || target_scale === extent[1]) { return false; }

        // If the factor is too much, scale it down to reach the extent exactly
        var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale));
        if (clamped_target_scale != target_scale){
            target_scale = clamped_target_scale;
            factor = target_scale / scale;
        }

        // Center each vector, stretch, then put back
        x = (x - center[0]) * factor + center[0];
        y = (y - center[1]) * factor + center[1];

        zoom.scale(target_scale).translate([x, y]);
        zoomed(timing);
        setTimeout(zoomEnd, timing);
      }

      controls_enter.append("div").attr("class", "zoom-in").on(d3plus.client.pointer.click, function(){
        zoomMath(zoomFactor);
      });

      controls_enter.append("div").attr("class", "zoom-out").on(d3plus.client.pointer.click, function(){
        zoomMath(1/zoomFactor);
      });

      controls_enter.append("div").attr("class", "zoom-reset");
      controls.select(".zoom-reset").on(d3plus.client.pointer.click, function(){
        d3plus.tooltip.remove("geo_map_sidebar");
        vars.highlight.value = false;
        vars.highlight.path = undefined;
        zoomLogic();
      });

    }

    var polyStyle = function(p) {
      p
        .attr("fill", function(d) {
          var dat = dataMap[d.id];
          var val = dat && vars.color.value in dat ? dat[vars.color.value] : null;
          d.color = colorScale && val !== null && typeof val === "number" ? colorScale(val) : vizStyles.color.missing;
          return d.color;
        })
        .attr("fill-opacity", pathOpacity)
        .attr("stroke-width", pathStroke/(zoom.scale()/polyZoom))
        .attr("stroke-opacity", strokeOpacity)
        .attr("stroke", function(d){
          return borderColor(d.color);
        });
    }

    var polys = polyGroup.selectAll("path")
      .data(coordData.features, function(d){
        if (vars.highlight.value === d.id) {
          if (vars.mouse.value && d.id.slice(0, 3) !== "140") createTooltip(d, true);
          vars.highlight.path = d;
        }
        return d.id;
      });

    polys.exit().remove();

    polys.enter().append("path")
      .attr("d", path)
      // .attr("vector-effect", "non-scaling-stroke")
      .attr("class", function(d){
        var o = {};
        o[vars.id.value] = d.id;
        var c = vars.class.value ? vars.class.value(o, vars) : "";
        return "d3plus_coordinates " + c;
      })
      .attr("id", function(d){
        return d.id;
      })
      .call(polyStyle);

    function createTooltip(d, big) {

      var dat = dataMap[d.id];

      var id = big ? "geo_map_sidebar" : "geo_map";

      if (big) {
        if (fullscreen) {
          var x = 0,
              y = d3.select("#map-filters").node().offsetHeight + d3.select("#top-nav").node().offsetHeight + 15,
              mh = window.innerHeight - y - 15 - d3.select("#map-subs").node().offsetHeight;
          if (d3plus.client.ie) mh -= 35;
        }
        else {
          var margin = 0,
              x = window.innerWidth - margin - vizStyles.tooltip.small/2,
              y = margin,
              mh = vars.height.value;
        }
      }
      else {
        var mouse = d3.mouse(d3.select("html").node()),
            x = mouse[0], y = mouse[1],
            mh = undefined;
      }
      var tooltip_data = [];

      var tooltip_data = vars.tooltip.value.reduce(function(arr, t){
        if (dat && t in dat && dat[t] !== null && dat[t] !== undefined) {
          arr.push({
            "group": "",
            "name": vars.format.text(t, {}),
            "value": vars.format.value(dat[t], {"key": t}),
            "highlight": t === vars.color.value
          });
        }
        return arr;
      }, []);
      var link_id = vars.attrs.value[d.id] ? vars.attrs.value[d.id].url_name : d.id;
      var html = " ", link = "/profile/geo/" + link_id + "/";
      if (d.id && big && vars.tooltip.url) {
        html = "<div class='d3plus_tooltip_html_seperator'></div>";
        // html = "<a class='btn pri-btn' href='" + link + "'>View Profile</a>";
        if (big.constructor === String) {
          html += big;
        }
        else {
          html += "<div class='loader'><i class='fa fa-circle-o-notch fa-spin'></i>Loading Data</div>";
        }
      }
      else if (d.id === void 0) {
        var length = vars.data.filtered.length,
            tdata = vars.data.filtered.filter(function(d){
              return d[vars.color.value] !== void 0 && d[vars.color.value] !== null;
            });
        if (tdata.length > 20) {
          var top = tdata.slice(0, 10).map(function(c, i){
            var n = vars.attrs.value[c.geo] ? vars.attrs.value[c.geo].display_name || vars.attrs.value[c.geo].name : c.geo;
            return "<tr><td class='list-rank'>" + (i + 1) + ".</td><td class='list-name' id='id" + c.geo + "'>" + n + "</td><td class='list-value'>" + vars.format.number(c[vars.color.value], {"key": vars.color.value, "vars": vars}) + "</td></tr>";
          }).join("");
          var bottom = tdata.slice().reverse().slice(0, 10).reverse().map(function(c, i){
            var n = vars.attrs.value[c.geo] ? vars.attrs.value[c.geo].display_name || vars.attrs.value[c.geo].name : c.geo;
            return "<tr><td class='list-rank'>" + ((length - 9) + i) + ".</td><td class='list-name' id='id" + c.geo + "'>" + n + "</td><td class='list-value'>" + vars.format.number(c[vars.color.value], {"key": vars.color.value, "vars": vars}) + "</td></tr>";
          }).join("");
          var html = "<div class='list-title'>Top 10 Locations</div><table>" + top + "</table><div class='list-title'>Bottom 10 Locations</div><table>" + bottom + "</table>";
        }
        else {
          var html = tdata.map(function(c, i){
            var n = vars.attrs.value[c.geo] ? vars.attrs.value[c.geo].display_name || vars.attrs.value[c.geo].name : c.geo;
            return "<tr><td class='list-rank'>" + (i + 1) + ".</td><td class='list-name' id='id" + c.geo + "'>" + n + "</td><td class='list-value'>" + vars.format.number(c[vars.color.value], {"key": vars.color.value, "vars": vars}) + "</td></tr>";
          }).join("");
          html = "<div class='list-title'>Location Ranking</div><table>" + html + "</table>";
        }
      }

      var tooltip_obj = {
        "align": !big ? "top center" : "bottom center",
        "arrow": big ? false : true,
        "background": vizStyles.tooltip.background,
        "color": big ? false : d.color,
        "data": tooltip_data,
        "description": big && d.id ? "Last selected geography" : tooltip_data.length || d.id === void 0 ? false : vars.tooltip.value.length ? "No Data Available" : false,
        "fontcolor": vizStyles.tooltip.font.color,
        "fontfamily": vizStyles.tooltip.font.family,
        "fontsize": vizStyles.tooltip.font.size,
        "fontweight": vizStyles.tooltip.font.weight,
        "footer": big ? false : !vars.zoom.value ? "Click to View Profile" : tooltip_data.length ? d.id === vars.highlight.value ? "Click to Recenter Map" : "Click for More Info" : "Click to Zoom In",
        "html": html,
        "id": id,
        "js": big && d.id ? function(elem) {
          elem.select(".d3plus_tooltip_title").on(d3plus.client.pointer.click, function(){
            window.location = link;
          });
        } : big ? function(elem) {
          elem.selectAll(".list-name").on(d3plus.client.pointer.click, function(){
            vars.zoom.reset = true;
            vars.self.highlight(this.id.slice(2)).draw();
            zoomEnd();
          });
        } : false,
        "max_height": mh,
        "max_width": vizStyles.tooltip.small,
        "mouseevents": big ? true : false,
        "offset": big ? 0 : 3,
        "parent": big && !fullscreen ? vars.container.value : big ? d3.select("#map-tooltip") : d3.select("body"),
        "title": d.id ? vars.format.text(d.id, {"key": vars.id.value, "vars": vars}, {"viz": vars.self}) : undefined,
        "width": vizStyles.tooltip.small,
        "x": x,
        "y": y
      };

      d3plus.tooltip.remove(id);
      d3plus.tooltip.create(tooltip_obj);

      if (d.id && big === true && vars.tooltip.url) {
        var url = vars.tooltip.url;
        var prefix = d.id.slice(0, 3)
        if (prefix == "040") {
          url += "&where=geo:^" + d.id.replace("040", "050");
        }
        else {
          url += "&geo=" + d.id;
        }
        load(url, function(data) {

          if (data.length > 20) {
            var top = data.slice(0, 10).map(function(c, i){
              var n = vars.attrs.value[c.geo].display_name || vars.attrs.value[c.geo].name;
              return "<tr><td class='list-rank'>" + (i + 1) + ".</td><td class='list-name' id='id" + c.geo + "'>" + n + "</td><td class='list-value'>" + vars.format.number(c[vars.color.value], {"key": vars.color.value, "vars": vars}) + "</td></tr>";
            }).join("");
            var bottom = data.slice().reverse().slice(0, 10).reverse().map(function(c, i){
              var n = vars.attrs.value[c.geo].display_name || vars.attrs.value[c.geo].name;
              return "<tr><td class='list-rank'>" + ((data.length - 9) + i) + ".</td><td class='list-name' id='id" + c.geo + "'>" + n + "</td><td class='list-value'>" + vars.format.number(c[vars.color.value], {"key": vars.color.value, "vars": vars}) + "</td></tr>";
            }).join("");
            var html = "<div class='list-title'>Top 10 Locations</div><table>" + top + "</table><div class='list-title'>Bottom 10 Locations</div><table>" + bottom + "</table>";
          }
          else {
            var html = data.map(function(c, i){
              var n = vars.attrs.value[c.geo].display_name || vars.attrs.value[c.geo].name;
              return "<tr><td class='list-rank'>" + (i + 1) + ".</td><td class='list-name' id='id" + c.geo + "'>" + n + "</td><td class='list-value'>" + vars.format.number(c[vars.color.value], {"key": vars.color.value, "vars": vars}) + "</td></tr>";
            }).join("");
            html = "<div class='list-title'>County Ranking</div><table>" + html + "</table>";
          }

          createTooltip(d, html);
        });
      }

    }

    if (vars.mouse.value) {

      var drag = true;

      polys
        .on("mouseover", function(d){
          if (vars.zoom.brush) {
            d3plus.tooltip.remove("geo_map");
          }
          else {
            if (!d3plus.client.ie) this.parentNode.appendChild(this);
            d3.select(this).attr("stroke-opacity", 1).style("cursor", "pointer");
            createTooltip(d);
          }
        })
        .on(d3plus.client.pointer.move, function(d){
          drag = d3.event.buttons ? true : false;
          if (drag) vars.zoom.reset = false;
          if (vars.zoom.brush) {
            d3plus.tooltip.remove("geo_map");
          }
          else {
            if (!d3plus.client.ie) this.parentNode.appendChild(this);
            d3.select(this).attr("stroke-opacity", 1).style("cursor", "pointer");
            createTooltip(d);
          }
        })
        .on("mouseout", function(d){
          d3.select(this).attr("stroke-opacity", strokeOpacity);
          d3plus.tooltip.remove("geo_map");
        })
        .on(d3plus.client.pointer.click, function(d){
          if (!vars.zoom.value) {
            var link_id = vars.attrs.value[d.id] ? vars.attrs.value[d.id].url_name : d.id;
            window.location = "/profile/geo/" + link_id + "/";
          }
          else if (drag) {
            drag = false;
          }
          else if (vars.highlight.value === d.id) {
            d3plus.tooltip.remove("geo_map_sidebar");
            vars.highlight.value = false;
            vars.highlight.path = undefined;
            zoomLogic();
          }
          else {
            vars.highlight.value = d.id;
            vars.highlight.path = d;
            d3.select(this).attr("fill-opacity", pathOpacity);
            d3plus.tooltip.remove("geo_map");
            zoomLogic(d);
            var dat = dataMap[d.id];
            if (d.id.slice(0, 3) !== "140" && dat) createTooltip(d, true);
            else d3plus.tooltip.remove("geo_map_sidebar");
          }
        });

    }

    if (vars.zoom.reset) {
      polys.call(polyStyle);
    }
    else {
      polys
        .transition().duration(timing)
        .call(polyStyle);
    }

    var pins = pinGroup.selectAll(".pin").data(pinData);
    pins.enter().append("path")
      .attr("class", "pin")
      .attr("vector-effect", "non-scaling-stroke")
      .attr("stroke-width", 1)
      .attr("d", vizStyles.pin.path)
      .attr("fill", vizStyles.pin.color)
      .attr("stroke", vizStyles.pin.stroke);

    if (vars.tiles.value) {
      var tile = d3.geo.tile()
        .overflow([true, false]);
    }

    if (vars.zoom.value) {
      zoomEvents();
    }

    if ((!vars.zoom.set || vars.color.changed) && fullscreen) createTooltip({}, true);

    if (!vars.zoom.set) {
      zoomed();
      vars.zoom.set = true;
    }
    else if (vars.zoom.reset) {
      zoomLogic(vars.highlight.path);
    }
    else if (fullscreen) createTooltip({}, true);

  }

  function zoomEvents() {
    if (vars.zoom.brush) {
      brushGroup.style("display", "inline");
      svg.on(".zoom", null);
    }
    else if (vars.zoom.value) {
      brushGroup.style("display", "none");
      svg.call(zoom);
      if (!vars.zoom.scroll) {
        svg
          .on("mousewheel.zoom", null)
          .on("MozMousePixelScroll.zoom", null)
          .on("wheel.zoom", null);
      }
      if (!vars.zoom.pan) {
        svg
          .on("mousedown.zoom", null)
          .on("mousemove.zoom", null)
          .on("touchstart.zoom", null)
          .on("touchmove.zoom", null);
      }
    }
  }

  function zoomLogic(d) {

    vars.zoom.reset = true;

    var mod = 0;
    if (d) {
      var bounds = path.bounds(d);
      mod = fullscreen || d.id.slice(0, 3) === "140" ? 0 : 250;
      zoomToBounds(bounds, mod);
    }
    else {
      if (fullscreen) createTooltip({}, true);
      var ns = s;
      if (!(projectionType === "mercator" && vars.id.value === "geo" && !vars.coords.solo.length)) {
        ns = (ns/Math.PI/2) * polyZoom;
      }
      zoom.scale(ns * 2 * Math.PI).translate(t);
      zoomed(timing);
      setTimeout(zoomEnd, timing);
    }

  }

  function zoomToBounds(b, mod) {

    if (mod === void 0) {
      mod = fullscreen || !vars.highlight.path || vars.highlight.path.id.slice(0, 3) === "140" ? 0 : 250;
    }

    var w = width - mod;

    var ns = defaultZoom / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / (height - key_height)),
        nt = [(w - ns * (b[1][0] + b[0][0])) / 2, (height - ns * (b[1][1] + b[0][1])) / 2 - key_height/2];

    ns = (ns/Math.PI/2) * polyZoom;

    zoom.scale(ns * 2 * Math.PI).translate(nt);
    zoomed(timing);
    setTimeout(zoomEnd, timing);

  }

  function zoomEnd() {

    if (fullscreen && history.pushState) {

      var trans = zoom.translate(),
          s = zoom.scale();

      var params = window.location.search;
      if (params.indexOf("translate") > 0) params = params.split("&translate")[0];
      var urlPath = "/map/" + params + "&translate=" + trans.join(",") + "&scale=" + s;
      window.history.pushState({"path": urlPath}, '', urlPath);

    }

  }

  function zoomed(zoomtiming) {

    if (d3.event && !vars.zoom.pan) {
      vars.zoom.pan = true;
      zoomEvents();
    }

    var trans = zoom.translate(),
        s = zoom.scale();

    var pz = s / polyZoom;

    if (pz < minZoom) {
      pz = minZoom;
      s = pz * polyZoom;
      zoom.scale(s);
    }

    if (!showUS) {

      var nh = height - key_height;
      var bh = coordBounds[1][1] - coordBounds[0][1];
      var bw = coordBounds[1][0] - coordBounds[0][0];
      var xoffset = (width - (bw * pz)) / 2;
      var xmin = xoffset > 0 ? xoffset : 0;
      var xmax = xoffset > 0 ? width - xoffset : width;
      var yoffset = (nh - (bh * pz)) / 2;
      var ymin = yoffset > 0 ? yoffset : 0;
      var ymax = yoffset > 0 ? nh - yoffset : nh;

      if (trans[0] + coordBounds[0][0] * pz > xmin) {
        trans[0] = -coordBounds[0][0] * pz + xmin
      }
      else if (trans[0] + coordBounds[1][0] * pz < xmax) {
        trans[0] = xmax - (coordBounds[1][0] * pz)
      }

      if (trans[1] + coordBounds[0][1] * pz > ymin) {
        trans[1] = -coordBounds[0][1] * pz + ymin
      }
      else if (trans[1] + coordBounds[1][1] * pz < ymax) {
        trans[1] = ymax - (coordBounds[1][1] * pz)
      }

    }

    zoom.translate(trans);

    if (vars.tiles.value) {
      var d = projection(defaultRotate)[0] - projection([0, 0])[0];
      var tileTrans = trans.slice();
      tileTrans[0] += (d/polyZoom) * s;
      var tileData = tile
        .size([width, height])
        .scale(s)
        .translate(tileTrans)
        ();
    }
    else {
      var tileData = [];
    }

    polyGroup.attr("transform", "translate(" + trans + ")scale(" + pz + ")")
      .selectAll("path").attr("stroke-width", pathStroke/pz);
    pinGroup.attr("transform", "translate(" + trans + ")scale(" + pz + ")")
      .selectAll(".pin")
      .attr("transform", function(d){
        return "translate(" + d + ")scale(" + (1/pz*vizStyles.pin.scale) + ")";
      });

    if (vars.tiles.value) {
      tileGroup.attr("transform", "scale(" + tileData.scale + ")translate(" + tileData.translate + ")");
    }

    var tilePaths = tileGroup.selectAll("image.tile")
        .data(tileData, function(d) { return d; });

    tilePaths.exit().remove();

    tilePaths.enter().append("image")
      .attr("xlink:href", function(d) {
        var x = d[0] % tileData.width;
        if (x < 0) x += tileData.width;
        return "https://cartodb-basemaps-" + ["a", "b", "c", "d"][Math.random() * 3 | 0] + ".global.ssl.fastly.net/" + cartodb + "/" + d[2] + "/" + x + "/" + d[1] + ".png";
      })
      .attr("width", 1)
      .attr("height", 1)
      .attr("x", function(d) { return d[0]; })
      .attr("y", function(d) { return d[1]; });

  }

  d3.select("body")
    .on("keydown.map", function() {
      if (d3.event.keyCode === 16) {
        vars.zoom.brush = true;
        zoomEvents();
      }
    })
    .on("keyup.map", function() {
      if (d3.event.keyCode === 16) {
        vars.zoom.brush = false;
        zoomEvents();
      }
    });

  return vars.self;

}
