import {Treemap, Donut, BarChart, StackedArea} from "d3plus-react";
import {uuid} from "d3plus-common";

export const charts = {
  Treemap,
  Donut,
  BarChart,
  StackedArea
};

export const legendConfig = {
  label: false,
  shapeConfig: {
    width: 0,
    height: 0
  }
};

export const timelineConfig = {
  // time: !isOpen ? "ID Year" : ""
};

export const colorScaleConfig = {
  colorScale: false,
  colorScaleConfig: {
    scale: "jenks"
  }
};

import {format as d3Format} from "d3-format";

function abbreviate(n) {
  if (typeof n !== "number") return "N/A";
  const length = n.toString().split(".")[0].length;
  let val;
  if (n === 0) val = "0";
  else if (length >= 3) {
    const f = d3Format(".3s")(n).replace("G", "B");
    const num = f.slice(0, -1);
    const char = f.slice(f.length - 1);
    val = `${parseFloat(num)}${char}`;
  }
  else if (length === 3) val = d3Format(",f")(n);
  else if (n < 1 && n > -1) val = d3Format(".2g")(n);
  else val = d3Format(".3g")(n);

  return val
    .replace(/(\.[1-9]*)[0]*$/g, "$1") // removes any trailing zeros
    .replace(/[.]$/g, ""); // removes any trailing decimal point
}

export default function createConfig(chartConfig) {
  const x = chartConfig.groupBy;
  const measure = chartConfig.measure;
  const dimension = chartConfig.dimension;

  // Confs of Viz
  const vizConfig = {
    groupBy: chartConfig.dimension,
    sum: d => d[measure.name],
    value: d => d[measure.name]
  };

  let config = {
    height: 400,
    legend: false,
    uuid: uuid(),
    tooltipConfig: {
      width: 90,
      title: d => `<h5 class="title xs-small">${d[dimension]}</h5>`,
      body: d => `<div>${measure.name}: ${abbreviate(d[measure.name])}</div>`
    }
  };

  if (/BarChart/.test(chartConfig.type)) {
    config = {
      ...config,
      groupBy: "ID Year",
      x: "ID Year",
      xConfig: {
        title: x
      },
      discrete: "x",
      y: measure.name,
      yConfig: {
        tickFormat: d => abbreviate(d),
        title: measure.name
      }
    };
  }
  else if (/StackedArea/.test(chartConfig.type)) {
    config = {
      ...config,
      ...vizConfig,
      x: "ID Year",
      xConfig: {
        title: x
      },
      discrete: "x",
      y: measure.name,
      yConfig: {
        tickFormat: d => abbreviate(d),
        title: measure.name
      }
    };
  }
  else if (/Pie/.test(chartConfig.type) || /Donut/.test(chartConfig.type)) {
    config = {
      ...config,
      ...vizConfig,
      sort: (a, b) => b[measure.name] - a[measure.name]
    };
  }
  else {
    config = {
      ...config,
      ...vizConfig
    };
  }

  // groupBy: "ID Year",

  if (chartConfig.type === "Geomap") config.colorScale = measure.name;
  if (chartConfig.type === "BarChart") {
    // config.time = "ID Year";
  }

  if (chartConfig.type === "StackedArea") {
    // config.groupBy = false;
    config.groupBy = chartConfig.dimension;
    config.x = "ID Year";
  }
  if (chartConfig.groupBy) config.groupBy = chartConfig.groupBy;
  if (x) config.x = x;

  return config;
}
