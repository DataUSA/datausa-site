// Converted from legacy canon_cms_generator #620 "Industries (Paying ACS) ⚠️ Needs Link" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 620,
  name: "Industries (Paying ACS) ⚠️ Needs Link",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygi_industry_for_median_earnings_5&include=${attrs.hierarchy}:${attrs.id}&measures=Median+Earnings+by+Industry%3A+Industry&drilldowns=Year,Industry&sort=Median+Earnings+by+Industry%3A+Industry.desc&time=Year.latest&limit=11&exclude=Industry:0`,
  logic: (resp, {formatters}) => {
    const {salary} = formatters;

    const measure: string = "Median Earnings by Industry: Industry";

    const text: any = resp.data.filter((d: any) => d[measure] > 0).length > 0 ? resp.data.filter((d: any) => d[measure] > 0).slice(0, 3).map((d: any) => `${d["Industry"]} (${salary(d[measure])})`) : false;

    return {
      payIndustryACSyear: resp.data[0]["Year"],
      payingIndustrySplitACS: resp.data.filter((d: any) => d[measure] > 0).length === 11,
      payingIndustryListACS: text
    }
  }
};

export default generator;
