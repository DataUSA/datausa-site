// Converted from legacy canon_cms_generator #624 "[Industries] Median Earnings by Sex" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 624,
  name: "[Industries] Median Earnings by Sex",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygsi_gender_by_industry_for_median_earnings_5&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Gender&measures=Median Earnings by Industry and Gender: Industry,Median Earnings by Industry and Gender Moe: Industry&time=Year.latest`,
  logic: (resp, {formatters, variables}) => {
    const {id} = variables;
    const data = resp.data;
    const {salary} = formatters;


    const menMedianEarning = (data.filter((d: any) => d["Gender ID"] === 0)[0]["Median Earnings by Industry and Gender: Industry"])
    const womenMedianEarning = (data.filter((d: any) => d["Gender ID"] === 1)[0]["Median Earnings by Industry and Gender: Industry"])

    const menMedianEarningMoe = data.filter((d: any) => d["Gender ID"] === 0)[0]["Median Earnings by Industry and Gender Moe: Industry"]
    const womenMedianEarningMoe = data.filter((d: any) => d["Gender ID"] === 1)[0]["Median Earnings by Industry and Gender Moe: Industry"]


    return {
      menMedianEarning: menMedianEarning ? salary(menMedianEarning) : false,
      womenMedianEarning: womenMedianEarning ? salary(womenMedianEarning) : false,
      menMedianEarningMoe: menMedianEarningMoe ? salary(menMedianEarningMoe) : salary(0),
      womenMedianEarningMoe: womenMedianEarningMoe ? salary(womenMedianEarningMoe) : salary(0),
    };
  }
};

export default generator;
