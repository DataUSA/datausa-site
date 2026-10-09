// Converted from legacy canon_cms_generator #761 "[Health] Health Service Type" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 761,
  name: "[Health] Health Service Type",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=prism_service_access&drilldowns=Health+Provider&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Household-weighted+avg+estimated+drive+time+%28minutes%29&exclude=Health+Provider:0`,
  logic: (resp, {variables}) => {
    const data = resp.data;

    const visiblePrismDataState = data.length > 0 && variables.hierarchy === "State";

    if(data.length > 0){
  
      const healthServiceType = data.reduce((acc: any, d: any) => {
        acc.push({
          option: `health_${d["Health Provider ID"]}`,
          label: d["Health Provider"]
        })
        return acc
      }, []);
  
      const healthServiceTypeDefault = healthServiceType[0]["option"]
  
      return {
        healthServiceType,
        healthServiceTypeDefault,
        visiblePrismDataState
      }
    }

    else{
      return{
        visiblePrismDataState
      }
    }


  }
};

export default generator;
