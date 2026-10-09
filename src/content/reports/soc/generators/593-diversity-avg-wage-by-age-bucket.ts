// Converted from legacy canon_cms_generator #593 "[Diversity] Avg Wage by Age Bucket" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 593,
  name: "[Diversity] Avg Wage by Age Bucket",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year%2CAge%2CGender&locale=en&measures=Record+Count%2CAverage+Wage&filters=Record+Count.gte.5&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&time=Year.latest`,
  logic: (resp, {libs, formatters, variables}) => {
    let dataMales: any; let dataFemales: any;
    const {hierarchy, id} = variables;
    const {nest, max, sum, extent, mean} = libs.d3;
    const {salary} = formatters;

    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const dataFiltered = resp.data.filter((d: any) => d["Year"] === latestYear);

    const ageBuckets = 5;

    const valueMeasure: string = "Average Wage"

    let dataWomen: any = [];
    let dataMen: any = [];
    const data = dataFiltered;
        nest()
          .key((d: any) => `${d.Year}_${Math.floor(d.Age / ageBuckets)}`)
          .entries(data.filter((d: any) => d["Age"] < 90))
          .map((group: any) => {
        
       //     const total = sum(group.values, (d: any) => d[valueMeasure])
            const ages = extent(group.values, (d: any) => d.Age);
            dataMales = group.values.filter((d: any) => d["Gender ID"] === 1);
            dataFemales = group.values.filter((d: any) => d["Gender ID"] === 2);
        
            const dataMale: Record<string, any> = {...dataMales[0]};
            delete dataMale.Age;
            dataMale["Starting Age"] = ages[0];
            dataMale["Ending Age"] = ages[1];
            dataMale[valueMeasure] = mean(dataMales, (d: any) => d[valueMeasure]);
            dataMen.push(dataMale)
    
            const dataFemale: Record<string, any> = {...dataFemales[1]};
            delete dataFemale.Age;
            dataFemale["Starting Age"] = ages[0];
            dataFemale["Ending Age"] = ages[1];
            dataFemale[valueMeasure] = mean(dataFemales, (d: any) => d[valueMeasure]);
            dataWomen.push(dataFemale)
    });

    const dataWomen_ = dataWomen.sort((a: any, b: any) => b[valueMeasure] - a[valueMeasure])
    const dataMen_ = dataMen.sort((a: any, b: any) => b[valueMeasure] - a[valueMeasure])

    const maleData: any = dataMen_[0][valueMeasure] ? true : false;
    const femaleData: any = dataWomen_[0][valueMeasure] ? true : false;

    const top1AgeMaleWage = dataMen_[0][valueMeasure];
    const top1AgeMaleWageRange: string = `${dataMen_[0]["Starting Age"]} to ${dataMen_[0]["Ending Age"]}`;
    const top1AgeFemaleWage = dataWomen_[0][valueMeasure];
    const top1AgeFemaleWageRange: string = `${dataWomen_[0]["Starting Age"]} to ${dataWomen_[0]["Ending Age"]}`;

    let string_: any = ""

    if (maleData && femaleData) {
      string_ = `The age ranges with the best average salaries were ${top1AgeFemaleWageRange} years for women (${salary(top1AgeFemaleWage)}) and ${top1AgeMaleWageRange} years for men (${salary(top1AgeMaleWage)}).`
    }

    else if (maleData) {
      string_ = `The age range with the best average salaries was ${top1AgeMaleWageRange} years for men (${salary(top1AgeMaleWage)}).`
    }

    else if (femaleData) {
      string_ = `The age range with the best average salaries was ${top1AgeFemaleWageRange} years for women (${salary(top1AgeFemaleWage)}).`
    }


    return{
      ageBucketWageText: string_,
      top1AgeMaleWage: dataMen_[0][valueMeasure],
      top1AgeMaleWageRange: `${dataMen_[0]["Starting Age"]} to ${dataMen_[0]["Ending Age"]}`,
      top1AgeFemaleWage: dataWomen_[0][valueMeasure],
      top1AgeFemaleWageRange: dataWomen_[0][valueMeasure] ? `${dataWomen_[0]["Starting Age"]} to ${dataWomen_[0]["Ending Age"]}` : false,
    }
  }
};

export default generator;
