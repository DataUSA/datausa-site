// Converted from legacy canon_cms_section_visualization #184 "section house" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables) => {
  const {colorGrey, colorParty, electionStateIDs, id, iconGeo, colorGeo} = variables;

  const fips = electionStateIDs.map((d: any) => +d.slice(7));
  const height = fips.includes(6) ? 500 : 300;
  
  return {
    data: `/api/civic/representative/${id}`,
    dataFormat: (data: any) => {
    
      data.forEach((d: any) => {
        if (d.Party === "Democratic-farmer-labor") {
          d.Party = "Democratic";
        }
      });
    
      return data;
    
    },
    depth: 1,
    groupBy: ["ID State", "District"],
    height,
    label: (d: any) => `District ${d.District}`,
    projection: "geoMercator",
    shapeConfig: {
      on: {
        click: (d: any) => {
          const {href} = window.location;
          if (href.includes("/profile/geo")) {
            const newURL = href.replace(/\/profile\/geo\/[^\/^?^#]+/g, `/profile/geo/${d["Slug District"]}`);
            if (newURL !== href) window.location.href = newURL;
          }
        }
      },
      Path: {
        fill: (d: any) => colorParty[d.Party] || colorGrey,
        fillOpacity: 1,
        strokeOpacity: 1
      }
    },
    tiles: false,
    tooltipConfig: {
      footer: "Click to view District Profile",
      title: (d: any) => {
        return `
          <div class='d3plus-tooltip-title-wrapper'>
            <div class="icon" style="background-color: ${colorGeo}"><img src="${iconGeo}" /></div>
            <div class="title"><span>District ${d.District}</span></div>
            <div class="subtitle"><span>Congressional Distric</span></div>
          </div>
        `
      },
      tbody: (d: any) => {
        const arr: any = [
          ["Representative", d.Member],
        ];
        if (d.Party) arr.push(["Party", d.Party]);
        if (d["Assumed office"]) arr.push(["Assumed Office", d["Assumed office"]]);
        return arr;
      }
    },
    topojson: `/topojson/Districts.json`,
    topojsonFilter: (d: any) => fips.includes(+d.id.slice(7, -2)),
    topojsonId: (d: any) => `${+d.id.slice(-2)}`,
    type: "Geomap",
    zoom: false
  };

};

export default viz;
