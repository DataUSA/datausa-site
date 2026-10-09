// Converted from legacy canon_cms_section_visualization #359 "section races" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {colorSex, iconGender, id, colorRaceACS, iconRace, hierarchy, tesseract} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, bucket, commas} = formatters;

  const optionSelected = swap("[[genderRacePoverty]]") //  genderRace, races

  // const dataGender = `/api/data?drilldowns=Gender,Race,Year&measures=Total Population,Total Population MOE Appx,Average Wage&Workforce Status=true&${hierarchy}=${id}`
  // const dataRaces = `/api/data?drilldowns=Race,Year&measures=Total Population,Total Population MOE Appx,Average Wage&Workforce Status=true&${hierarchy}=${id}`

  const dataGender: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Gender,Race&measures=Total+Population,Total+Population+MOE+Appx,Average%20Wage,Record+Count&include=${hierarchy}:${id};Workforce+Status:true&locale=en`
  const dataRace: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Race&measures=Total+Population,Total+Population+MOE+Appx,Average%20Wage,Record+Count&include=${hierarchy}:${id};Workforce+Status:true&locale=en`

  if(optionSelected === "genderRace"){
    return {
      data: dataGender,
      dataFormat: (resp: any) => {
        const data = resp.data.filter((d: any) => d["Race ID"] !== 5).map((d: any) => Object.assign({}, d));
      
        nest()
          .key((d: any) => d.Year)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d["Total Population"]);
            group.values.forEach((d: any) => d.share = d["Total Population"] / total);
          });
        
          data.forEach((d: any) => {
            d.Sex = d.Gender
            d["Sex ID"] = d["Gender ID"]
            delete d.Gender
            delete d["Gender ID"]
          });

        return data;
      },
      groupBy: "Sex ID",
      groupPadding: 10,
      label: (d: any) => `${abbreviate(d["share"]*100)}%`,
      legendConfig: {
        label: (d: any) => d.Sex,
        shapeConfig: {
          backgroundImage: (d: any) => iconGender[d.Sex]
        }
      },
      legendTooltip: {
        tbody: []
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Workforce", (d: any) => commas(d["Total Population"])],
          ["Margin of Error", (d: any) => `± ${commas(d[`Total Population MOE Appx`])}`],
          ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
        ]
      },
      type: "BarChart",
      x: "Race",
      xConfig: {
        labelRotation: false,
        //tickFormat: optionSelected === "genderRace" ? (d: any) => bucket(d) : false,
        title: false
      },
      xSort: (a: any, b: any) => b["Total Population"] - a["Total Population"],
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      }
    }
  }

  else{
     return {
      data: dataRace,
      dataFormat: (resp: any) => {
        const data = resp.data.filter((d: any) => d["Race ID"] !== 5).map((d: any) => Object.assign({}, d));
      
        nest()
          .key((d: any) => d.Year)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d["Total Population"]);
            group.values.forEach((d: any) => d.share = d["Total Population"] / total);
          });
        console.log(data)
        return data;
      },
      discrete: "y",
      groupBy: "Race ID",
      groupPadding: 10,
      label: (d: any) => `${abbreviate(d["share"]*100)}%`,
      legendConfig: false,
      legendTooltip: {
        tbody: []
      },
      shapeConfig: {
      fill: (d: any) => colorRaceACS[d["Race ID"]],
      label: false
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Workforce", (d: any) => commas(d["Total Population"])],
          ["Margin of Error", (d: any) => `± ${commas(d[`Total Population MOE Appx`])}`],
          ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
        ]
      },
      type: "BarChart",
      x: "share",
      xConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      },
      y: "Race",
      yConfig: {
        labelRotation: false,
        //tickFormat: optionSelected === "genderRace" ? (d: any) => bucket(d) : false,
        title: false
      },
      ySort: (a: any, b: any) => a["Total Population"] - b["Total Population"],
    }
  }


};

export default viz;
