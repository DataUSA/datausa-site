// Converted from legacy canon_cms_generator #683 "Citizenship" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 683,
  name: "Citizenship",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygc_citizenship_status_5&measures=Citizenship+Status&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year,Citizenship`,
  logic: (resp, {libs}) => {
    if (!resp.data.length) return {citizenshipCurr: false};

    const yearCurr = libs.d3.max(resp.data, (d: any) => d["Year"]);

    const dataCurr = resp.data.filter((d: any) => d["Year"] === yearCurr);
    const dataPrev = resp.data.filter((d: any) => d["Year"] === yearCurr - 1);

    const measure: string = "Citizenship Status";

    const totalCurr = libs.d3.sum(dataCurr, (d: any) => d[measure]);
    const citizensCurr = dataCurr.find((d: any) => d["Citizenship ID"] === 0)[measure];

    const retObj: Record<string, any> = {
      citizenshipCurr: citizensCurr / totalCurr * 100,
      citizenshipCurrYear: yearCurr
    };
  
    if (dataPrev.length) {
      const totalPrev = libs.d3.sum(dataPrev, (d: any) => d[measure]);
      const citizensPrev = dataPrev.find((d: any) => d["Citizenship ID"] === 0)[measure];
      retObj.citizenshipPrev = citizensPrev / totalPrev * 100;
      retObj.citizenshipPrevYear = dataPrev[0].Year;
      retObj.citizenshipDiff = (citizensCurr / totalCurr) - (citizensPrev / totalPrev);
    }

    return retObj;

  }
};

export default generator;
