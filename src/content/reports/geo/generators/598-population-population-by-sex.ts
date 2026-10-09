// Converted from legacy canon_cms_generator #598 "[Population] Population by Sex" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 598,
  name: "[Population] Population by Sex",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=Gender&measures=Total+Population&time=Year.latest&include=${attrs.hierarchy}:${attrs.id}`,
  logic: (resp, {libs, formatters, variables}) => {
    const {id} = variables;
    const data = resp.data;
    const {commas} = formatters;

    if (data.length !== 0) {
      const residentPopulation = libs.d3.sum(data, (d: any) => d["Total Population"]);
  
      const menResidents = data.filter((d: any) => d["Gender ID"] === 1)[0]["Total Population"]
      const womenResidents = data.filter((d: any) => d["Gender ID"] === 2)[0]["Total Population"]
  
      const menResidentsPct = (data.filter((d: any) => d["Gender ID"] === 1)[0]["Total Population"]/residentPopulation) * 100
      const womenResidentsPct = (data.filter((d: any) => d["Gender ID"] === 2)[0]["Total Population"]/residentPopulation) * 100
  
  
      return {
        residentPopulation,
        womenResidents,
        menResidents,
        menResidentsPct,
        womenResidentsPct
      }
    }

    else {
      return{
       residentPopulation: false
      }
    }
  }
};

export default generator;
