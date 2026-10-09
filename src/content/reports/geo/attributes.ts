/**
 * Geography "custom attributes": the per-member values that the legacy `api/customAttributes.js`
 * computed before running generators (ids for PUMS and election queries, breadcrumbs, colour maps,
 * API hosts). Ported by hand; every key name is preserved because generator URLs and bodies read them.
 */
import {colorMapping} from "@/content/shared/color-mapping";
import {civicOfficials} from "@/content/reports/geo/civic";
import {intersects, neighbors} from "@/lib/api/geoservice";
import {getMember} from "@/lib/dimensions/db";
import {geoParents} from "@/lib/dimensions/parents";
import type {AttributeContext, MemberAttributes, Variables} from "@/lib/reports/types";

export {colorMapping};

export async function attributes(member: MemberAttributes, ctx: AttributeContext): Promise<Variables> {
  const {id, hierarchy} = member;
  const full = getMember(member.dimension, member.id, member.cubeName);
  const breadcrumbs = full ? await geoParents(full) : [];

  const retObj: Variables = {
    ...colorMapping,
    breadcrumbs,
    freightYear: 2024,
    neverShow: false,
    geoservice: ctx.geoservice,
    tesseract: ctx.tesseract,
    url: undefined
  };

  const parentsElection = await civicOfficials("senator", id);
  retObj.parentsElection = parentsElection;

  const state = breadcrumbs.find(d => d.hierarchy === "State");
  const stateElection = parentsElection
    .map(d => String(d["ID State"]))
    .reduce<string[]>((acc, item) => (acc.includes(item) ? acc : [...acc, item]), []);

  if (!stateElection.length && (id === "05000US11001" || id.startsWith("79500US11001"))) {
    stateElection.push("04000US11");
  }

  retObj.stateId = state && ["Congressional District"].includes(hierarchy) ? state.id : id;
  retObj.stateDataID = state && !["Nation", "State"].includes(hierarchy) ? state.id : id;
  retObj.hierarchyElectionSub = ["Nation", "County"].includes(hierarchy) ? hierarchy : "State";
  retObj.stateElectionId = ["Nation", "State", "County"].includes(hierarchy) ? id : stateElection.join(",");
  retObj.hierarchyElectionSubTemp = ["Nation"].includes(hierarchy) ? hierarchy : "State";
  retObj.stateElectionIdTemp = ["Nation", "State"].includes(hierarchy) ? id : stateElection.join(",");
  retObj.electionCut = hierarchy === "Nation" ? "State" : hierarchy === "County" ? `County&State+County=${retObj.stateDataID}` : `County&State+County=${retObj.stateElectionId}`;
  retObj.hierarchySub = hierarchy === "Nation" ? "State" : "County";
  retObj.CBPSection = hierarchy === "County" || (hierarchy === "State" && id !== "04000US72") || hierarchy === "MSA";
  retObj.includeIncome = hierarchy === "Nation" ? "&exclude=State:0" : hierarchy === "State" ? `&include=State+County:${id}` : hierarchy === "County" ? `&include=County+Tract:${id}` : hierarchy === "Place" ? `&include=Place+Place-Tract:${id}` : "";
  retObj.incomeDrilldown = hierarchy === "Nation" ? "State" : hierarchy === "State" ? "County" : hierarchy === "County" ? "Tract" : hierarchy === "Place" ? "Place-Tract" : "";
  retObj.specialTessCut = hierarchy === "Nation" ? "&exclude=State:0" : hierarchy === "State" ? `&include=State+County:${id}` : hierarchy === "County" ? `&include=County+Tract:${id}` : hierarchy === "Place" ? `&include=State+Place:${state ? state.id : id}` : hierarchy === "MSA" ? `&include=State+County:${state ? state.id : id}` : hierarchy === "PUMA" ? `&include=State+PUMA:${state ? state.id : id}` : "";
  retObj.specialTessDrilldown = hierarchy === "Nation" ? "State" : hierarchy === "State" ? "County" : hierarchy === "MSA" ? "County" : hierarchy === "PUMA" ? "PUMA" : hierarchy === "County" ? "Tract" : hierarchy === "Place" ? "Place" : "";

  if (hierarchy !== "Nation" && hierarchy !== "State" && hierarchy !== "PUMA") {
    const states = await intersects(id, "state");
    retObj.pumsID = states.map(d => d.geoid).join(",");
    retObj.pumsHierarchy = "State";
  }
  else {
    retObj.pumsID = id;
    retObj.pumsHierarchy = hierarchy;
  }

  if (hierarchy !== "Nation") {
    const stateNeighbors = await neighbors(state ? state.id : id);
    retObj.stateNeighbors = stateNeighbors.map(d => d.geoid).join(",");
  }
  else retObj.stateNeighbors = "";

  return retObj;
}
