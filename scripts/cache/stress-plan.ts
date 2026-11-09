// The warm UI's side of the Stress mode: the default URL mix, building the weighted URL list from the
// dimensions database, the stages, and reading a stress run's files back for the page. The load itself
// is scripts/cache/stress.ts. See docs/deployment.md, "Warm UI".
import {existsSync, readFileSync} from "node:fs";
import {join} from "node:path";
import type {DatabaseSync} from "node:sqlite";
import type {Stage, StressConfig} from "./stress";

/**
 * The warmed levels and their share of the list, like real traffic: mostly places and counties.
 * School districts aren't cached (and aren't listed). Shares are percentages; they're normalized.
 */
export const DEFAULT_SHARES: Record<string, number> = {
  "geo|Place": 40, "geo|County": 20, "geo|State": 8, "geo|MSA": 5, "geo|Congressional District": 2, "geo|PUMA": 2, "geo|Nation": 1,
  "university|University": 8, "university|Carnegie": 0.5,
  "soc|Detailed Occupation": 3, "soc|Broad Occupation": 0.5, "soc|Minor Occupation Group": 0.5, "soc|Major Occupation Group": 0.5,
  "naics|Industry Group": 2, "naics|Industry Sub-Sector": 0.75, "naics|Industry Sector": 0.75,
  "cip|CIP6": 1.5, "cip|CIP4": 1, "cip|CIP2": 0.5,
  "napcs|NAPCS Class": 1, "napcs|NAPCS Group": 0.5, "napcs|NAPCS Section": 0.5
};

export interface UrlMix {
  /** level key (`profile|hierarchy`) -> share of the list, and how many of its largest members to draw from (0: all) */
  levels: Record<string, {share: number; pool: number}>;
  /** URLs in the list (it's cycled through) */
  size: number;
  /** Zipf exponent over the zvalue rank: 0 draws every member alike, 1 favors the largest strongly */
  skew: number;
  seed: number;
}

export const DEFAULT_MIX: UrlMix = {
  levels: Object.fromEntries(Object.entries(DEFAULT_SHARES).map(([k, share]) => [k, {share, pool: 0}])),
  size: 20000, skew: 0.8, seed: 1
};

/** mulberry32, so a list can be built again */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The URL list: each level gets its share of `size`, drawn from its members by zvalue rank with
 * weight 1 / rank^skew, so the popular reports (states, big cities, large universities) repeat more
 * often. Shuffled, so the levels are mixed in time.
 */
export function buildUrls(db: DatabaseSync, mix: UrlMix): {urls: string[]; byLevel: Record<string, {urls: number; distinct: number; pool: number}>} {
  const random = rng(mix.seed);
  const entries = Object.entries(mix.levels).filter(([, v]) => v.share > 0);
  const totalShare = entries.reduce((n, [, v]) => n + v.share, 0);
  const urls: string[] = [];
  const byLevel: Record<string, {urls: number; distinct: number; pool: number}> = {};
  for (const [key, v] of entries) {
    const [profile, hierarchy] = key.split("|");
    const dim = (db.prepare("SELECT dimension FROM profiles WHERE slug = ? AND ordering = 0").get(profile) as {dimension: string} | undefined)?.dimension;
    if (!dim) continue;
    let slugs = (db.prepare("SELECT DISTINCT slug FROM members WHERE dimension = ? AND hierarchy = ? AND hidden = 0 ORDER BY zvalue DESC NULLS LAST, id")
      .all(dim, hierarchy) as {slug: string}[]).map(r => r.slug);
    if (v.pool > 0) slugs = slugs.slice(0, v.pool);
    if (!slugs.length) continue;
    const want = Math.max(1, Math.round(mix.size * v.share / totalShare));
    const cum: number[] = [];
    let sum = 0;
    for (let i = 0; i < slugs.length; i++) cum.push(sum += 1 / (i + 1) ** mix.skew);
    const seen = new Set<string>();
    for (let n = 0; n < want; n++) {
      const x = random() * sum;
      let lo = 0, hi = cum.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < x) lo = mid + 1;
        else hi = mid;
      }
      urls.push(`/profile/${profile}/${slugs[lo]}`);
      seen.add(slugs[lo]);
    }
    byLevel[key] = {urls: want, distinct: seen.size, pool: slugs.length};
  }
  for (let i = urls.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [urls[i], urls[j]] = [urls[j], urls[i]];
  }
  return {urls, byLevel};
}

