/**
 * Global d3plus theme: fonts, colours, tooltip and axis styling shared by every chart.
 * Ported from the legacy `app/d3plus.js`; colour and icon lookups come from `shared/data`.
 */
import {colorDefaults} from "@d3plus/color";
import {color as parseColor} from "d3-color";
import colors from "@/content/shared/data/colors.json";
import icons from "@/content/shared/data/icons.json";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const colorLookup = colors as AnyRecord;
const iconLookup = icons as AnyRecord;

colorDefaults.dark = colorLookup.colorBackground;
colorDefaults.light = "#ffffff";

const {bad, good} = colorLookup as {bad: string; good: string};

/** Measures whose growth is undesirable are coloured with the "bad" palette. */
export const badMeasures = [
  "Population in Poverty by Gender, Age, and Race", "Children In Poverty", "Unemployment",
  "Uninsured", "Uninsured Adults", "Uninsured Children", "Could Not See Doctor Due To Cost",
  "Adult Obesity", "Diabetes", "Sexually Transmitted Infections", "Hiv Prevalence", "Alcohol-Impaired Driving Deaths",
  "Excessive Drinking", "Adult Smoking", "Homicide Rate", "Violent Crime", "Motor Vehicle Crash Deaths",
  "Premature Death", "Poor Or Fair Health", "Poor Physical Health Days", "Poor Mental Health Days", "Low Birthweight",
  "Food Environment Index", "Physical Inactivity", "Access To Exercise Opportunities", "Teen Births", "Social Associations",
  "Injury Deaths", "Air Pollution - Particulate Matter 1", "Drinking Water Violations", "Premature Age-Adjusted Mortality",
  "Infant Mortality", "Child Mortality", "Food Insecurity", "Limited Access To Healthy Foods",
  "Children Eligible For Free Or Reduced Price Lunch", "Severe Housing Problems",
  "Opioid Overdose Death Rate Per 100,000 Age-Adjusted", "Drug Overdose Death Rate Per 100,000 Age-Adjusted", "Drug Overdose Deaths",
  "Nonmedical Use of Prescription Pain Relievers Among Individuals Aged 12+",
  "Borrowers In Default", "Borrowers Entered Repayment", "Default Rate"
];

const listGeo = ["State", "Destination State", "Origin State", "County", "PUMA", "Geography"];
const styleColors = {geo: "#879bf5", naics: "#e2cfe6"};

const pathway = ["Pathway Gothic One", "Arial Narrow", "sans-serif"];
const sourceSans = ["Source Sans Pro", "sans-serif"];
const palanquin = ["Palanquin", "sans-serif"];

/** Web fonts the charts measure text with; the chart island waits for them before drawing. */
export const chartFonts = ["Pathway Gothic One", "Palanquin", "Source Sans Pro"];

/** Finds a colour for a datum from the colour lookup (`"<Dimension> ID"` or `"ID <Dimension>"` keys). */
export function findColor(this: AnyRecord | void, d: AnyRecord): string {
  let detectedColors: string[] = [];
  if (this && (this as AnyRecord)._filteredData) {
    detectedColors = Array.from(new Set((this as AnyRecord)._filteredData.map(findColor)));
  }
  if (detectedColors.length !== 1) {
    for (const key in colorLookup) {
      if (`ID ${key}` in d) {
        const color = colorLookup[key][`${d[`ID ${key}`]}`] || colorLookup[key][`${d[key]}`];
        if (color) return color;
        else continue;
      }
      else if (`${key} ID` in d) {
        const color = colorLookup[key][`${d[`${key} ID`]}`] || colorLookup[key][`${d[key]}`];
        if (color) return color;
        else continue;
      }
    }
    return colorLookup.colorGrey;
  }
  return Object.keys(d).some(v => badMeasures.includes(v)) ? bad : good;
}


/**
 * d3plus 4 hyphenates words that do not fit their line ("Ar-chi-tec-ture"); d3plus 2 split labels
 * only at spaces and after punctuation and dropped a word that could not fit, which is what the
 * legacy charts show (narrow bars carry no label). Same splitting rules as the old `textSplit`.
 */
