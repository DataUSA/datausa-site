// Converted from legacy canon_cms_section_visualization #305 "section acceptance" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorGrey, colorHighlight, id, tesseract} = variables;
  const {abbreviate, commas, salary} = formatters;

  const measure: string = "Admissions Total,Applicants Total";
  const measureEncoded = measure.replace(/\s/g, "%20");

  const dataCarnegieParent: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&drilldowns=Year,Carnegie+Parent&locale=en&measures=Admissions Total,Applicants Total`

  return {
    data: dataCarnegieParent,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["Carnegie Parent ID"] !== "NAD").map((d: any) => {
        return {...d, "Acceptance Rate": d["Admissions Total"] / d["Applicants Total"]};
      });
      return data;
    },
    discrete: "y",
    groupBy: ["Carnegie Parent"],
    shapeConfig: {
      Bar: {
        labelConfig: {
          textAnchor: "start"
        }
      },
      fill: (d: any) => d["Carnegie Parent ID"] === id ? colorHighlight : colorGrey
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Applicants", (d: any) => `${commas(d["Applicants Total"])}`],
        ["Admissions", (d: any) => `${commas(d["Admissions Total"])}`],
        ["Acceptance Rate", (d: any) => `${abbreviate(d["Acceptance Rate"] * 100)}%`]
      ]
    },
    barPadding: 0,
    // groupPadding: 40,
    type: "BarChart",
    legend: false,
    x: "Acceptance Rate",
    xConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Acceptance Rate"
    },
    y: "Carnegie Parent",
    yConfig: {
      labelRotation: false,
      title: "University",
      ticks: []
    },
    ySort: (a: any, b: any) => a["Acceptance Rate"] - b["Acceptance Rate"]
  }
};

export default viz;
