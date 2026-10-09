// Converted from legacy canon_cms_section_visualization #439 "section median_earnings" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const {hierarchy, id, iconGender, colorGender, tesseract} = variables;
  const {commas, abbreviate, salary} = formatters;

  const data: string = `${tesseract}tesseract/data?cube=acs_ygsi_gender_by_industry_for_median_earnings_5&include=${hierarchy}:${id}&exclude=Industry+Group:0&drilldowns=Gender,Industry+Group,Year&measures=Median Earnings by Industry and Gender: Industry Group,Median Earnings by Industry and Gender Moe: Industry Group`
  //const dataURL = `/api/data?Geography=${id}&drilldowns=Gender,Industry Group,Year&measures=Median Earnings by Industry and Gender,Median Earnings by Industry and Gender Moe`

  return {
    data: data,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["Industry Group"] !== "Total");
      data.forEach((d: any) => {
        d["Industry Group"] = d["Industry Group"].replace(" (Group)", "");
        d["Gender ID"] = `${d["Gender ID"]}`
      });
      return data;
    },
    discrete: 'y',
    groupBy: ['Gender'],
    legend: true,
    legendConfig: {
      label: (d: any) => d.Gender,
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d["Gender"]],
        //fill: (d: any) => d["Gender"] === "Male" ? "#5259fd" : "#38d1da"
      }
    },
    legendTooltip: {
      tbody: [],
      //title: (d: any) => d.Gender,
    },
    shapeConfig: {
      label: (d: any) => '',
      Bar: {
        fill: (d: any) => colorGender[d.Gender]
      }
      //fill: (d: any) => d["Gender"] === "Male" ? "#5259fd" : "#38d1da"
    },
    stacked: true,
    time: "Year",
    type: "BarChart",
    tooltipConfig: {
      tbody: [
        ["Median Earnigs", (d: any) => abbreviate(d["Median Earnings by Industry and Gender: Industry Group"])],
        ["Margin of Error", (d: any) => `± ${commas(d["Median Earnings by Industry and Gender Moe: Industry Group"])}`]
      ]
    },
    x: (d: any) => { 
      return d["Gender ID"] == "1" ? d["Median Earnings by Industry and Gender: Industry Group"] * -1 : d["Median Earnings by Industry and Gender: Industry Group"] },
    xConfig: {
      tickFormat: (d: any) => formatters.dollar(Math.abs(d)),
      title: "Median Earnings by Gender"
    },
    y: "Industry Group",
    ySort: (a: any, b: any) => b["Industry Group"].localeCompare(a["Industry Group"]),
  }

};

export default viz;