export function legacySplit(text: unknown): string[] {
  // Like d3plus 4's own split, each word keeps its trailing whitespace: the wrapper concatenates
  // words into lines and measures the spaces separately.
  const words = String(text ?? "").match(/\S+\s*/g) ?? [];
  return words.flatMap(word => word.split(/(?<=[-/;:&])(?=\S)/));
}
/**
 * d3plus 2 drew map paths with the Geomap's own Path fill (the colour scale, else `topojsonFill`)
 * and ignored the theme's generic `fill`; d3plus 4 lets the generic theme fill win, which painted
 * every choropleth shape in one colour. This restores the old precedence for Path shapes using the
 * same lookups as the library default (`charts/Geomap/index.js` in `@d3plus/core`).
 */
function pathFill(this: AnyRecord | void, d: AnyRecord, i: number): string {
  const viz = this as AnyRecord | undefined;
  if (viz?.schema?.topojson === undefined && viz?.schema?.colorScale === undefined) return findColor.call(this, d);
  const colorScale = viz?.schema?.colorScale;
  if (colorScale && viz?._colorScaleClass) {
    let datum = d;
    while (datum?.__d3plus__ && datum.data) datum = datum.data;
    const value = colorScale(datum, i);
    if (value !== undefined && value !== null) {
      const scale = viz._colorScaleClass._colorScale;
      if (scale && scale.domain().length) return scale(value);
      const colors = viz._colorScaleClass.color();
      return Array.isArray(colors) ? colors[colors.length - 1] : colors;
    }
  }
  const topojsonFill = viz?.schema?.topojsonFill;
  return typeof topojsonFill === "function" ? topojsonFill(d, i) : topojsonFill ?? "#f5f5f3";
}

/** A CSS colour with its alpha multiplied by `opacity`; anything d3-color cannot parse is returned as is. */
function withOpacity(value: unknown, opacity: unknown): unknown {
  const alpha = Number(opacity);
  if (typeof value !== "string" || opacity === undefined || opacity === null || !Number.isFinite(alpha) || alpha === 1) return value;
  const parsed = parseColor(value);
  if (!parsed) return value;
  parsed.opacity *= alpha;
  return parsed.formatRgb();
}

/**
 * d3plus 4 paints a Geomap's topojson paths with `fill`, `stroke`, `strokeWidth` and `opacity` only
 * (`charts/Geomap/emit.js`): the `fillOpacity` and `strokeOpacity` every legacy map relied on (0.75
 * and 0.25 in the theme, 0.5 for the neighbours on the About maps) are dropped, so shapes came out
 * solid with full-strength borders. This folds both opacities into the colours themselves. The
 * stroke falls back to the library default (a darker fill) when a chart sets none.
 */
export function geomapShapeConfig(shapeConfig: AnyRecord = {}): AnyRecord {
  const path: AnyRecord = {...theme.shapeConfig.Path, ...(shapeConfig.Path ?? {})};
  const resolve = (viz: unknown, value: unknown, d: AnyRecord, i: number) => typeof value === "function" ? value.call(viz, d, i) : value;
  return {
    ...shapeConfig,
    Path: {
      ...(shapeConfig.Path ?? {}),
      fill(this: unknown, d: AnyRecord, i: number) {
        const fill = withOpacity(resolve(this, path.fill, d, i), resolve(this, path.fillOpacity, d, i));
        // An invisible fill must not catch the pointer: an outline drawn over other shapes (the
        // state on a place's About map) would otherwise swallow their hover.
        return typeof fill === "string" && parseColor(fill)?.opacity === 0 ? "none" : fill;
      },
      stroke(this: unknown, d: AnyRecord, i: number) {
        let stroke = resolve(this, path.stroke, d, i);
        if (stroke === undefined) {
          const fill = resolve(this, path.fill, d, i);
          stroke = typeof fill === "string" ? parseColor(fill)?.darker().formatRgb() ?? fill : fill;
        }
        return withOpacity(stroke, resolve(this, path.strokeOpacity, d, i));
      }
    }
  };
}

