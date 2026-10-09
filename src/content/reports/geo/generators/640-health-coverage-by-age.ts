// Converted from legacy canon_cms_generator #640 "[Health] Coverage by Age" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 640,
  name: "[Health] Coverage by Age",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygh_health_care_coverage_overall_5&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Age,Year&measures=Health Insurance Policies&time=Year.latest`,
  logic: (resp, {libs, formatters}) => {
    const data = resp.data;

    const words: Record<string, any> = {
      0: "under 18 years",
      1: "between 18 and 34 years",
      2: "between 35 and 64 years",
      3: "over 64 years"
    }

    const lastYearCoverage_ageOption: any = data[0] ? data[0]["Year"] : undefined

    const total = libs.d3.sum(data, (d: any) => d["Health Insurance Policies"]);

    data.forEach((d: any) => {
      d.Age = words[d["Age ID"]]
      d.Share = (d["Health Insurance Policies"] / total)*100
    })

    const coverageByAge = data.map((d: any, i: any) => `${formatters.growthPct(d.Share)} ${d["Age"]}`)


    return {
      lastYearCoverage_ageOption,
      coverageByAge: coverageByAge.length > 0 ? coverageByAge : false
    };
  }
};

export default generator;
