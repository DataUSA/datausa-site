// Converted from legacy canon_cms_generator #617 "Industries (Common PUMS Sectors)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 617,
  name: "Industries (Common PUMS Sectors)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&include=${attrs.hierarchy}:${attrs.id}&measures=Total+Population&time=Year.latest&drilldowns=Industry+Sector&sort=Total+Population.desc&Workforce+Status=true&limit=5`,
  logic: (resp) => {
    const data = resp.data.filter((d: any) => d["Industry Sector ID"] !== "")

    return {
      commonIndPUMSgroups: data.slice(0,3).map((d: any) => d["Industry Sector"])
    }
  }
};

export default generator;