function findColorTooltip(this: AnyRecord | void, key: string, d: AnyRecord): string {
  let detectedColors: string[] = [];
  if (this && (this as AnyRecord)._filteredData) {
    detectedColors = Array.from(new Set((this as AnyRecord)._filteredData.map(findColor)));
  }
  if (detectedColors.length !== 1) {
    if (colorLookup[key]) {
      const color = key === "NAPCS" ? styleColors.naics : colorLookup[key][`${d[`ID ${key}`]}`] || colorLookup[key][`${d[key]}`] || colorLookup[key][`${d[`${key} ID`]}`];
      if (color) return color;
    }
    else if (listGeo.includes(key)) {
      return styleColors.geo;
    }
    return colorLookup.colorGrey;
  }
  return Object.keys(d).some(v => badMeasures.includes(v)) ? bad : good;
}

function getTooltipTitle(d3plusConfig: AnyRecord, d: AnyRecord) {
  const raw = d3plusConfig._groupByRaw;
  const len = Array.isArray(raw) ? raw.length : 1;
  const parentName = Array.isArray(raw) ? raw[0] : raw;

  let parent = (Object.entries(d).find(h => h[0] === parentName) || [])[1] || [undefined];
  let parentId = parentName;
  if (typeof parentId === "string" && parentId.includes("ID")) {
    parentId = parentId.replace("ID", "").trim();
    const entry = Object.entries(d).find(h => h[0] === parentId);
    parent = entry && entry[1] ? entry[1] : [undefined];
  }
  const itemName = Array.isArray(raw) ? raw[len - 1] : raw;
  let item = (Object.entries(d).find(h => h[0] === itemName) || [])[1] || [undefined];
  let itemId = itemName;
  if (typeof itemId === "string" && itemId.includes("ID")) {
    itemId = itemId.replace("ID", "").trim();
    const entry = Object.entries(d).find(h => h[0] === itemId);
    item = entry && entry[1] ? entry[1] : [undefined];
  }
  return {item, itemId, parent, parentId};
}

export function tooltipTitle(bgColor: string, imgUrl: string | undefined, title: string, subtitle: string | false = false): string {
  let tooltip = "<div class='d3plus-tooltip-title-wrapper'>";
  if (imgUrl) tooltip += `<div class="icon" style="background-color: ${bgColor}"><img src="${imgUrl}" /></div>`;
  tooltip += `<div class=${imgUrl ? "title" : "title-without-icon"}><span>${title}</span></div>`;
  if (subtitle) tooltip += `<div class="subtitle"><span>${subtitle}</span></div>`;
  tooltip += "</div>";
  return tooltip;
}

export function findIcon(key: string, d: AnyRecord): string | undefined {
  const icon = listGeo.includes(key) ? "iconGeo" : `icon${key}`;
  const iconID = d[`${key} ID`] || d[`ID ${key}`];
  const iconName = d[`${key}`];
  if (!iconLookup[icon]) return undefined;
  if (icon === "iconGeo" || icon === "iconRace") return iconLookup[icon];
  return iconLookup[icon][iconID] || iconLookup[icon][iconName] || undefined;
}

export function findTooltipTitle(this: AnyRecord | void, d: AnyRecord, d3plusConfig: AnyRecord): string {
  const {item, itemId, parent, parentId} = getTooltipTitle(d3plusConfig, d);
  void itemId;
  const aggregated = Array.isArray(parent) ? "Values" : parent;
  const title = Array.isArray(item) ? `Other ${aggregated || "Values"}` : item;
  const bgColor = findColorTooltip.call(this as AnyRecord, parentId, d);
  const imgUrl = findIcon(parentId, d);
  // A function groupBy has no level name to show (it used to print the function's source).
  return tooltipTitle(bgColor, imgUrl, title, typeof parentId === "string" ? parentId : false);
}

const labelPadding = 5;

