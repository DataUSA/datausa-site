// Converted from legacy canon_cms_section_visualization #329 "section admissions_applicants_enrolled" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap, albersUsaPr}) => {
  const {id, hierarchy, countyList, tesseract} = variables;
  const {abbreviate, commas, growthPct} = formatters;

  const carnegieId = swap("[[carnegieParents1]]").replace("carnegie_", "")
  const carnegie = carnegieId*1 === 0 ? "" : `;Carnegie Parent:${carnegieId}`

  const measureSelected = swap("[[enrolledOptions]]") //  applicants, admitted, enrolled

  const geoLevel =  hierarchy === "Nation" ? "State" : "County"

  const measure = measureSelected === "applicants" ? "Applicant Admitted" : measureSelected === "admitted" ? "Admitted who Enrolled" : "Enrollment"
 
  const url = measureSelected === "enrolled" ? `/api/data?drilldowns=${geoLevel},Year&measures=Enrollment${carnegie}`
                                             : `/api/data?drilldowns=${geoLevel},Year&measures=Applicants Total,Admissions Total,Admissions Enrolled Total${carnegie}`

  //Applicants Men,Applicants Women,Admissions Men,Admissions Women, Admissions Enrolled Men,Admissions Enrolled Women

  const tesseractUrl = measureSelected === "enrolled" ? `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=${geoLevel},Year&include=${hierarchy}:${id}${carnegie}&locale=en&measures=Enrollment`
                                                 : `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&drilldowns=${geoLevel},Year&include=${hierarchy}:${id}${carnegie}&locale=en&measures=Applicants Total,Admissions Total,Admissions Enrolled Total`


  return {
    data: tesseractUrl,
    dataFormat: (resp: any) => {
      const data = resp.data;
      if (measureSelected !== "enrolled") {
        data.forEach((d: any) => {
          d["Applicant Admitted"] = (d["Admissions Total"] / d["Applicants Total"]) * 100
          d["Admitted who Enrolled"] = (d["Admissions Enrolled Total"] / d["Admissions Total"]) * 100
        });
      }
  
      return data.filter((d: any) => d[measure]);
    },
    colorScale: measure,
    colorScaleConfig: {
      axisConfig: {
        tickFormat: measureSelected === "enrolled" ? (d: any) => `${abbreviate(d)}` : (d: any) => `${abbreviate(d)}%`,
        title: measure
      },
      //color: colorRaceACS[raceId],
      scale: "jenks"
    },
    /*shapeConfig: {
      Path: {
        fillOpacity: (d: any) => hierarchy === "Congressional District" && d["ID Geography"] === id ? 1 : 0.75,
        strokeOpacity: (d: any) => hierarchy === "Congressional District" && d["ID Geography"] === id ? 1 : 0.25
      }
    },*/
    tooltipConfig: {
      //title: (d: any) => hierarchy !== "Nation" ? d.County : d.State,
      tbody: (d: any) => {
        let customTooltip: any = [];
        measureSelected === "enrolled" ?
          customTooltip = [
            ["Year", d["Year"]],
            ["Enrollment", commas(d["Enrollment"])],
          ]
          : measureSelected === "applicants" ?
          customTooltip = [
            ["Year", d["Year"]],
            ["Admissions", commas(d["Admissions Total"])],
            ["Applicants", commas(d["Applicants Total"])],
            ["Applicant Admitted", growthPct(d["Applicant Admitted"])]
          ]
          : 
          customTooltip = [
            ["Year", d["Year"]],
            ["Admissions Enrolled", commas(d["Admissions Enrolled Total"])],
            ["Admissions", commas(d["Admissions Total"])],
            ["Admitted who Enrolled", growthPct(d["Admitted who Enrolled"])]
          ]
        return customTooltip;
       },
    },
    groupBy: hierarchy !== "Nation" ? "County ID" : "State ID",
    label: (d: any) => hierarchy !== "Nation" ? d.County : d.State,
    projection: hierarchy === "Nation" && typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
    topojson: hierarchy !== "Nation" ? `/topojson/County.json` : `/topojson/State.json`,
    topojsonId: (d: any) => d.id,
    topojsonFilter: hierarchy !== "Nation" ? (d: any) => countyList.includes(d.id) : (d: any) => true,
    time: "Year",
    type: "Geomap"
  }


};

export default viz;
