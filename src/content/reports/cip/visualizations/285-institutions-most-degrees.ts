// Converted from legacy canon_cms_section_visualization #285 "section institutions_most_degrees" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorHighlight, id, tesseract, hierarchy} = variables;
  const {abbreviate, salary} = formatters;

  const dataByCIP: string = `${tesseract}tesseract/data.jsonrecords?${hierarchy}=${id}&cube=ipeds_completions&drilldowns=University,Year&locale=en&measures=Completions`
  const dataTotal: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=University,Year&locale=en&measures=Completions`

  return {
    data: [dataByCIP, dataTotal],
    dataFormat: (resp: any) => {
        const dataByCIP = resp[0].data.filter((d: any) => d["Completions"] >= 5);
        const dataTotal = resp[1].data.filter((d: any) => d["Completions"] >= 5);
  
        const completionShares = dataByCIP.map((cip: any) => {
            const total = dataTotal.find((total: any) => 
                total["University ID"] === cip["University ID"] && 
                total["Year"] === cip["Year"]
            );
            if (total) {
                const share = cip.Completions / total.Completions;
                return {
                    "University ID": cip["University ID"],
                    "University": cip["University"],
                    "Completions Share Of University": share,
                    "Total Completions": total.Completions,
                    "Completions": cip.Completions,
                    "Year": cip.Year
                };
            }
            return null; 
        }).filter((result: any) => result !== null);
  
        // Group by Year
        const groupedByYear = completionShares.reduce((acc: any, curr: any) => {
            if (!acc[curr.Year]) {
                acc[curr.Year] = [];
            }
            acc[curr.Year].push(curr);
            return acc;
        }, {});
  
        // Sort each group and keep only top 5 entries
        const topEntries = Object.values(groupedByYear).flatMap((yearGroup: any) => {
            return yearGroup.sort((a: any, b: any) => {
                if (a["Completions Share Of University"] !== b["Completions Share Of University"]) {
                    return b["Completions Share Of University"] - a["Completions Share Of University"];
                } else {
                    return b["Completions"] - a["Completions"];
                }
            }).slice(0, 5);
        });
  
        return topEntries;
    },
    discrete: "x",
    groupBy: ["University"],
    shapeConfig: {
      Bar: {
        labelConfig: {
          text: "",
          textAnchor: "start"
        }
      },
      fill: (d: any) => colorHighlight
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Degrees Awarded", (d: any) => abbreviate(d["Completions"])],
        ["Percentage of Degrees Awarded", (d: any) => `${abbreviate(d["Completions Share Of University"] * 100)}%`]
      ]
    },
    barPadding: 10,
    type: "BarChart",
    legend: false,
    y: "Completions Share Of University",
    yConfig: {
      tickFormat: (d: any) => `${Number(abbreviate(d)) * 100}%`
    },
    x: "University",
    xConfig: {
      labelRotation: false,
      title: "University"
    },
    xSort: (a: any, b: any) => {
        if (a["Completions Share Of University"] !== b["Completions Share Of University"]) {
          return b["Completions Share Of University"] - a["Completions Share Of University"]; // Sort by businessCompletionPercentage (descending)
        } else {
          return b["Completions"] - a["Completions"];
        }
      }
  }
};

export default viz;
