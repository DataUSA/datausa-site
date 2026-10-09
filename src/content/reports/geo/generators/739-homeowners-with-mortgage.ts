// Converted from legacy canon_cms_generator #739 "Homeowners with Mortgage" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 739,
  name: "Homeowners with Mortgage",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygh_homeowners_with_mortgage_spending_30_percent_on_costs_5&include=${attrs.hierarchy}:${attrs.id}&measures=Homeowners by Mortgage,Homeowners by Mortgage Moe&drilldowns=Year,Mortgage Status `,
  logic: (resp, {libs}) => {
    const data = resp.data;

    const lastYear = libs.d3.max(data, (d: any) => d.Year)
    const prevYear = lastYear - 1

    const currData = data.filter((d: any) => d.Year === lastYear)
    const prevData = data.filter((d: any) => d.Year === prevYear)
    const measure: string = "Homeowners by Mortgage";

    const currOwners: any = currData[0] ? currData.find((d: any) => d["Mortgage Status ID"] === 0)[measure] : false; //21
    const currTotal: any = currData[0] ? libs.d3.sum(currData, (d: any) => d[measure]) : false; //33
    const currPct: any = currData[0] ? currOwners / currTotal * 100 : false;

    const retObj: Record<string, any> = {
      pct_homeownersMortgage: currData[0] ? currPct : false,
      curr_homeownersMortgage: currData[0] ? currOwners : false,
      currYear_homeownersMortgage: currData[0] ? currData[0].Year : false,
    };

    if (prevData.length) {
      const prevOwners = prevData.find((d: any) => d["Mortgage Status ID"] === 0)[measure];
      const prevTotal = libs.d3.sum(prevData, (d: any) => d[measure]);
      const prevPct = prevOwners / prevTotal * 100;
  
      retObj.prev_homeownersMortgage = prevPct;
      retObj.prevYear_homeownersMortgage = prevData[0].Year;
      retObj.diff_homeownersMortgage = currPct - prevPct;
    }

    return retObj;

  }
};

export default generator;
