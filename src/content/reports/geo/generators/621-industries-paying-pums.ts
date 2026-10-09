// Converted from legacy canon_cms_generator #621 "Industries (Paying PUMS)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 621,
  name: "Industries (Paying PUMS)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&measures=Average+Wage,Record+Count&time=Year.latest&drilldowns=Year,Industry+Group&filters=Record+Count.gte.5&sort=Average+Wage.desc&limit=6`,
  logic: (resp, {formatters}) => {
    const {salary} = formatters;

    const data = resp.data.filter((d: any) => d["Industry Group ID"] !== "");

    data.sort((a: any, b: any) => {return b["Average Wage"] > a["Average Wage"] ? 1 : -1})

    const ids = data.map((d: any) => d["Industry Group ID"]);
    const names = data.map((d: any) => d["Industry Group"]);
    const text = data.slice(0, 3)
      .map((d: any) => `<a href="/profile/naics/${d["Industry Group ID"] || d["Industry Group ID"]}">${d["Industry Group"]}</a> (${salary(d["Average Wage"])})`);

    return {
      payIndustryYear: data[0]["Year"],
      payingIndustryIDs: ids,
      payingIndustryName: names,
      payingIndustryListPUMS: text,
      payingIndustrySplitPUMS: data.length >= 11,
      payingIndPUMSnames: data.slice(0, 3).map((d: any) => d["Industry Group"])
    }
  }
};

export default generator;
