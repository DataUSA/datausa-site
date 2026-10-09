// Converted from legacy canon_cms_section_visualization #297 "section tuition" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorGrey, colorHighlight, id, tesseract} = variables;
  const {abbreviate, commas, salary} = formatters;

  const measure: string = "State Tuition";
  const measureEncoded = measure.replace(/\s/g, "%20");

  const dataCarnegieParent: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,Carnegie+Parent&locale=en&measures=State+Tuition`

  return {
    data: dataCarnegieParent,
    dataFormat: (resp: any) => resp.data.filter((d: any) => d["Carnegie Parent ID"] !== "NAD"),
    discrete: "x",
    groupBy: ["Carnegie Parent"],
    shapeConfig: {
      Bar: {
        label: ""
      },
      fill: (d: any) => d["Carnegie Parent ID"] === id ? colorHighlight : colorGrey
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["University", (d: any) => d["Carnegie Parent"]],
        ["Tuition Cost", (d: any) => `$${commas(d["State Tuition"])}`]
      ]
    },
    barPadding: 10,
    groupPadding: 40,
    type: "BarChart",
    legend: false,
    y: measure,
    yConfig: {
      tickFormat: (d: any) => `$${commas(d)}`,
      title: "State Tuition"
    },
    x: "Carnegie Parent",
    xConfig: {
      labelRotation: false
    },
    xSort: (a: any, b: any) => b[measure] - a[measure]
  }
};

export default viz;
