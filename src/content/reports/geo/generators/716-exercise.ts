// Converted from legacy canon_cms_generator #716 "Exercise" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 716,
  name: "Exercise",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&drilldowns=Year,State&measures=Access%20To%20Exercise%20Opportunities&sort=Access%20To%20Exercise%20Opportunities.desc&time=Year.latest&limit=3`,
  logic: (resp, {formatters}) => {
    const measure: string = "Access To Exercise Opportunities";
    const format = (d: any) => `${formatters.abbreviate(d * 100)}%`;
    const sub = (d: any) => `${format(d)} prevalence`;
    const name = (d: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State.replace(/\,\s[A-z]{2}$/g, "")}</a>`;

    return {
      exerciseNationVisible1: resp.data.length >= 1,
      exerciseNationVisibleText1: resp.data.length === 1,
      exerciseNationVisibleMore: resp.data.length > 1,
      exercise1NameNation: name(resp.data[0]),
      exercise2NameNation: name(resp.data[1]),
      exercise3NameNation: name(resp.data[2]),
      exercise1ValueNation: format(resp.data[0][measure]),
      exercise2ValueNation: format(resp.data[1][measure]),
      exercise3ValueNation: format(resp.data[2][measure]),
      exercise1SubNation: sub(resp.data[0][measure]),
      exercise2SubNation: sub(resp.data[1][measure]),
      exercise3SubNation: sub(resp.data[2][measure]),
      exerciseNation: "Percent of Residents with Access To Exercise Opportunities",
      exerciseMeasureNation: measure,
      exerciseYearNation: resp.data[0].Year
    }
  }
};

export default generator;
