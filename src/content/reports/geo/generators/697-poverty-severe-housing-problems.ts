// Converted from legacy canon_cms_generator #697 "[Poverty] Severe Housing Problems" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 697,
  name: "[Poverty] Severe Housing Problems",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year&measures=Severe+Housing+Problems`,
  logic: (resp, {libs, formatters}) => {
    const {declinedGrewWord, growthPct} = formatters;
    const data = resp.data;

    const lastYearSevereHousingStates: any = data[0] ? libs.d3.max(data, (d: any) => d.Year) : false
    const prevYearSevereHousingStates: any = data[data.length-1] ? libs.d3.min(data, (d: any) => d.Year) : false

    const dataCurr = data.filter((d: any) => d["Year"] === lastYearSevereHousingStates)
    const dataPrev = data.filter((d: any) => d["Year"] === prevYearSevereHousingStates)

    const severeHousingRate: any = dataCurr[0] ? (dataCurr[0]["Severe Housing Problems"])*100 : false

    const severeHousingRatePrev: any = dataPrev[0] ? (dataPrev[0]["Severe Housing Problems"])*100 : false

    const severeHousingProblemDiff =  Math.abs(severeHousingRate - severeHousingRatePrev)
    const severeHousingProblemWord = declinedGrewWord(severeHousingRate - severeHousingRatePrev)

    const lenSevereHousing = data.length;

    const textGrowthSevereHousing = lenSevereHousing > 1 ? `From ${prevYearSevereHousingStates} to ${lastYearSevereHousingStates}, the indicator ${severeHousingProblemWord} ${growthPct(severeHousingProblemDiff)}.` : "";

    return {
      lenSevereHousing,
      prevYearSevereHousingStates,
      lastYearSevereHousingStates,
      severeHousingRate,
      severeHousingRatePrev,
      severeHousingProblemDiff,
      severeHousingProblemWord,
      textGrowthSevereHousing
    };
  }
};

export default generator;
