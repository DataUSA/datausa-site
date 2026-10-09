// Converted from legacy canon_cms_generator #592 "[Diversity] Workforce by Age Bucket" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 592,
  name: "[Diversity] Workforce by Age Bucket",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Age,${attrs.hierarchy}&locale=en&measures=Record+Count%2CTotal+Population&include=Workforce+Status:true;${attrs.hierarchy}:${attrs.id}&filters=Record+Count.gte.5&time=Year.latest`,
  logic: (resp, {libs, variables}) => {
    let dataTots: any;
    const {hierarchy, id} = variables;
    const {nest, max, sum, extent} = libs.d3;

    const ageBuckets = 5;
    const valueMeasure: string = "Total Population"
    let dataTotal: any = [];

    const occupationData = resp.data.filter((d: any) => d[`${hierarchy} ID`] === id);
    const latestYear = Math.max(...occupationData.map((d: any) => d["Year"]));
    
    //const data_ = resp.data.filter((d: any) => d["ID Year"]*1 === rankingLatestYear)

    const {data} = resp;
        nest()
          .key((d: any) => `${d.Year}_${Math.floor(d.Age / ageBuckets)}`)
          .entries(data.filter((d: any) => d["Age"] < 90))
          .map((group: any) => {
        
            const total = sum(group.values, (d: any) => d[valueMeasure])
            const ages = extent(group.values, (d: any) => d.Age);
        
            dataTots = group.values.filter((d: any) => d["Year"] === latestYear);
        
            const dataTot: Record<string, any> = {...dataTots};
            delete dataTot.Age;
            dataTot["Starting Age"] = ages[0];
            dataTot["Ending Age"] = ages[1];
            dataTot[valueMeasure] = sum(dataTots, (d: any) => d[valueMeasure]);
            dataTot["Percentage"] = (dataTot[valueMeasure] / total) * 100;
  
            dataTotal.push(dataTot)

          });

    const data_ = dataTotal.sort((a: any, b: any) => b["Total Population"] - a["Total Population"])

    const total = sum(data_, (d: any) => d[valueMeasure])
    const totalShare = ((data_[0]["Total Population"] + data_[1]["Total Population"] + data_[2]["Total Population"]) / total) * 100

    return{
      top1AgeWorkforce: data_[0]["Total Population"],
      top1AgeWorkforceRange: `${data_[0]["Starting Age"]} to ${data_[0]["Ending Age"]}`,
      top2AgeWorkforce: data_[1]["Total Population"],
      top2AgeWorkforceRange: `${data_[1]["Starting Age"]} to ${data_[1]["Ending Age"]}`,
      top3AgeWorkforce: data_[2]["Total Population"],
      top3AgeWorkforceRange: `${data_[2]["Starting Age"]} to ${data_[2]["Ending Age"]}`,
      ageBucketShare: totalShare
  
  
    }
  }
};

export default generator;
