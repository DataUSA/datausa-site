// Converted from legacy canon_cms_section_visualization #289 "section grads_ethnicity_sex" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {colorGender, colorHighlight, iconGender, id, tesseract, hierarchy} = variables;
  const {abbreviate, salary, commas} = formatters;

  const {nest, sum} = libs.d3;

  const measure: string = "Completions";
  const measureEncoded = measure.replace(/\s/g, "%20");
  const degreeGradsEthnicityGender = swap("[[degree-grads_ethnicity_gender]]")

  let degreeID = degreeGradsEthnicityGender.replace("degree", "");

  const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Gender,Year,Degree,IPEDS Race&include=${hierarchy}:${id};Degree:${degreeID}&locale=en&measures=Completions`

  return {
    barPadding: 0,
    data: data,
    dataFormat: (resp: any) => {
      const data = resp.data;
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

      return data;
    },
    discrete: "x",
    groupBy: "Sex",
    groupPadding: 15,
    shapeConfig: {
      Bar: {
        label: ""
      },
      fill: (d: any) => colorGender[d.Sex]
    },
    legendConfig: {
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d.Sex]
      }
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Degree", (d: any) => d.Degree],
        ["Degrees Awarded", (d: any) => commas(d[measure])],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    type: "BarChart",
    y: "share",
    yConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`
    },
    x: "IPEDS Race",
    xConfig: {
      labelRotation: false,
      label: (d: any) => d["IPEDS Race"]
    },
    xSort: (a: any, b: any) => b["share"] - a["share"]
  }
};

export default viz;
