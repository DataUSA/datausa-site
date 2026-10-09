// Converted from legacy canon_cms_section_visualization #100 "section bar" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {colorGrey, colorHighlight, id, colorOnet, iconOnet} = variables;
  const {abbreviate, salary, commas} = formatters;

  const title = variables[swap("[[skill-bar-value-bar]]")];
  const measure = title === "Value" ? "LV Value" : title;

  return {
    data: `/api/data?measure=LV Value,RCA&CIP=${id}&drilldowns=Skill%20Element&parents=true`,
    discrete: "y",
    groupBy: ["Skill Element Group", "Skill Element"],
    groupPadding: 2,
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconOnet[d["ID Skill Element Group"]]
      }
    },
    legendTooltip: {
      tbody: () => []
    },
    shapeConfig: {
      fill: (d: any) => colorOnet[d["ID Skill Element Group"]]
    },
    tooltipConfig: {
      tbody: [
        ["Value", (d: any) => abbreviate(d["LV Value"])],
        ["RCA", (d: any) => abbreviate(d["RCA"])]
      ]
    },
    time: "ID Year",
    type: "BarChart",
    x: measure,
    height: 600,
    xConfig: {
      tickFormat: (d: any) => abbreviate(d),
      title
    },
    y: "Skill Element",
    yConfig: {
      shapeConfig: {
        labelConfig: {
          fontSize: () => 10,
          padding: 0
        }
      },
      title: "Skill"
    },
    ySort: (a: any, b: any) => a["ID Skill Element Group"] > b["ID Skill Element Group"] ? -1 : 1
  }
};

export default viz;
