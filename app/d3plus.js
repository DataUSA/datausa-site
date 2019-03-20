import styles from "./style.yml";
import colors from "../static/data/colors.json";

const bad = "#cf5555";
const good = "#3182bd";

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

export {badMeasures};

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
      if (`ID ${key}` in d) {
        return colors[key][d[`ID ${key}`]] || colors[key][d[key]] || colors.colorGrey;
      }
    }
  }
  return Object.keys(d).some(v => badMeasures.includes(v)) ? bad : good;
}

const currentYear = new Date().getFullYear();
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
      fontFamily: () => "Source Sans Pro",
      fontSize: () => 12,
      fontWeight: () => 400
    },
    stroke: "#ccc"
  },
  tickSize: 5,
  titleConfig: {
    fontColor: () => "#211f1a",
    fontFamily: () => "Palanquin",
    fontSize: () => 12,
    fontWeight: () => 400
  }
};

export default {
  barPadding: 0,
  colorScaleConfig: {
    axisConfig: {
      labelOffset: true,
      labelRotation: false,
      shapeConfig: {
        labelConfig: {
          fontColor: () => "#211f1a",
          fontFamily: () => "Source Sans Pro",
          fontSize: () => 12,
          fontWeight: () => 400
        }
      },
      titleConfig: {
        fontColor: () => "#211f1a",
        fontFamily: () => "Palanquin",
        fontSize: () => 12,
        fontWeight: () => 400
      }
    },
    color: colors.colorScaleGood,
    legendConfig: {
      shapeConfig: {
        labelConfig: {
          fontFamily: () => "Source Sans Pro",
          fontSize: () => 12
        },
        height: () => 15,
        stroke: "transparent",
        width: () => 15
      }
    },
    scale: "jenks"
  },
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
        fontFamily: () => "Palanquin",
        fontSize: () => 13
      },
      height: () => 20,
      width: () => 20
    }
  },
  loadingHTML: `
  <div>
    <strong>Drawing Visualization</strong>
  </div>`,
  messageMask: true,
  messageStyle: {
    "color": "#888",
    "font-family": "'Palanquin', sans-serif",
    "font-size": "16px",
    "font-weight": "300"
  },
  noDataHTML: `
  <div>
    <strong>No Data Available</strong>
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
        fontFamily: () => "Pathway Gothic One",
        fontSize: () => 13,
        padding: "0 5px"
      },
      strokeWidth: d => {
        const c = findColor(d);
        return c === good || c === bad ? 1 : 0;
      }
    },
    fill: findColor,
    hoverOpacity: 0.5,
    labelConfig: {
      fontFamily: () => "Pathway Gothic One",
      fontSize: () => 13,
      padding: labelPadding
    },
    Line: {
      curve: "monotoneX",
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
        fontFamily: () => "Pathway Gothic One",
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
      "fill": "#888",
      "fill-opacity": 0.25,
      "transform": "translate(0, 2)"
    },
    shapeConfig: {
      fill: "transparent",
      labelConfig: {
        fontColor(d) {
          const n = parseInt(d.text, 10);
          return isNaN(n) || n <= currentYear ? "#888" : styles.red;
        },
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
  titleConfig: {
    fontFamily: "Pathway Gothic One",
    fontSize: 18,
    fontWeight: 400,
    padding: 0
  },
  tooltipConfig: {
    background: "white",
    border: "1px solid #888",
    footerStyle: {
      "color": "#666",
      "font-family": "'Palanquin', sans-serif",
      "font-size": "12px",
      "font-weight": "300",
      "padding-top": "5px"
    },
    padding: "10px",
    titleStyle: {
      "color": "#888",
      "font-family": "'Palanquin', sans-serif",
      "font-size": "16px",
      "font-weight": "300"
    }
  },
  xConfig: {...axisStyles},
  yConfig: {...axisStyles},
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
