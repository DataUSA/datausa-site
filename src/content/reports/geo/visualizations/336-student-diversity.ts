// Converted from legacy canon_cms_section_visualization #336 "section student-diversity" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {colorRaceIPEDS, iconRace, id, iconGender, colorGender, tesseract, hierarchy} = variables;
  const {abbreviate, commas} = formatters;
  const {nest, sum} = libs.d3;

  const carnegieId = swap("[[completionsUniversities]]").replace("carnegie_", "")
  const carnegie = carnegieId*1 === 0 ? "" : `;Carnegie Parent:${carnegieId}`

  const variableSelected = swap("[[genderRaceOptions]]") //genderOption, raceOption, raceGenderOption

  const statusEducation = swap("[[statusEducation]]") //statusEducation0, statusEducation1, statusEducation2
  const sector = statusEducation === "statusEducation0" ? "" : statusEducation === "statusEducation1" ? `;Sector:1,4,7` : `;Sector:2,3,5,6,8,9`

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=IPEDS+Race,Gender,Year&include=${hierarchy}:${id}${sector}${carnegie}&locale=en&measures=Completions`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data.map((d: any) => Object.assign({}, d));
      return data.filter((d: any) => d["Completions"] > 0);
    },
    groupBy: variableSelected === "raceGenderOption" ? ["Gender ID"] : ["Race ID"],
    label: (d: any) => abbreviate(d["Completions"]),
    legend: variableSelected !== "raceOption" ? true : false,
    legendConfig: {
      label: variableSelected !== "raceOption" ? (d: any) => d.Gender : false,
      shapeConfig: {
        backgroundImage: variableSelected !== "raceOption" ? (d: any) => iconGender[d["Gender"]] : false
      }
    },
    legendTooltip: {
      tbody: [],
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
        ["Completions", (d: any) => commas(d["Completions"])]
      ]
    },
    type: "BarChart",
    x: variableSelected !== "genderOption" ? "IPEDS Race" : "Gender",
    xConfig: {
      title: ""
    },
    y: "Completions",
    yConfig: {
      title: "Completions"
    }
  };


};

export default viz;
