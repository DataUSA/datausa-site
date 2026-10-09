// Converted from legacy canon_cms_generator #528 "[Education] Tuition (Sector)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 528,
  name: "[Education] Tuition (Sector)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Sector&include=Sector:1,2;${attrs.hierarchy}:${attrs.id}&locale=en&measures=State+Tuition%2COut+Of+State+Tuition&time=Year.latest`,
  logic: (resp) => {
    const data = resp.data.filter((d: any) => d["Out Of State Tuition"] !== null)

    const pub = data.filter((d: any) => d["Sector ID"] === 1)[0] ? data.filter((d: any) => d["Sector ID"] === 1) : [];
    const pvt = data.filter((d: any) => d["Sector ID"] === 2)[0] ? data.filter((d: any) => d["Sector ID"] === 2) : [];

    const tuitionPublicOOS: any = pub[0] ? pub[0]["Out Of State Tuition"] : false;
    const tuitionPublicState: any = pub[0] ? pub[0]["State Tuition"] : false;
    const tuitionPrivate: any = pvt[0] ? pvt[0]["Out Of State Tuition"] : false;

    return {
      pub,
      pvt,
      tuitionPublicOOS,
      tuitionPublicState,
      tuitionPrivate,
      tuitionBoth: tuitionPublicOOS && tuitionPrivate,
      tuitionPvtOnly: tuitionPrivate && !tuitionPublicOOS,
      tuitionPubOnly: tuitionPublicOOS && !tuitionPrivate
    }
  }
};

export default generator;
