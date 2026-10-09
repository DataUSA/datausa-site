// Converted from legacy canon_cms_section_visualization #328 "section admissions_applicants_enrolled" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {id, hierarchy, iconGender, tesseract} = variables;
  const {abbreviate, commas, growthPct} = formatters;

  const carnegieId = swap("[[carnegieParents1]]").replace("carnegie_", "")
  const carnegie = carnegieId * 1 === 0 ? "" : `;Carnegie Parent:${carnegieId}`

  const measureSelected = swap("[[enrolledOptions]]") //  applicants, admitted, enrolled

  const measure = measureSelected === "applicants" ? "Applicant Admitted" : measureSelected === "admitted" ? "Admitted who Enrolled" : "Enrollment"
 
  const dataURL = measureSelected === "enrolled" ? `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=Gender,Year&include=${hierarchy}:${id}${carnegie}&locale=en&measures=Enrollment`
                                                 : `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&drilldowns=Year&include=${hierarchy}:${id}${carnegie}&locale=en&measures=Applicants+Men,Applicants+Women,Admissions+Men,Admissions+Women,Admissions+Enrolled+Men,Admissions+Enrolled+Women`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      let data = resp.data.map((d: any) => Object.assign({}, d));
      if (measureSelected !== "enrolled") {
        data.forEach((d: any) => {
          d["Applicant Admitted Women"] = (d["Admissions Women"] / d["Applicants Women"]) * 100
          d["Admitted who Enrolled Women"] = (d["Admissions Enrolled Women"] / d["Admissions Women"]) * 100
          d["Applicant Admitted Men"] = (d["Admissions Men"] / d["Applicants Men"]) * 100
          d["Admitted who Enrolled Men"] = (d["Admissions Enrolled Men"] / d["Admissions Men"]) * 100
        });
      
        const men = data.map((d: any) => {
          return Object.assign({}, d)
        })
      
        data.forEach((d: any) => {
          d["Gender"] = "Women"
          d["Gender ID"] = 2
        
          d["Admissions Enrolled"] = d["Admissions Enrolled Women"]
          d["Admissions"] = d["Admissions Women"]
          d["Admitted who Enrolled"] = d["Admitted who Enrolled Women"]
          d["Applicant Admitted"] = d["Applicant Admitted Women"]
          d["Applicants"] = d["Applicants Women"]
        
          delete d["Admissions Enrolled Women"]
          delete d["Admissions Women"]
          delete d["Admitted who Enrolled Women"]
          delete d["Applicant Admitted Women"]
          delete d["Applicants Women"]
        
          delete d["Admissions Enrolled Men"]
          delete d["Admissions Men"]
          delete d["Admitted who Enrolled Men"]
          delete d["Applicant Admitted Men"]
          delete d["Applicants Men"]
        })

        men.forEach((d: any) => {
          d["Gender"] = "Men"
          d["Gender ID"] = 1
        
          d["Admissions Enrolled"] = d["Admissions Enrolled Men"]
          d["Admissions"] = d["Admissions Men"]
          d["Admitted who Enrolled"] = d["Admitted who Enrolled Men"]
          d["Applicant Admitted"] = d["Applicant Admitted Men"]
          d["Applicants"] = d["Applicants Men"]
        
          delete d["Admissions Enrolled Women"]
          delete d["Admissions Women"]
          delete d["Admitted who Enrolled Women"]
          delete d["Applicant Admitted Women"]
          delete d["Applicants Women"]
        
          delete d["Admissions Enrolled Men"]
          delete d["Admissions Men"]
          delete d["Admitted who Enrolled Men"]
          delete d["Applicant Admitted Men"]
          delete d["Applicants Men"]
        })
        return data.concat(men)
      }
      else{
       return data.filter((d: any) => d[measure]);
      }
    },
    groupBy: ["Gender ID"],
    height: 300,
    label: measureSelected === "enrolled" ? (d: any) => `${abbreviate(d[measure])}` : (d: any) => `${abbreviate(d[measure])}%`,
    legend: true,
    legendConfig: {
      label: (d: any) => d.Gender,
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d["Gender"]]
      }
    },
    legendTooltip: {
      tbody: [],
      //title: (d: any) => d.Gender,
    },
    type: "LinePlot",
    tooltipConfig: {
      title: (d: any) => d["Gender"],
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
            ["Admissions", commas(d["Admissions"])],
            ["Applicants", commas(d["Applicants"])],
            ["Applicant Admitted", growthPct(d["Applicant Admitted"])]
          ]
          : 
          customTooltip = [
            ["Year", d["Year"]],
            ["Admissions Enrolled", commas(d["Admissions Enrolled"])],
            ["Admissions", commas(d["Admissions"])],
            ["Admitted who Enrolled", growthPct(d["Admitted who Enrolled"])]
          ]
        return customTooltip;
      }
    },
    x: "Year",
    y: measure,
    yConfig: {
      tickFormat: measureSelected === "enrolled" ? (d: any) => `${abbreviate(d)}` : (d: any) => `${abbreviate(d)}%`,
    }
  };
};

export default viz;
