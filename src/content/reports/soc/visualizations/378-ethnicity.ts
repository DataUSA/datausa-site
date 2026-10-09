// Converted from legacy canon_cms_section_visualization #378 "section ethnicity" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {commas, abbreviate, abs, lowercase, dollar} = formatters;
  const {hierarchy, id, iconGender, colorGender, tesseract} = variables;

  const selector = swap("[[ethnicity-employment]]") // employedE, unemployedE
  const workstatus = selector === "employedE" ? "true" : "false"

  const genderfilter = swap("[[ethnicity-gender]]") // genderAllE, genderFemaleE, genderMaleE
  const gender = genderfilter === "genderMaleE" ? ";Gender:1" : genderfilter === "genderFemaleE" ? ";Gender:2" : ""

  const dataURL: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,PUMS+Ethnicity&include=Workforce+Status:${workstatus};${hierarchy}:${id}${gender};PUMS+Ethnicity+Parent:Hispanic&locale=en&measures=Record+Count,Total+Population,Total+Population+MOE+Appx&filters=Record+Count.gte.5`

  return {
    data: dataURL,
    label: (d: any) => String(d["PUMS Ethnicity"]),
    groupBy: "PUMS Ethnicity ID",
    sum: "Total Population",
    shapeConfig: {
      fill: "D3PLUS-COMMON-RESET",
    },
    tooltipConfig: {
      tbody: [
        ["Total Population", (d: any) => commas(d["Total Population"])],
        ["Margin of Error", (d: any) => commas(d["Total Population MOE Appx"])],
        ["Gender", genderfilter === "genderMaleE" ? "Male" : genderfilter === "genderFemaleE" ? "Female" : "All"]
      ]
    },
    type: "Treemap",
    time: "Year",
    timeline: true,
    legend: false
  };


};

export default viz;
