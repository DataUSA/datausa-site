// Converted from legacy canon_cms_section_visualization #99 "section radar" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {colorHighlight, id} = variables;
  const {abbreviate} = formatters;

  const title = variables[swap("[[skill-radar-value-radar]]")];
  const measure = title === "Value" ? "LV Value" : title;

  return {
    data: `/api/data?measure=LV Value,RCA&CIP=${id}&drilldowns=Skill Element`,
    shapeConfig: {
      Path: {
        stroke: colorHighlight,
        strokeOpacity: 1,
        strokeWidth: 2,
        fill: "transparent"
      }
    },
    legendTooltip: {
      tbody: () => []
    },
    time: "Year",
    metric: "Skill Element",
    groupBy: "CIP",
    label: (d: any) => d["Skill Element"],
    tooltipConfig: {
      title: (d: any) => d["Skill Element"] ? d["Skill Element"] : false,
      tbody: (d: any) => [
        ["Value", abbreviate(d["LV Value"])],
        ["RCA", abbreviate(d.RCA)]
      ]
    },
    value: measure,
    height: 600,
    type: "Radar"
  };
};

export default viz;
