// Converted from legacy canon_cms_section_visualization #392 "section educational-pyramid" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  let dataMales: any; let dataFemales: any;
  const {hierarchy, id, tesseract, iconGender, colorGender, isNationStatePuma, isMSA, stateParentId, electionStateIDs} = variables;
  const {commas, abbreviate, salary} = formatters;
  const {extent, nest, sum} = libs.d3;

  const measure = swap("[[popEducation]]") // population, wage
  const measure_ = measure === "population" ? "Total Population" : "Average Wage"

  const ages = swap("[[educationAges]]") //  allPopulation, age25

  const listAges = Array(91 - 25).fill(undefined).map((_: any, idx: any) => 25 + idx).join(',')
  const ageFilter = ages === "allPopulation" ? "" : `&Age=${listAges}`

  const degrees: Record<string, any> = {
    "Associates Degree": 7,
    "Bachelors Degree": 8,
    "Graduate Degree":9,
    "High School or Equivalent": 5,
    "No Schooling": 1,
    "Preschool": 2,
    "Primary Education": 3,
    "Secondary Education": 4,
    "Some college": 6
  }

  const geoLevel = isNationStatePuma ? `include=${hierarchy}:${id}` : isMSA ? `include=State:${electionStateIDs}` : `include=State:${stateParentId}`

  const dataURL = ages === "age25" ? `${tesseract}tesseract/data?cube=pums_5&${geoLevel}&drilldowns=Age,Gender,Group,Year&measures=Total Population,Average Wage,Average Wage Appx MOE`
                                   : `${tesseract}tesseract/data?cube=pums_5&${geoLevel}&drilldowns=Gender,Group,Year&measures=Total Population,Average Wage,Average Wage Appx MOE`

  const moeData: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&${geoLevel}&drilldowns=Gender,Group,Year&measures=Total+Population+MOE+Appx&locale=en&parents=false`

  return {
    data: [dataURL, moeData],
    dataFormat: (resp: any) => {

      const data = resp[0].data.map((d: any) => Object.assign({}, d));
      const moe = resp[1].data.map((d: any) => Object.assign({}, d));
    
      if(ages === "age25"){
        let dataWomen: any = [];
        let dataMen: any = [];
      
        data.forEach((d: any) => {
          d["Group ID"] = Number(`${degrees[d["Group"]]}`);
          d["Age Range"] = d["Age"] >= 25 ? 1: 0
        });
      
        nest()
          .key((d: any) => `${d.Year}_${d["Age Range"]}_${d["Group ID"]}`)
          .entries(data)
          .map((group: any) => {
          
            const total = sum(group.values, (d: any) => d[measure_])
          
            dataMales = group.values.filter((d: any) => d["Gender ID"] === 1);
            dataFemales = group.values.filter((d: any) => d["Gender ID"] === 2);
          
            const dataMale: Record<string, any> = {...dataMales[0]};
            delete dataMale.Age;
            delete dataMale["Age ID"];
            dataMale[measure_] = sum(dataMales, (d: any) => d[measure_]);
            dataMale["Percentage"] = (dataMale[measure_] / total) * 100;
            dataMen.push(dataMale)
      
            const dataFemale: Record<string, any> = {...dataFemales[1]};
            delete dataFemale.Age;
            delete dataFemale["Age ID"];
            dataFemale[measure_] = sum(dataFemales, (d: any) => d[measure_]);
            dataFemale["Percentage"] = (dataFemale[measure_] / total) * 100;
          
            dataWomen.push(dataFemale)
  
          });
        
          const dataFinal = dataWomen.concat(dataMen).filter((d: any) => d["Age Range"]*1 === 1)
        
          // ADD MOE VALUE
          const moeMap = new Map(
            moe.map((item: any) => [
              `${item.Year}-${item["Gender ID"]}-${item.Group}`,
              item["Total Population MOE Appx"]
            ])
          );
        
          const dataWithMoe = dataFinal.map(({["Age Range"]: _, ...rest}: any) => {
            const key: string = `${rest.Year}-${rest["Gender ID"]}-${rest.Group}`;
            const moeValue = moeMap.get(key);
            return {
              ...rest,
              ...(moeValue !== undefined && { "Total Population MOE Appx": moeValue })
            };
          });

        return dataWithMoe
      }
      else{
        data.forEach((d: any) => {
          d["Group ID"] = Number(`${degrees[d["Group"]]}`);
        });
      
       // ADD MOE VALUE
        const moeMap = new Map(
          moe.map((item: any) => [
            `${item.Year}-${item["Gender ID"]}-${item.Group}`,
            item["Total Population MOE Appx"]
          ])
        );
      
        const dataWithMoe = data.map(({["Age Range"]: _, ...rest}: any) => {
          const key: string = `${rest.Year}-${rest["Gender ID"]}-${rest.Group}`;
          const moeValue = moeMap.get(key);
          return {
            ...rest,
            ...(moeValue !== undefined && { "Total Population MOE Appx": moeValue })
          };
        });

        return dataWithMoe.filter((d: any) => d["Group ID"]);
      }
    },
    discrete: "y",
    groupBy: ["Gender"],
    legend: true,
    legendConfig: {
      label: (d: any) => d.Gender,
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d["Gender"]],
      }
    },
    legendTooltip: {
      tbody: [],
    },
    shapeConfig: {
      label: (d: any) => '',
      Bar: {
        fill: (d: any) => colorGender[d.Gender]
      }
    },
    stacked: true,
    time: "Year",
    type: "BarChart",
    tooltipConfig: {
      tbody: [
        ["Population", (d: any) => commas(d["Total Population"])],
        ["Population Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`],
        ["Average Wage", (d: any) => salary(d["Average Wage"])],
        ["Average Wage Margin of Error", (d: any) => `± ${salary(d["Average Wage Appx MOE"])}`]
      ]
    },
    x: (d: any) => d["Gender ID"] === 1 ? d[measure_] * -1 : d[measure_],
    xConfig: {
      tickFormat: measure === "population" ? (d: any) => abbreviate(Math.abs(d)) : (d: any) => salary(Math.abs(d)),
      title: measure === "population" ? "Population by Gender and Education" : "Average Wage by Gender and Education"
    },
    y: "Group",
    ySort: (a: any, b: any) => a["Group ID"] - b["Group ID"],
  }

};

export default viz;
