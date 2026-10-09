// Converted from legacy canon_cms_section_visualization #72 "section tmap_institutions_grads" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorSector, iconSector, id, manyUniversities, tesseract, hierarchy} = variables;
  const {abbreviateBig, commas} = formatters;

  const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=University%2CYear%2CSector&include=${hierarchy}:${id}&locale=en&measures=Completions`

  return {
    data: `/api/data?CIP=${id}&measures=Completions&drilldowns=Sector,University`,
    //data: data,
    aggs: {
      "ID Sector": (arr: any, acc: any) => acc(arr[0])
    },
    height: 500,
    groupBy: ["Sector", "University"],
    legendConfig: {
      shapeConfig: {
        backgroundImage: (d: any) => iconSector[d["ID Sector"]]
      }
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Degrees Awarded", (d: any) => commas(d.Completions)]
      ]
    },
    shapeConfig: {
      fill: (d: any) => colorSector[d["ID Sector"]]
    },
    sum: (d: any) => d.Completions,
    time: "Year",
    total: "Completions",
    totalFormat: (d: any) => `Total: ${abbreviateBig(d)}`,
    type: "Treemap"
  }
};

export default viz;
