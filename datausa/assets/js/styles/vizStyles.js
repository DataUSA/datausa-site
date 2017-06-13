var vizStyles = {

  top: "#1A3E61", // top 5 bars
  bottom: "#58879A", // bottom 5 bars

  default: {
    pri: "#ef6145",
    sec: "#C6C7CA",
    compare: "#ff976c"
  },
  geo: {
    pri: "#ef6145",
    sec: "#C6C7CA",
    compare: "#ff976c"
  },
  cip: {
    pri: "#ef6145",
    sec: "#C6C7CA",
    compare: "#ff976c"
  },
  soc: {
    pri: "#ef6145",
    sec: "#C6C7CA",
    compare: "#ff976c"
  },
  naics: {
    pri: "#ef6145",
    sec: "#C6C7CA",
    compare: "#ff976c"
  },

  // pri: "#ef6145",
  // sec: "#C6C7CA",
  compare: "#ff976c",

  "tooltip": {
    "background": "white",
    "font": {
      "color": "#888",
      "family": "Palanquin",
      "size": 18,
      "weight": 300
    },
    "small": 250
  },

  "ui": {
    "border": 1,
    "color": {
      "primary": "white",
      "secondary": "#ccc"
    },
    "font": {
      "color": "#1B191D",
      "family": "Palanquin",
      "size": 12,
      "transform": "none",
      "weight": 300,
      "secondary": {
        "color": "#949494",
        "family": "Palanquin",
        "size": 12,
        "transform": "none",
        "weight": 300
      }
    }
  },

  "ui_map": {
    "border": 1,
    "color": {
      "primary": "white",
      "secondary": "#ccc"
    },
    "font": {
      "color": "#1B191D",
      "family": "Palanquin",
      "size": 12,
      "transform": "none",
      "weight": 300,
      "secondary": {
        "color": "#949494",
        "family": "Palanquin",
        "size": 12,
        "transform": "none",
        "weight": 300
      }
    }
  },

  "background": "transparent",
  "color": {
    "missing": "#efefef",
    // "heatmap": ['#273b98', '#abd9e9', '#E8EA94', '#fdae61', '#992E3F'],
    // "heatmap": ['#CEF0DE','#41b6c4','#2c7fb8','#253494'],
    // "heatmap": ['#f0f9e8','#CEF0DE','#7bccc4','#43a2ca','#0868ac'],
    // "heatmap": ['#eff3ff','#c6dbef','#9ecae1','#6baed6','#3182bd','#08519c'],
    // "heatmap": ['#eff3ff','#c6dbef','#9ecae1','#6baed6','#3182bd','#004994'],
    "heatmap": "#3182bd",
    "primary": "#aaa"
  },
  "edges": {
    "color": "#d0d0d0"
  },
  "labels": {
    "font": {
      // add keys for any visualization type you want to overwrite
      "default": {
        "family": "Pathway Gothic One",
        "size": 13
      },
      "tree_map": {
        "family": "Pathway Gothic One",
        "size": 13
      }
    }
  },
  "legend": {
    "font": {
      "color": "#444",
      "family": "Palanquin",
      "size": 12,
      "weight": 400
    }
  },
  "lines": {
    "interpolation": "linear",
    "stroke-width": 3
  },
  "messages": {
    "font": {
      "color": "#888",
      "family": "Palanquin",
      "size": 16,
      "weight": 300
    }
  },
  "sankey": {
    "padding": 5,
    "width": 150
  },
  "shapes": {
    "padding": 0,
    "stroke": {
      "width": 1
    }
  },

  "pin": {
    // "color": "#F33535",
    "color": "transparent",
    "stroke": "#d5614d",
    "path": "M0.001-53.997c-9.94,0-18,8.058-18,17.998l0,0l0,0c0,2.766,0.773,5.726,1.888,8.066C-13.074-20.4,0.496,0,0.496,0s12.651-20.446,15.593-27.964v-0.061l0.021,0.005c-0.007,0.019-0.016,0.038-0.021,0.056c0.319-0.643,0.603-1.306,0.846-1.985c0.001-0.003,0.003-0.006,0.004-0.009c0.001-0.001,0.001-0.003,0.002-0.005c0.557-1.361,1.059-3.054,1.059-6.035c0,0,0,0,0-0.001l0,0C17.999-45.939,9.939-53.997,0.001-53.997z M0.001-29.874c-3.763,0-6.812-3.05-6.812-6.812c0-3.762,3.05-6.812,6.812-6.812c3.762,0,6.812,3.05,6.812,6.812C6.812-32.924,3.763-29.874,0.001-29.874z",
    "scale": 0.5
  },

  "tiles_viz": "light_all", // either light_all or dark_all
  "tiles_map": "light_all" // either light_all or dark_all

}
