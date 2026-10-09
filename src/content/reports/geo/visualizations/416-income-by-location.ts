// Converted from legacy canon_cms_section_visualization #416 "section income-by-location" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap, albersUsaPr}) => {
  const {colorRaceACS, tractIds, id, hierarchy, incomeGeoIDs, 
        childHierarchy, incomeRaceSelector, colorGeo, iconGeo, tesseract} = variables;
  const {abbreviate, salary} = formatters;

  const raceVar = swap("[[race-income-income_geo]]");
  const race = incomeRaceSelector.find((d: any) => d.option === raceVar).label;
  const raceId = raceVar.replace(/[A-z]/g, "");

  const measure: string = "Household Income by Race";

  const includeCut = hierarchy === "Nation" ? "" : `&include=${hierarchy}+${childHierarchy}:${id}`

  const url = hierarchy !== "Place" 
    ? `${tesseract}tesseract/data?cube=acs_ygr_median_household_income_race_5${includeCut}&drilldowns=Year,Race,${childHierarchy}&measures=Household+Income+by+Race,Household+Income+by+Race+Moe&Race=${raceId}&parents=true`
    : `${tesseract}tesseract/data?cube=acs_ygr_median_household_income_race_5&include=Place+Place-Tract:${id}&drilldowns=Year,Race,Place-Tract&measures=Household+Income+by+Race,Household+Income+by+Race+Moe&Race=${raceId}&parents=true`;
  
  const cartUrl = !["Tract", "Place"].includes(childHierarchy) 
    ? `${tesseract}tesseract/data?cube=acs_ygr_median_household_income_race_5${includeCut}&drilldowns=Year,Race,${childHierarchy}&measures=Household+Income+by+Race,Household+Income+by+Race+Moe&drilldowns=Race&parents=true`
    : url;
  
  const topojson: any = ["Tract", "Place"].includes(childHierarchy) ? `Tract_${id.slice(7, 9)}` : childHierarchy;

  return {
    cart: cartUrl,
    data: url,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["Race ID"]*1 === raceId*1);
      return data;
    },
    colorScale: "Household Income by Race",
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => `$${abbreviate(d)}`,
        title: `Median Household Income${race === "Total" ? "" : ` (${race})`}`
      },
      color: colorRaceACS[raceId],
      scale: "jenks"
    },
    tooltipConfig: {
      title: (d: any) =>
        { return `
          <div class='d3plus-tooltip-title-wrapper'>
            <div class="icon" style="background-color: ${colorGeo}"><img src="${iconGeo}" /></div>
            <div class="title"><span>${childHierarchy === "State" ? d.State : childHierarchy === "Place" ? d["Place-Tract"] : d[`${childHierarchy}`]}</span></div>
            <div class="subtitle"><span>${childHierarchy}</span></div>
          </div>`},
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Race", race === "Total" ? "All" : race],
        ["Median Household Income", (d: any) => salary(d[measure])],
        ["Margin of Error", (d: any) => `± ${salary(d[`${measure} Moe`])}`]
      ]
    },
    topojsonKey: "objects",
    groupBy: childHierarchy === "State" ? "State ID" : childHierarchy === "Place" ? "Place-Tract ID" : `${childHierarchy} ID`,
    label: (d: any) => childHierarchy === "Tract" ? `${d[hierarchy]} ${d[childHierarchy]}`.split(",")[0] : d[hierarchy],
    projection: childHierarchy === "State" && typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
    topojson: `/topojson/${topojson}.json`,
    topojsonFilter: (d: any) => hierarchy !== "Place" ? incomeGeoIDs.includes(d.id) : tractIds.includes(d.id),
    time: "Year",
    type: "Geomap"
  }
};

export default viz;
