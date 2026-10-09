/**
 * Data sources for /about/datasets, derived from the Tesseract cube annotations (legacy
 * `cache/datasets.js`): cubes grouped by `source_name`, then by `dataset_name`.
 */
import {cacheLife, cacheTag} from "next/cache";
import {fetchData, TESSERACT_URL} from "@/lib/api/tesseract";

export interface DatasetSource {
  title: string;
  desc: string[];
  datasets: {title: string; link: string; tables: string[]}[];
}

interface CubeAnnotations {
  hide_in_ui?: string | boolean;
  source_name?: string;
  source_description?: string;
  dataset_name?: string;
  dataset_link?: string;
  table_id?: string;
}

export async function getDatasetSources(): Promise<DatasetSource[]> {
  "use cache";
  cacheLife("data");
  cacheTag("tesseract");
  const result = await fetchData<{cubes: {annotations?: CubeAnnotations}[]}>(`${TESSERACT_URL}tesseract/cubes`);
  const annotations = (result.data?.cubes ?? [])
    .map(c => c.annotations)
    .filter((a): a is CubeAnnotations => Boolean(a) && String(a?.hide_in_ui ?? "").toLowerCase() !== "true" && Boolean(a?.source_name));
  const bySource = new Map<string, CubeAnnotations[]>();
  for (const a of annotations) {
    const key = a.source_name as string;
    if (!bySource.has(key)) bySource.set(key, []);
    bySource.get(key)!.push(a);
  }
  return Array.from(bySource, ([title, values]) => {
    const byDataset = new Map<string, CubeAnnotations[]>();
    for (const v of values.filter(d => d.dataset_name)) {
      const key = v.dataset_name as string;
      if (!byDataset.has(key)) byDataset.set(key, []);
      byDataset.get(key)!.push(v);
    }
    return {
      title,
      desc: Array.from(new Set(values.map(d => d.source_description).filter((d): d is string => Boolean(d)))),
      datasets: Array.from(byDataset, ([name, group]) => ({
        title: name,
        link: group[0].dataset_link ?? "",
        tables: Array.from(new Set(group.flatMap(d => (d.table_id ?? "").split(",").filter(n => n.length))))
      }))
    };
  }).sort((a, b) => a.title.localeCompare(b.title));
}

/** Slug used to look up usage notes and caveats for a source (same rules as the legacy page). */
export function sourceSlug(title: string): string {
  return title
    .replace(/\.|&|\(|\)|\*|'/g, "")
    .replace(/\s/g, "-")
    .toLowerCase()
    .replace(/^the-/g, "")
    .replace(/^us-/g, "")
    .replace(/--/g, "-");
}
