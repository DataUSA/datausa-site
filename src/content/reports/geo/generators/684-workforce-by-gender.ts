// Converted from legacy canon_cms_generator #684 "Workforce by Gender" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 684,
  name: "Workforce by Gender",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&include=${attrs.hierarchy}:${attrs.id};Employment+Time+Status:1&measures=Average+Wage,Average+Wage+Appx+MOE,Total+Population&time=Year.latest&drilldowns=Year,${attrs.hierarchy},Gender`,
  logic: (resp, {libs, variables}) => {
    const {hierarchy} = variables;
    if (!resp.data.length) return {wage1Gap: false};
    const {nest} = libs.d3;

    const retObj: Record<string, any> = {
      wageGenderYear: resp.data[0].Year
    };

    nest()
      .key((d: any) => d[`${hierarchy} ID`])
      .entries(resp.data)
      .forEach((group: any, i: any) => {
        const male = group.values.find((d: any) => d["Gender ID"] === 1);
        const female = group.values.find((d: any) => d["Gender ID"] === 2);

        retObj[`wage${i + 1}Geo`] = female[hierarchy];
        retObj[`wage${i + 1}Female`] = female["Average Wage"];
        retObj[`wage${i + 1}FemaleMOE`] = female["Average Wage Appx MOE"];
        retObj[`wage${i + 1}Male`] = male["Average Wage"];
        retObj[`wage${i + 1}MaleMOE`] = male["Average Wage Appx MOE"];
        retObj[`wage${i + 1}Gap`] = male["Average Wage"] / female["Average Wage"];
    
      });
  
    return retObj;
  }
};

export default generator;
