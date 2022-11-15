import styles from "./style.yml";
import colors from "../static/data/colors.json";
import icons from "../static/data/icons.json";
import {colorDefaults, colorLegible} from "d3plus-color";
colorDefaults.dark = colors.colorBackground;
colorDefaults.light = "#ffffff";

const {bad, good} = colors;

const badMeasures = [
  "Population in Poverty by Gender, Age, and Race",
  "Children In Poverty",
  "Unemployment",
  "Children In Poverty",

  "Uninsured",
  "Uninsured Adults",
  "Uninsured Children",
  "Could Not See Doctor Due To Cost",

  "Adult Obesity",
  "Diabetes",
  "Sexually Transmitted Infections",
  "Hiv Prevalence",
  "Alcohol-Impaired Driving Deaths",
  "Excessive Drinking",
  "Adult Smoking",
  "Homicide Rate",
  "Violent Crime",
  "Motor Vehicle Crash Deaths",

  "Premature Death",
  "Poor Or Fair Health",
  "Poor Physical Health Days",
  "Poor Mental Health Days",
  "Low Birthweight",
  "Food Environment Index",
  "Physical Inactivity",
  "Access To Exercise Opportunities",
  "Teen Births",
  "Social Associations",
  "Injury Deaths",
  "Air Pollution - Particulate Matter 1",
  "Drinking Water Violations",
  "Premature Age-Adjusted Mortality",
  "Infant Mortality",
  "Child Mortality",
  "Food Insecurity",
  "Limited Access To Healthy Foods",
  "Children Eligible For Free Or Reduced Price Lunch",

  "Severe Housing Problems",

  "Opioid Overdose Death Rate Per 100,000 Age-Adjusted",
  "Drug Overdose Death Rate Per 100,000 Age-Adjusted",
  "Drug Overdose Deaths",
  "Nonmedical Use of Prescription Pain Relievers Among Individuals Aged 12+",

  "Borrowers In Default",
  "Borrowers Entered Repayment",
  "Default Rate"
];

const listGeo = ["State", "Destination State", "Origin State", "County", "PUMA", "Geography"]

export {badMeasures};

const pathway = ["Pathway Gothic One", "Arial Narrow", "sans-serif"];
const sourceSans = ["Source Sans Pro", "sans-serif"];
const palanquin = ["Palanquin", "sans-serif"];

/**
 * Finds a color if defined in the color lookup.
 * @param {Object} d
 */
function findColor(d) {
  let detectedColors = [];
  if (this && this._filteredData) {
    detectedColors = Array.from(new Set(this._filteredData.map(findColor)));
  }
  if (detectedColors.length !== 1) {
    for (const key in colors) {
      // Mondrian-Only
      if (`ID ${key}` in d) {
        const color = colors[key][`${d[`ID ${key}`]}`] || colors[key][`${d[key]}`];
        if (color) return color;
        else continue;
      }
      // Tesseract-Only
      else if (`${key} ID` in d) {
        const color = colors[key][`${d[`${key} ID`]}`] || colors[key][`${d[key]}`];
        if (color) return color;
        else continue;
      }
    }
    return colors.colorGrey;
  }
  return Object.keys(d).some(v => badMeasures.includes(v)) ? bad : good;
}

function findColorTooltip(key, d) {
  let detectedColors = [];
  if (this && this._filteredData) {
    detectedColors = Array.from(new Set(this._filteredData.map(findColor)));
  }
  if (detectedColors.length !== 1) {
    if (colors[key]) {
      const color = key === "NAPCS" ? styles.naics : colors[key][`${d[`ID ${key}`]}`] || colors[key][`${d[key]}`] || colors[key][`${d[`${key} ID`]}`];
      if (color) return color;
    }
    else if (listGeo.includes(key)) {
      const color = styles.geo;
      if (color) return color;
    }
    return colors.colorGrey;
  }
  return Object.keys(d).some(v => badMeasures.includes(v)) ? bad : good;
}

const getTooltipTitle = (d3plusConfig, d) => {
  const len = Array.isArray(d3plusConfig._groupByRaw) ? d3plusConfig._groupByRaw.length : 1;

  const parentName = Array.isArray(d3plusConfig._groupByRaw) ? d3plusConfig._groupByRaw[0] : d3plusConfig._groupByRaw;

  let parent = Object.entries(d).find(h => h[0] === parentName)[1] || [undefined];
  let parentId = parentName;
  if (parentId.includes("ID")) {
    parentId = parentId.replace("ID", "").trim();
    parent = Object.entries(d).find(h => h[0] === parentId)//[1] || [undefined];
    parent = parent && parent[1] ? parent[1] : [undefined]
  }
  const itemName = Array.isArray(d3plusConfig._groupByRaw) ? d3plusConfig._groupByRaw[len - 1] : d3plusConfig._groupByRaw;

  let item = Object.entries(d).find(h => h[0] === itemName)[1] || [undefined];
  let itemId = itemName;
  if (itemId.includes("ID")) {
    itemId = itemId.replace("ID", "").trim();
    item = Object.entries(d).find(h => h[0] === itemId)//[1] || [undefined];
    item = item && item[1] ? item[1] : [undefined]
  }

  return {item, itemId, parent, parentId};
};

