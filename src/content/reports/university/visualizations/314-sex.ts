// Converted from legacy canon_cms_section_visualization #314 "section sex" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGender, colorHighlight, iconGender, id, commonMajorsIds, tesseract, hierarchy} = variables;
  const {abbreviate, salary, commas} = formatters;
  const {nest, sum} = libs.d3;

  const measure: string = "Completions";
  const measureEncoded = measure.replace(/\s/g, "%20");

  return {
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year,Gender,CIP6&include=${hierarchy}:${id};CIP6:${commonMajorsIds}&locale=en&measures=Completions`,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["Completions"] !== null && d["Completions"] !== 0);
    
      data.forEach((d: any) => {
        d["Sex ID"] = d["Gender ID"]
        d["Sex"] = d["Gender"]
        delete d.Gender
        delete d["Gender ID"]
      })

      return data;
    },
    groupPadding: 40,
    discrete: "x",
    groupBy: ["Sex"],
    shapeConfig: {
      Bar: {
        label: ""
      },
      fill: (d: any) => colorGender[d.Sex]
    },
    legendConfig: {
      label: "",
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d.Sex]
      }
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Degrees Awarded", (d: any) => commas(d[measure])]
      ]
    },
    barPadding: 0,
    type: "BarChart",
    y: "Completions",
    yConfig: {
      title: "Degrees Awarded"
    },
    x: "CIP6",
    xConfig: {
      title: "College Degree",
      labelRotation: false,
      label: (d: any) => d["CIP6"]
    },
    xSort: (a: any, b: any) => b["Completions"] - a["Completions"]
  }
};

export default viz;
