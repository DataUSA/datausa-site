// Converted from legacy canon_cms_generator #520 "[Education] Completions" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 520,
  name: "[Education] Completions",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Gender,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&time=Year.latest.2`,
  logic: (resp, {libs, variables}) => {
    const {max} = libs.d3;
    const {hierarchy} = variables

    const data = resp.data;

    if(data.length > 0){

      const lastYearCompletions = max(data, (d: any) => d.Year) || undefined
  
      const lastData = data.filter((d: any) => d["Year"] === lastYearCompletions)
  
      const completionsTotal = libs.d3.sum(lastData, (d: any) => d["Completions"]);
  
      const menCompletions = lastData.filter((d: any) => d["Gender ID"] === 1)[0]["Completions"]
      const womenCompletions = lastData.filter((d: any) => d["Gender ID"] === 2)[0]["Completions"]
  
      const menCompletionsPct = (lastData.filter((d: any) => d["Gender ID"] === 1)[0]["Completions"]/completionsTotal) * 100
      const womenCompletionsPct = (lastData.filter((d: any) => d["Gender ID"] === 2)[0]["Completions"]/completionsTotal) * 100
  
      const rateCompletions = menCompletions / womenCompletions
      const rateCompletionsWord = menCompletions < womenCompletions ? "less" : "more"
  
      return {
        lastYearCompletions,
        completionsTotal,
        menCompletions,
        womenCompletions,
        menCompletionsPct,
        womenCompletionsPct,
        rateCompletions,
        rateCompletionsWord
      }
    }
    else{
      return{
        lastYearCompletions: false
      }
    }
  }
};

export default generator;