export const tooltipTitle = (bgColor, imgUrl, title, subtitle=false) => {
  let tooltip = "<div class='d3plus-tooltip-title-wrapper'>";

  if (imgUrl) {
    tooltip += `<div class="icon" style="background-color: ${bgColor}"><img src="${imgUrl}" /></div>`;
  }

  tooltip += `<div class=${imgUrl ? "title" : "title-without-icon"}><span>${title}</span></div>`;

  if(subtitle){
    tooltip += `<div class="subtitle"><span>${subtitle}</span></div>`;
  }
  tooltip += "</div>";
  return tooltip;
};

export const findIcon = (key, d) => {
  const icon = listGeo.includes(key) ? "iconGeo" : `icon${key}`;
  const iconID = d[`${key} ID`] || d[`ID ${key}`];
  const iconName = d[`${key}`]
  return icons[icon] ? icon === "iconGeo" || icon === "iconRace" ? icons[icon] :
        icons[icon][iconID] || icons[icon][iconName] ? icons[icon][iconID] || icons[icon][iconName] : undefined : undefined;
};

export const findTooltipTitle = (d, d3plusConfig) => {
  const {item, itemId, parent, parentId} = getTooltipTitle(d3plusConfig, d);
  const aggregated = Array.isArray(parent) ? "Valores" : parent;
  const title = Array.isArray(item) ? `Otros ${aggregated || "Valores"}` : item;
  const itemBgImg = parentId;
  let bgColor = findColorTooltip(itemBgImg, d);
  let imgUrl = findIcon(itemBgImg, d);
  return tooltipTitle(bgColor, imgUrl, title, parentId);
}

const labelPadding = 5;

const axisStyles = {
  barConfig: {
    stroke: "#ccc"
  },
  gridConfig: {
    stroke: "#ccc"
  },
  shapeConfig: {
    labelConfig: {
      fontColor: () => "#211f1a",
      fontFamily: () => sourceSans,
      fontSize: () => 12,
      fontWeight: () => 400
    },
    stroke: "#ccc"
  },
  tickSize: 5,
  titleConfig: {
    fontColor: () => "#211f1a",
    fontFamily: () => palanquin,
    fontSize: () => 12,
    fontWeight: () => 400
  }
};

