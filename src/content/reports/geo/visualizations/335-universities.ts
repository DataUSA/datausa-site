// Converted from legacy canon_cms_section_visualization #335 "section universities" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {colorSector, iconSector, id, manyUniversities, tesseract, hierarchy} = variables;
  const {abbreviateBig, commas} = formatters;

  const raceId = swap("[[racesUniversities]]").replace("ipedsRace", "")
  const genderId = swap("[[genderUniversities]]").replace("sex", "")

  const race = raceId*1 === 0 ? "" : `;IPEDS Race:${raceId}`
  const sex = genderId*1 === 0 ? "" : `;Gender:${genderId}`

  const dataURL: string = `/api/data?Geography=${id}&measures=Completions&drilldowns=Sector,University${race}${sex}`

  const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Sector,University,Year&include=${hierarchy}:${id}${race}${sex}&locale=en&measures=Completions`

  return {
    aggs: {
      "Sector ID": (arr: any, acc: any) => acc(arr[0])
    },
    data: data,
    dataFormat: (resp: any) => {
      const data = resp.data;
    
      return data.filter((d: any) => d["Completions"] > 0);
    },
    depth: 1,
    groupBy: ["Sector", "University"],
    legendConfig: {
      label: "",
      shapeConfig: {
        backgroundImage: (d: any) => iconSector[d["Sector ID"]]
      }
    },
    shapeConfig: {
      fill: (d: any) => colorSector[d["Sector ID"]]
    },
    sum: (d: any) => d.Completions,
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d["Year"]],
        ["Degrees Awarded", (d: any) => commas(d["Completions"])]
      ]
    },
    total: "Completions",
    totalFormat: (d: any) => `Total: ${abbreviateBig(d)}`,
    type: "Treemap"
  }
};

export default viz;
