// Converted from legacy canon_cms_generator #685 "Citizenship (Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 685,
  name: "Citizenship (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygc_citizenship_status_5&measures=Citizenship+Status&include=Nation:01000US&time=Year.latest&drilldowns=Year,Citizenship`,
  logic: (resp, {libs}) => {
    const dataCurr = resp.data;
    const measure: string = "Citizenship Status";

    const totalCurr = libs.d3.sum(dataCurr, (d: any) => d[measure]);
    const citizensCurr = dataCurr.find((d: any) => d["Citizenship ID"] === 0)[measure];

    return {
      citizenshipNation: citizensCurr / totalCurr * 100
    };

  }
};

export default generator;
