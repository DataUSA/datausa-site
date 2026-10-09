// Converted from legacy canon_cms_generator #689 "Homeowners" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 689,
  name: "Homeowners",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=acs_ygo_tenure_5&drilldowns=Year,Occupied+By&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Household+Ownership,Household+Ownership+Moe&time=Year.latest`,
  logic: (resp, {libs}) => {
    const currData = resp.data;
    const measure: string = "Household Ownership";

    const currOwners = currData.find((d: any) => d["Occupied By ID"] === 0)[measure];
    const currTotal = libs.d3.sum(currData, (d: any) => d[measure]);
    const currPct = currOwners / currTotal * 100;

    return {
      homeownerCurr: currPct
    };

  }
};

export default generator;
