// Converted from legacy canon_cms_section_visualization #435 "section rent_own" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {colorGrey, colorHighlight, hierarchy, id, tesseract, similarHierarchy, similarID} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, growthPct} = formatters;

  const optionSelected = swap("[[rentMortgage]]") //rentOwn, homeownersMortgage

  const measure = optionSelected === "rentOwn" ? "Household Ownership" : "Homeowners by Mortgage"

  const drilldown = optionSelected === "rentOwn" ? "Occupied By" : "Mortgage Status"
  const title = optionSelected === "rentOwn" ? "Homeownership" : "Homeowners with Mortgage"
  const cube = optionSelected === "rentOwn" ? "acs_ygo_tenure_5" : "acs_ygh_homeowners_with_mortgage_spending_30_percent_on_costs_5"

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=${cube}&include=${hierarchy}:${id}&drilldowns=Year,${hierarchy},${drilldown}&locale=en&measures=${measure},${measure}+Moe`

  function removeDuplicates(array: any) {
    const seen = new Set();
    return array.filter((item: any) => {
      const key = JSON.stringify(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return {
    cache: false,
    axisPersist: false,
    data: dataURL,
    dataFormat: (resp: any) => {
      const dataID = resp.data;

      nest().key((d: any) => `${d.Year}_${d.hierarchy}`)
        .entries(dataID)
        .forEach((group: any) => {
          const owners = group.values.find((d: any) => d[`${drilldown} ID`]*1 === 0);
          const renters = group.values.find((d: any) => d[`${drilldown} ID`]*1 === 1);
          owners.share = owners[measure] / (owners[measure] + renters[measure]);
          dataID.push(owners);
        });
      
      const uniqueData = removeDuplicates(dataID.filter((d: any) => d[`${drilldown} ID`] === 0));

      return uniqueData;
    },

    groupBy: `${hierarchy}`,
    legend: false,
    lineLabels: true,
    shapeConfig: {
      Line: {
        labelConfig: {
          fontColor: colorHighlight,
          fontFamily: () => ["Pathway Gothic One", "Arial Narrow", "sans-serif"],
          fontSize: () => 12,
          fontStroke: "#E9E9E9",
          fontStrokeWidth: 0.1
        },
        stroke: colorHighlight
      }
    },
    time: "Year",
    timeline: false,
    tooltipConfig: {
      title: (d: any) => d[hierarchy],
      tbody: [
        ["Year", (d: any) => d.Year],
        [title, (d: any) => abbreviate(d[measure])],
        ["Margin of Error", (d: any) => `± ${abbreviate(d[`${measure} Moe`])}`],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    type: "LinePlot",
    x: "Year",
    y: "share",
    yConfig: {
      tickFormat: (d: any) => `${growthPct(d * 100)}`,
      title: title
    },
    //ySort: (a: any, b: any) => a["share"] - b["share"]
  }  


};

export default viz;
