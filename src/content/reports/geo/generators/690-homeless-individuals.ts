// Converted from legacy canon_cms_generator #690 "Homeless Individuals" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 690,
  name: "Homeless Individuals",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=health_estimates_of_chronically_homeless_individuals&measures=Estimates+of+Chronically+Homeless+Individuals&sort=Estimates+of+Chronically+Homeless+Individuals.desc&drilldowns=Year,State&time=Year.latest&limit=3`,
  logic: (resp, {formatters}) => {
    const measure: string = "Estimates of Chronically Homeless Individuals";
    const format = formatters.commas;
    const sub = (d: any) => `${format(d)} individuals`;

    return {
      homelessVisible1: resp.data.length >= 1,
      homelessVisibleMore: resp.data.length > 1,
      homelessVisibleText1: resp.data.length === 1,
      homeless1Name: `<a href="/profile/geo/${resp.data[0]["State ID"] || resp.data[0]["State ID"]}">${resp.data[0].State}</a>`,
      homeless2Name: `<a href="/profile/geo/${resp.data[1]["State ID"] || resp.data[1]["State ID"]}">${resp.data[1].State}</a>`,
      homeless3Name: `<a href="/profile/geo/${resp.data[2]["State ID"] || resp.data[2]["State ID"]}">${resp.data[2].State}</a>`,
      homeless1Value: format(resp.data[0][measure]),
      homeless2Value: format(resp.data[1][measure]),
      homeless3Value: format(resp.data[2][measure]),
      homeless1Sub: sub(resp.data[0][measure]),
      homeless2Sub: sub(resp.data[1][measure]),
      homeless3Sub: sub(resp.data[2][measure]),
      homeless: "Estimated Number of Chronically Homeless Individuals", 
      homelessMeasure: measure,
      homelessYear: resp.data[0].Year
    }
  }
};

export default generator;
