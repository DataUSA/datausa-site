// Converted from legacy canon_cms_generator #468 "[About - Costs] Tuition" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 468,
  name: "[About - Costs] Tuition",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=District+Tuition%2CBooks+And+Supplies&time=Year.latest.5`,
  logic: (resp, {libs, formatters}) => {
    const {growth, growthPct, increasedWord} = formatters;

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);
    const dataPrev = resp.data.filter((d: any) => d["Year"] === latestYear - 1);

    if (data.length > 0 && dataPrev.length > 0) {
  
      const tuitionYearCurr: any = data.length > 0 ? data[0]["Year"] : false;
      const tuitionYearPrev: any = dataPrev.length > 0 ? dataPrev[0]["Year"] : false;
  
      const tuitionCostCurr: any = data.length > 0 ? data[0]["District Tuition"] : false;
      const tuitionCostPrev: any = dataPrev.length > 0 ? dataPrev[0]["District Tuition"] : false;
  
      let tuitionBooksCurr: any = data.length > 0 ? data[0]["Books And Supplies"] : false;
      const tuitionBooksPrev: any = dataPrev.length > 0 ? dataPrev[0]["Books And Supplies"] : false;
  
      const tuitionGrowth: any = tuitionCostCurr ? growth({curr: tuitionCostCurr, prev: tuitionCostPrev}) : false;
      const tuitionGrowthSub = tuitionGrowth ? `${growthPct(tuitionGrowth)} growth from ${tuitionYearPrev}` : "";
  
      const tuitionBooksGrowth = formatters.growth({curr: tuitionBooksCurr, prev: tuitionBooksPrev});
      //const tuitionBooksSentence = tuitionBooksCurr ? "" : tuitionBooksGrowth == 0 ? "did not change" : `${increasedWord(tuitionBooksGrowth)} by ${growthPct(tuitionBooksGrowth)}`;
  
      const dataFiltered = resp.data.filter((d: any) => d["District Tuition"] >= 0)
  
      return {
        tuitionYearCurr,
        tuitionYearPrev,
        tuitionCostCurr: tuitionCostCurr ? tuitionCostCurr : false,
        tuitionCostPrev,
        tuitionBooksCurr: tuitionBooksCurr ? tuitionBooksCurr : false,
        tuitionBooksPrev,
        tuitionGrowth,
        tuitionGrowthSub,
        tuitionBooksGrowth,
        tuitionBooksSentence: tuitionBooksCurr && tuitionBooksGrowth === 0 ? "did not change" : tuitionBooksCurr ? `${increasedWord(tuitionBooksGrowth)} by ${growthPct(tuitionBooksGrowth)}` : "",
        tuitionCostsVis: dataFiltered.length == 0 ? false : true,
      }
    }
    else{
      return{
        tuitionCostsVis: false
      }
    }
  }
};

export default generator;
