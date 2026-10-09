// Converted from legacy canon_cms_generator #532 "[About] Most Common Degree" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 532,
  name: "[About] Most Common Degree",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year,CIP6,Degree&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc&time=Year.latest&exclude=Degree:20,21`,
  logic: (resp, {libs, formatters, variables}) => {
    const {name} = variables;
    const data_ = resp.data.filter((d: any) => d["Completions"] > 0)

    if (data_.length === 0){
        return {
        bachelorsMostPopularDegree: false,
        bachelorsNotMostPopularDegree: false,
        latestYearDegrees_: false,
        degreeCommonTop3_: false,
        degreeTop1_: false,
        degreeTop2_: false,
        degreeTop3_: false,
        mostPopularDegree: false,
        degreeCommonText: "",
        mostCommonDegreesText: ""
      }
    }

    else{
      const latestYear = libs.d3.max(data_, (d: any) => d["Year"]);
  
      let data = data_.filter((d: any) => d["Year"] === latestYear);
  
      const url = (d: any) => `<a href='/profile/cip/${d["CIP6 ID"]}'>${d["CIP6"]}</a>`;
      const {commas} = formatters;
  
      const latestYearDegrees_ = data[0]["Year"]
      const mostPopularDegree = data[0]["Degree"]
      const mostPopularDegreeID = data[0]["Degree ID"]
  
      const dataFiltered = data.filter((d: any) => d["Degree"] === mostPopularDegree);
      const dataFiltered_ = dataFiltered.slice(0, 3).map((d: any, i: any) => `${url(d)} (${commas(d["Completions"])} degrees${!i ? " awarded" : ""})`);
  
      let text1: any = "";
  
      if(dataFiltered.length > 0){
    
        if (dataFiltered.length > 2 && dataFiltered[2]["Completions"] > 0) {
          text1 = `${dataFiltered_[0]}, followed by ${dataFiltered_[1]} and ${dataFiltered_[2]}.`;
        }
    
        else if (dataFiltered.length > 1 && dataFiltered[1]["Completions"] > 0) {
          text1 = `${dataFiltered_[0]}, followed by ${dataFiltered_[1]}.`;
        }
    
        else if (dataFiltered[0]["Completions"] > 0) {
          text1 = `${dataFiltered_[0]}.`;
        }
    
        else {
          text1 = "";
        }
      }
  
      let text2: any = ""
  
      if (latestYearDegrees_ && mostPopularDegree && dataFiltered_){
        text2 = `In ${latestYearDegrees_}, the most popular ${mostPopularDegree} concentrations at ${name} were ${formatters.list(dataFiltered_)}.`
      }
  
      return {
        bachelorsMostPopularDegree: mostPopularDegreeID === 5 ? true : false,
        bachelorsNotMostPopularDegree: mostPopularDegreeID === 5 ? false : true,
        latestYearDegrees_,
        degreeCommonTop3_: dataFiltered_,
        degreeTop1_: dataFiltered_[0],
        degreeTop2_: dataFiltered_[1],
        degreeTop3_: dataFiltered_[2],
        mostPopularDegree,
        degreeCommonText: text1,
        mostCommonDegreesText: text2
      }
    }
  }
};

export default generator;