/** Random place ids for the Tesseract probe. */
export function probePlaces(db: DatabaseSync, n = 200): string[] {
  return (db.prepare("SELECT id FROM members WHERE dimension = 'Geography' AND hierarchy = 'Place' AND hidden = 0 ORDER BY random() LIMIT ?").all(n) as {id: string}[]).map(r => String(r.id));
}

export interface StageInput {
  kind: "stages" | "spike";
  /** stages: rates in pages/s, comma-separated */
  rates?: string;
  seconds?: number;
  pauseS?: number;
  /** spike: base rate, before and after, and the peak */
  base?: number;
  peak?: number;
  beforeS?: number;
  peakS?: number;
  afterS?: number;
}

export function buildStages(s: StageInput): Stage[] {
  if (s.kind === "spike") {
    const base = Number(s.base ?? 5), peak = Number(s.peak ?? 20);
    return [
      {label: `base ${base}/s`, rate: base, seconds: Number(s.beforeS ?? 120)},
      {label: `spike ${peak}/s`, rate: peak, seconds: Number(s.peakS ?? 120)},
      {label: `back to ${base}/s`, rate: base, seconds: Number(s.afterS ?? 300)}
    ].filter(st => st.seconds > 0);
  }
  const rates = String(s.rates ?? "").split(/[^0-9.]+/).map(Number).filter(n => n > 0);
  const seconds = Number(s.seconds ?? 300), pause = Number(s.pauseS ?? 0);
  const out: Stage[] = [];
  rates.forEach((rate, i) => {
    out.push({label: `${rate}/s`, rate, seconds});
    if (pause > 0 && i < rates.length - 1) out.push({label: "pause", rate: 0, seconds: pause});
  });
  return out;
}

export const DEFAULT_STRESS: Omit<StressConfig, "stages" | "probe"> & {stageInput: StageInput; tesseract: string} = {
  target: "https://penn.datausa.io",
  cap: 300,
  timeoutMs: 60_000,
  hitMargin: 5,
  hitRule: "total",
  stop: {windowS: 30, minRequests: 20, errorPct: 2, missPct: 5, droppedPct: 2, probeMs: 5000, minMemMb: 2048},
  stageInput: {kind: "stages", rates: "2,5,10,20,40,80,120", seconds: 300, pauseS: 120, base: 5, peak: 40, beforeS: 120, peakS: 120, afterS: 300},
  tesseract: "https://api-penn.datausa.io/",
  monitorUrl: ""
};

const jsonLines = (text: string) => text.split("\n").filter(Boolean).flatMap(l => {
  try {
    return [JSON.parse(l) as Record<string, unknown>];
  }
  catch {
    return [];
  }
});

/** A stress run for the page: the progress series (thinned to about 600 points), events, summary. */
export function stressStatus(dir: string, tail: (path: string, bytes: number) => string) {
  const progress = jsonLines(tail(join(dir, "progress.jsonl"), 3_000_000));
  const step = Math.max(1, Math.ceil(progress.length / 600));
  const series = progress.filter((_, i) => i % step === 0 || i === progress.length - 1);
  return {
    config: existsSync(join(dir, "config.json")) ? JSON.parse(readFileSync(join(dir, "config.json"), "utf8")) as StressConfig : null,
    latest: progress[progress.length - 1] ?? null,
    series,
    events: existsSync(join(dir, "events.jsonl")) ? jsonLines(readFileSync(join(dir, "events.jsonl"), "utf8")).slice(-60) : [],
    summary: existsSync(join(dir, "summary.json")) ? JSON.parse(readFileSync(join(dir, "summary.json"), "utf8")) as Record<string, unknown> : null,
    probes: jsonLines(tail(join(dir, "probe.jsonl"), 200_000)).slice(-360)
  };
}
