// Converted from legacy canon_cms_generator #169 "[Diversity] Birthplaces (RCA)" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 169,
  name: "[Diversity] Birthplaces (RCA)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=CIP2&activity=Birthplace&measure=Total+Population&time=Year&cuts=CIP2:${attrs.cip2};Workforce+Status:true;Nativity:2&top=3.Year.Total+Population+RCA.desc`,
  logic: (resp, {libs}) => {
    // /api/data?CIP2=<id>&measure=ycbpop RCA,Record Count&drilldowns=Birthplace,Nativity&Nativity=2&order=ycbpop RCA&sort=desc&Workforce Status=true&Record Count>=5

    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);

    // ycbpop RCA
    return {
      degreeCommonCountry1RCA: data.length > 0 && data[0]["Birthplace"],
      degreeCommonCountry1RCAValue: data.length > 0 && data[0]["Total Population RCA"],
      degreeCommonCountry2RCA: data.length > 1 && data[1]["Birthplace"],
      degreeCommonCountry2RCAValue: data.length > 1 && data[1]["Total Population RCA"],
      degreeCommonCountry3RCA: data.length > 2 && data[2]["Birthplace"],
      degreeCommonCountry3RCAValue: data.length > 2 && data[2]["Total Population RCA"]
    }
  }
};

export default generator;
