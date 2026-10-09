// Converted from legacy canon_cms_section_visualization #325 "section staff_tmap" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorOccupIPEDS, instructionalEmployees, iconSector, id, manyUniversities, tesseract, hierarchy} = variables;
  const {abbreviateBig, commas} = formatters;

  return {
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_noninstructional&drilldowns=IPEDS+Occupation,Year,${hierarchy}&include=${hierarchy}:${id}&locale=en&measures=Total+Noninstructional+Employees&parents=true`,
    dataFormat: (resp: any) => {
      const data = resp.data;
      data.forEach((d: any) => {
        d["Total Employees"] = d["Total Noninstructional Employees"];
      });

      const instructional = instructionalEmployees;

      instructional.forEach((d: any) => {
        d["IPEDS Occupation"] = d["Academic Rank"];
        d["IPEDS Occupation Parent"] = "Professor";
        d["IPEDS Occupation Parent ID"] = "Professor";
        d["Total Employees"] = d["Median Total Instructional Employees"];
      });
    
      const dataFinal = data.concat(instructional);

      return dataFinal.filter((d: any) => d["Total Employees"] > 0)
    },
    groupBy: ["IPEDS Occupation Parent", "IPEDS Occupation"],
    legendConfig: {
      label: "",
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Occupation Group", (d: any) => d["IPEDS Occupation Parent"]],
        ["Number of Employees", (d: any) => commas(d["Total Employees"])]
      ]
    },
    shapeConfig: {
      fill: (d: any) => colorOccupIPEDS[d["IPEDS Occupation Parent"]] ? colorOccupIPEDS[d["IPEDS Occupation Parent"]] : "red"
    },
    sum: "Total Employees",
    time: "Year",
    total: "Total Employees",
    totalFormat: (d: any) => `Total: ${abbreviateBig(d)}`,
    type: "Treemap"
  }
};

export default viz;
