// Converted from legacy canon_cms_section_visualization #300 "section other_expenses" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, id, tesseract, hierarchy, similarID, carnegieSimilarIDs} = variables;
  const {abbreviate, commas, salary} = formatters;

  if (hierarchy === "University") {

    const similarIDArray = similarID.split(",");
    const similarIDs = similarIDArray.slice(0, 5);
  
    const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_ic_living_expenses&drilldowns=Year,${hierarchy}&include=${hierarchy}:${id},${similarIDs}&locale=en&measures=Median+Room+And+Board%2CMedian+Other+Student+Expenses`
    const dataTuition: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,${hierarchy}&include=${hierarchy}:${id},${similarIDs}&locale=en&measures=Books+And+Supplies`

    return {
      data: [data, dataTuition],
      dataFormat: (resp: any) => {
      
        const resp0 = resp[0].data;
        const resp1 = resp[1].data;
      
        const resp0Temp = resp0.filter((d: any) => d[`${hierarchy} ID`]*1 === id*1)
        const resp1Temp = resp1.filter((d: any) => d[`${hierarchy} ID`]*1 === id*1)

        const maxYear0 = libs.d3.max(resp0Temp, (d: any) => d.Year)
        const maxYear1 = libs.d3.max(resp1Temp, (d: any) => d.Year)
      
        const maxYear = Math.max(maxYear0, maxYear1);

        function mergeData(data1: any, data2: any) {
          return data1.map((item1: any) => {
            const match = data2.find((item2: any) => 
              item2["University ID"] === item1["University ID"] && item2["Year"] === item1["Year"]
            );
            return { ...item1, ...match };
          });
        }
      
        const mergedData = mergeData(resp0, resp1);
      
        const data = mergedData.reduce((all: any, d: any) => {
          all.push(Object.assign({}, d, {title: "Books And Supplies", value: d["Books And Supplies"]}));
          all.push(Object.assign({}, d, {title: "Room And Board", value: d["Median Room And Board"]}));
          all.push(Object.assign({}, d, {title: "Other Expenses", value: d["Median Other Student Expenses"]}));
          return all;
        }, []);
      
        return data.filter((d: any) => d.Year <= maxYear);
      },
      discrete: "x",
      groupBy: ["University"],
      shapeConfig: {
        Bar: {
          label: ""
        },
        fill: (d: any) => d["University ID"] == id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Cost", (d: any) => `$${commas(d["value"])}`]
        ]
      },
      barPadding: 0,
      groupPadding: 40,
      type: "BarChart",
      legend: false,
      y: "value",
      yConfig: {
        tickFormat: (d: any) => `$${commas(d)}`,
        title: "Cost"
      },
      x: "title",
      xConfig: {
        labelRotation: false
      },
      xSort: (a: any, b: any) => a["value"] - b["value"]
    }
  }

  else if (hierarchy === "Carnegie Parent") {
  
    const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_ic_living_expenses&drilldowns=Year,Carnegie+Parent&locale=en&measures=Median+Room+And+Board%2CMedian+Other+Student+Expenses`
    const dataTuition: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,Carnegie+Parent&locale=en&measures=Books+And+Supplies`

    return {
      data: [data, dataTuition],
      dataFormat: (resp: any) => {
      
        const resp0 = resp[0].data;
        const resp1 = resp[1].data;
      
        function mergeData(data1: any, data2: any) {
          return data1.map((item1: any) => {
            const match = data2.find((item2: any) => 
              item2["Carnegie Parent ID"] === item1["Carnegie Parent ID"] && item2["Year"] === item1["Year"]
            );
            return { ...item1, ...match };
          });
        }
      
        const mergedData = mergeData(resp0, resp1);
      
        const data = mergedData.reduce((all: any, d: any) => {
          all.push(Object.assign({}, d, {title: "Books And Supplies", value: d["Books And Supplies"]}));
          all.push(Object.assign({}, d, {title: "Room And Board", value: d["Median Room And Board"]}));
          all.push(Object.assign({}, d, {title: "Other Expenses", value: d["Median Other Student Expenses"]}));
          return all;
        }, []);
        return data;
      },
      discrete: "x",
      groupBy: ["Carnegie Parent"],
      shapeConfig: {
        Bar: {
          label: ""
        },
        fill: (d: any) => d["Carnegie Parent ID"] == id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Cost", (d: any) => `$${commas(d["value"])}`]
        ]
      },
      barPadding: 0,
      groupPadding: 40,
      type: "BarChart",
      legend: false,
      y: "value",
      yConfig: {
        tickFormat: (d: any) => `$${commas(d)}`,
        title: "Cost"
      },
      x: "title",
      xConfig: {
        labelRotation: false
      },
      xSort: (a: any, b: any) => a["value"] - b["value"]
    }
  }

  else {
  
    const similarIDs = carnegieSimilarIDs[id]["ids"]
  
    const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_ic_living_expenses&drilldowns=Year,${hierarchy}&include=${hierarchy}:${id},${similarIDs}&locale=en&measures=Median+Room+And+Board%2CMedian+Other+Student+Expenses`
    const dataTuition: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,${hierarchy}&include=${hierarchy}:${id},${similarIDs}&locale=en&measures=Books+And+Supplies`

    return {
      data: [data, dataTuition],
      dataFormat: (resp: any) => {
      
        const resp0 = resp[0].data;
        const resp1 = resp[1].data;
      
        function mergeData(data1: any, data2: any) {
          return data1.map((item1: any) => {
            const match = data2.find((item2: any) => 
              item2["Carnegie ID"] === item1["Carnegie ID"] && item2["Year"] === item1["Year"]
            );
            return { ...item1, ...match };
          });
        }
      
        const mergedData = mergeData(resp0, resp1);
      
        const data = mergedData.reduce((all: any, d: any) => {
          all.push(Object.assign({}, d, {title: "Books And Supplies", value: d["Books And Supplies"]}));
          all.push(Object.assign({}, d, {title: "Room And Board", value: d["Median Room And Board"]}));
          all.push(Object.assign({}, d, {title: "Other Expenses", value: d["Median Other Student Expenses"]}));
          return all;
        }, []);
        return data;
      },
      discrete: "x",
      groupBy: ["Carnegie"],
      shapeConfig: {
        Bar: {
          label: ""
        },
        fill: (d: any) => d["Carnegie ID"] == id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Cost", (d: any) => `$${commas(d["value"])}`]
        ]
      },
      barPadding: 0,
      groupPadding: 40,
      type: "BarChart",
      legend: false,
      y: "value",
      yConfig: {
        tickFormat: (d: any) => `$${commas(d)}`,
        title: "Cost"
      },
      x: "title",
      xConfig: {
        labelRotation: false
      },
      xSort: (a: any, b: any) => a["value"] - b["value"]
    }
  }
};

export default viz;
