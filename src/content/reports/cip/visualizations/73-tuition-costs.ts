// Converted from legacy canon_cms_section_visualization #73 "section tuition_costs" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {colorGrey, colorHighlight, id, socLevelName, keySameLevel, neighbourLevel} = variables;
  const {abbreviate, commas, salary} = formatters;

  const measure = variables[swap("[[tuition-measure-tuition_costs]]")];

  return {
    data: `/api/data?CIP=${id}&measures=State%20Tuition,Total Graduates,Out%20Of%20State%20Tuition&drilldowns=University&order=Total Graduates&sort=desc&limit=5:Year`,
    discrete: "y",
    groupBy: ["University"],
    shapeConfig: {
      Bar: {
        labelConfig: {
          textAnchor: "start"
        }
      },
      fill: (d: any) => colorHighlight
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["In-State Tuition", (d: any) => salary(d["State Tuition"])],
        ["Out-of-State Tuition", (d: any) => salary(d["Out Of State Tuition"])],
        ["Total Graduates", (d: any) => commas(d["Total Graduates"])]
      ]
    },
    barPadding: 10,
    type: "BarChart",
    legend: false,
    x: measure,
    xConfig: {
      tickFormat: (d: any) => `$${abbreviate(d)}`,
      title: measure
    },
    y: "University",
    yConfig: {
      title: "Top 5 Universities",
      ticks: []
    },
    ySort: (a: any, b: any) => a[measure] - b[measure]
  }
};

export default viz;
