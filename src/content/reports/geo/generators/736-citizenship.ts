// Converted from legacy canon_cms_generator #736 "CitizenShip" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 736,
  name: "CitizenShip",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygc_citizenship_status_5&measures=Citizenship+Status&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year`,
  logic: (resp, {libs}) => {
    const data = resp.data;

    const citizenCurrYear: any = data[0] ? libs.d3.max(data, (d: any) => d.Year) : false
    const citizenPrevYear = citizenCurrYear - 1

    const citizenTotal = data.filter((d: any) => d.Year === citizenCurrYear)[0]["Citizenship Status"]
    const citizenTotalPrev = data.filter((d: any) => d.Year === citizenPrevYear)[0]["Citizenship Status"]

    return {
      citizenTotal,
      citizenTotalPrev,
      citizenCurrYear,
      citizenPrevYear
    };

  }
};

export default generator;
