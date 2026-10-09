// Converted from legacy canon_cms_generator #664 "Household Income (Children)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 664,
  name: "Household Income (Children)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygr_median_household_income_race_5&measures=Household+Income+by+Race&drilldowns=${attrs.incomeDrilldown},Year&time=Year.latest&sort=Household+Income+by+Race.desc${attrs.includeIncome}`,
  logic: (resp, {variables}) => {
    const measure: string = "Household Income by Race";
    const {incomeDrilldown} = variables;

    let data = resp.data;
    const latest = Math.max(...data.map((d: any) => d["Year"]));
    data = data.filter((d: any) => d["Year"] === latest);

    const one = data.length >= 1;
    const two = data.length >= 2;
    const three = data.length >= 3;

    const children = data.map((d: any) => d[`${incomeDrilldown} ID`]);
    const name = (d: any) => d[incomeDrilldown].includes("Census Tract") ? d[incomeDrilldown].split(",")[0] : `<a href="/profile/geo/${d[`${incomeDrilldown} ID`]}">${d[incomeDrilldown]}</a>`;

    return {
     /* incomeGeo1Name: one && name(data[0]),
      incomeGeo1Value: one && data[0][measure],
      incomeGeo2Name: two && name(data[1]),
      incomeGeo2Value: two && data[1][measure],
      incomeGeo3Name: three && name(data[2]),
      incomeGeo3Value: three && data[2][measure],*/
      incomeGeoYear: data[0].Year,
      incomeGeoIDs: children
    }
  }
};

export default generator;
