// Converted from legacy canon_cms_generator #723 "Kitchens" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 723,
  name: "Kitchens",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygh_occupied_households_lacking_kitchen_5${attrs.specialTessCut}&measures=Households+by+Kitchen+Type&drilldowns=Year,${attrs.specialTessDrilldown},Kitchen+Facilities&time=Year.latest`,
  logic: (resp, {libs, formatters, variables}) => {
    const drilldown: string = "Kitchen Facilities";
    const measure: string = "Households by Kitchen Type";
    const title: string = `Percentage of Occupied Households Lacking Complete ${drilldown}`;
    const format = (d: any) => `${formatters.abbreviate(d * 100)}%`;
    const name = (d: any) => d.name.replace(/\,\s[A-z]{2}$/g, "");

    const {nest, sum} = libs.d3;
    const {specialTessDrilldown} = variables;

    let data: any = [];
    nest()
      .key((d: any) => `<a href="/profile/geo/${d[`${specialTessDrilldown} ID`]}">${d[specialTessDrilldown].replace(/\,\s[A-z]{2}$/g, "")}</a>`)
      .entries(resp.data)
      .forEach((group: any) => {
        const {key, values} = group;
        const num = values.find((d: any) => d[`${drilldown} ID`] === 1)[measure];
        const total = sum(values, (d: any) => d[measure]);
        data.push({
          name: key,
          value: num / total
        })
      });
  
    data = data.filter((d: any) => d.value !== null).sort((a: any, b: any) => b.value - a.value).slice(0, 3);

    const slug: string = "kitchenAll";
    const retObj: Record<string, any> = {
      [slug]: `Percent of Occupied Households Lacking Complete ${drilldown}`,
      [`${slug}Measure`]: title,
      [`${slug}Visible1`]: data.length >= 1,
      [`${slug}VisibleText1`]: data.length === 1,
      [`${slug}VisibleMore`]: data.length > 1,
      [`${slug}Year`]: resp.data.length && resp.data[0].Year
    };
    data.forEach((d: any, i: any) => {
      retObj[`${slug}${i + 1}Name`] = d.name;
      retObj[`${slug}${i + 1}Value`] = format(d.value);
      retObj[`${slug}${i + 1}Sub`] = format(d.value);
    });
    return retObj;

  }
};

export default generator;
