// Converted from legacy canon_cms_generator #674 "Homeowners (Tenure)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 674,
  name: "Homeowners (Tenure)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygo_tenure_5&include=${attrs.hierarchy}:${attrs.id}&measures=Household+Ownership,Household+Ownership+Moe&drilldowns=Year,Occupied+By`,
  logic: (resp, {libs, variables}) => {
    const data = resp.data;

    const lastYear = libs.d3.max(data, (d: any) => d.Year)
    const prevYear = lastYear - 1


    const currData = data.filter((d: any) => d.Year === lastYear)
    const prevData = data.filter((d: any) => d.Year === prevYear)
    const measure: string = "Household Ownership";
    const {id} = variables;

    const currOwners = currData.find((d: any) => d["Occupied By ID"] === 0)[measure];
    const currTotal = libs.d3.sum(currData, (d: any) => d[measure]);
    const currPct = currOwners / currTotal * 100;

    const retObj: Record<string, any> = {
      pct_rentOwn: currPct,
      curr_rentOwn: currPct,
      currYear_rentOwn: currData[0].Year,
      acsMultiYear: prevData.length > 1,
      acsSingleYear: prevData.length === 0,
      acsMultiYearNotNation: prevData.length > 1 && id !== "01000US"
    };

    if (prevData.length) {
      const prevOwners = prevData.find((d: any) => d["Occupied By ID"] === 0)[measure];
      const prevTotal = libs.d3.sum(prevData, (d: any) => d[measure]);
      const prevPct = prevOwners / prevTotal * 100;
  
      retObj.prev_rentOwn = prevPct;
      retObj.prevYear_rentOwn = prevData[0].Year;
      retObj.diff_rentOwn = currPct - prevPct;
    }

    return retObj;

  }
};

export default generator;
