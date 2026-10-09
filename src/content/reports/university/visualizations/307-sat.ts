// Converted from legacy canon_cms_section_visualization #307 "section sat" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, id, name, tesseract, hierarchy, idCarnegie, idCarnegieParent} = variables;
  const {abbreviate, commas} = formatters;
  const sections: any = ["Critical Reading", "Math", "Writing"];
  const percentiles: any = [25, 50, 75];

  let config
  let dataUniversity
  let dataCarnegie
  let dataCarnegieParent

  if (hierarchy === "Carnegie Parent") {
  
    dataCarnegieParent = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&include=Carnegie+Parent:${id}&drilldowns=Year,Carnegie+Parent&locale=en&measures=SAT+Math+25th+Percentile%2CSAT+Math+50th+Percentile%2CSAT+Math+75th+Percentile%2CSAT+Writing+25th+Percentile%2CSAT+Writing+75th+Percentile%2CSAT+Critical+Reading+25th+Percentile%2CSAT+Critical+Reading+50th+Percentile%2CSAT+Critical+Reading+75th+Percentile&parents=true`
  
    config = {
      data: dataCarnegieParent,
      dataFormat: (resp: any) => {
        const data = resp.data.reduce((all: any, d: any) => {
          sections.forEach((section: any) => {
            percentiles.forEach((pct: any) => {
              const score = d[`SAT ${section} ${pct}th Percentile`];
              if (score) {
                all.push(Object.assign({}, d, {
                  Section: section, 
                  Score: score, 
                  Percentile: `${pct}th Percentile`
                }));
              }
            });
          });
          return all;
        }, []);
        return data;
      },
      discrete: "x",
      depth: 2,
      groupBy: ["Section", "Percentile", "Carnegie Parent"],
      shapeConfig: {
        fill: (d: any) => d[`Carnegie Parent ID`] === id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Section", (d: any) => d.Section],
          ["Percentile", (d: any) => d.Percentile],
          ["Average Score", (d: any) => abbreviate(d.Score)]
        ]
      },
      type: "Plot",
      legendConfig: {
        label: (d: any) => d[`Carnegie Parent ID`] === id ? name : "Carnegie Parent"
      },
      x: "Section",
      yConfig: {
        domain: [200, 800],
        title: "Average Score"
      },
      y: "Score",
      xConfig: {
        title: false
      },
    }
  }

  else if (hierarchy === "Carnegie") {
  
    dataCarnegieParent = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&include=Carnegie+Parent:${idCarnegieParent}&drilldowns=Year,Carnegie+Parent&locale=en&measures=SAT+Math+25th+Percentile%2CSAT+Math+50th+Percentile%2CSAT+Math+75th+Percentile%2CSAT+Writing+25th+Percentile%2CSAT+Writing+75th+Percentile%2CSAT+Critical+Reading+25th+Percentile%2CSAT+Critical+Reading+50th+Percentile%2CSAT+Critical+Reading+75th+Percentile`
    dataCarnegie = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&include=Carnegie:${id}&drilldowns=Year,Carnegie&locale=en&measures=SAT+Math+25th+Percentile%2CSAT+Math+50th+Percentile%2CSAT+Math+75th+Percentile%2CSAT+Writing+25th+Percentile%2CSAT+Writing+75th+Percentile%2CSAT+Critical+Reading+25th+Percentile%2CSAT+Critical+Reading+50th+Percentile%2CSAT+Critical+Reading+75th+Percentile`
  
    config = {
      data: [dataCarnegieParent, dataCarnegie],
      dataFormat: (resp: any) => {
        const dataCP = resp[0].data;
        const dataC = resp[1].data;
      
        const dataTemp = dataC.filter((d: any) => d["Carnegie ID"]*1 === id*1);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year);

        dataCP.forEach((d: any) => {
          d["Carnegie"] = d["Carnegie Parent"]
          d["Carnegie ID"] = d["Carnegie Parent ID"]
          delete d["Carnegie Parent"]
          delete d["Carnegie Parent ID"]
        })
      
        dataC.forEach((d: any) => {
          d["Carnegie ID"] = `${d["Carnegie ID"]}`
        })

        let data = dataC.concat(dataCP)

        const dataFinal = data.reduce((all: any, d: any) => {
          sections.forEach((section: any) => {
            percentiles.forEach((pct: any) => {
              const score = d[`SAT ${section} ${pct}th Percentile`];
              if (score) {
                all.push(Object.assign({}, d, {
                  Section: section, 
                  Score: score, 
                  Percentile: `${pct}th Percentile`
                }));
              }
            });
          });
          return all;
        }, []);
        return dataFinal.filter((d: any) => d["Year"]*1 <= maxYear*1);
      },
      discrete: "x",
      depth: 2,
      groupBy: ["Section", "Percentile", "Carnegie"],
      shapeConfig: {
        fill: (d: any) => d[`Carnegie ID`] === id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Section", (d: any) => d.Section],
          ["Percentile", (d: any) => d.Percentile],
          ["Average Score", (d: any) => abbreviate(d.Score)]
        ]
      },
      type: "Plot",
      legendConfig: {
        label: (d: any) => d[`Carnegie ID`] === id ? name : "Carnegie Parent"
      },
      x: "Section",
      yConfig: {
        domain: [200, 800],
        title: "Average Score"
      },
      y: "Score",
      xConfig: {
        title: false
      },
    }
  }

  else {
  
    dataCarnegieParent = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&include=Carnegie+Parent:${idCarnegieParent}&drilldowns=Year,Carnegie+Parent&locale=en&measures=SAT+Math+25th+Percentile%2CSAT+Math+50th+Percentile%2CSAT+Math+75th+Percentile%2CSAT+Writing+25th+Percentile%2CSAT+Writing+75th+Percentile%2CSAT+Critical+Reading+25th+Percentile%2CSAT+Critical+Reading+50th+Percentile%2CSAT+Critical+Reading+75th+Percentile`
    dataCarnegie = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&include=Carnegie:${idCarnegie}&drilldowns=Year,Carnegie&locale=en&measures=SAT+Math+25th+Percentile%2CSAT+Math+50th+Percentile%2CSAT+Math+75th+Percentile%2CSAT+Writing+25th+Percentile%2CSAT+Writing+75th+Percentile%2CSAT+Critical+Reading+25th+Percentile%2CSAT+Critical+Reading+50th+Percentile%2CSAT+Critical+Reading+75th+Percentile`
    dataUniversity = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&include=University:${id}&drilldowns=Year,University&locale=en&measures=SAT+Math+25th+Percentile%2CSAT+Math+50th+Percentile%2CSAT+Math+75th+Percentile%2CSAT+Writing+25th+Percentile%2CSAT+Writing+75th+Percentile%2CSAT+Critical+Reading+25th+Percentile%2CSAT+Critical+Reading+50th+Percentile%2CSAT+Critical+Reading+75th+Percentile`
  
    config = {
      agg: {
        "University ID": (arr: any) => arr[0]
      },
      data: [dataCarnegieParent, dataCarnegie, dataUniversity],
      dataFormat: (resp: any) => {
      
        const dataCP = resp[0].data;
        const dataC = resp[1].data;
        const dataU = resp[2].data.filter((d: any) => d["SAT Critical Reading 25th Percentile"] || d["SAT Critical Reading 50th Percentile"] || d["SAT Critical Reading 75th Percentile"] || d["SAT Math 25th Percentile"] || d["SAT Math 50th Percentile"] || d["SAT Math 75th Percentile"] || d["SAT Writing 25th Percentile"] || d["SAT Writing 50th Percentile"] || d["SAT Writing 75th Percentile"]);

        const dataTemp = dataU.filter((d: any) => d["University ID"]*1 === id*1);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year);

        dataU.forEach((d: any) => {
          d["University ID"] = `${d["University ID"]}`
        })
      
        dataCP.forEach((d: any) => {
          d["University"] = d["Carnegie Parent"]
          d["University ID"] = d["Carnegie Parent ID"]
          delete d["Carnegie Parent"]
          delete d["Carnegie Parent ID"]
        })
      
        dataC.forEach((d: any) => {
          d["University"] = d["Carnegie"]
          d["University ID"] = d["Carnegie ID"]
          delete d["Carnegie"]
          delete d["Carnegie ID"]
        })
      
        const data = dataU.concat(dataCP, dataC)
      
        const dataFinal = data.reduce((all: any, d: any) => {
          sections.forEach((section: any) => {
            percentiles.forEach((pct: any) => {
              const score = d[`SAT ${section} ${pct}th Percentile`];
              if (score) {
                all.push(Object.assign({}, d, {
                  Section: section, 
                  Score: score, 
                  Percentile: `${pct}th Percentile`
                }));
              }
            });
          });
          return all;
        }, []);

        return dataFinal.filter((d: any) => d["Year"]*1 <= maxYear*1);
      },
      discrete: "x",
      depth: 2,
      groupBy: ["Section", "Percentile", "University"],
      shapeConfig: {
        fill: (d: any) => d[`University ID`] == id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Section", (d: any) => d.Section],
          ["Percentile", (d: any) => d.Percentile],
          ["Average Score", (d: any) => abbreviate(d.Score)]
        ]
      },
      type: "Plot",
      legendConfig: {
        label: (d: any) => `${d["University ID"]}` === id ? name : "Carnegie Parent"
      },
      x: "Section",
      yConfig: {
        domain: [200, 800],
        title: "Average Score"
      },
      y: "Score",
      xConfig: {
        title: false
      },
    }
  }

  return config;
};

export default viz;
