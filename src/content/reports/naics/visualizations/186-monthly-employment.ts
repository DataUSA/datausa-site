// Converted from legacy canon_cms_section_visualization #186 "section monthly-employment" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, swap}) => {
  const {blsMonthlyDimension, blsMonthlyID, colorHighlight, tesseract} = variables;
  const {timeFormat} = libs.d3;
  const {abbreviate, growth} = formatters;

  const monthFormat = timeFormat("%B %Y");

  const url: string = `${tesseract}tesseract/data.jsonrecords?cube=BLS Employment - ${blsMonthlyDimension} Only&drilldowns=Month of Year,${blsMonthlyDimension}&measures=NSA Employees&${blsMonthlyDimension}=${blsMonthlyID}`;

  const selector = swap("[[monthly-employment]]");
  const isGrowth = selector.includes("Growth");
  const startYear = +swap("[[bls-start-year]]");

  return {
    data: url,
    dataFormat: (resp: any) => {
    
      const data = resp.data;
      if (data.length && !data[0].Date) {
        data.forEach((d: any) => {
          const monthId = d["Month of Year ID"];
          d.Date = `${monthId}-01`;
          const prevYear = data.find((x: any) => x["Month of Year ID"] === `${monthId.slice(0, 4) - 1}-${monthId.slice(5, 7)}`);
          d["NSA Employees Growth"] = prevYear ? growth({curr: d["NSA Employees"], prev: prevYear["NSA Employees"]}) : 0;
          // const currMonth = +monthId.slice(5, 7);
          // const prevMonthID = `${currMonth === 1 ? monthId.slice(0, 4) - 1 : monthId.slice(0, 4)}-${currMonth === 1 ? 12 : currMonth - 1}`;
          // const prevMonth = data.find((x: any) => x["Month of Year ID"] === prevMonthID);
          // d["NSA Employees Growth (MoM)"] = prevMonth ? growth({curr: d["NSA Employees"], prev: prevMonth["NSA Employees"]}) : 0;
        });
      }
    
      return data.filter((d: any) => +d["Month of Year ID"].slice(0, 4) >= startYear);
    },
    groupBy: blsMonthlyDimension,
    legend: false,
    lineLabels: true,
    shapeConfig: {
      Line: {
        stroke: colorHighlight
      }
    },
    startYear,
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
      },
      titleStyle: {
        color: colorHighlight
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
