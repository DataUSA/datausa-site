// Converted from legacy canon_cms_generator #446 "[Skills] Top Skills (Total)" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 446,
  name: "[Skills] Top Skills (Total)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=onet_by_pums&drilldowns=Skill+Element,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Total+Score`,
  logic: (resp, {libs}) => {
    const yearMembers: any = [...new Set(resp.data.map((d: any) => d["Year"]))].sort((a: any, b: any) => b - a);

    if (!resp.data.length) return {showValueSkills: false};

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"])
    const data = resp.data.filter((d: any) => d["Year"] === latestYear)

    data.sort((a: any, b: any) => b["Total Score"] - a["Total Score"])

    return {
      top1Skills: data[0]["Skill Element"],
      top2Skills: data[1]["Skill Element"],
      top3Skills: data[2]["Skill Element"],
      showValueSkills: true,
    }

  }
};

export default generator;
