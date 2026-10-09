// Converted from legacy canon_cms_generator #616 "Industries (Common PUMS)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 616,
  name: "Industries (Common PUMS)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&include=${attrs.hierarchy}:${attrs.id}&measures=Total+Population,Record+Count&Workforce+Status=true&time=Year.latest&drilldowns=Industry+Group&sort=Total+Population.desc&limit=11&filters=Record+Count.gte.5&exclude=Industry+Group:0`,
  logic: (resp, {formatters}) => {
    const {commas} = formatters;

    const data = resp.data.filter((d: any) => d["Industry Group ID"] !== "")

    const ids = data.map((d: any) => d["Industry Group ID"]);
    const names = data.map((d: any) => d["Industry Group"]);
    const text = data.slice(0, 3)
      .map((d: any) => `<a href="/profile/naics/${d["Slug Industry Group"] || d["Industry Group ID"]}">${d["Industry Group"]}</a> (${commas(d["Total Population"])} people)`);

    return {
      commonIndustryIDs: ids,
      commonIndustryNames: names,
      commonIndustryListPUMS: text,
      commonIndustrySplitPUMS: resp.data.length === 11,
      commonIndPUMSnames: data.slice(0, 3).map((d: any) => d["Industry Group"])
    }
  }
};

export default generator;
