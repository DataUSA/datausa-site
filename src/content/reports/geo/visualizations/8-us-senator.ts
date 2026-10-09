// Converted from legacy canon_cms_section_visualization #8 "section us_senator" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorParty, colorGrey, id, senatorYears, tesseract} = variables;
  const {abbreviate, stripHTML} = formatters;
  const {max, min, nest, sum} = libs.d3;
  const {strip, titleCase} = libs.d3plus;

  const currentSenators: any = [];
  const states: any = [];
  for (let i = 1; i < 7; i++) {
    if (variables[`senator${i}Name`]) {
      currentSenators.push({
        "Candidate": variables[`senator${i}Name`],
        "Party ID": variables[`senator${i}Party`],
        "Party": variables[`senator${i}Party`],
        "Start Year": variables[`senator${i}Elected`],
        "End Year": variables[`senator${i}NextYear`],
        "Class": parseFloat(stripHTML(variables[`senator${i}Class`])),
        "State": variables[`senator${i}State`],
        "State ID": variables[`senator${i}StateID`]
      });
      if (i % 2) states.push(variables[`senator${i}StateID`]);
    }
  }

  const houseTotal = currentSenators.length;
  const minBarHeight = 20;
  const axisPadding = 125;
  let height = minBarHeight * houseTotal + axisPadding;
  let padding = 0;
  const maxHeight = 500;
  const barCutoff = Math.floor((maxHeight - axisPadding) / minBarHeight);
  if (houseTotal <= barCutoff) {
  
    const barSize = min([120, Math.floor((maxHeight - axisPadding) / houseTotal)]);
    height = barSize * houseTotal + axisPadding;
  
    const mod = ((houseTotal - 1) / (barCutoff - 1)) || 1;
    const maxPadding = 0.2;
    padding = maxPadding + (padding - maxPadding) * mod;
  
  }

  const legendLabel = (d: any) => {
    if (d.Party instanceof Array) {
      const parties = d.Party.map((d: any) => d.toLowerCase());
      const label = parties.some((d: any) => d.includes("green") && !d.includes("rainbow")) ? "Multiple Green"
        : parties.some((d: any) => d.includes("libertarian")) ? "Multiple Libertarian"
        : parties.some((d: any) => d.includes("independen") && !d.includes("democrat/republican") && !d.includes("veteran") && !d.includes("constitution")) ? "Multiple Independent" 
        : "Multiple";
      return `${label} Parties`;
    }
    return titleCase(d.Party.replace(/-/g, " "));
  }

  const nameStrip = (d: any) => {
    const split = strip(d.toLowerCase())
      .replace("-jr", "")
      .replace("-sr", "")
      .replace("-iii", "")
      .split("-")
      .pop();
    return split;
  };

  const nameClean = (d: any) => {
    return d
      .replace(/\./g, "")
      .replace("Sen ", "")
      .replace("Iii", "III")
      .replace("Ii", "II")
      .replace("Iv", "IV")
      .replace(/[\s]{2,}/g, " ");
  };

  const years = senatorYears.concat([senatorYears[senatorYears.length - 2] + 6, senatorYears[senatorYears.length - 1] + 6]);
  const thisYear = new Date().getFullYear();

  return {
    aggs: {
      "Party": (arr: any, acc: any) => acc(arr[0])
    },
    axisConfig: {
      gridConfig: {
        "stroke-width": 1
      },
      labels: years,
      tickFormat: (d: any) => `'${`${new Date(d).getFullYear()}`.slice(2, 4)}`,
      ticks: years,
      tickSize: 5,
      title: "Election Years (6-year terms)"
    },
    data: `${tesseract}tesseract/data?Special=0&cube=Data_USA_Senate_election&drilldowns=State,Year,Party,Candidate,Special&measures=Candidate+Votes,Total+Votes&State=${states.join(",")}`,
    dataFormat: (resp: any) => {

      const tops = nest()
        .key((d: any) => `${d.Year}_${d["State ID"]}`)
        .entries(resp.data)
        .map((group: any) => {
            const [year, stateID] = group.key.split("_"); 
          
            const candidateGroups = nest()
                .key((d: any) => `${d["Candidate ID"]}_${d["Candidate"]}`)
                .entries(group.values);
              
            const aggregatedCandidates = candidateGroups.map((candidateGroup: any) => {
                  const [candidateID, candidateName] = candidateGroup.key.split("_");
                  const votesByParty: Record<string, any> = {};

                  const totalVotes = candidateGroup.values.reduce((sum: any, d: any) => {
                      votesByParty[d["Party"]] = (votesByParty[d["Party"]] || 0) + d["Candidate Votes"];
                      return sum + d["Candidate Votes"];
                  }, 0);
                
                  const dominantParty = Object.entries(votesByParty).sort((a: any, b: any) => b[1] - a[1])[0][0];
                  const originalData = candidateGroup.values[0];
                  return {
                      ...originalData,
                      "Candidate ID": candidateID,
                      "Candidate": candidateName,
                      "Candidate Votes": totalVotes,
                      "Party": dominantParty,
                  };
            });
          
            return aggregatedCandidates.sort((a: any, b: any) => b["Candidate Votes"] - a["Candidate Votes"])[0];
          });

      const candidates = nest()
        .key((d: any) => `${d["State ID"]}_${d["Candidate ID"]}`)
        .entries(tops)
        .reduce((arr: any, group: any) => {
        
          const terms = group.values
            .sort((a: any, b: any) => a["Year"] - b["Year"])
            .reduce((arr: any, d: any) => {
              d.Candidate = nameClean(d.Candidate);
              if (d.Party === "Democratic-farmer-labor") {
                d.Party = "Democratic";
              }
              d["Party ID"] = d.Party;
              d["Start Year"] = d["Year"];
              d["End Year"] = d["Year"] + 6;
              d["Class"] = (d["End Year"] - 2018) % 6 === 0 ? 1 : (d["End Year"] - 2014) % 6 === 0 ? 2 : 3;
              if (!arr.length || arr[arr.length - 1]["End Year"] !== d["Start Year"]) {
                arr.push(d);
              }
              else {
                ["End Year", "Party ID", "Party", "Candidate"].forEach((col: any) => {
                  arr[arr.length - 1][col] = d[col];
                });
              }
              return arr;
            }, []);
          
          arr = arr.concat(terms);
          return arr;
        }, [])
        .sort((a: any, b: any) => b["End Year"] - a["End Year"]);

      (currentSenators || []).forEach((c: any) => {
      
        const lastName = nameStrip(c.Candidate);
        const included = candidates.find((d: any) => {
          return nameStrip(d.Candidate) === lastName;
        });

        if (!included) {
          const previous = candidates.find((d: any) => d.Class === c.Class && d["State ID"] === c["State ID"]);
          if (previous) {
            previous["End Year"] = c["Start Year"];
          }
          candidates.push(c);
        }
      });

      return candidates;
    },
    end: "End Year",
    groupBy: [(d: any) => `${d.Class}_${d.Geography}`, (d: any) => `${d["Candidate"]}_${d["Start Year"]}`],
    height,
    label: (d: any) => d.Candidate,
    legendConfig: {
      label: legendLabel
    },
    legendTooltip: {
      tbody: [],
      title: legendLabel
    },
    paddingInner: padding,
    paddingOuter: padding,
    shapeConfig: {
      fill: (d: any) => colorParty[d.Party] || colorGrey,
      Rect: {
        labelBounds: (d: any, i: any, s: any) => {
          const h = s.height;
          const w = s.width;
          const hPadding = h >= 16 ? 3 : 1;
          const wPadding = 5;
          return {width: w - wPadding * 2, height: h - hPadding * 2, x: -w / 2 + wPadding, y: -h / 2 + hPadding};
        },
        labelConfig: {
          fontMax: 24,
          verticalAlign: "middle"
        }
      }
    },
    start: "Start Year",
    tooltipConfig: {
      title: (d: any) => {
        return `
          <div class='d3plus-tooltip-title-wrapper'>
            <div class="title-without-icon"><span>${d["Candidate"]}</span></div>
            <div class="subtitle"><span>Candidate</span></div>
          </div>
        `
      },
      tbody: [
        ["State", (d: any) => d.Geography],
        ["Party", (d: any) => titleCase(d.Party.replace(/-/g, " "))],
        ["Senator Class", (d: any) => d.Class],
        ["Assumed Office", (d: any) => d["Start Year"]],
        [(d: any) => d["End Year"] < thisYear ? "Left Office" : "Next Election", (d: any) => d["End Year"]]
      ]
    },
    type: "Priestley"
  }
};

export default viz;
