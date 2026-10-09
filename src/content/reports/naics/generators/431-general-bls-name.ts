// Converted from legacy canon_cms_generator #431 "[General] BLS Name" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 431,
  name: "[General] BLS Name",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=bls_growth_industry&drilldowns=Industry&measures=Industry+Jobs&time=Year.latest`,
  logic: (resp, {formatters, variables}) => {
    const {blsIds} = variables

    const blsIDs = Object.values(blsIds);

    const data = resp.data.filter((d: any) => blsIDs.includes(d["Industry ID"]))

    const blsName = data.map((d: any, i: any) => `${d["Industry"]}`)
    const blsID = data.map((d: any, i: any) => `${d["Industry ID"]}`)

    return {
     blsName: formatters.list(blsName),
     blsID
    };

  }
};

export default generator;
