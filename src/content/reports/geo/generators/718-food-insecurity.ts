// Converted from legacy canon_cms_generator #718 "Food Insecurity" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 718,
  name: "Food Insecurity",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&drilldowns=State,Year&measures=Food+Insecurity&sort=Food+Insecurity.desc&time=Year.latest&limit=3`,
  logic: (resp, {formatters}) => {
    const measure: string = "Food Insecurity";
    const format = (d: any) => `${formatters.abbreviate(d * 100)}%`;
    const sub = (d: any) => `${format(d)} prevalence`;
    const name = (d: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State.replace(/\,\s[A-z]{2}$/g, "")}</a>`;

    return {
      foodNationVisible1: resp.data.length >= 1,
      foodNationVisibleText1: resp.data.length === 1,
      foodNationVisibleMore: resp.data.length > 1,
      food1NameNation: name(resp.data[0]),
      food2NameNation: name(resp.data[1]),
      food3NameNation: name(resp.data[2]),
      food1ValueNation: format(resp.data[0][measure]),
      food2ValueNation: format(resp.data[1][measure]),
      food3ValueNation: format(resp.data[2][measure]),
      food1SubNation: sub(resp.data[0][measure]),
      food2SubNation: sub(resp.data[1][measure]),
      food3SubNation: sub(resp.data[2][measure]),
      foodNation: "Prevalence of Food Insecurity",
      foodMeasureNation: measure,
      foodYearNation: resp.data[0].Year
    }
  }
};

export default generator;
