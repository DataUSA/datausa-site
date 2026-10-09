// Converted from legacy canon_cms_generator #447 "[Skills] Top Skills (RCA)" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 447,
  name: "[Skills] Top Skills (RCA)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}complexity/rca_historical.jsonrecords?cube=onet_by_pums&location=${attrs.hierarchy}&activity=Skill+Element&measure=Total+Score&time=Year&parents=true&cuts=${attrs.hierarchy}:${attrs.id}&time_filter=Year.latest`,
  logic: (resp, {libs}) => {
    if (!resp.data.length) return {showRCASkills: false};

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"])
    const data = resp.data.filter((d: any) => d["Year"] === latestYear)

    data.sort((a: any, b: any) => b["Total Score RCA"] - a["Total Score RCA"])

    return {
      top1SkillsRCA: data[0]["Skill Element"],
      top2SkillsRCA: data[1]["Skill Element"],
      top3SkillsRCA: data[2]["Skill Element"],
      showRCASkills: true,
    }

  }
};

export default generator;
