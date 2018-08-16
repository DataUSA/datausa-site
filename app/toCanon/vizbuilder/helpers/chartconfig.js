import {
  BarChart,
  Donut,
  Geomap,
  LinePlot,
  Pie,
  StackedArea,
  Treemap
} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {sortByCustomKey} from "./sorting";

export const charts = {
  barchart: BarChart,
  barchartyear: BarChart,
  donut: Donut,
  geomap: Geomap,
  // histogram: BarChart,
  lineplot: LinePlot,
  pie: Pie,
  stacked: StackedArea,
  treemap: Treemap
};

export const ALL_YEARS = "All years";

export const tooltipGenerator = (label, drilldowns, measure, moe) => {
  const tbody = drilldowns.filter(d => d !== label).map(dd => [dd, d => d[dd]]);
  tbody.push([measure, d => `${formatAbbreviate(d[measure] * 1 || 0)}`]);
  if (moe) {
    const moeName = moe.name;
    tbody.push([
      "Margin of Error",
      d => `±${formatAbbreviate(d[moeName] * 1 || 0)}`
    ]);
  }
  return {
    title: d => [].concat(d[label]).join(", "),
    tbody
  };
};

/**
 * @prop {[x: string]: ChartConfigFunction}
 */
const makeConfig = {
  barchart(commonConfig, query, flags) {
    const {timeDrilldown, drilldown, measure} = query;

    const drilldownName = drilldown.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      title: `${measureName} by ${drilldownName}`,
      discrete: "x",
      x: drilldownName,
      xConfig: {title: drilldownName},
      y: measureName,
      yConfig: {
        tickFormat: formatAbbreviate,
        title: measureName
      },
      stacked: drilldown.depth > 1,
      xSort: sortByCustomKey(drilldownName),
      ...flags.chartConfig
    };

    if (timeDrilldown) {
      config.groupBy = [timeDrilldown.hierarchy.levels[1].name];
    }

    return config;
  },
  barchartyear(commonConfig, query, flags) {
    const {drilldown, timeDrilldown, measure} = query;

    const drilldownName = timeDrilldown.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      title: `${measureName} by ${drilldownName}`,
      discrete: "x",
      x: drilldownName,
      xConfig: {title: drilldownName},
      y: measureName,
      yConfig: {tickFormat: formatAbbreviate, title: measureName},
      stacked: true,
      groupBy: [drilldown.name],
      tooltipConfig: tooltipGenerator(
        drilldownName,
        flags.availableKeys,
        measureName,
        query.moe
      ),
      ...flags.chartConfig
    };

    delete config.time;

    return config;
  },
  donut(commonConfig, query, flags) {
    const {drilldown, measure} = query;

    const drilldownName = drilldown.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      title: `${measureName} by ${drilldownName}`,
      xConfig: {title: null},
      y: measureName,
      yConfig: {tickFormat: formatAbbreviate, title: measureName},
      groupBy: drilldownName,
      ...flags.chartConfig
    };

    return config;
  },
  geomap(commonConfig, query, flags) {
    const drilldownName = query.drilldown.name;
    const measureName = query.measure.name;
    const isActive = flags.activeType === "geomap";

    const config = {
      ...commonConfig,
      title: `${measureName} by ${drilldownName}`,
      colorScale: measureName,
      colorScalePosition: isActive ? "bottom" : false,
      groupBy: `ID ${drilldownName}`,
      zoomScroll: false,
      ...flags.topojsonConfig,
      ...flags.chartConfig
    };

    if (isActive) {
      config.colorScaleConfig = {
        scale: "jenks"
      };
    }

    return config;
  },
  histogram(commonConfig, query, flags) {
    const config = this.barchart(commonConfig, query, flags);

    return {
      ...config,
      // title: `${measureName} by ${drilldownName}`,
      groupPadding: 0,
      ...flags.chartConfig
    };
  },
  lineplot(commonConfig, query, flags) {
    const {drilldown, measure, moe, timeDrilldown} = query;

    const drilldownName = timeDrilldown.name;
    const measureName = measure.name;

    const config = {
      ...commonConfig,
      title: `${measureName} by ${drilldownName}`,
      discrete: "x",
      groupBy: drilldown.name,
      x: drilldownName,
      xConfig: {title: drilldownName},
      y: measureName,
      yConfig: {tickFormat: formatAbbreviate, title: measureName},
      ...flags.chartConfig
    };

    if (moe) {
      const moeName = moe.name;

      config.confidence = [
        d => d[measureName] - d[moeName],
        d => d[measureName] + d[moeName]
      ];
    }

    delete config.time;

    return config;
  },
  pie(commonConfig, query, flags) {
    return this.donut(commonConfig, query, flags);
  },
  stacked(commonConfig, query, flags) {
    const config = this.lineplot(commonConfig, query, flags);

    const drilldownName = query.drilldown.name;
    const measureName = query.measure.name;

    config.title = `${measureName} by ${drilldownName}`;

    return config;
  },
  treemap(commonConfig, query, flags) {
    const {drilldown, measure} = query;

    const drilldownName = drilldown.name;
    const measureName = measure.name;

    const levels = drilldown.hierarchy.levels;
    const ddIndex = levels.indexOf(drilldown);

    const config = {
      ...commonConfig,
      title: `${measureName} by ${drilldownName}`,
      groupBy: levels.slice(1, ddIndex + 1).map(lvl => lvl.name),
      ...flags.chartConfig
    };

    return config;
  }
};

