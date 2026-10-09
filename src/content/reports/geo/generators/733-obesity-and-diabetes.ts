// Converted from legacy canon_cms_generator #733 "Obesity and Diabetes" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 733,
  name: "Obesity and Diabetes",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&drilldowns=State&measures=Adult+Obesity,Diabetes+Prevalence&drilldowns=State,Year&time=Year.latest`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const currYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === currYear);

    const obesityMeasure: string = "Adult Obesity";
    const obesity = data.sort((a: any, b: any) => b[obesityMeasure] > a[obesityMeasure] ? 1 : -1);

    const diabetesMeasure: string = "Diabetes Prevalence";
    const diabetes = data.sort((a: any, b: any) => b[diabetesMeasure] > a[diabetesMeasure] ? 1 : -1);


    return {
      obesity1Name: `<a href="/profile/geo/${obesity[0]["State ID"]}">${obesity[0]["State"]}</a>`,
      obesity1Value: obesity[0][obesityMeasure]*100,

      diabetes1Name: `<a href="/profile/geo/${diabetes[0]["State ID"]}">${diabetes[0]["State"]}</a>`,
      diabetes1Value: diabetes[0][diabetesMeasure]*100,

    }
  }
};

export default generator;
