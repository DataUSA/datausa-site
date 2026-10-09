// Converted from legacy canon_cms_section_visualization #403 "section poverty_and_diversity" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, swap}) => {
  const {colorSex, iconGender, id, colorRaceACS, iconRace, hierarchy, tesseract} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, bucket, commas} = formatters;
  const measure: string = "Poverty Population";
  const measureEmbedded = measure.replace(/\s/g, "%20");

  const optionSelected = swap("[[sexAgeRacePoverty]]") //raceOption, raceGenderOption,ageSexOption

  let dataURL: any = ""
  if(optionSelected === "raceOption"){
    dataURL = `${tesseract}tesseract/data?cube=acs_ygpsar_poverty_by_gender_age_race_5&include=${hierarchy}:${id};Poverty+Status:0&drilldowns=Year,Race&measures=Poverty+Population,Poverty+Population+Moe`
  }
  else if(optionSelected === "raceGenderOption"){
    dataURL = `${tesseract}tesseract/data?cube=acs_ygpsar_poverty_by_gender_age_race_5&include=${hierarchy}:${id};Poverty+Status:0&drilldowns=Year,Race,Gender&measures=Poverty+Population,Poverty+Population+Moe`
  }
  else{
     dataURL = `${tesseract}tesseract/data?cube=acs_ygpsar_poverty_by_gender_age_race_5&include=${hierarchy}:${id};Poverty+Status:0&drilldowns=Year,Age,Gender&measures=Poverty+Population,Poverty+Population+Moe`
  }

  const config: Record<string, any> = {
    cache: false,
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["Race ID"] !== 0);
      nest()
        .key((d: any) => d.Year)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          group.values.forEach((d: any) => d.share = d[measure] / total);
        });
      if(optionSelected !== "raceOption"){
        data.forEach((d: any) => {
          d.Sex = d.Gender
          d["Sex ID"] = d["Gender ID"]
          delete d.Gender
          delete d["Gender ID"]
        });
      }
      return data;
    },
    groupBy: optionSelected !== "raceOption" ? "Sex ID" : "Race ID",
    groupPadding: 10,
    label: (d: any) => `${abbreviate(d["share"]*100)}%`,
    legendConfig: {
      label: optionSelected !== "raceOption" ?  (d: any) => d.Sex : false,
      shapeConfig: {
        backgroundImage: optionSelected !== "raceOption" ?  (d: any) => iconGender[d.Sex] : false
      }
    },
    legendTooltip: {
      tbody: []
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["People", (d: any) => commas(d[measure])],
        ["Margin of Error", (d: any) => `± ${commas(d[`${measure} Moe`])}`],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    type: "BarChart",
    x: optionSelected === "ageSexOption" ? "Age" : "Race",
    xConfig: {
      labelRotation: false,
      tickFormat: optionSelected === "ageSexOption" ? (d: any) => bucket(d) : false,
      title: false
    },
    y: "share",
    yConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Share"
    }
  }

  if(optionSelected === "raceOption"){
    config.shapeConfig= {
      fill: (d: any) => colorRaceACS[d["Race ID"]],
      label: false
    }
  }

  return config;

};

export default viz;
