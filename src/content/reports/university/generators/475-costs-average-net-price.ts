// Converted from legacy canon_cms_generator #475 "[Costs] Average Net Price" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 475,
  name: "[Costs] Average Net Price",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_university&drilldowns=Year,${attrs.hierarchy}&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Median+Percent+With+Grant+Aid%2CMedian+Percent+Federal+Loans%2CMedian+Average+Net+Price+Grant+Or+Scholarship+Aid`,
  logic: (resp, {formatters, variables}) => {
    const data = resp.data.filter((d: any) => d["Median Average Net Price Grant Or Scholarship Aid"] !== null);
    const {growthWord, growthPct} = formatters;

    if (data.length > 0){
  
      const data = resp.data.sort((a: any, b: any) => b["Year"] - a["Year"])
  
      const aidYearCurr = data[0]["Year"];
      const aidYearPrev = data[1] && data[1]["Year"];
      const aidNetPrice = data[0]["Median Average Net Price Grant Or Scholarship Aid"];
      const aidNetPricePrev = data[1] && data[1]["Median Average Net Price Grant Or Scholarship Aid"];
      const aidGrantPercent = data[0]["Median Percent With Grant Aid"];
      const aidGrantPercentPrev = data[1] && data[1]["Median Percent With Grant Aid"];
      const aidGrantPercentGrowth = formatters.growth({curr: aidGrantPercent, prev: aidGrantPercentPrev});
      const aidLoanPercent = data[0]["Median Percent Federal Loans"];
      const aidNetPriceGrowth: any = aidNetPricePrev ? formatters.growth({curr: aidNetPrice, prev: aidNetPricePrev}) : false;
  
      const aidGrantText: string = `This represents a ${growthWord(aidGrantPercentGrowth)} of ${growthPct(aidGrantPercentGrowth)} with respect to ${aidYearPrev}, when ${aidGrantPercentPrev}% of undergraduate students received financial aid.`
  
      let text: any = ""
  
      if(aidLoanPercent && aidGrantPercent){
        text = `In ${aidYearCurr}, ${aidGrantPercent}% of undergraduate students attending ${variables.name} received financial aid through grants. Comparatively, ${formatters.abbreviate(aidLoanPercent)}% of undergraduate students received financial aid through loans.`
      }
  
      else if(aidLoanPercent && !aidGrantPercent){
        text = `In ${aidYearCurr}, ${formatters.abbreviate(aidLoanPercent)}% of undergraduate students received financial aid through loans.`
      }
  
      else if(!aidLoanPercent && aidGrantPercent){
        text = `In ${aidYearCurr}, ${aidGrantPercent}% of undergraduate students attending ${variables.name} received financial aid through grants.`
      }
  
      else{
        text = ""
      }
  
      let text2: any = ""
  
      if(aidYearPrev && aidYearCurr && aidNetPriceGrowth) {
        text2 = `Between ${aidYearPrev} and ${aidYearCurr}, the average net price of ${variables.name} grew by ${formatters.growthPct(aidNetPriceGrowth)}.`
      }
  
      return {
        aidNetPriceYearCurr: aidYearCurr,
        aidNetPriceYearPrev: aidYearPrev,
        aidNetPrice: aidNetPrice ? aidNetPrice : false,
        aidNetPriceGrowth, 
        aidVis: true,
        aidNetPriceGrowthText: text2,
      }
    }
    else{
      return {
        aidVis: false
      }
    }
  }
};

export default generator;