/**
 * Generates an array with valid config objects, depending on the type of data
 * retrieved and the current user defined parameters, to use in d3plus charts.
 * @param {CreateChartConfigParams} param0 The object containing the parameters
 * @returns {CreateChartConfigResult[]}
 */
export default function createChartConfig({
  activeType,
  members,
  query,
  topojson,
  userConfig,
  visualizations
}) {
  const availableKeys = Object.keys(members);
  const availableCharts = new Set(activeType ? [activeType] : visualizations);

  const hasTimeDim = query.timeDrilldown && Array.isArray(members.Year);
  const hasGeoDim = query.dimension.annotations.dim_type === "GEOGRAPHY";

  const drilldownName = query.drilldown.name;
  const measureName = query.measure.name;
  const getMeasureName = d => d[measureName];

  const commonConfig = {
    height: activeType ? 500 : 400,
    legend: false,

    tooltipConfig: tooltipGenerator(
      drilldownName,
      availableKeys,
      measureName,
      query.moe
    ),

    duration: 0,
    sum: getMeasureName,
    value: getMeasureName
  };

  if (hasTimeDim) {
    const timeDrilldownName = query.timeDrilldown.name;
    commonConfig.time = timeDrilldownName;
  }

  const topojsonConfig = topojson[drilldownName];

  if (!activeType) {
    if (members[drilldownName].length > 20) {
      availableCharts.delete("barchart");
    }

    const aggregatorType =
      query.measure.annotations.aggregation_method ||
      query.measure.aggregatorType ||
      "UNKNOWN";

    if (!hasTimeDim) {
      availableCharts.delete("stacked");
      availableCharts.delete("barchartyear");
      availableCharts.delete("lineplot");
    }

    if (!hasGeoDim || !topojsonConfig) {
      availableCharts.delete("geomap");
    }

    if (aggregatorType === "AVERAGE") {
      availableCharts.delete("donut");
      availableCharts.delete("stacked");
      availableCharts.delete("treemap");
      availableCharts.delete("histogram");
    }
    if (aggregatorType !== "SUM" && aggregatorType !== "UNKNOWN") {
      availableCharts.delete("donut");
      availableCharts.delete("stacked");
      availableCharts.delete("treemap");
      availableCharts.delete("histogram");
      availableCharts.delete("barchartyear");
    }
  }
  else {
    commonConfig.total = getMeasureName;
  }

  const flags = {
    activeType,
    availableKeys,
    topojsonConfig,
    chartConfig: userConfig || {}
  };

  return Array.from(
    availableCharts,
    type =>
      type in charts
        ? {type, config: makeConfig[type](commonConfig, query, flags)}
        : null
  ).filter(Boolean);
}

/**
 * @typedef {(commonConfig, query, flags) => object} ChartConfigFunction
 * @param {object} commonConfig The common config between all charts
 * @param {object} query The current `query` object from the Vizbuilder's state
 * @param {object} flags An object with flags and other state variables
 * @returns {object} The config for the chart of the corresponding type
 */

/**
 * @typedef {object} CreateChartConfigParams
 * @prop {string} activeType The currently active chart type
 * @prop {object} members An object with the members in the current dataset
 * @prop {object} query The current query object from the Vizbuilder's state
 * @prop {object} topojson An object where keys are Level names and values are config params for the topojson properties
 * @prop {object} userConfig The config params provided by the user
 * @prop {string[]} visualizations An array with valid visualization names to present
 */

/**
 * @typedef {object} CreateChartConfigResult
 * @prop {string} type The type of chart for this config
 * @prop {object} config The config object for the chart
 */
