/**
 * Data for the home page state map (legacy `GET /api/home-geomap`): latest population per state
 * from Tesseract, joined with the state slugs from the dimensions database.
 */
import {cacheLife, cacheTag} from "next/cache";
import {listMembers} from "@/lib/dimensions/db";
import {fetchData, TESSERACT_URL} from "@/lib/api/tesseract";

export interface HomeGeomapRow {"State ID": string; State: string; Year: number; Population: number; slug: string}

export async function getHomeGeomapData(): Promise<HomeGeomapRow[]> {
  "use cache";
  cacheLife("data");
  cacheTag("tesseract", "dimensions");
  const url = `${TESSERACT_URL}tesseract/data.jsonrecords?cube=acs_yg_total_population_5&drilldowns=State,Year&locale=en&measures=Population&time=Year.latest`;
  const result = await fetchData<{data: Record<string, string | number>[]}>(url);
  const rows = result.data?.data ?? [];
  const slugs = new Map(listMembers("Geography", "State", 100, true).map(m => [m.id, m.slug]));
  return rows.map(row => ({
    "State ID": String(row["State ID"]),
    State: String(row.State),
    Year: Number(row.Year),
    Population: Number(row.Population),
    slug: slugs.get(String(row["State ID"])) ?? String(row["State ID"])
  }));
}
