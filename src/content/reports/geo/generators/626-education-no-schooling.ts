// Converted from legacy canon_cms_generator #626 "[Education] No Schooling" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 626,
  name: "[Education] No Schooling",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=Year,Age,Gender,State&measures=Total Population&time=Year.latest&Group=No Schooling`,
  logic: (resp, {libs}) => {
    let dataMales: any; let dataFemales: any;
    const {extent, nest, sum} = libs.d3;
    const data = resp.data.filter((d: any) => d["Age"]*1 >= 25)

    let dataWomen: any = [];
    let dataMen: any = [];

    data.forEach((d: any) => {
      d["Age Range"] = d["Age ID"] >= 25 ? 1: 0
    });

    nest()
      .key((d: any) => `${d["Age Range"]}_${d["State ID"]}}`)
      .entries(data)
      .map((group: any) => {
    
        const total = sum(group.values, (d: any) => d["Total Population"])
    
        dataMales = group.values.filter((d: any) => d["Gender ID"] === 1);
        dataFemales = group.values.filter((d: any) => d["Gender ID"] === 2);
    
        const dataMale: Record<string, any> = {...dataMales[0]};
        delete dataMale.Age;
        delete dataMale["Age ID"];
        dataMale["Total Population"] = sum(dataMales, (d: any) => d["Total Population"]);
        dataMale["Percentage"] = (dataMale["Total Population"] / total) * 100;
        dataMen.push(dataMale)

        const dataFemale: Record<string, any> = {...dataFemales[1]};
        delete dataFemale.Age;
        delete dataFemale["Age ID"];
        dataFemale["Total Population"] = sum(dataFemales, (d: any) => d["Total Population"]);
        dataFemale["Percentage"] = (dataFemale["Total Population"] / total) * 100;
    
        dataWomen.push(dataFemale)

      });


    const dataNoSchooling =  dataWomen.concat(dataMen).filter((d: any) => d["Age Range"]*1 === 1)

    dataNoSchooling.forEach((d: any) => {
      delete d["Gender"]
      delete d["Group ID"]
      delete d["Group"]
      delete d["Slug State"]
      delete d["Age Range"]
      delete d["Percentage"]
    })

    return{
      dataNoSchooling: dataWomen.concat(dataMen)
    }
  }
};

export default generator;
