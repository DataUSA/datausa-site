// Converted from legacy canon_cms_section_visualization #339 "section district_tuition" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {colorSector, id, tesseract, hierarchy} = variables;
  const {abbreviate, salary} = formatters;

  const carnegieId = swap("[[carnegieUniversities]]").replace("carnegie_", "")
  const carnegie = carnegieId*1 === 0 ? "" : `;Carnegie Parent:${carnegieId}`

  const colorSpent: Record<string, any> = {
    1: "#93c47d",
    2: "#76a5af",
    3: "#c27ba0"
  }

  const dataTuition_: string = `/api/data?Geography=${id}&measures=State Tuition&drilldowns=Sector${carnegie}`
  const dataFee_: string = `/api/data?Geography=${id}&measures=State Fee&drilldowns=Sector${carnegie}`
  const dataBooks_: string = `/api/data?Geography=${id}&measures=Books And Supplies&drilldowns=Sector${carnegie}`

  const dataTuition: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Sector,Year&include=${hierarchy}:${id}${carnegie}&locale=en&measures=State+Tuition`
  const dataFee: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Sector,Year&include=${hierarchy}:${id}${carnegie}&locale=en&measures=State+Fee`
  const dataBooks: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Sector,Year&include=${hierarchy}:${id}${carnegie}&locale=en&measures=Books+And+Supplies`

  return {
    data: [dataTuition, dataFee, dataBooks],
    dataFormat: (resp: any) => {
      let dataTuition = resp[0].data.map((d: any) => Object.assign({}, d));
      let dataFee = resp[1].data.map((d: any) => Object.assign({}, d));
      let dataBooks = resp[2].data.map((d: any) => Object.assign({}, d));
    
      const updateData = (data: any, spent: any, spentID: any, value: any) => {
        data.forEach((d: any) => {
          d["Spent"] = spent;
          d["Spent ID"] = spentID
          d["Value"] = d[value];
          delete d[value]
        });
        return data;
      };
    
      dataTuition = updateData(dataTuition, "State Tuition", 1, "State Tuition");
      dataFee = updateData(dataFee, "State Fee", 2, "State Fee");
      dataBooks = updateData(dataBooks, "Books And Supplies", 3, "Books And Supplies");
    
      const dataFinal = dataTuition.concat([...dataFee, ...dataBooks]);
      const totalsMap: Record<string, any> = {};

      dataFinal.forEach((item: any) => {
        const key: string = `${item.Sector}-${item.Year}`;
        if (!totalsMap[key]) {
          totalsMap[key] = 0;
        }
        totalsMap[key] += item.Value;
      });
    
      const updatedData = dataFinal.map((item: any) => {
        const key: string = `${item.Sector}-${item.Year}`;
        return { ...item, Total: totalsMap[key] };
      });

      return updatedData.filter((d: any) => d["Value"]);
    },
    discrete: "y",
    groupBy: "Spent",
    label: (d: any) => "",
    legend: false,
    /*legendSort: (a: any, b: any) => a["Spent ID"] - b["Spent ID"],
    legendConfig: {
      label: (d: any) => d["Spent"],
      shapeConfig: {
        fill: (d: any) => colorSpent[d["Spent ID"]], 
      },
    },*/
    shapeConfig: {
      Bar: {
        labelConfig: {
          textAnchor: "start"
        }
      },
      fill: (d: any) => colorSpent[d["Spent ID"]]
    },
    stacked: true,
    stackOrder: ["State Tuition", "State Fee", "Books And Supplies"],
    time: "Year",
    tooltipConfig: {
      title: (d: any) => d["Spent"],
      tbody: [
        ["Year", (d: any) => d["Year"]],
        ["Spent", (d: any) => salary(d["Value"])]
      ]
    },
    type: "BarChart",
    x: "Value",
    xConfig: {
      tickFormat: (d: any) => `${salary(d)}`,
    },
    y: "Sector",
    yConfig: {
      title: "Sector"
    },
    ySort: (a: any, b: any) => a["Total"] - b["Total"],
  }
};

export default viz;
