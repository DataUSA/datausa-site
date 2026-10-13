// Converted from legacy canon_cms_section_visualization #1 "section about" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";
import {schoolDistrictMapPrefixes} from "@/lib/geo/school-districts";

const viz: VizDefinition = (variables, {albersUsaPr}) => {
  const {
    colorBackground,
    colorHighlight, 
    hierarchy,
    id,
    // [longitude, latitude] of a member too small to see at the map's scale (set for school districts)
    mapMarker,
    name,
    neighborIds,
    stateIds
  } = variables;

  const geoIds: any = [id].concat(neighborIds).concat(stateIds);
  const state = id.slice(7, 9);

  const hidden: any = ["XXUSA", "04000US69", "04000US66", "04000US60", "04000US78", "05000US60050", "05000US60010", "05000US60020", "05000US66010", "05000US69100", "05000US69110", "05000US69120", "05000US69085", "79500US6600100"];

  const non48: any = ["02", "15", "72"];

  // A school district is drawn among the districts of its state that do not overlap it (elementary
  // and secondary districts cover the same ground): `SchoolDistrict_<state>.json` holds all three kinds.
  const districtPrefixes = hierarchy === "School District" ? schoolDistrictMapPrefixes(id) : [];

  const geoFilter = hierarchy === "MSA" ? (d: any) => geoIds.includes(d.id)
    : hierarchy === "School District" ? (d: any) => districtPrefixes.some(prefix => d.id.startsWith(prefix))
    : hierarchy === "County" || hierarchy === "PUMA" ? (d: any) => d.id.slice(7, 9) === state && !hidden.includes(d.id)
    : hierarchy === "Congressional District" ? (d: any) => +d.id.slice(7, -2) === +state
    : (d: any) => !hidden.includes(d.id);

  const fill = hierarchy === "Nation" ? (d: any) => colorHighlight 
    : ["State", "County", "PUMA", "School District"].includes(hierarchy) ? (d: any) => d.id === id ? colorHighlight : "white"
    : (d: any) => d.id === id ? colorHighlight : d.id.includes("04000US") ? "transparent" : "white";
  
  const topojson = hierarchy === "Nation" 
    ? "State" 
    : hierarchy === "Place" 
      ? `Place_${state}` 
      : hierarchy === "School District"
        ? `SchoolDistrict_${state}`
      : hierarchy === "Congressional District" 
        ? "Districts" 
        // the file is Msa.json; "MSA.json" only resolves on a case-insensitive file system
        : hierarchy === "MSA" ? "Msa" : hierarchy;

  // The topojson files carry ids only; the names for the tooltip come from the dimensions database
  // and are joined to the shapes by id. Shapes left without a name have no tooltip: the state
  // outlines behind places and metro areas are context, not something to hover.
  const names = hierarchy === "MSA" ? `ids=${[id].concat(neighborIds).filter(Boolean).join(",")}`
    : hierarchy === "County" ? `prefix=05000US${state}`
    : hierarchy === "PUMA" ? `prefix=79500US${state}`
    : hierarchy === "Congressional District" ? `prefix=50000US${state}`
    : hierarchy === "Place" ? `prefix=16000US${state}`
    : hierarchy === "School District" ? `prefix=${districtPrefixes.join(",")}`
    : "prefix=04000US";

  return {
    data: `/api/geo/names?${names}`,
    dataFormat: (resp: any) => resp.data.map((d: any) => ({id: d.id, "ID Geography": d.id, Geography: d.name}))
      // a ring around the member, drawn as a point on top of the shapes
      .concat(mapMarker ? [{id: `${id}-marker`, "ID Geography": `${id}-marker`, Geography: name, lonlat: mapMarker}] : []),
    groupBy: "ID Geography",
    label: (d: any) => d.Geography,
    legend: false,
    ocean: colorBackground,
    projection: ["Nation", "State"].includes(hierarchy) || non48.includes(state)
      ? typeof window !== "undefined" ? albersUsaPr() : "geoAlbersUsa" 
        : "geoMercator",
    ...(mapMarker ? {point: (d: any) => d.lonlat, pointSize: () => 1, pointSizeMin: 9, pointSizeMax: 9} : {}),
    shapeConfig: {
      Circle: {
        fill: "transparent",
        stroke: colorHighlight,
        strokeWidth: 2
      },
      Path: {
        fill,
        fillOpacity: (d: any) => hierarchy === "Nation" ? 1 : d.id === id ? 1 : 0.5,
        stroke: "white",
        // the theme default (0.25) left the borders between same-coloured neighbours barely visible
        strokeOpacity: 0.7,
        strokeWidth: 1
      }
    },
    topojson: `/topojson/${topojson}.json`,
    topojsonFilter: geoFilter,
    tiles: false,
    // name only: no table under the title
    tooltipConfig: {tableStyle: {display: "none"}},
    type: "Geomap",
    zoom: false
  };
};

export default viz;
