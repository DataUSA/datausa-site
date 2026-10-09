// Converted from legacy canon_cms_generator #607 "[Workforce] Top states" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 607,
  name: "[Workforce] Top states",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=State,Year&measures=Total+Population&time=Year.latest&Workforce+Status=true`,
  logic: (resp, {libs, formatters}) => {
    const data = resp.data;
    const {commas} = formatters;

    const lastYearWorkforce = data[0]["Year"]
    const totalWorkforceUSA = libs.d3.sum(data, (d: any) => d["Total Population"]);

    const dataSorted = data.sort((a: any, b: any) => b["Total Population"] > a["Total Population"] ? 1 : -1);

    const top3WorkforceByState = data.slice(0, 3)
                                      .map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${commas(d["Total Population"])} people)`)


    return {
      totalWorkforceUSA,
      lastYearWorkforce,
      top3WorkforceByState
    };
  }
};

export default generator;
