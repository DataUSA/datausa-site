// Converted from legacy canon_cms_section_visualization #185 "section covid-employment" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, swap}) => {
  const {stateDataID, tesseract} = variables;
  const {nest, timeFormat} = libs.d3;
  const {abbreviate, growth} = formatters;

  const monthFormat = timeFormat("%B %Y");

  const selector = swap("[[monthly-employment]]");
  const isGrowth = selector.includes("Growth");
  // const startYear = +"[[bls-start-year]]";
  const startYear = 2018;

  const url: string = `${tesseract}tesseract/data.jsonrecords?cube=BLS Employment - Supersector Only&drilldowns=Month of Year,Supersector&measures=NSA Employees&State=${stateDataID}`;

  return {
    data: url,
    dataFormat: (resp: any) => {
    
      const returnData = resp.data;
      if (returnData.length && !returnData[0].Date) {
      
        nest()
          .key((d: any) => d["Supersector ID"])
          .entries(returnData)
          .forEach((group: any) => {
            const data = group.values;
            data.forEach((d: any) => {
              const monthId = d["Month of Year ID"];
              d.Date = `${monthId}-02`;
              const prevYear = data.find((x: any) => x["Month of Year ID"] === `${monthId.slice(0, 4) - 1}-${monthId.slice(5, 7)}`);
              d["NSA Employees Growth"] = prevYear ? growth({curr: d["NSA Employees"], prev: prevYear["NSA Employees"]}) : 0;
            });
          });
        
      }
    
      return returnData.filter((d: any) => +d["Month of Year ID"].slice(0, 4) >= startYear);
    },
    groupBy: "Supersector",
    legend: false,
    lineLabels: true,
    shapeConfig: {
      Line: {
        strokeWidth: 2
      }
    },
    time: "Date",
    timeline: false,
    tooltipConfig: {
      tbody: (d: any) => {
        const arr: any = [
          ["Month", monthFormat(new Date(d.Date))],
          ["Employees", abbreviate(d["NSA Employees"])]
        ];
        if (d["NSA Employees Growth"]) arr.push(["Employee Growth (YoY)", `${abbreviate(d["NSA Employees Growth"])}%`]);
        return arr;
      }
    },
    type: "LinePlot",
    x: "Date",
    y: `NSA Employees${isGrowth ? " Growth" : ""}`,
    yConfig: {
      tickFormat: isGrowth ? (d: any) => `${abbreviate(d)}%` : abbreviate,
      title: variables[selector]
    }
  }
};

export default viz;