const axisStyles = {
  // d3plus 4 forces the domain's min and max into the ticks (e.g. a "146,100" label at the top of
  // a bar chart); the legacy axes only showed the scale's round ticks.
  domainTicks: false,
  barConfig: {stroke: "#ccc"},
  gridConfig: {stroke: "#ccc"},
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

/** Shared d3plus configuration applied under every chart's own config. */
export const theme: AnyRecord = {
  // d3plus 4 renders a data-table toggle and a search box on every chart by default; the site has
  // its own "View Data" panel and never had in-chart search, so both stay off (d3plus v4 API:
  // `tableView`, `search`). Charts can still opt in through their own config.
  tableView: false,
  search: false,
  minimap: false,
  // Fills come from `shapeConfig.fill` (findColor) as on the legacy site. d3plus 4 keys legend
  // entries on the `color` accessor when one exists (its default is the first groupBy level), which
  // merged this site's per-category legends into their parent groups; `false` keys them on the
  // resolved fill again.
  color: false,
  // 4.6/4.7 defaults that the legacy (d3plus 2) design never had: legends stay in the margin, no
  // size legend, per-shape tooltips, and charts keep their DOM when scrolled out of view.
  legendInset: false,
  sizeLegend: false,
  tooltipShared: false,
  // Map shapes with no data row have nothing to say: d3plus 2 gave them no tooltip, d3plus 4 shows
  // one for every topojson path (titled "Other Values" here).
  tooltip: (d: AnyRecord) => !(d && d.__d3plus__ && d.feature && !d.data),
  detectVisibleUnload: false,
  aggs: {
    "ID Group": (arr: AnyRecord[], acc: (d: AnyRecord) => unknown) => {
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
      shapeConfig: {labelConfig: {split: legacySplit, fontColor: () => "#211f1a", fontFamily: () => sourceSans, fontSize: () => 12, fontWeight: () => 400}},
      titleConfig: {fontColor: () => "#211f1a", fontFamily: () => palanquin, fontSize: () => 12, fontWeight: () => 400}
    },
    color: colorLookup.colorScaleGood,
    colorMin: colorLookup.colorScaleGood[0],
    colorMid: colorLookup.colorScaleGood[2],
    colorMax: colorLookup.colorScaleGood[4],
    legendConfig: {
      shapeConfig: {
        labelConfig: {split: legacySplit, fontFamily: () => sourceSans, fontSize: () => 12},
        height: () => 15,
        stroke: "transparent",
        width: () => 15
      }
    },
    scale: "jenks"
  },
  colorScalePosition: "bottom",
  confidenceConfig: {fillOpacity: 0.2, label: false, Area: {strokeWidth: 0}},
  hiddenColor: "#ddd",
  legendConfig: {
    shapeConfig: {
      labelConfig: {split: legacySplit, fontFamily: () => palanquin, fontSize: () => 13},
      height: () => 20,
      width: () => 20
    }
  },
  legendPosition: "bottom",
  legendTooltip: {
    tbody: [],
    title(this: AnyRecord, d: AnyRecord) {
      return findTooltipTitle.call(this, d, this);
    }
  },
  loadingHTML: `<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(229, 232, 242, 0.8); font-family: 'Palanquin', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 400; color: #114B8A;">
    <div style="width: 32px; height: 32px; border: 3px solid #dae0e4; border-top-color: #ef6145; border-radius: 50%; animation: d3plus-loading-spin 0.8s linear infinite; margin-bottom: 12px;"></div>
    Loading Visualization
    <style>@keyframes d3plus-loading-spin { to { transform: rotate(360deg); } }</style>
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
      strokeWidth: (d: AnyRecord) => {
        const c = findColor(d);
        return c === good || c === bad ? 1 : 0;
      }
    },
    Bar: {
      // d3plus 4's legend, timeline and axes leave bars a few pixels thinner than d3plus 2 did, and a
      // label only draws when its line height fits inside the bar minus padding; the default 1.2 line
      // height dropped the labels off ~18px bars that the legacy charts labelled (population pyramids).
      // Bar labels are single lines, so a line height equal to the font size costs nothing visually.
      labelConfig: {split: legacySplit, fontFamily: () => pathway, fontResize: false, fontSize: () => 13, lineHeight: () => 13, padding: "0 5px"},
      strokeWidth: (d: AnyRecord) => {
        const c = findColor(d);
        return c === good || c === bad ? 1 : 0;
      }
    },
    // d3plus 4 sweeps motion trails behind moving points by default; the legacy charts had none.
    Circle: {trail: false},
    fill: findColor,
    labelConfig: {split: legacySplit, fontFamily: () => pathway, fontSize: () => 13, padding: labelPadding},
    Line: {
      curve: "monotoneX",
      labelConfig: {split: legacySplit, fontFamily: () => pathway, fontSize: () => 12},
      stroke: findColor,
      strokeWidth: 3,
      strokeLinecap: "round"
    },
    Path: {fill: pathFill, fillOpacity: 0.75, strokeOpacity: 0.25},
    Rect: {
      trail: false,
      labelBounds: (d: AnyRecord, i: number, s: {width: number; height: number}) => {
        const h = s.height;
        const sh = Math.min(17, h * 0.5);
        return [
          {width: s.width - labelPadding * 2, height: h - sh, x: -s.width / 2 + labelPadding, y: -h / 2 + labelPadding},
          {width: s.width - labelPadding * 2, height: sh, x: -s.width / 2 + labelPadding, y: h / 2 - sh}
        ];
      },
      labelConfig: {split: legacySplit, fontFamily: () => pathway, fontSize: () => 13, fontResize: true, padding: 0}
    }
  },
  timelineConfig: {
    brushing: false,
    buttonBehavior: "buttons",
    buttonHeight: 20,
    buttonPadding: 5,
    labelRotation: false,
    padding: 0,
    selectionConfig: {"fill": "#BEC7DE", "fill-opacity": 0.5, "rx": "3px", "ry": "3px", "transform": "translate(0, 2)"},
    shapeConfig: {
      fill: "transparent",
      labelConfig: {split: legacySplit, fontColor: () => "#515B67", fontFamily: () => "Palanquin", fontSize: () => 12, fontWeight: () => 700, lineHeight: () => 16, padding: 0},
      stroke: "transparent",
      strokeWidth: 0
    }
  },
  tileUrl: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=cb1_2h0m_1_893ce8e35ef09eaf402c1fa2",
  totalConfig: {fontColor: () => "#211f1a", fontFamily: "Palanquin", fontSize: 14, fontWeight: 400, padding: 0},
  titleConfig: {fontColor: () => "#211f1a", fontFamily: pathway, fontSize: 18, fontWeight: 400, padding: 0},
  tooltipConfig: {
    background: "white",
    borderRadius: "6px",
    padding: "0px",
    width: "224px",
    footerStyle: {
      "color": "#869DAD", "font-family": "Palanquin", "font-size": "10px", "font-weight": "700", "text-transform": "uppercase",
      "background": "#FFFFFF", "text-align": "center", "padding-top": "10px", "padding-bottom": "16px",
      "border-radius": "0px 0px 6px 6px", "border-top": "1px solid #dae0e4"
    },
    titleStyle: {
      "color": "#303F50", "font-family": "Palanquin", "font-size": "14px", "font-weight": "600", "text-align": "center",
      "border-radius": "6px 6px 0px 0px", "padding": "10px 5px 7px 5px", "background": "#F6F8FA"
    },
    tbodyStyle: {"color": "#6D7B8E", "text-transform": "uppercase", "font-size": "10px", "font-family": "Palanquin"},
    tableStyle: {"border-collapse": "unset", "padding": "14px 24px 9px 19px"},
    trStyle: {"font-family": "Palanquin", "border": "none"},
    tdStyle: {"text-align": "left", "font-weight": "600", "padding-bottom": "7px"},
    title(this: AnyRecord, d: AnyRecord) {
      return findTooltipTitle.call(this, d, this);
    }
  },
  xConfig: {...axisStyles},
  yConfig: {...axisStyles},
  x2Config: {...axisStyles},
  y2Config: {...axisStyles},
  zoomControlStyle: {
    "background": "rgba(255, 255, 255, 0.75)", "border": "1px solid #999", "color": "#999", "display": "block",
    "font": "900 15px/21px 'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif", "height": "20px", "margin": "5px",
    "opacity": 0.75, "padding": 0, "text-align": "center", "width": "20px"
  }
};
