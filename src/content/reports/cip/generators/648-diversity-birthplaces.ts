// Converted from legacy canon_cms_generator #648 "[Diversity] Birthplaces" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 648,
  name: "[Diversity] Birthplaces",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year%2CBirthplace&include=CIP2:${attrs.cip2};Nativity:2;Workforce+Status:true&locale=en&measures=Record+Count%2CTotal+Population&sort=Total+Population.desc&filters=Record+Count.gte.5&time=Year.latest&limit=5`,
  logic: (resp, {libs}) => {
    ///api/data?CIP2=<id>&measure=Total%20Population,Record%20Count&drilldowns=Birthplace&Nativity=2&order=Total%20Population&sort=desc&Workforce%20Status=true&Record%20Count>=5&Year=latest

    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);
    //const data = resp.data

    return {
      degreeCommonCountry1: data.length > 0 && data[0]["Birthplace"],
      degreeCommonCountry1Value: data.length > 0 && data[0]["Total Population"],
      degreeCommonCountry2: data.length > 1 && data[1]["Birthplace"],
      degreeCommonCountry2Value: data.length > 1 && data[1]["Total Population"],
      degreeCommonCountry3: data.length > 2 && data[2]["Birthplace"],
      degreeCommonCountry3Value: data.length > 2 && data[2]["Total Population"]
    }
  }
};

export default generator;
