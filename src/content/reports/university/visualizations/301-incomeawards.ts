// Converted from legacy canon_cms_section_visualization #301 "section incomeawards" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, id, similarID, carnegieSimilarIDs, tesseract, hierarchy, idCarnegie, idCarnegieParent} = variables;
  const {abbreviate, commas, salary} = formatters;

  const normalizeData = (data: any, nameField: any, idField: any) => {
    data.forEach((d: any) => {
      d["University"] = d[nameField];
      d["University ID"] = d[idField];

      delete d[nameField];
      delete d[idField];
    });

    return data;
  };

  if (hierarchy == "University") {
  
    const similarIDArray = similarID.split(",");
    const similarIDs = similarIDArray.slice(0, 5);
  
    const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_aid&drilldowns=Income+Range,Year,University&include=University:${id},${similarIDs}&locale=en&measures=Median+Grant+Or+Scholarship+Award`
    const dataCarnegie: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_aid&drilldowns=Income+Range,Year,Carnegie&include=Carnegie:${idCarnegie}&locale=en&measures=Median+Grant+Or+Scholarship+Award`
    const dataCarnegieParent: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_aid&drilldowns=Income+Range,Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Median+Grant+Or+Scholarship+Award`

    const dataLiving: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_ic_living_expenses&drilldowns=Year,University&include=University:${id},${similarIDs}&locale=en&measures=Median+Room+And+Board,Median+Other+Student+Expenses`
    const dataCarnegieLiving: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_ic_living_expenses&drilldowns=Year,Carnegie&include=Carnegie:${idCarnegie}&locale=en&measures=Median+Room+And+Board,Median+Other+Student+Expenses`
    const dataCarnegieParentLiving: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_ic_living_expenses&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Median+Room+And+Board,Median+Other+Student+Expenses`

    const dataTuition: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,University&include=University:${id},${similarIDs}&locale=en&measures=Out+Of+State+Tuition,Books+And+Supplies`
    const dataCarnegieTuition: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,Carnegie&include=Carnegie:${idCarnegie}&locale=en&measures=Out+Of+State+Tuition,Books+And+Supplies`
    const dataCarnegieParentTuition: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Out+Of+State+Tuition,Books+And+Supplies`

    return {
      data: [data, dataCarnegie, dataCarnegieParent, dataLiving, dataCarnegieLiving, dataCarnegieParentLiving, dataTuition, dataCarnegieTuition, dataCarnegieParentTuition],
      dataFormat: (resp: any) => {
        const data = resp[0].data.filter((d: any) => d["Median Grant Or Scholarship Award"] !== null);
        const dataCarnegie = resp[1].data;
        const dataCarnegieParent = resp[2].data;
      
        const dataLiving = resp[3].data; 
        const dataCarnegieLiving = resp[4].data; 
        const dataCarnegieParentLiving = resp[5].data; 
      
        const dataTuition = resp[6].data; 
        const dataCarnegieTuition = resp[7].data; 
        const dataCarnegieParentTuition = resp[8].data; 
      
        const tempData = data.filter((d: any) => d["University ID"]*1 === id*1)
        const maxYear = libs.d3.max(tempData, (d: any) => d.Year)
        const minYear = libs.d3.min(tempData, (d: any) => d.Year)
      
        normalizeData(dataCarnegie, "Carnegie", "Carnegie ID");
        normalizeData(dataCarnegieParent, "Carnegie Parent", "Carnegie Parent ID");
        normalizeData(dataCarnegieLiving, "Carnegie", "Carnegie ID");
        normalizeData(dataCarnegieParentLiving, "Carnegie Parent", "Carnegie Parent ID");
        normalizeData(dataCarnegieTuition, "Carnegie", "Carnegie ID");
        normalizeData(dataCarnegieParentTuition, "Carnegie Parent", "Carnegie Parent ID");

        const dataConcat_ = data.concat(dataCarnegie, dataCarnegieParent);
        const dataConcat = dataConcat_.filter((d: any) => d["Year"]*1 >= minYear*1 && d["Year"]*1 <= maxYear*1);
      
        const livingCost = dataLiving.concat(dataCarnegieLiving, dataCarnegieParentLiving);
        const tuitionCost = dataTuition.concat(dataCarnegieTuition, dataCarnegieParentTuition);
  
        //Add measures
        const livingCostLookup: Record<string, any> = {};
        livingCost.forEach((d: any) => {
          livingCostLookup[`${d["Year"]}_${d["University ID"]}`] = d;
        });
      
        const tuitionCostLookup: Record<string, any> = {};
        tuitionCost.forEach((d: any) => {
          tuitionCostLookup[`${d["Year"]}_${d["University ID"]}`] = d;
        });
      
        const dataFinal = dataConcat.map((d: any) => {
          const key: string = `${d["Year"]}_${d["University ID"]}`;
      
          const living = livingCostLookup[key] || {};
          const tuition = tuitionCostLookup[key] || {};
      
          return {
            ...d,
            ...living,
            ...tuition
          };
        });
      
        dataFinal.forEach((d: any) => {
          d["Cost"] = d["Books And Supplies"] + d["Median Other Student Expenses"] + d["Median Room And Board"] + d["Out Of State Tuition"];
          d["Discount"] = d["Median Grant Or Scholarship Award"] / d["Cost"];
        })

        return dataFinal.filter((d: any) => d["Discount"] > 0);
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
          ["Average Financial Aid", (d: any) => `$${commas(d["Median Grant Or Scholarship Award"])}`],
          ["Cost", (d: any) => `$${commas(d["Cost"])}`],
          ["Discount", (d: any) => `${abbreviate(d["Discount"] * 100)}%`]
        ]
      },
      barPadding: 0,
      groupPadding: 40,
      type: "BarChart",
      legend: false,
      y: "Discount",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Discount"
      },
      x: "Income Range",
      xConfig: {
        labelRotation: false,
        title: "Income Range"
      },
      xSort: (a: any, b: any) => a["Income Range ID"] - b["Income Range ID"]
    }
  }

  else {

    const similarIDs = carnegieSimilarIDs[id]["ids"]
    const dataCarnegie: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_aid&drilldowns=Income+Range,Year,Carnegie&include=Carnegie:${id},${similarIDs}&locale=en&measures=Median+Grant+Or+Scholarship+Award`
    const dataCarnegieParent: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_aid&drilldowns=Income+Range,Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Median+Grant+Or+Scholarship+Award`
  
    const dataCarnegieLiving: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_ic_living_expenses&drilldowns=Year,Carnegie&include=Carnegie:${id},${similarIDs}&locale=en&measures=Median+Room+And+Board,Median+Other+Student+Expenses`
    const dataCarnegieParentLiving: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_ic_living_expenses&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Median+Room+And+Board,Median+Other+Student+Expenses`

    const dataCarnegieTuition: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,Carnegie&include=Carnegie:${id},${similarIDs}&locale=en&measures=Out+Of+State+Tuition,Books+And+Supplies`
    const dataCarnegieParentTuition: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Out+Of+State+Tuition,Books+And+Supplies`

    return {
      data: [dataCarnegie, dataCarnegieParent, dataCarnegieLiving, dataCarnegieParentLiving, dataCarnegieTuition, dataCarnegieParentTuition],
      dataFormat: (resp: any) => {
        const dataCarnegie = resp[0].data;
        const dataCarnegieParent = resp[1].data.filter((d: any) => d["Carnegie Parent ID"] !== "NAD");
      
        const dataCarnegieLiving = resp[2].data;
        const dataCarnegieParentLiving = resp[3].data.filter((d: any) => d["Carnegie Parent ID"] !== "NAD");
      
        const dataCarnegieTuition = resp[4].data;
        const dataCarnegieParentTuition = resp[5].data.filter((d: any) => d["Carnegie Parent ID"] !== "NAD");
      
        const tempData = dataCarnegie.filter((d: any) => d["Carnegie ID"]*1 === id*1)

        const maxYear = libs.d3.max(tempData, (d: any) => d.Year)
        const minYear = libs.d3.min(tempData, (d: any) => d.Year)

        normalizeData(dataCarnegie, "Carnegie", "Carnegie ID");
        normalizeData(dataCarnegieParent, "Carnegie Parent", "Carnegie Parent ID");
        normalizeData(dataCarnegieLiving, "Carnegie", "Carnegie ID");
        normalizeData(dataCarnegieParentLiving, "Carnegie Parent", "Carnegie Parent ID");
        normalizeData(dataCarnegieTuition, "Carnegie", "Carnegie ID");
        normalizeData(dataCarnegieParentTuition, "Carnegie Parent", "Carnegie Parent ID");

        const dataConcat_ = dataCarnegie.concat(dataCarnegieParent);

        const dataConcat = dataConcat_.filter((d: any) => d["Year"]*1 >= minYear*1 && d["Year"]*1 <= maxYear*1);
      
        const livingCost = dataCarnegieLiving.concat(dataCarnegieParentLiving);
        const tuitionCost = dataCarnegieTuition.concat(dataCarnegieParentTuition);
  
        //Add measures
        const livingCostLookup: Record<string, any> = {};
        livingCost.forEach((d: any) => {
          livingCostLookup[`${d["Year"]}_${d["University ID"]}`] = d;
        });
      
        const tuitionCostLookup: Record<string, any> = {};
        tuitionCost.forEach((d: any) => {
          tuitionCostLookup[`${d["Year"]}_${d["University ID"]}`] = d;
        });
      
        const dataFinal = dataConcat.map((d: any) => {
          const key: string = `${d["Year"]}_${d["University ID"]}`;
      
          const living = livingCostLookup[key] || {};
          const tuition = tuitionCostLookup[key] || {};
      
          return {
            ...d,
            ...living,
            ...tuition
          };
        });
      
        dataFinal.forEach((d: any) => {
          d["Cost"] = d["Books And Supplies"] + d["Median Other Student Expenses"] + d["Median Room And Board"] + d["Out Of State Tuition"];
          d["Discount"] = d["Median Grant Or Scholarship Award"] / d["Cost"];
        })

        return dataFinal.filter((d: any) => d["Discount"] > 0);
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
          ["Average Financial Aid", (d: any) => `$${commas(d["Median Grant Or Scholarship Award"])}`],
          ["Cost", (d: any) => `$${commas(d["Cost"])}`],
          ["Discount", (d: any) => `${abbreviate(d["Discount"] * 100)}%`]
        ]
      },
      barPadding: 0,
      groupPadding: 40,
      type: "BarChart",
      legend: false,
      y: "Discount",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Discount"
      },
      x: "Income Range",
      xConfig: {
        labelRotation: false,
        title: "Income Range"
      },
      xSort: (a: any, b: any) => a["Income Range ID"] - b["Income Range ID"]
    }
  }

  
};

export default viz;
