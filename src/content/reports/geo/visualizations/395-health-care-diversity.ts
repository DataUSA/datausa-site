// Converted from legacy canon_cms_section_visualization #395 "section health_care_diversity" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, swap}) => {
  const {id, hierarchy, tesseract, colorSex, iconGender} = variables;
  const {nest, sum} = libs.d3;
  const {commas, abbreviate, growthPct} = formatters;

  const ageColor: Record<string, any> = {
    0: "#62c0cb",
    1: "#4695b4",
    2: "#f5ae77",
    3: "#e97f4c"
  }

  const optionSelected = swap("[[healthDiversity]]") //genderOption, ageOption

  const measure = optionSelected === "ageOption" ? "Health Insurance Policies" : "Health Insurance by Gender and Age"
  const drilldown = optionSelected === "ageOption" ? "Kaiser Coverage" : "Health Coverage"
  const groupby = optionSelected === "ageOption" ? "Age" : "Gender"

  const dataURL = optionSelected === "ageOption" ? `${tesseract}tesseract/data?cube=acs_ygh_health_care_coverage_overall_5&include=${hierarchy}:${id}&drilldowns=Year,Kaiser Coverage,Age&measures=Health Insurance Policies` 
                                                 : `${tesseract}tesseract/data?cube=acs_yghsa_health_coverage_type_by_gender_by_age_5&include=${hierarchy}:${id}&drilldowns=Year,Health Coverage,Gender&measures=Health Insurance by Gender and Age`

  const config: Record<string, any> = {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data.map((d: any) => Object.assign({}, d));
      nest()
        .key((d: any) => `${d.Year}_${d[drilldown]}`)
        .entries(data)
        .forEach((group: any) => {
          const {values} = group;
          const total = sum(values, (d: any) => d[measure]);
          values.forEach((d: any) => d.Share = d[measure] / total * 100);
        });
      return data;
    },
    groupBy: [`${groupby} ID`],
    groupPadding: 15,
    label: (d: any) => String(d[groupby]),
    legendSort: (a: any, b: any) => a[`${groupby} ID`] - b[`${groupby} ID`],
    legendConfig: {
      label: optionSelected !== "ageOption" ?  (d: any) => d.Gender : (d: any) => d.Age,
      shapeConfig: {
        backgroundImage: optionSelected !== "ageOption" ?  (d: any) => iconGender[d.Gender] : false
      }
    },
    /*shapeConfig: {
      fill: "D3PLUS-COMMON-RESET"
    },*/
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Coverage", (d: any) => commas(d[measure])],
        ["Coverage Share", (d: any) => growthPct(d["Share"])]
      ]
    },
    type: "BarChart",
    x: drilldown,
    xSort: (a: any, b: any) => a[`${groupby} ID`] - b[`${groupby} ID`],
    xConfig: {
      title: ""
    },
    y: "Share",
    yConfig: {
      title: "",
      tickFormat: (d: any) => growthPct(d)
    }
  };

  if(optionSelected === "ageOption"){
    config.shapeConfig = {
      fill: (d: any) => ageColor[d["Age ID"]],
      label: false
    }
  }

  return config;
};

export default viz;
