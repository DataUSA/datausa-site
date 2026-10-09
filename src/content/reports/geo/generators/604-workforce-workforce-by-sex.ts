// Converted from legacy canon_cms_generator #604 "[Workforce] Workforce by Sex" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 604,
  name: "[Workforce] Workforce by Sex",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=Year,Gender&measures=Total+Population&time=Year.latest&include=${attrs.hierarchy}:${attrs.id}&Workforce+Status=true`,
  logic: (resp, {libs, formatters, variables}) => {
    const {id} = variables;
    const data = resp.data;
    const {commas} = formatters;

    if(data.length > 0){
  
      const lastYearWorkDiv = libs.d3.max(data, (d: any) => d.Year)
  
      const workforcePopulation = libs.d3.sum(data, (d: any) => d["Total Population"]);
  
      const menWorkforce = data.filter((d: any) => d["Gender ID"] === 1)[0]["Total Population"]
      const womenWorkforce = data.filter((d: any) => d["Gender ID"] === 2)[0]["Total Population"]
  
      const menWorkforcePct = (data.filter((d: any) => d["Gender ID"] === 1)[0]["Total Population"]/workforcePopulation) * 100
      const womenWorkforcePct = (data.filter((d: any) => d["Gender ID"] === 2)[0]["Total Population"]/workforcePopulation) * 100
  
  
      return {
        lastYearWorkDiv,
        workforcePopulation,
        womenWorkforce,
        menWorkforce,
        menWorkforcePct,
        womenWorkforcePct
      }
    }
    else{
      return {
        workforcePopulation: false
      }
    }
  }
};

export default generator;
