// Converted from legacy canon_cms_section_visualization #133 "section radar" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {colorHighlight, id} = variables;
  const {abbreviate} = formatters;

  const title = variables[swap("[[skill-radar-value-radar]]")];
  const measure = title === "Value" ? "LV Value" : title;

  return {
    data: `/api/data?measure=LV%20Value,RCA&PUMS%20Occupation=${id}&drilldowns=Skill%20Element&parents=true`,
    shapeConfig: {
      Path: {
        stroke: colorHighlight,
        strokeOpacity: 1,
        strokeWidth: 2,
        fill: "transparent"
      }
    },
    label: (d: any) => d["Skill Element"],
    legendTooltip: {
      tbody: () => []
    },
    tooltipConfig: {
      tbody: (d: any) => [
        ["Value", abbreviate(d["LV Value"])],
        ["RCA", abbreviate(d.RCA)]
      ]
    },
    time: "Year",
    metric: "Skill Element",
    groupBy: "PUMS Occupation",
    value: measure,
    height: 600,
    type: "Radar"
  };
};

export default viz;
