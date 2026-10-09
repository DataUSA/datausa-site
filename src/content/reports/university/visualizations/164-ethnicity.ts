// Converted from legacy canon_cms_section_visualization #164 "section ethnicity" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorRaceACS, iconRace, raceData, id, tesseract, hierarchy} = variables;
  const {abbreviate} = formatters;

  const {nest, sum} = libs.d3;
  
  return {
    //data: `/api/data?University=${id}&measures=Completions&drilldowns=IPEDS%20Race&order=Completions&sort=desc`,
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=IPEDS+Race,Year&${hierarchy}=${id}&locale=en&measures=Completions&sort=Completions.desc`,
    dataFormat: (resp: any) => {

      const data = resp.data.filter((d: any) => !["unknown"].includes(d["IPEDS Race ID"]));
      // const data = resp.data;
      nest()
        .key((d: any) => d.Year)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d["Completions"]);
          group.values.forEach((d: any) => d.share = d["Completions"] / total);
        });

      return data;
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Degrees Awarded", (d: any) => abbreviate(d["Completions"])],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    groupBy: "IPEDS Race",
    legendConfig: {
      label: "",
      shapeConfig: {
        backgroundImage: iconRace
      }
    },
    shapeConfig: {
      // fill: (d: any) => d.Race ? colorRaceACS[d["ID Race"] + 1] : colorRaceACS["9"],
      label: false
    },
    time: "Year",
    type: "BarChart",
    y: "IPEDS Race",
    discrete: "y",
    yConfig: {
      title: "Race or Ethnicity"
    },
    ySort: (a: any, b: any) => a["share"] - b["share"],
    x: "share",
    xConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Share"
    }
  }
};

export default viz;
