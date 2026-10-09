// Converted from legacy canon_cms_generator #700 "[Poverty] Children In Poverty" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 700,
  name: "[Poverty] Children In Poverty",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&drilldowns=State,Year&measures=Children In Poverty&time=Year.latest`,
  logic: (resp, {formatters}) => {
    const data = resp.data;
    const {growthPct} = formatters;

    const measure: string = "Children In Poverty"

    const lastYearChildrenInPoverty = data[0]["Year"]

    data.sort((a: any, b: any) => b[measure] > a[measure] ? 1 : -1);
    const top3ChildrenInPoverty = data.slice(0, 3)
                                      .map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d[measure]*100)})`)



    return {
      lastYearChildrenInPoverty,
      top3ChildrenInPoverty
    };
  }
};

export default generator;
