// Converted from legacy canon_cms_generator #444 "[Skills] RCA" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 444,
  name: "[Skills] RCA",
  allowed: "always",
  api: attrs => `${attrs.tesseract}complexity/rca_historical.jsonrecords?cube=onet_by_cip&location=${attrs.hierarchy}&activity=Skill+Element&measure=Total+Score&time=Year&cuts=${attrs.hierarchy}:${attrs.id}`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);

    const latest = data
      .sort((a: any, b: any) => b["Total Score RCA"] - a["Total Score RCA"]);

    return {
      skillsRCATop1: latest.length > 0 ? latest[0]["Skill Element"] : false,
      skillsRCATop3: latest.slice(0,3).map((d: any) => d["Skill Element"])
    }
  }
};

export default generator;
