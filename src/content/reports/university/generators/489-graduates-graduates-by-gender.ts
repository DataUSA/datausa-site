// Converted from legacy canon_cms_generator #489 "[Graduates] Graduates by Gender" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 489,
  name: "[Graduates] Graduates by Gender",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year,Gender&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&time=Year.latest`,
  logic: (resp) => {
    const data = resp.data.filter((d: any) => d["Completions"] > 0);

    if(data.length > 0){
  
      const male = data.filter((d: any) => d["Gender ID"]*1 === 1);
      const female = data.filter((d: any) => d["Gender ID"]*1 === 2);

      const gradsYearCurr: any = data[0] ? data[0]["Year"] : false;
      const gradsMale = male[0] ? male[0]["Completions"] : 0;
      const gradsFemale = female[0] ? female[0]["Completions"] : 0;
      const gradsGenderDiff = gradsFemale - gradsMale;
      const gradsGenderDiffAbs = Math.abs(gradsGenderDiff);
      const gradsTotal = gradsMale + gradsFemale;
      const gradsMalePercent = (gradsMale / gradsTotal) * 100;
      const gradsFemalePercent = (gradsFemale / gradsTotal) * 100;
      const gradsRatio = gradsMale / gradsFemale;
      const gradsRatioDiff = gradsMale - gradsFemale;
  
      return {
        gradsYearCurr,
        gradsMale,
        gradsMaleVis: gradsMale ? true : false,
        gradsFemale,
        gradsFemaleVis: gradsFemale ? true : false,
        gradsGenderDiff,
        gradsGenderDiffAbs,
        gradsTotal,
        gradsMalePercent,
        gradsFemalePercent,
        gradsRatio,
        gradsRatioDiff,
        sexBreakdownCommonMajorsVis: true,
      }
    }
    else{
      return{
        sexBreakdownCommonMajorsVis: false,
        gradsYearCurr: false,
        gradsMaleVis: false,
        gradsFemaleVis: false
      }
    }

  }
};

export default generator;
