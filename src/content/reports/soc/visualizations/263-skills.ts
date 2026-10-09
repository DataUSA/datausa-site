// Converted from legacy canon_cms_section_visualization #263 "section skills" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {colorGrey, colorHighlight, id, colorOnet, iconOnet, hierarchy, tesseract} = variables;
  const {abbreviate, salary, commas} = formatters;
  const selector = swap("[[skills-chart-type]]") // radarSkills, barchartSkills

  const measureSelector = swap("[[skills-measure]]") // valueSkills, rcaSkills
  const measure = measureSelector === "valueSkills" ? "LV Value" : "RCA"

  const dataRCA: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=onet_by_pums&location=${hierarchy}&activity=Skill+Element&measure=Total+Score&time=Year&parents=true&cuts=${hierarchy}:${id}`
  const dataValue: string = `${tesseract}tesseract/data.jsonrecords?cube=onet_by_pums&drilldowns=Year,Skill+Element,${hierarchy}&include=${hierarchy}:${id}&locale=en&measures=LV+Value&parents=true`


  if (selector == "radarSkills") {

  return {
    data: `/api/data?measure=LV%20Value,RCA&${hierarchy}=${id}&drilldowns=Skill%20Element&parents=true`,
    shapeConfig: {
      Path: {
        stroke: colorHighlight,
        strokeOpacity: 1,
        strokeWidth: 2,
        fill: "transparent"
      }
    },
    label: (d: any) => d["Skill Element"],
    legendTooltip: {
      tbody: () => []
    },
    tooltipConfig: {
      tbody: (d: any) => [
        ["Value", abbreviate(d["LV Value"])],
        ["RCA", abbreviate(d["RCA"])]
      ]
    },
    time: "Year",
    metric: "Skill Element",
    groupBy: hierarchy,
    value: measure,
    height: 600,
    type: "Radar"
  };
  }

  else {


  return {
    data: `/api/data?measure=LV Value,RCA&${hierarchy}=${id}&drilldowns=Skill%20Element&parents=true`,
    discrete: "y",
    groupBy: ["Skill Element Group", "Skill Element"],
    groupPadding: 2,
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconOnet[d["ID Skill Element Group"]]
      }
    },
    legendTooltip: {
      tbody: () => []
    },
    shapeConfig: {
      fill: (d: any) => colorOnet[d["ID Skill Element Group"]]
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Value", (d: any) => abbreviate(d["LV Value"])],
        ["RCA", (d: any) => abbreviate(d["RCA"])]
      ]
    },
    type: "BarChart",
    x: measure,
    height: 600,
    xConfig: {
      tickFormat: (d: any) => abbreviate(d),
      measure
    },
    y: "Skill Element",
    yConfig: {
      shapeConfig: {
        labelConfig: {
          fontSize: () => 10,
          padding: 0
        }
      },
      title: "Skill"
    },
    ySort: (a: any, b: any) => a["ID Skill Element Group"] > b["ID Skill Element Group"] ? -1 : 1
  }
  }
};

export default viz;
