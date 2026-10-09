// Converted from legacy canon_cms_section_visualization #373 "section gender-and-age" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {hierarchy, id, iconGender, colorGender, tesseract} = variables;
  const {commas, abbreviate} = formatters;

  const dataURL: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Gender,Employment+Time+Status,Year&include=Workforce+Status:true;${hierarchy}:${id}&locale=en&measures=Total+Population,Total+Population+MOE+Appx`

  const colorConfig: Record<string, any> = {
    1: colorGender["Male"],
    2: colorGender["Female"]
  };

  const opConfig: Record<string, any> = {
    1: 1,
    2: 0.6
  }

  return {
    data: dataURL,
    height:250,
    groupBy: ["Gender ID", "Employment Time Status ID"],
    label: (d: any) => String(d["Employment Time Status"]),
    discrete: "y",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d["Year"]],
        ["Workforce", (d: any) => commas(d["Total Population"])]
      ]
    },
    time: "Year",
    title: `Workday by Gender`,
    type: "BarChart",
    legend: false,
    stacked: true,
    stackOrder: ["Employment Time Status"],
    shapeConfig: {
      fill: (d: any) => colorConfig[d["Gender ID"]],
      opacity: (d: any) => opConfig[d["Employment Time Status ID"]]
    },
    x: "Total Population",
    xConfig: {
      title: "Workforce",
      tickFormat: (d: any) => abbreviate(d)
    },
    y: "Gender",
    yConfig: {
      title: ""
    }
  };
};

export default viz;
