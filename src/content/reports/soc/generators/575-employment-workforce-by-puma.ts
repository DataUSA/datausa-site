// Converted from legacy canon_cms_generator #575 "[Employment] Workforce by PUMA" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 575,
  name: "[Employment] Workforce by PUMA",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,PUMA&locale=en&measures=Record+Count,Total+Population&top=3.Year.Total+Population.desc&time=Year.latest&filters=Record+Count.gte.5&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true`,
  logic: (resp, {formatters}) => {
    const data = resp.data;

    if(data.length > 0){
      const latestYear = data[0].Year;
  
      const url = (d: any) => `<a href='/profile/geo/${d["PUMA ID"]}'>${d["PUMA"]}</a>`;
      const dataFiltered = data.map(url);
  
      const list_: any = [];
  
      const name1 = dataFiltered.length > 0 && dataFiltered[0]
      const name2 = dataFiltered.length > 1 && dataFiltered[1]
      const name3 = dataFiltered.length > 2 && dataFiltered[2]
  
      const metric1 = formatters.commas(data.length > 0 && data[0]["Total Population"])
      const metric2 = formatters.commas(data.length > 1 && data[1]["Total Population"])
      const metric3 = formatters.commas(data.length > 2 && data[2]["Total Population"])
  
  
      if (name1) {
        list_.push(`${name1} (${metric1})`);
      }
  
      if (name2) {
        list_.push(`${name2} (${metric2})`);
      }
  
      if (name3) {
        list_.push(`${name3} (${metric3})`);
      }
  
  
      return {
        topWorkforceList_pumasEBL: formatters.list(list_),
        topWorkforceLastYear_pumasEBL: latestYear,
      }
    }
    else{
      return{
        topWorkforceList_pumasEBL: false,
        topWorkforceLastYear_pumasEBL: false
      }
    }
  

  }
};

export default generator;
