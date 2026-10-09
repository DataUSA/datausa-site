// Converted from legacy canon_cms_generator #698 "[Poverty] Severe Housing Problems" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 698,
  name: "[Poverty] Severe Housing Problems",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&drilldowns=State,Year&measures=Severe Housing Problems&time=Year.latest`,
  logic: (resp, {formatters}) => {
    const data = resp.data;
    const {growthPct} = formatters;

    const measure: string = "Severe Housing Problems"

    const lastYearSevereHousingProblem = data[0]["Year"]

    data.sort((a: any, b: any) => b[measure] > a[measure] ? 1 : -1);
    const top3SevereHousingProblem = data.slice(0, 3)
                                      .map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d[measure]*100)})`)



    return {
      lastYearSevereHousingProblem,
      top3SevereHousingProblem
    };
  }
};

export default generator;
