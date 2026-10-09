// Converted from legacy canon_cms_section_visualization #115 "section sankey" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const {nodesFlow, linksFlow, colorCommodityL0} = variables;
  const {abbreviate} = formatters;

  return {
    nodes: nodesFlow,
    links: linksFlow,
    nodeWidth: 140,
    nodePadding: 3,
    type: "Sankey",
    height: 550,
    shapeConfig: {
      fill: (d: any) => colorCommodityL0[d.level0] || "blue",
      Path: {
        stroke: "#bbb"
      },
      Rect: {
        label: (d: any) => d.name,
        labelConfig: {
          fontResize: false,
          textAnchor: "middle",
          verticalAlign: "middle"
        }
      }
    },
    legend: true,
    legendConfig: {
      label: "",
      shapeConfig: {
        height: 20,
        width: 20
      }
    },
    tooltipConfig: {
      title: (d: any) => d.name,
      tbody: (d: any) => {
        const rows: any = [];
        if (d.value) rows.push([`${d.direction} Value`, `$${abbreviate(d.value * 1000000)}`]);
        else {
          rows.push(["Total Input", `$${abbreviate(d.input * 1000000)}`]);
          rows.push(["Total Output", `$${abbreviate(d.output * 1000000)}`]);
        }
        return rows;
      }
    },
    time: "ID Year",
    value: "value"
  };
};

export default viz;
