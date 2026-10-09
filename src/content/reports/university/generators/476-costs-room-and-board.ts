// Converted from legacy canon_cms_generator #476 "[Costs] Room and Board" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 476,
  name: "[Costs] Room and Board",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_ic_living_expenses&drilldowns=Year,${attrs.hierarchy}&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Median+Room+And+Board`,
  logic: (resp, {formatters}) => {
    const data_ = resp.data;

    if(data_.length > 0){
  
      const data = data_.sort((a: any, b: any) => b["Year"] - a["Year"])
  
      const roomYearCurr: any = data.length > 0 ? data[0]["Year"] : false;
      const roomYearPrev: any = data.length > 1 ? data[1]["Year"] : false;
      const roomCostCurr: any = data.length > 0 ? data[0]["Median Room And Board"] : false;
      const roomCostPrev: any = data.length > 1 ? data[1]["Median Room And Board"] : false;
      const roomCostGrowth: any = roomCostPrev ? formatters.growth({curr: roomCostCurr, prev: roomCostPrev}) : false;
      const roomCostSentence: any = roomCostGrowth ? (roomCostGrowth === 0 ? "did not change" : `${formatters.increasedWord(roomCostGrowth)} by ${formatters.growthPct(roomCostGrowth)}`) : false;
  
      return {
        roomYearCurr,
        roomYearPrev,
        roomCostCurr,
        roomCostPrev,
        roomCostGrowth,
        roomCostSentence,
        OtherStudentExpensesVis: true
      }
    }
    else{
      return{
        OtherStudentExpensesVis: false
      }
    }
  }
};

export default generator;
