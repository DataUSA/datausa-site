// Converted from legacy canon_cms_section_visualization #308 "section enrollment_status" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, id, tesseract} = variables;
  const {abbreviate, commas, salary} = formatters;

  const {nest, sum} = libs.d3;
  const measure: string = "Enrollment";
  const measureEncoded = measure.replace(/\s/g, "%20");

  return {
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=Enrollment+Status,Carnegie+Parent,Year&locale=en&measures=Enrollment`,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["Carnegie Parent ID"] !== "NAD");
      nest()
        .key((d: any) => `${d.Year}_${d["Carnegie Parent"]}`)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          group.values.forEach((d: any) => d.share = d[measure] / total);
        });
      
    
      return data;
    },
    discrete: "x",
    groupBy: ["Enrollment Status"],
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
        ["Enrolled Students", (d: any) => `${commas(d["Enrollment"])}`],
        ["Share", (d: any) => `${commas(d["share"] * 100)}%`]
      ]
    },
    barPadding: 0,
    groupPadding: 40,
    type: "BarChart",
    legend: false,
    y: "share",
    yConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Share"
    },
    x: "Carnegie Parent",
    xConfig: {
      labelRotation: false,
      title: "University"
    },
    xSort: (a: any, b: any) => a["Carnegie Parent"] > b["Carnegie Parent"] ? 1 : -1
  }
};

export default viz;
