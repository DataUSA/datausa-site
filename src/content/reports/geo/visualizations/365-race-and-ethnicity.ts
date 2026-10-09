// Converted from legacy canon_cms_section_visualization #365 "section race_and_ethnicity" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorRaceACS, iconRace, id, hierarchy, tesseract} = variables;
  const {abbreviate} = formatters;
  const {sum, nest} = libs.d3;

  const oldPop: string = "Hispanic Population";
  const newPop: string = "Population";

  const cleanRace = (d: any) => String(Array.isArray(d) ? d[0] : d)
    .replace(" Alone", "")
    .replace("Some Other Race", "Other")
    .replace("Two or More Races", "Multiracial");

  return {
    aggs: {
      "Race ID": (arr: any, acc: any) => acc(arr[0]),
      "Ethnicity ID": (arr: any, acc: any) => acc(arr[0])
    },
    data: `${tesseract}tesseract/data?cube=acs_ygr_race_with_hispanic_5&include=${hierarchy}:${id}&drilldowns=Race,Ethnicity,Year&measures=Hispanic+Population,Hispanic+Population+Moe`,
    dataFormat: (resp: any) => {
      const data = resp.data;
    
      nest()
        .key((d: any) => d.Year)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[oldPop]);
          group.values
            .forEach((d: any) => {
              d[newPop] = d[oldPop];
              delete d[oldPop];
              d.share = d[newPop] / total;
            });
        });
      
        data.forEach((d: any) => {
          d["Race"] = cleanRace(d.Race)
        })

      return data;
    },
    depth: 1,
    groupBy: ["Ethnicity", "Race"],
    label: (d: any) => `${cleanRace(d.Race)}${d.Ethnicity instanceof Array ? "" : ` (${d.Ethnicity.includes("Not") ? "Non-" : ""}Hispanic)`}`,
    layoutPadding: (d: any) => d.depth ? 1 : 5,
    legendConfig: {
      label: (d: any) => {
        while (d.__d3plus__) d = d.data;
        return cleanRace(d.Race);
      },
      shapeConfig: {
        backgroundImage: iconRace
      }
    },
    shapeConfig: {
      fill: (d: any) => colorRaceACS[d["Race ID"] + 1],
      fillOpacity: (d: any) => d.Ethnicity.includes("Not") ? 1 : 0.75
    },
    time: "Year",
    tooltipConfig: {
      title: (d: any) => {
        return  `
          <div class='d3plus-tooltip-title-wrapper'>
            <div class="icon" style="background-color: ${colorRaceACS[d["Race ID"] + 1]}"><img src="${iconRace}" /></div>
           <div class="title"><span>${`${cleanRace(d.Race)}${d.Ethnicity instanceof Array ? "" : ` (${d.Ethnicity.includes("Not") ? "Non-" : ""}Hispanic)`}`}</span></div>
            <div class="subtitle"><span>Ethnicity</span></div>
          </div>
        `
      },
      tbody: [
        ["Population", (d: any) => abbreviate(d[newPop])],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    legendTooltip: {
      title: (d: any) => {
        return  `
          <div class='d3plus-tooltip-title-wrapper'>
            <div class="icon" style="background-color: ${colorRaceACS[d["Race ID"] + 1]}"><img src="${iconRace}" /></div>
            <div class="title"><span>${cleanRace(d.Race)}</span></div>
            <div class="subtitle"><span>Ethnicity</span></div>
          </div>
        `
      }
    },
    type: "Treemap",
    sum: (d: any) => d.share,
  }
};

export default viz;
