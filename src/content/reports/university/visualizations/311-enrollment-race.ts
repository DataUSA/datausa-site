// Converted from legacy canon_cms_section_visualization #311 "section enrollment_race" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, id, hierarchy, tesseract} = variables;
  const {abbreviate, commas, salary} = formatters;

  const {nest, sum} = libs.d3;
  const measure: string = "Enrollment";
  const measureEncoded = measure.replace(/\s/g, "%20");

  return {
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=${hierarchy},IPEDS+Race%2CYear&locale=en&measures=Enrollment&include=${hierarchy}:${id}`,
    dataFormat: (resp: any) => {
      const data = resp.data;
      nest()
        .key((d: any) => d.Year)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          group.values.forEach((d: any) => d.share = d[measure] / total);
        });
      return data.filter((d: any) => d["IPEDS Race ID"] === "nonresident");
    },
    height: 200,
    discrete: "y",
    groupBy: [`${hierarchy}`],
    label: "",
    shapeConfig: {
      fill: (d: any) => d[`${hierarchy} ID`] == id ? colorHighlight : colorGrey
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["University", (d: any) => d["University"]],
        ["Enrolled Students", (d: any) => `${commas(d["Enrollment"])}`],
        ["Share", (d: any) => `${commas(d["share"] * 100)}%`]
      ]
    },
    // barPadding: 0,
    // groupPadding: 40,
    type: "BarChart",
    legend: false,
    x: "share",
    xConfig: {
      domain: [0, 0.6],
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Non-resident Aliens",
      labelRotation: false
    },
    y: "IPEDS Race",
    yConfig: {
      title: "",
      ticks: []
    }
  }

};

export default viz;
