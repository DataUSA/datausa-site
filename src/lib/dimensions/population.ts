/**
 * Latest total population per geography, used (like the legacy boot-time `pops` cache) to decide
 * which parents and similar places are worth linking (population above 250,000 when the member
 * itself is that large). Values come from Tesseract at request time and are cached; nothing is
 * stored in the repository.
 */
import {fetchData, tesseractDataUrl} from "@/lib/api/tesseract";
import {geoLevel} from "@/lib/api/geoservice";

export const BIG_POPULATION = 250000;

/** Latest population for each geoid, grouped per summary level into one cached Tesseract query each. */
export async function getPopulations(ids: string[]): Promise<Record<string, number>> {
  const byLevel = new Map<string, string[]>();
  for (const id of Array.from(new Set(ids))) {
    const level = geoLevel(id);
    if (!level) continue;
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level)!.push(id);
  }
  const out: Record<string, number> = {};
  await Promise.all(Array.from(byLevel.entries()).map(async ([level, levelIds]) => {
    const url = tesseractDataUrl({
      cube: "acs_yg_total_population_5",
      drilldowns: level,
      measures: "Population",
      include: `${level}:${levelIds.join(",")}`,
      time: "Year.latest"
    });
    const result = await fetchData(url);
    for (const row of result.data?.data ?? []) {
      const id = String(row[`${level} ID`]);
      const pop = Number(row.Population);
      if (id && !Number.isNaN(pop)) out[id] = pop;
    }
  }));
  return out;
}
