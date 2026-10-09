// Converted from legacy canon_cms_generator #719 "Food Insecurity" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 719,
  name: "Food Insecurity",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&include=State+County:${attrs.stateDataID}&drilldowns=County,Year&measures=Food+Insecurity&sort=Food+Insecurity.desc&time=Year.latest&limit=3`,
  logic: (resp, {formatters}) => {
    const measure: string = "Food Insecurity";
    const format = (d: any) => `${formatters.abbreviate(d * 100)}%`;
    const sub = (d: any) => `${format(d)} prevalence`;
    const name = (d: any) => `<a href="/profile/geo/${d["County ID"]}">${d.County.replace(/\,\s[A-z]{2}$/g, "")}</a>`;

    return {
      foodNotNationVisible1: resp.data.length >= 1,
      foodNotNationVisibleText1: resp.data.length === 1,
      foodNotNationVisibleMore: resp.data.length > 1,
      food1NameNotNation: name(resp.data[0]),
      food2NameNotNation: name(resp.data[1]),
      food3NameNotNation: name(resp.data[2]),
      food1ValueNotNation: format(resp.data[0][measure]),
      food2ValueNotNation: format(resp.data[1][measure]),
      food3ValueNotNation: format(resp.data[2][measure]),
      food1SubNotNation: sub(resp.data[0][measure]),
      food2SubNotNation: sub(resp.data[1][measure]),
      food3SubNotNation: sub(resp.data[2][measure]),
      foodNotNation: "Prevalence of Food Insecurity",
      foodMeasureNotNation: measure,
      foodYearNotNation: resp.data[0].Year
    }
  }
};

export default generator;
