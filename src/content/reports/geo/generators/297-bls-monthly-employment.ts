// Converted from legacy canon_cms_generator #297 "BLS Monthly Employment" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 297,
  name: "BLS Monthly Employment",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=BLS Employment - Supersector Only&drilldowns=Month of Year,State&measures=NSA Employees&State=${attrs.stateDataID}`,
  logic: (resp, {libs, formatters, variables}) => {
    const {max, min, nest, timeFormat} = libs.d3;
    const {blsMonthlyDimension, name} = variables;
    const {growth} = formatters;

    const monthFormat = timeFormat("%B %Y");

    const latest = max(resp.data, (d: any) => new Date(`${d["Month of Year ID"]}-01`)).getTime();
    const latestEmployment = resp.data.find((d: any) => new Date(`${d["Month of Year ID"]}-01`).getTime() === latest);
    const latestID = latestEmployment["Month of Year ID"];
    const prev: string = `${latestID.slice(0, 4) - 1}-${latestID.slice(5, 7)}`;
    const prevEmployment = resp.data.find((d: any) => d["Month of Year ID"] === prev);
    // const years = Array.from(new Set(resp.data.map((d: any) => +d["Month of Year ID"].slice(0, 4))))
    //   .filter((d: any) => d < 2019)
    //   .sort().slice(1);

    const covidMonth: string = "2020-04"

    const returnData = resp.data;
        if (returnData.length && !returnData[0].Date) {
      
          nest()
            .key((d: any) => d["State ID"])
            .entries(returnData)
            .forEach((group: any) => {
              const data = group.values;
              data.forEach((d: any) => {
                const monthId = d["Month of Year ID"];
                d.Date = `${monthId}-01`;
                const prevYear = data.find((x: any) => x["Month of Year ID"] === `${monthId.slice(0, 4) - 1}-${monthId.slice(5, 7)}`);
                d["NSA Employees Growth"] = prevYear ? growth({curr: d["NSA Employees"], prev: prevYear["NSA Employees"]}) : 0;
              });
            });
        }
    
    const covidEmploymentGrowth = returnData.filter((d: any) => d["Month of Year ID"] === covidMonth)[0]["NSA Employees Growth"]

    return {
      latestEmploymentState: latestEmployment["State"],
      covidEmploymentGrowthWord: covidEmploymentGrowth < 0 ? "decline" : "growth",
      covidEmploymentGrowth: Math.abs(covidEmploymentGrowth),
      covidMonthEmployment: monthFormat(new Date(`${covidMonth}-02`)),
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
      latestEmploymentGrowthYoY: "Monthly Growth (Year-over-Year)"
      // latestEmploymentStartYears: years.map(String)
    }
  }
};

export default generator;
