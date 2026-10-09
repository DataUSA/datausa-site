// Converted from legacy canon_cms_generator #588 "Veterans" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 588,
  name: "Veterans",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygv_veterans_5&${attrs.hierarchy}=${attrs.id}&measures=Veterans,Veterans+Moe&sort=Veterans.desc&drilldowns=Year,Period+of+Service&time=Year.latest`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const currYear = max(resp.data, (d: any) => d["Year"]);
    const currData = resp.data.filter((d: any) => d["Year"] === currYear);

    const data = currData.filter((d: any) => d["Period of Service ID"] !== 5 && d["Veterans"] > 0);
    const measure: string = "Veterans";

    return {
      conflict1Name: data.length > 0 ? data[0]["Period of Service"] : false,
      conflict1Value: data.length > 0 ? data[0][measure] : false,
      conflict1Moe: data.length > 0 ? Math.round(data[0][`${measure} Moe`]) : false,
      conflict2Name: data.length > 1 ? data[1]["Period of Service"] : false,
      conflict2Value: data.length > 1 ? data[1][measure] : false,
      conflict2Moe: data.length > 1 ? Math.round(data[1][`${measure} Moe`]) : false,
      conflict3Name: data.length > 2 ? data[2]["Period of Service"] : false,
      conflict3Value: data.length > 2 ? data[2][measure] : false,
      conflict3Moe: data.length > 2 ? Math.round(data[2][`${measure} Moe`]) : false,
      conflict1Size: data.length > 1 ? data[0][measure] / data[1][measure] : false,
    };
  }
};

export default generator;
