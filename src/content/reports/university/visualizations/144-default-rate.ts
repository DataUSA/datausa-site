// Converted from legacy canon_cms_section_visualization #144 "section default_rate" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const {colorGrey, colorHighlight, id, name, similarUnivIds, similarUnivIdsTemp, opeid, tesseract, similarOpeidId_List} = variables;
  const {abbreviate, commas, salary} = formatters;

  const measure: string = "Default Rate";
  const measureEncoded = measure.replace(/\s/g, "%20");

  const dataId: string = `${tesseract}tesseract/data.jsonrecords?OPEID=${opeid}&cube=ed_defaults&drilldowns=OPEID%2CYear&measures=Borrowers+In+Default%2CBorrowers+Entered+Repayment%2C${measureEncoded}`

  const dataNeighbour1: string = `${tesseract}tesseract/data.jsonrecords?OPEID=${similarOpeidId_List[0]}&cube=ed_defaults&drilldowns=OPEID%2CYear&measures=Borrowers+In+Default%2CBorrowers+Entered+Repayment%2C${measureEncoded}`
  const dataNeighbour2: string = `${tesseract}tesseract/data.jsonrecords?OPEID=${similarOpeidId_List[1]}&cube=ed_defaults&drilldowns=OPEID%2CYear&measures=Borrowers+In+Default%2CBorrowers+Entered+Repayment%2C${measureEncoded}`
  const dataNeighbour3: string = `${tesseract}tesseract/data.jsonrecords?OPEID=${similarOpeidId_List[2]}&cube=ed_defaults&drilldowns=OPEID%2CYear&measures=Borrowers+In+Default%2CBorrowers+Entered+Repayment%2C${measureEncoded}`
  const dataNeighbour4: string = `${tesseract}tesseract/data.jsonrecords?OPEID=${similarOpeidId_List[3]}&cube=ed_defaults&drilldowns=OPEID%2CYear&measures=Borrowers+In+Default%2CBorrowers+Entered+Repayment%2C${measureEncoded}`
  const dataNeighbour5: string = `${tesseract}tesseract/data.jsonrecords?OPEID=${similarOpeidId_List[4]}&cube=ed_defaults&drilldowns=OPEID%2CYear&measures=Borrowers+In+Default%2CBorrowers+Entered+Repayment%2C${measureEncoded}`

  if(opeid){
  return {
    data: [dataId, dataNeighbour1, dataNeighbour2, dataNeighbour3, dataNeighbour4, dataNeighbour5],
    dataFormat: (resp: any) => {
      const data1 = resp[0].data;
      const data2 = resp[1].data;
      const data3 = resp[2].data;
      const data4 = resp[3].data;
      const data5 = resp[4].data;
      const data6 = resp[5].data;
      let data_ = data2.concat([...data3, ...data4, ...data5, ...data6]).filter((d: any) => d["Default Rate"] >= 0);
      return data_.concat([...data1]);
    },
    discrete: "y",
    groupBy: ["OPEID"],
    shapeConfig: {
      Bar: {
        labelConfig: {
          textAnchor: "start"
        }
      },
      fill: (d: any) => d["OPEID ID"] === opeid ? colorHighlight : colorGrey
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Default Rate", (d: any) => `${abbreviate(d[measure] * 100)}%`],
        ["Number of Borrowers", (d: any) => d["Borrowers Entered Repayment"]],
        ["Number of Defaults", (d: any) => d["Borrowers In Default"]]
      ]
    },
    barPadding: 0,
    type: "BarChart",
    legend: false,
    x: measure,
    xConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: ""
    },
    y: "OPEID",
    yConfig: {
      labelRotation: false,
      title: "",
      ticks: []
    },
    ySort: (a: any, b: any) => a[measure] - b[measure]
  }}

  else{
    return {}
  
  }
};

export default viz;
