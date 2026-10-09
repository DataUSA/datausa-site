// Converted from legacy canon_cms_generator #564 "[Diversity] Education by workforce and wage" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 564,
  name: "[Diversity] Education by workforce and wage",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Group&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&time=Year.latest&locale=en&measures=Total+Population,Average+Wage`,
  logic: (resp, {libs, formatters}) => {
    // /api/data?drilldowns=Group&measures=Total Population,Average Wage&<hierarchy>=<id>&Workforce Status=true&Year=<pumsLatestYear>

    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);
    //const data = resp.data;
    const {commas, abbreviate, salary, lower} = formatters;

    const lastYearEducation: any = data[0] ? max(data, (d: any) => d["Year"]) : undefined
    const currData = data.filter((d: any) => d["Year"] === lastYearEducation);


    currData.sort((a: any, b: any) => {return b["Total Population"] > a["Total Population"] ? 1 : -1})
    const top3WorkforceEducation = currData.slice(0,3).map((d: any, i: any) => `${lower(d["Group"])} (${commas(d["Total Population"])} people)`)
    const top3EducationLevel = currData.slice(0,3).map((d: any, i: any) => `${lower(d["Group"])}`)

    const totalWorkforceEducation = currData.reduce((sum: any, d: any) => {return sum + d["Total Population"];},0)
    const totalTop3WorkforceEducation = currData.slice(0,3).reduce((sum: any, d: any) => {return sum + d["Total Population"];},0)
    const pctTopEducationLevel = (totalTop3WorkforceEducation /totalWorkforceEducation) * 100

    currData.sort((a: any, b: any) => {return b["Average Wage"] > a["Average Wage"] ? 1 : -1})
    const topWageEducation: any = currData[0] ? currData[0]["Group"] : false



    return {
      pctTopEducationLevel,
      lastYearEducation,
      top3EducationLevel,
      top3WorkforceEducation,
      topWageEducation
    };
  }
};

export default generator;
