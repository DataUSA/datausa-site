// Converted from legacy canon_cms_section_visualization #390 "section degrees" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {abbreviate} = formatters;
  const {isNationStatePuma, stateParentId, id, isMSA, electionStateIDs, hierarchy, tesseract} = variables;
  const raceId = swap("[[raceEducation]]").replace("pums5Race", "")
  const race = raceId*1 === 0 ? "" : `&Race=${raceId}`

  const geoLevel = isNationStatePuma ? `include=${hierarchy}:${id}` : isMSA ? `include=State:${electionStateIDs}` : `include=State:${stateParentId}`

  const dataURL: string = `${tesseract}tesseract/data?cube=pums_5&${geoLevel}&drilldowns=Degree,Year&measures=Total+Population&exclude=Degree:0&parents=true${race}`

  return {
    data: dataURL,
    groupBy: [
      "Group ID",
      "Degree ID"
    ],
    label: (d: any) => String(d["Degree"]),
    legend: true,
    legendConfig: {
      label: (d: any) => d["Group"]
    },
    shapeConfig: {
      fill: "D3PLUS-COMMON-RESET"
    },
    sum: "Total Population",
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Total Population", (d: any) => abbreviate(d["Total Population"])]
      ]
    },
    total: "Total Population",
    totalFormat: (d: any) => `Total: ${abbreviate(d)}`,
    type: "Treemap"
  };
};

export default viz;
