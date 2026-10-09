// Converted from legacy canon_cms_section_visualization #376 "section ethnicity" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {commas, abbreviate, abs, lowercase, dollar, growthPct} = formatters;
  const {hierarchy, id, colorParentEthnicityPUMS, tesseract} = variables;
  const {sum, nest} = libs.d3;

  const selector = swap("[[ethnicity-employment]]") // employedE, unemployedE
  const workstatus = selector === "employedE" ? "true" : "false"

  const genderfilter = swap("[[ethnicity-gender]]") // genderAllE, genderFemaleE, genderMaleE
  const gender = genderfilter === "genderMaleE" ? ";Gender:1" : genderfilter === "genderFemaleE" ? ";Gender:2" : ""

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,PUMS+Ethnicity+Parent&include=Workforce+Status:${workstatus};${hierarchy}:${id}${gender}&locale=en&measures=Record+Count,Total+Population&filters=Record+Count.gte.5`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data;
    
      nest()
        .key((d: any) => `${d.Year}`)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d["Total Population"]) 
          group.values.forEach((d: any) => {
              d["Share"] = (d["Total Population"] / total) * 100
          });
        });

      return data;
    },
  
    groupBy: ["PUMS Ethnicity Parent"],
    //label: (d: any) => growthPct(d["Share"]),
    label: "",
    legend: true,
    legendConfig: {
      label: (d: any) => String(d["PUMS Ethnicity Parent"]),
    },
    shapeConfig: {
      fill: (d: any) => colorParentEthnicityPUMS[d["PUMS Ethnicity Parent"]],
    },
    tooltipConfig: {
      tbody: [
        ["Gender", genderfilter === "genderMaleE" ? "Male" : genderfilter === "genderFemaleE" ? "Female" : "All"],
        ["Total Population", (d: any) => commas(d["Total Population"])],
        ["Share", (d: any) => growthPct(d["Share"])],
      
      ]
    },
    type: "Donut",
    value: "Total Population",
    time: "Year",
    height: 250,
    timeline: true,
  };

};

export default viz;
