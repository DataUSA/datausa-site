// Converted from legacy canon_cms_section_visualization #412 "section car-ownership" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorGrey, colorHighlight, id, hierarchy, tesseract} = variables;
  const {nest, max, sum} = libs.d3;
  const {abbreviate} = formatters;

  const measure: string = "Commute Means by Gender";

  const dataNation: string = `${tesseract}tesseract/data?cube=acs_ygsv_gender_of_workers_by_vehicles_available_5&measures=Commute+Means+by+Gender,Commute+Means+by+Gender+Moe&include=Nation:01000US&drilldowns=Nation,Year,Vehicles+Available`
  const dataGeos: string = `${tesseract}tesseract/data?cube=acs_ygsv_gender_of_workers_by_vehicles_available_5&measures=Commute+Means+by+Gender,Commute+Means+by+Gender+Moe&include=${hierarchy}:${id}&drilldowns=${hierarchy},Year,Vehicles+Available`

  if(hierarchy !== "Nation"){
    return {
      data: [dataNation, dataGeos],
      dataFormat: (resp: any) => {
        const dataNation = resp[0].data;
        const dataGeo = resp[1].data;
      
        const maxYear = libs.d3.max(dataGeo, (d: any) => d.Year)

        const formattedNation = dataNation.map((d: any) => {
          const h: Record<string, any> = { ...d };
          h[hierarchy] = d["Nation"];
          h[`${hierarchy} ID`] = d["Nation ID"];
          delete h["Nation"];
          delete h["Nation ID"];
          return h;
        });
      
        const mergedData: any = [...formattedNation, ...dataGeo];

        const currYear = max(mergedData, (d: any) => d["Year"]);
        const data = mergedData.filter((d: any) => d["Year"] === maxYear);
      
        nest().key((d: any) => `${d.Year}_${d[hierarchy]}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d[measure]);
            group.values.forEach((d: any) => d.share = d[measure] / total);
          });
        return data.filter((d: any) => d["Year"] <= maxYear);
      },
      groupBy: hierarchy,
      groupPadding: 20,
      shapeConfig: {
        fill: (d: any) => d[`${hierarchy} ID`] === id ? colorHighlight : colorGrey,
        label: false
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Households", (d: any) => abbreviate(d[measure])],
          ["Margin of Error", (d: any) => `± ${abbreviate(d[`${measure} Moe`])}`],
          ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
        ]
      },
      type: "BarChart",
      x: (d: any) => `${d["Vehicles Available ID"]}`,
      xConfig: {
        tickFormat: (d: any) => d === "5" ? "5+" : d
      },
      xSort: (a: any, b: any) => a["Vehicles Available ID"] - b["Vehicles Available ID"],
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      }
    }
  }
  else{
    return {
      data: dataNation,
      dataFormat: (resp: any) => {
        const dataNation = resp.data;

        const currYear = max(dataNation, (d: any) => d["Year"]);
        const data = dataNation.filter((d: any) => d["Year"] === currYear);
      
        nest().key((d: any) => `${d.Year}_${d[hierarchy]}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d[measure]);
            group.values.forEach((d: any) => d.share = d[measure] / total);
          });
        return data;
      },
      groupBy: hierarchy,
      groupPadding: 20,
      shapeConfig: {
        fill: (d: any) => d[`${hierarchy} ID`] === id ? colorHighlight : colorGrey,
        label: false
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Households", (d: any) => abbreviate(d[measure])],
          ["Margin of Error", (d: any) => `± ${abbreviate(d[`${measure} Moe`])}`],
          ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
        ]
      },
      type: "BarChart",
      x: (d: any) => `${d["Vehicles Available ID"]}`,
      xConfig: {
        tickFormat: (d: any) => d === "5" ? "5+" : d
      },
      xSort: (a: any, b: any) => a["Vehicles Available ID"] - b["Vehicles Available ID"],
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      }
    }
  }
};

export default viz;