export default {
  aggs: {
    "ID Group": (arr, acc) => {
      const uniques = Array.from(new Set(arr.map(acc)));
      return uniques.length === 1 ? uniques[0] : uniques;
    }
  },
  axisConfig: axisStyles,
  barPadding: 0,
  colorScaleConfig: {
    axisConfig: {
      labelOffset: true,
      labelRotation: false,
      shapeConfig: {
        labelConfig: {
          fontColor: () => "#211f1a",
          fontFamily: () => sourceSans,
          fontSize: () => 12,
          fontWeight: () => 400
        }
      },
      titleConfig: {
        fontColor: () => "#211f1a",
        fontFamily: () => palanquin,
        fontSize: () => 12,
        fontWeight: () => 400
      }
    },
    color: colors.colorScaleGood,
    colorMin: colors.colorScaleGood[0],
    colorMid: colors.colorScaleGood[2],
    colorMax: colors.colorScaleGood[4],
    legendConfig: {
      shapeConfig: {
        labelConfig: {
          fontFamily: () => sourceSans,
          fontSize: () => 12
        },
        height: () => 15,
        stroke: "transparent",
        width: () => 15
      }
    },
    scale: "jenks"
  },
  colorScalePosition: "bottom",
  confidenceConfig: {
    fillOpacity: 0.2,
    label: false,
    Area: {
      strokeWidth: 0
    }
  },
  hiddenColor: "#ddd",
  legendConfig: {
    shapeConfig: {
      labelConfig: {
        fontFamily: () => palanquin,
        fontSize: () => 13
      },
      height: () => 20,
      width: () => 20
    }
  },
  legendPosition: "bottom",
  legendTooltip: {
    title(d) {
      return findTooltipTitle(d, this)
    }
  },
  loadingHTML: `<div style="left: 50%; top: 50%; position: absolute; transform: translate(-50%, -50%); font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 400;">
    Loading Visualization
  </div>`,
  messageMask: true,
  messageStyle: {
    "color": "#888",
    "font-family": "'Palanquin', sans-serif",
    "font-size": "16px",
    "font-weight": "300"
  },
  noDataHTML: `<div style="left: 50%; top: 50%; position: absolute; transform: translate(-50%, -50%); font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 400;">
    No Data Available
  </div>`,
  ocean: "transparent",
  padPixel: 1,
  shapeConfig: {
    Area: {
      strokeWidth: d => {
        const c = findColor(d);
        return c === good || c === bad ? 1 : 0;
      }
    },
    Bar: {
      labelConfig: {
        fontFamily: () => pathway,
        fontResize: false,
        fontSize: () => 13,
        padding: "0 5px"
      },
      strokeWidth: d => {
        const c = findColor(d);
        return c === good || c === bad ? 1 : 0;
      }
    },
    fill: findColor,
    labelConfig: {
      fontFamily: () => pathway,
      fontSize: () => 13,
      padding: labelPadding
    },
    Line: {
      curve: "monotoneX",
      labelConfig: {
        fontFamily: () => pathway,
        fontSize: () => 12
      },
      stroke: findColor,
      strokeWidth: 3,
      strokeLinecap: "round"
    },
    Path: {
      fillOpacity: 0.75,
      strokeOpacity: 0.25
    },
    Rect: {
      labelBounds: (d, i, s) => {
        const h = s.height;
        const sh = Math.min(17, h * 0.5);
        const arr = [
          {width: s.width - labelPadding * 2, height: h - sh, x: -s.width / 2 + labelPadding, y: -h / 2 + labelPadding},
          {width: s.width - labelPadding * 2, height: sh, x: -s.width / 2 + labelPadding, y: h / 2 - sh}
        ];
        return arr;
      },
      labelConfig: {
        fontFamily: () => pathway,
        fontSize: () => 13,
        fontResize: true,
        padding: 0
      }
    }
  },
  timelineConfig: {
    brushing: false,
    buttonBehavior: "buttons",
    buttonHeight: 20,
    buttonPadding: 5,
    labelRotation: false,
    padding: 0,
    selectionConfig: {
      "fill": "#BEC7DE",
      "fill-opacity": 0.5,
      "rx": "3px",
      "ry": "3px",
      "transform": "translate(0, 2)"
    },
    shapeConfig: {
      fill: "transparent",
      labelConfig: {
        fontColor: () => "#515B67",
        fontFamily: () => "Palanquin",
        fontSize: () => 12,
        fontWeight: () => 700,
        lineHeight: () => 16,
        padding: 0
      },
      stroke: "transparent",
      strokeWidth: 0
    }
  },
  totalConfig: {
    fontColor: () => "#211f1a",
    fontFamily: "Palanquin",
    fontSize: 14,
    fontWeight: 400,
    padding: 0
  },
  titleConfig: {
    fontColor: () => "#211f1a",
    fontFamily: pathway,
    fontSize: 18,
    fontWeight: 400,
    padding: 0
  },
  tooltipConfig: {
    background: "white",
    borderRadius: "6px",
    padding: "0px",
    width: "224px",
    footerStyle: {
      "color": "#869DAD",
      "font-family": "Palanquin",
      "font-size": "10px",
      "font-weight": "700",
      "text-transform": "uppercase",
      "background": "#FFFFFF",
      "text-align": "center",
      "padding-top": "10px",
      "padding-bottom": "16px",
      "border-radius": "0px 0px 6px 6px",
      "border-top": "1px solid #dae0e4"
    },
    titleStyle: {
      "color": "#303F50",
      "font-family": "Palanquin",
      "font-size": "14px",
      "font-weight": "600",
      "text-align": "center",
      "border-radius": "6px 6px 0px 0px",
      "padding": "10px 5px 7px 5px",
      "background": "#F6F8FA"
    },
    tbodyStyle: {
      "color": "#6D7B8E",
      "text-transform": "uppercase",
      "font-size": "10px",
      "font-family": "Palanquin"
    },
    tableStyle: {
      "border-collapse": "unset",
      "padding": "14px 24px 9px 19px"
    },
    trStyle: {
      "font-family": "Palanquin",
      "border": "none"
    },
    tdStyle: {
      "text-align": "left",
      "font-weight": "600",
      "padding-bottom": "7px"
    },
    title(d) {
      return findTooltipTitle(d, this)
    }
  },
  xConfig: {...axisStyles},
  yConfig: {...axisStyles},
  x2Config: {...axisStyles},
  y2Config: {...axisStyles},
  zoomControlStyle: {
    "background": "rgba(255, 255, 255, 0.75)",
    "border": "1px solid #999",
    "color": "#999",
    "display": "block",
    "font": "900 15px/21px 'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
    "height": "20px",
    "margin": "5px",
    "opacity": 0.75,
    "padding": 0,
    "text-align": "center",
    "width": "20px"
  }
};
