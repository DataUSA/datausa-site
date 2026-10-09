/**
 * Current US senators and representatives for a geography. Ported from the legacy
 * `GET /api/civic/:type/:geo` route (`api/election.js`): rosters are static content
 * (`shared/data/senators.json`, `representatives.json`), the state is found through the geoservice,
 * and congressional-district slugs come from the dimensions database.
 */
import senators from "@/content/shared/data/senators.json";
import representatives from "@/content/shared/data/representatives.json";
import {intersects} from "@/lib/api/geoservice";
import {getMembers, listMembers} from "@/lib/dimensions/db";

export type CivicType = "senator" | "representative";

export type CivicRow = Record<string, unknown> & {State: string; District?: string; "ID State"?: string; "Slug District"?: string};

const rosters: Record<CivicType, CivicRow[]> = {
  senator: senators as CivicRow[],
  representative: representatives as CivicRow[]
};

export async function civicOfficials(type: CivicType, geo: string): Promise<CivicRow[]> {
  let districts: string[] = [];
  let states: string[] = [];
  let rows: CivicRow[] = (rosters[type] ?? []).map(r => ({...r}));

  if (geo !== "01000US") {
    if (!geo.startsWith("040")) {
      const targetLevels = type === "senator" ? "state" : "state,congressionaldistrict";
      const parents = (await intersects(geo, targetLevels, true))
        .filter(d => (d.overlap_size ?? 0) > 0.00001)
        .sort((a, b) => (b.overlap_size ?? 0) - (a.overlap_size ?? 0));
      let stateRelations = parents.filter(d => d.level === "state");
      if (stateRelations.length > 1 && !geo.startsWith("310")) stateRelations = stateRelations.slice(0, 1);
      states = stateRelations.map(d => d.geoid);
      if (geo.startsWith("500")) districts = [`${+geo.slice(-2)}`];
    }
    else states = [geo];

    if (states.length) {
      const attrs = getMembers("Geography", states, "State");
      const names = attrs.map(d => d.name);
      rows = rows.filter(d => names.includes(d.State));
      rows.forEach(r => { r["ID State"] = attrs.find(d => d.name === r.State)?.id; });
      rows.sort((a, b) => states.indexOf(String(a["ID State"])) - states.indexOf(String(b["ID State"])));
    }

    if (districts.length && rows.length && rows[0].District) {
      rows = rows.filter(d => districts.includes(String(d.District)));
    }

    if (type === "representative") {
      const districtRows = listMembers("Geography", "Congressional District", 1000, true);
      const lookup: Record<string, Record<string, {slug: string}>> = {};
      districtRows.forEach(d => {
        const state = d.id.slice(0, -2).replace("500", "040");
        (lookup[state] ??= {})[`${+d.id.slice(-2)}`] = d;
      });
      rows.forEach(r => {
        const state = String(r["ID State"]);
        r["Slug District"] = lookup[state] && r.District !== undefined && lookup[state][String(r.District)] ? lookup[state][String(r.District)].slug : "";
      });
    }
  }

  return rows;
}
