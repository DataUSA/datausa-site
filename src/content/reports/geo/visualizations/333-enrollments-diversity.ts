// Converted from legacy canon_cms_section_visualization #333 "section enrollments_diversity" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {id, iconGender, iconRace, colorGender, colorRaceIPEDS, tesseract, hierarchy} = variables;
  const {abbreviate, commas} = formatters;

  const carnegieId = swap("[[carnegieParents2]]").replace("carnegie_", "")
  const carnegie = carnegieId*1 === 0 ? "" : `;Carnegie Parent:${carnegieId}`

  const variableSelected = swap("[[enrollmentsDiversity]]") //genderOption, raceOption, raceGenderOption

  const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=Year,Gender,IPEDS Race&include=${hierarchy}:${id}${carnegie}&locale=en&measures=Enrollment`

  return {
    data: data,
    //`/api/data?Geography=${id}&drilldowns=Gender,IPEDS Race,Year&measures=Enrollment${carnegie}`,
    dataFormat: (resp: any) => {
      const data = resp.data.map((d: any) => Object.assign({}, d));
      return data;
    },
    groupBy: variableSelected === "raceGenderOption" ? ["Gender ID"] : ["Race ID"],
    label: (d: any) => abbreviate(d["Enrollment"]),
    legend: variableSelected !== "raceOption" ? true : false,
    legendConfig: {
      label: variableSelected !== "raceOption" ? (d: any) => d.Gender : false,
      shapeConfig: {
        backgroundImage: variableSelected !== "raceOption" ? (d: any) => iconGender[d["Gender"]] : false
      }
    },
    legendTooltip: {
      tbody: [],
      title:  (d: any) =>  {
        const imgUrl = variableSelected !== "raceOption" ? iconGender[d["Gender"]] : iconRace;
        return `
          <div class='d3plus-tooltip-title-wrapper'>
            <div class="icon" style="background-color: ${variableSelected !== "raceOption" ? colorGender[d.Gender] : colorRaceIPEDS[d["IPEDS Race ID"]]}"><img src="${imgUrl}" /></div>
            <div class="title"><span>${variableSelected !== "raceOption" ? d.Gender : d["IPEDS Race"]}</span></div>
            <div class="subtitle"><span>${variableSelected !== "raceOption" ? "Gender" : "Race"}</span></div>
          </div>
        ` 
      }
    },
    time: "Year",
    tooltipConfig: {
      title: (d: any) =>  {
        const imgUrl = variableSelected !== "raceOption" ? iconGender[d["Gender"]] : iconRace;
        return `
          <div class='d3plus-tooltip-title-wrapper'>
            <div class="icon" style="background-color: ${variableSelected !== "raceOption" ? colorGender[d.Gender] : colorRaceIPEDS[d["IPEDS Race ID"]]}"><img src="${imgUrl}" /></div>
            <div class="title"><span>${variableSelected !== "raceOption" ? d.Gender : d["IPEDS Race"]}</span></div>
            <div class="subtitle"><span>${variableSelected !== "raceOption" ? "Gender" : "Race"}</span></div>
          </div>
        ` 
      },
      tbody: [
        ["Year", (d: any) => d["Year"]],
        ["Enrollment", (d: any) => commas(d["Enrollment"])]
      ]
    },
    type: "BarChart",
    x: variableSelected !== "genderOption" ? "IPEDS Race" : "Gender",
    xConfig: {
      title: ""
    },
    y: "Enrollment",
    yConfig: {
      title: "Enrollments"
    }
  };
};

export default viz;
