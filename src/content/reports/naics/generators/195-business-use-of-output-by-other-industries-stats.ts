// Converted from legacy canon_cms_generator #195 "[Business] Use of Output by Other Industries Stats" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 195,
  name: "[Business] Use of Output by Other Industries Stats",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?Commodity+L0=${attrs.beaL0}&cube=bea_use&drilldowns=Commodity+L0,Industry+L0,Year&measures=Value+Millions&sort=Value+Millions.desc&limit=10&time=year.latest`,
  logic: (resp) => {
    const url = (d: any) => `<a href='/profile/naics/${d["Industry L0 ID"]}'>${d["Industry L0"]}</a>`;

    const vaFilter: any = ["FINALUSES", "VA", "TOTCOMOUT", "HS", "ORE", "GFGD", "G", "TOTII", "GFGN", "GSLE", "GFE", "GSLG", "Other", "Used", "TOTFU", "TOTVA", "TOTINDOUT", "V001", "V002", "V003", "F010", "F020", "F030", "F040", "F050", "F100"];

    const listIntermediateValues = resp.data.filter((d: any) => !vaFilter.includes(d["Industry L0 ID"])).map(url);

    return {
      topOutput1Name: listIntermediateValues[0] || undefined,
      topOutput2Name: listIntermediateValues[1] || undefined,
      topOutput3Name: listIntermediateValues[2] || undefined
    }


  }
};

export default generator;
