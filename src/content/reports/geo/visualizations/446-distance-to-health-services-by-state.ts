// Converted from legacy canon_cms_section_visualization #446 "section distance-to-health-services-by-state" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {d3} = libs;
  const {hierarchy, id, neighborsList, tesseract, name} = variables;
  const {abbreviate, commas, growthPct} = formatters;

  const colorList: Record<string, any> = {
    "1": "#172955",
    "2": "#375f90",
    "3": "#5593cd",
    "4": "#afc8dc",
    "5": "#c6d6e1",
  };

  const selector = swap("[[healthServiceSelector]]").replace("health_", "");

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?Health+Provider=${selector}&cube=prism_service_access&include=${hierarchy}:${id},${neighborsList}&drilldowns=${hierarchy},Average+Distance+Range&locale=en&measures=Household+Count`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data;
    
      const stateGroups = d3.nest()
        .key((d: any) => d[hierarchy])
        .entries(data)
        .reduce(
          (a: any, d: any) => ({
            ...a,
            [d["key"]]: d3.sum(d["values"], (d: any) => d["Household Count"])
          }), {});
        
      return data.map((d: any) => ({
        ...d,
        "Coverage": 100 * d["Household Count"] / stateGroups[d[hierarchy]]
      }));
    },
    discrete: "y",
    groupBy: ["Average Distance Range ID"],
    shapeConfig: {
      fill: (d: any) => colorList[d["Average Distance Range ID"]]
    },
    label: (d: any) => "",
    legend: true,
    legendConfig: {
      label: (d: any) => d["Average Distance Range"]
    },
    stacked: true,
    tooltipConfig: {
      tbody: [
        ["State",(d: any) => d[hierarchy]],
        ["Addresses", (d: any) => `${commas(d["Household Count"])}`],
        ["Coverage", (d: any) => growthPct(d["Coverage"])],
      ]
    },
    type: "BarChart",
    x: "Household Count",
    xConfig: {
      tickFormat: (d: any) => abbreviate(d),
      title: "Households"
    },
    y: hierarchy,
    yConfig: {
      //ticks: [],
      title: `${name} & neighboring geographies`
    },
    ySort: (a: any, b: any) => a["Average estimated driving distance (miles)"] - b["Average estimated driving distance (miles)"]
  }
};

export default viz;
