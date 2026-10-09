// Converted from legacy canon_cms_section_visualization #288 "section ethnicity_degrees" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {colorRaceACS, iconRace, raceData, id, tesseract, hierarchy} = variables;
  const {abbreviate, abbreviateBig} = formatters;

  const {nest, sum} = libs.d3;

  const degrees = swap("[[degrees]]").replace("degree", "");
  const degreesCut = degrees === "0" ? "" : `Degree=${degrees}&`;

  const data: string = `${tesseract}tesseract/data.jsonrecords?${degreesCut}cube=ipeds_completions&drilldowns=IPEDS+Race,Year&${hierarchy}=${id}&locale=en&measures=Completions`

  return {
    cache:false,
    data: data,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["Completions"] > 0);
      nest()
        .key((d: any) => d.Year)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d["Completions"]);
          group.values.forEach((d: any) => d.share = d["Completions"] / total);
        });
      
      const maxYear = libs.d3.max(data, (d: any) => d.Year); 

      return {
        data: data,
        timeFilter: (d: any) => d.Year === maxYear
      }
    },
    discrete: "y",
    groupBy: "IPEDS Race",
    legendConfig: {
      label: "",
      shapeConfig: {
        backgroundImage: iconRace
      }
    },
    shapeConfig: {
      label: false
    },
    time: "Year",
    timeline: true,
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Degrees Awarded", (d: any) => abbreviateBig(d["Completions"])],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    type: "BarChart",
    x: "share",
    xConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Share"
    },
    y: "IPEDS Race",
    yConfig: {
      title: "Race or Ethnicity"
    },
    ySort: (a: any, b: any) => a["share"] - b["share"],
  }
};

export default viz;
