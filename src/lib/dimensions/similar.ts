/**
 * "Keep Exploring" / similar members. Ported from the legacy `GET /api/:slug/similar/:id` route
 * (geography branch) and `GET /api/neighbors?dimension=Geography`.
 */
import {intersects, neighbors as geoNeighborsApi} from "@/lib/api/geoservice";
import {fetchData, tesseractDataUrl} from "@/lib/api/tesseract";
import {getMembers, type MemberRow} from "@/lib/dimensions/db";
import {BIG_POPULATION, getPopulations} from "@/lib/dimensions/population";

/** Neighbouring geographies as dimension members (legacy `/api/neighbors?dimension=Geography`). */
export async function geoNeighbors(id: string): Promise<MemberRow[]> {
  const ids = (await geoNeighborsApi(id)).map(d => d.geoid);
  // The legacy query returned rows in primary-key order, which the generated text relies on.
  return getMembers("Geography", ids).sort((a, b) => a.id.localeCompare(b.id));
}

/** Similar geographies for the Keep Exploring tiles (legacy `/api/geo/similar/:id`). */
export async function similarGeographies(member: MemberRow, limit = 6): Promise<MemberRow[]> {
  const {id} = member;
  let attrs: MemberRow[] = [];

  if (id === "01000US") {
    const url = tesseractDataUrl({
      cube: "acs_ygr_median_household_income_race_5",
      drilldowns: "State",
      measures: "Household Income by Race",
      time: "Year.latest",
      sort: "Household Income by Race.desc"
    });
    const result = await fetchData(url);
    const arr = result.data?.data ?? [];
    const l = Math.ceil(limit / 2);
    const states = arr.slice(0, l).concat(arr.slice(-l));
    attrs = getMembers("Geography", states.map(d => String(d["State ID"])));
  }
  else {
    const prefix = id.slice(0, 3);
    const targetLevels = prefix === "040" ? "msa"
      : prefix === "050" ? "state,msa"
        : prefix === "310" ? "state"
          : prefix === "160" ? "state,msa,county"
            : prefix === "795" ? "state,msa,county"
              : prefix === "500" ? "state,msa,county"
                : undefined;
    let ids = (await intersects(id, targetLevels)).map(d => d.geoid);
    ids.push("01000US");
    const pops = await getPopulations([id, ...ids]);
    if ((pops[id] ?? 0) > BIG_POPULATION) ids = ids.filter(d => (pops[d] ?? 0) > BIG_POPULATION);
    attrs = getMembers("Geography", ids);
    const neighborMembers = prefix === "160" ? [] : await geoNeighbors(id);
    attrs = attrs.concat(neighborMembers).filter((d, i, arr) => arr.findIndex(a => a.id === d.id) === i);
  }

  return attrs
    .filter(d => !d.hidden)
    .sort((a, b) => (b.zvalue ?? 0) - (a.zvalue ?? 0))
    .slice(0, limit);
}
