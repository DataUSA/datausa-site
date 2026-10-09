// Converted from legacy canon_cms_section_visualization #320 "section ethnicity_sex" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGender, colorHighlight, iconGender, id, tesseract, hierarchy} = variables;
  const {abbreviate, salary, commas} = formatters;

  const {nest, sum} = libs.d3;

  const measure: string = "Completions";
  const measureEncoded = measure.replace(/\s/g, "%20");

  return {
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=IPEDS+Race,Year,Gender&include=${hierarchy}:${id}&locale=en&measures=Completions`,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["IPEDS Race ID"] !== "unknown");
      nest()
        .key((d: any) => d.Year)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d["Completions"]);
          group.values.forEach((d: any) => d.share = d["Completions"] / total);
        });
  
      data.forEach((d: any) => {
        d.Sex = d.Gender
        d["Sex ID"] = d["Gender ID"]
        delete d.Gender
        delete d["Gender ID"]
      });
    
      return data.filter((d: any) => d["Completions"] > 0);
    },
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
        ["Degrees Awarded", (d: any) => commas(d[measure])],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    barPadding: 0,
    type: "BarChart",
    // legend: false,
    y: "share",
    yConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`
    },
    x: "IPEDS Race",
    xConfig: {
      title: "RACE OR ETHNICITY",
      labelRotation: false,
      label: (d: any) => d["IPEDS Race"]
    },
    xSort: (a: any, b: any) => b["share"] - a["share"]
  }
};

export default viz;
