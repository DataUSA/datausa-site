// Converted from legacy canon_cms_generator #296 "[Employment] BLS Monthly Employment" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 296,
  name: "[Employment] BLS Monthly Employment",
  allowed: "blsMonthlyID",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=BLS Employment - ${attrs.blsMonthlyDimension} Only&drilldowns=Month of Year,${attrs.blsMonthlyDimension}&measures=NSA Employees&${attrs.blsMonthlyDimension}=${attrs.blsMonthlyID}`,
  logic: (resp, {libs, formatters, variables}) => {
    const {max, min} = libs.d3;
    const {blsMonthlyDimension, name} = variables;

    const latest = max(resp.data, (d: any) => new Date(`${d["Month of Year ID"]}-01`)).getTime();
    const latestEmployment = resp.data.find((d: any) => new Date(`${d["Month of Year ID"]}-01`).getTime() === latest);
    const latestID = latestEmployment["Month of Year ID"];
    const prev: string = `${latestID.slice(0, 4) - 1}-${latestID.slice(5, 7)}`;
    const prevEmployment = resp.data.find((d: any) => d["Month of Year ID"] === prev);
    const years = Array.from(new Set(resp.data.map((d: any) => +d["Month of Year ID"].slice(0, 4))))
      .filter((d: any) => d < 2019)
      .sort().slice(1);

    return {
      latestEmployment: latestEmployment["NSA Employees"],
      latestEmploymentDiff: latestEmployment["NSA Employees"] - prevEmployment["NSA Employees"],
      latestEmploymentGrowth: formatters.growth({curr: latestEmployment["NSA Employees"], prev: prevEmployment["NSA Employees"]}),
      latestEmploymentPrev: prevEmployment["NSA Employees"],
      latestEmploymentSector: latestEmployment[blsMonthlyDimension],
      latestEmploymentSubtitle: blsMonthlyDimension === "Supersector",
      latestEmploymentMonth: latestEmployment["Month of Year"].split(", ")[0],
      latestEmploymentCurrYear: latestID.slice(0, 4),
      latestEmploymentPrevYear: prev.slice(0, 4),
      latestEmploymentValue: "Monthly Employees (Non-Seasonally Adjusted)",
      latestEmploymentGrowthYoY: "Monthly Growth (Year-over-Year)",
      latestEmploymentStartYears: years.map(String)
    }
  }
};

export default generator;
