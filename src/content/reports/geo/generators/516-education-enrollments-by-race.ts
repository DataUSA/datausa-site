// Converted from legacy canon_cms_generator #516 "[Education] Enrollments by Race" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 516,
  name: "[Education] Enrollments by Race",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=Year,Gender,IPEDS Race&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Enrollment&time=Year.latest`,
  logic: (resp, {libs, variables}) => {
    const {max} = libs.d3;
    const {hierarchy} = variables;
    const {extent, nest, sum} = libs.d3;

    const data = resp.data;

    if(data.length > 0){
      const lastYearEducByRace: any = data[0] ? data[0]["Year"] : false
  
      const dataLastYear = data.filter((d: any) => d["Year"] === lastYearEducByRace)
  
      nest()
        .key((d: any) => d["IPEDS Race ID"])
        .entries(dataLastYear)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d["Enrollment"])
          group.values.forEach((d: any) => {
            d["Share"] = (d["Enrollment"] / total) * 100
            d["Total"] = total
          });
        })
  
      const topRaceEnrollmentValue = Math.max(...dataLastYear.map((d: any) => d.Total))
  
      const race = dataLastYear.find((d: any) => d.Total === topRaceEnrollmentValue)["IPEDS Race ID"]
      const topRaceEnrollment = dataLastYear.find((d: any) => d.Total === topRaceEnrollmentValue)["IPEDS Race"]
  
      const dataTopRace = dataLastYear.filter((d: any) => d["IPEDS Race ID"] === race)
  
      const topRaceEnrollmentWomenPct = dataTopRace.filter((d: any) => d["Gender ID"] === 2)[0]["Share"]
      const topRaceEnrollmentMenPct = dataTopRace.filter((d: any) => d["Gender ID"] === 1)[0]["Share"]
  
  
      return {
        lastYearEducByRace,
        topRaceEnrollmentValue,
        topRaceEnrollmentWomenPct,
        topRaceEnrollmentMenPct,
        topRaceEnrollment
      }
    }
    else{
      return{
        lastYearEducByRace: false,
        topRaceEnrollmentValue:false,
      }
    }
  }
};

export default generator;
