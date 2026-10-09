// Converted from legacy canon_cms_section_visualization #257 "section races" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, swap}) => {
  const {hierarchy, id, colorGrey, colorHighlight} = variables;
  const {abbreviate, growthPct, commas, salary} = formatters;
  const {sum, nest} = libs.d3;

  const selector = swap("[[races-employment]]") // employedR, unemployedR
  const workstatus = selector === "employedR" ? "true" : "false"

  return {
    data: `/api/data?drilldowns=Year,Race&measures=Total Population,Record Count&${hierarchy}=${id}&Record Count>=5&Workforce Status=${workstatus}`,
    dataFormat: (resp: any) => {
      const data = resp.data;
      libs.d3.nest()
        .key((d: any) => `${d.Year}`)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d["Total Population"]);
          group.values.forEach((d: any) => d.share = d["Total Population"] / total);
        });
      return data;
    },
    height: 300,
    groupBy: ["ID Race"],
    label: (d: any) => String(d["Race"]),
    discrete: "y",
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Total Population", (d: any) => commas(d["Total Population"])],
        ["Share", (d: any) => `${abbreviate(d["share"] * 100)}%`]
      ]
    },
    type: "BarChart",
    x: "share",
    xConfig: {
      title: "Share",
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`
    },
    y: "Race",
    ySort: (a: any, b: any) => a["share"] - b["share"],
    yConfig: {
      title: "Race"
    }
  };

  
};

export default viz;
