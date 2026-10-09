// Converted from legacy canon_cms_generator #625 "[Industries] Median Earnings by Industry and Sex" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 625,
  name: "[Industries] Median Earnings by Industry and Sex",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygsi_gender_by_industry_for_median_earnings_5&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year,Gender,Industry Group&measures=Median Earnings by Industry and Gender: Industry+Group&time=Year.latest`,
  logic: (resp, {formatters, variables}) => {
    const {id} = variables;
    const data = resp.data.filter((d: any) => d["Industry Group ID"] !== 0 && d["Median Earnings by Industry and Gender: Industry Group"] !== null);
    const {salary} = formatters;

    if (data.length === 0) {
        return {
        lastYearMedianEarnings: false,
        top3IndustriesMedianEarningMen: false,
        top3IndustriesMedianEarningWomen: false,
        medianEarningsByIndustryVis: false
      };
    }

    else {
    const lastYearMedianEarnings = data[0]["Year"]

    data.forEach((d: any) => {
      d["Industry Group"] = d["Industry Group"].replace(" (Group)", "");
    });

    const menData = data.filter((d: any) => d["Gender ID"] === 0).sort((a: any, b: any) => b["Median Earnings by Industry and Gender: Industry Group"] > a["Median Earnings by Industry and Gender: Industry Group"] ? 1 : -1);
    const womenData = data.filter((d: any) => d["Gender ID"] === 1).sort((a: any, b: any) => b["Median Earnings by Industry and Gender: Industry Group"] > a["Median Earnings by Industry and Gender: Industry Group"] ? 1 : -1);

    const top3IndustriesMedianEarningMen = menData.slice(0, 3)
                                                  .map((d: any, i: any) => `${d["Industry Group"]} (${salary(d["Median Earnings by Industry and Gender: Industry Group"])})`)

    const top3IndustriesMedianEarningWomen = womenData.slice(0, 3)
                                                      .map((d: any, i: any) => `${d["Industry Group"]} (${salary(d["Median Earnings by Industry and Gender: Industry Group"])})`)



    return {
      lastYearMedianEarnings,
      top3IndustriesMedianEarningMen,
      top3IndustriesMedianEarningWomen,
      medianEarningsByIndustryVis: true
    };
    }
  }
};

export default generator;
