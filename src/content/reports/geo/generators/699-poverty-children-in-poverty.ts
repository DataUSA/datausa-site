// Converted from legacy canon_cms_generator #699 "[Poverty] Children in Poverty" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 699,
  name: "[Poverty] Children in Poverty",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year&measures=Children In Poverty`,
  logic: (resp, {libs, formatters}) => {
    const {declinedGrewWord, growthPct} = formatters;
    const data = resp.data;

    const lastYearChildrenInPovertyStates: any = data[0] ? libs.d3.max(data, (d: any) => d.Year) : false
    const prevYearChildrenInPovertyStates: any = data[data.length-1] ? libs.d3.min(data, (d: any) => d.Year) : false

    const dataCurr = data.filter((d: any) => d["Year"] === lastYearChildrenInPovertyStates)
    const dataPrev = data.filter((d: any) => d["Year"] === prevYearChildrenInPovertyStates)

    const childrenInPovertyRate: any = dataCurr[0] ? (dataCurr[0]["Children In Poverty"])*100 : false

    const childrenInPovertyPrev: any = dataPrev[0] ? (dataPrev[0]["Children In Poverty"])*100 : false

    const childrenInPovertyDiff =  Math.abs(childrenInPovertyRate - childrenInPovertyPrev)
    const childrenInPovertyWord = declinedGrewWord(childrenInPovertyRate - childrenInPovertyPrev)

    const lenDataChildrenPoverty = data.length;
    const povertyChildrenGrowthText = lenDataChildrenPoverty > 1 ? `From ${prevYearChildrenInPovertyStates} to ${lastYearChildrenInPovertyStates}, the indicator ${childrenInPovertyWord} ${growthPct(childrenInPovertyDiff)}.` : ""


    return {
      lenDataChildrenPoverty,
      prevYearChildrenInPovertyStates,
      lastYearChildrenInPovertyStates,
      childrenInPovertyRate,
      childrenInPovertyPrev,
      childrenInPovertyDiff,
      childrenInPovertyWord,
      povertyChildrenGrowthText
    };
  }
};

export default generator;
