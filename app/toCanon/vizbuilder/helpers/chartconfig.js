import {
  Treemap,
  BarChart,
  StackedArea,
  Geomap,
  LinePlot
} from "d3plus-react";
import {uuid} from "d3plus-common";
import {formatAbbreviate} from "d3plus-format";

export const charts = {
  Treemap,
  Geomap,
  LinePlot,
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
    color: "#0D47A1",
    scale: "jenks"
  }
};

export default function createConfig(chartConfig) {
  const x = chartConfig.groupBy;
  const measure = chartConfig.measure;
  const dimension = chartConfig.dimension;
  const moe = chartConfig.moe || null;

  // Confs of Viz
  const vizConfig = {
    groupBy: chartConfig.dimension,
    loadingMessage: "Loading",
    total: d => d[measure.name],
    totalConfig: {
      fontSize: 14
    },
    sum: d => d[measure.name],
    value: d => d[measure.name]
  };

  let config = {
    height: 400,
    legend: false,
    uuid: uuid(),
    tooltipConfig: {
      width: 60,
      title: d => `<h5 class="title xs-small">${d[dimension]}</h5>`,
      body: d =>
        `<div>${measure.name}: ${formatAbbreviate(d[measure.name])}</div>`
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
        title: measure.name
      }
    };
  }
  else if (/StackedArea|LinePlot/.test(chartConfig.type)) {
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
        title: measure.name
      }
    };
  }
  else if (/Geomap/.test(chartConfig.type)) {
    config = {
      ...config,
      tiles: false,
      id: "ID State",
      topojsonId: "id",
      topojsonKey: "states",
      groupBy: "ID State",
      topojson: "/topojson/states.json",
      ocean: "transparent",
      projection: "geoAlbersUsa",
      colorScale: measure.name,
      colorScalePosition: "bottom",
      legend: false,
      colorScaleConfig: {
        scale: "jenks",
        height: 500,
        width: 900
      },
      duration: 0,
      zoom: true,
      zoomFactor: 2,
      zoomScroll: false
    };
  }
  else {
    config = {
      ...config,
      ...vizConfig
    };
  }

  if (chartConfig.type === "BarChart") {
    config.tooltipConfig = {
      width: 60,
      title: d => `<h5 class="title xs-small">${d["ID Year"]}</h5>`,
      body: d =>
        `<div>${measure.name}: ${formatAbbreviate(d[measure.name])}</div>`
    };
  }

  if (chartConfig.type === "LinePlot" && moe) {
    config.confidence = [
      d => d[measure.name] - d[moe.name],
      d => d[measure.name] + d[moe.name]
    ];
    config.confidenceConfig = {
      fillOpacity: 0.15
    };
    config.tooltipConfig = {
      width: 60,
      title: d => `<h5 class="title xs-small">${d[dimension]}</h5>`,
      body: d =>
        "<div>" +
        `<div>${measure.name}: ${formatAbbreviate(d[measure.name])}</div>` +
        `<div>MOE: ±${formatAbbreviate(d[moe.name])}</div>` +
        "</div>"
    };
  }

  if (chartConfig.type === "StackedArea") {
    config.groupBy = chartConfig.dimension;
    config.x = "ID Year";
  }
  if (chartConfig.groupBy) config.groupBy = chartConfig.groupBy;
  if (x) config.x = x;

  return config;
}
