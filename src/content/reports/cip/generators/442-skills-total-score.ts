// Converted from legacy canon_cms_generator #442 "[Skills] Total Score" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 442,
  name: "[Skills] Total Score",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?${attrs.hierarchy}=${attrs.id}&cube=onet_by_cip&drilldowns=Year%2CSkill+Element&measures=Total+Score`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);

    const latest = data
      .sort((a: any, b: any) => b["Total Score"] - a["Total Score"]);

    return {
      skillsTop1: latest.length > 0 ? latest[0]["Skill Element"] : false,
      skillsTop3: latest.slice(0,3).map((d: any) => d["Skill Element"])
    }
  }
};

export default generator;
