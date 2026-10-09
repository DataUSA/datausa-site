// Converted from legacy canon_cms_generator #600 "[Population] Population by PUMA" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 600,
  name: "[Population] Population by PUMA",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=Year,PUMA&measures=Total+Population&Year=2020&State=${attrs.id}`,
  logic: (resp, {formatters}) => {
    const {commas, abbreviate} = formatters;
    const data = resp.data;

    if (data.length !== 0){
      const lastYearPums1 = data[0]["Year"]
  
      const lastData = data.filter((d: any) => d["Year"]*1 === lastYearPums1*1)
  
      data.sort((a: any, b: any) => b["Total Population"] - a["Total Population"])
  
      const residentState = data.reduce((a: any, b: any) => a + b["Total Population"], 0);
  
      const url = (d: any) => `<a href="/profile/geo/${d["Slug State"]}">${d["State"]}</a> (${commas(d["Total Population"])} residents)`;
      const top3PumaPopulation = data.slice(0,3).map((d: any) => url(d))
  
      return {
        residentState,
        top3PumaPopulation,
      }
    }

    else{
      return{
        residentState: false
      }
    }






  }
};

export default generator;
