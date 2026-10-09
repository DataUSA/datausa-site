// Converted from legacy canon_cms_section_visualization #136 "section about" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables) => {
  const {
    colorBackground,
    colorHighlight, 
    idCounty,
    neighborIds,
    stateIds
  } = variables;

  const id = idCounty ? idCounty : '999999';
  const hierarchy: string = "County";
  //const geoIds: any = [id].concat(neighborIds).concat(stateIds);
  const geoIds: any = [id];
  const state = id.slice(7, 9);

  const hidden: any = ["XXUSA", "04000US69", "04000US66", "04000US60", "04000US78", "05000US60050", "05000US60010", "05000US60020", "05000US66010", "05000US69100", "05000US69110", "05000US69120", "05000US69085", "79500US6600100"];

  const geoFilter = hierarchy === "MSA" ? (d: any) => geoIds.includes(d.id)
    : hierarchy === "County" || hierarchy === "PUMA" ? (d: any) => d.id.slice(7, 9) === state && !hidden.includes(d.id)
    : (d: any) => !hidden.includes(d.id);

  const fill = hierarchy === "Nation" ? (d: any) => colorHighlight 
    : ["State", "County", "PUMA"].includes(hierarchy) ? (d: any) => d.id === id ? colorHighlight : "white"
    : (d: any) => d.id === id ? colorHighlight : d.id.includes("04000US") ? "transparent" : "white";
  
  const topojson = hierarchy === "Nation" ? "State" : hierarchy === "Place" ? `Place_${state}` : hierarchy;

  return {
    groupBy: (d: any) => d.Geography, 
    ocean: colorBackground,
    projection: ["Nation", "State"].includes(hierarchy) || state === "02" ? "geoAlbersUsa" : "geoMercator",
    shapeConfig: {
      Path: {
        fill,
        fillOpacity: (d: any) => hierarchy === "Nation" ? 1 : d.id === id ? 1 : 0.5,
        stroke: "white",
        strokeWidth: 1
      }
    },
    topojson: `/topojson/${topojson}.json`,
    topojsonFilter: geoFilter,
    tiles: false,
    type: "Geomap",
    zoom: false
  };
};

export default viz;
