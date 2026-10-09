// Converted from legacy canon_cms_generator #618 "Industries (Common ACS) ⚠️ Needs Link" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 618,
  name: "Industries (Common ACS) ⚠️ Needs Link",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygsi_gender_by_industry_c_5&include=${attrs.hierarchy}:${attrs.id}&measures=Workforce+by+Industry+and+Gender&drilldowns=Industry&sort=Workforce+by+Industry+and+Gender.desc&time=Year.latest&limit=11`,
  logic: (resp, {formatters}) => {
    const {commas} = formatters;

    const measure: string = "Workforce by Industry and Gender";

    const text = resp.data.filter((d: any) => d[measure] > 0).slice(0, 3).map((d: any) => `${d["Industry"]} (${commas(d[measure])} people)`);

    return {
      commonIndustrySplitACS: resp.data.length === 11,
      commonIndustryListACS: text
    }
  }
};

export default generator;
