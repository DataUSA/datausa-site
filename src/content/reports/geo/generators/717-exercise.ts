// Converted from legacy canon_cms_generator #717 "Exercise" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 717,
  name: "Exercise",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&include=State+County:${attrs.stateDataID}&drilldowns=Year,County&measures=Access%20To%20Exercise%20Opportunities&sort=Access%20To%20Exercise%20Opportunities.desc&time=Year.latest&limit=3`,
  logic: (resp, {formatters}) => {
    const measure: string = "Access To Exercise Opportunities";
    const format = (d: any) => `${formatters.abbreviate(d * 100)}%`;
    const sub = (d: any) => `${format(d)} prevalence`;
    const name = (d: any) => `<a href="/profile/geo/${d["County ID"]}">${d.County.replace(/\,\s[A-z]{2}$/g, "")}</a>`;

    return {
      exerciseNotNationVisible1: resp.data.length >= 1,
      exerciseNotNationVisibleText1: resp.data.length === 1,
      exerciseNotNationVisibleMore: resp.data.length > 1,
      exercise1NameNotNation: name(resp.data[0]),
      exercise2NameNotNation: name(resp.data[1]),
      exercise3NameNotNation: name(resp.data[2]),
      exercise1ValueNotNation: format(resp.data[0][measure]),
      exercise2ValueNotNation: format(resp.data[1][measure]),
      exercise3ValueNotNation: format(resp.data[2][measure]),
      exercise1SubNotNation: sub(resp.data[0][measure]),
      exercise2SubNotNation: sub(resp.data[1][measure]),
      exercise3SubNotNation: sub(resp.data[2][measure]),
      exerciseNotNation: "Percent of Residents with Access To Exercise Opportunities",
      exerciseMeasureNotNation: measure,
      exerciseYearNotNation: resp.data[0].Year
    }
  }
};

export default generator;
