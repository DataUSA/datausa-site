/**
 * URL shapes of the batched warmer: which planned Tesseract URLs differ only by the member id, how
 * to ask for many members in one query, and how to cut that answer back into the response each
 * member would have received alone. Pure: no Next.js, Redis or network.
 *
 * A shape is the URL with the member id replaced by `{M}`, where the id is the whole value of
 * - an include entry: `include=Place:{M}`, also compound (`include=Health Provider:1;State County:{M}`);
 * - a plain cut parameter: `Origin State={M}`, `University={M}`;
 * - the `filter` of an RCA query (`complexity/rca_historical?…&filter=University:{M}`): the RCA is
 *   computed over every location and the filter only keeps some rows, so a list keeps several.
 * The id must appear once in the URL, there and nowhere else.
 *
 * The batched query puts the ids in a list, adds the level to `drilldowns` when it is missing (at
 * the end or at the start: the strategy) and, for `limit` shapes, drops the limit. The split groups
 * rows by the level's id column, removes the columns the single query does not have (the added level
 * and, with `parents=true`, its parents), and rebuilds the top level (`annotations`, `page`,
 * `columns`, `data`) in the batch response's key order. Whether a shape's split equals the single
 * responses is decided by the verification gate (`gate.ts`), never assumed.
 */

export type Param = [key: string, value: string];

export interface ParsedUrl {
  base: string;
  params: Param[];
}

/** Splits a URL into its base and raw `key=value` pairs, keeping order and encoding as written. */
export function parseUrl(url: string): ParsedUrl {
  const q = url.indexOf("?");
  if (q < 0) return {base: url, params: []};
  const params: Param[] = url.slice(q + 1).split("&").filter(Boolean).map(p => {
    const eq = p.indexOf("=");
    return eq < 0 ? [p, ""] : [p.slice(0, eq), p.slice(eq + 1)];
  });
  return {base: url.slice(0, q), params};
}

export function buildUrl({base, params}: ParsedUrl): string {
  return params.length ? `${base}?${params.map(([k, v]) => `${k}=${v}`).join("&")}` : base;
}

/** Decodes a raw query component the way Tesseract reads it (`+` is a space). */
export function decode(raw: string): string {
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  }
  catch {
    return raw.replace(/\+/g, " ");
  }
}

/** Parameters that are not level names. */
const RESERVED = new Set([
  "cube", "drilldowns", "measures", "include", "exclude", "time", "sort", "limit", "locale", "parents",
  "properties", "filters", "top", "ranking", "sparse", "slugs", "format", "captions", "growth", "calc",
  "location", "activity", "measure", "cuts", "filter", "threshold", "pagination", "debug", "rca", "level"
]);

export const isReserved = (key: string) => RESERVED.has(decode(key).toLowerCase());

export function getParam(parsed: ParsedUrl, key: string): string | undefined {
  return parsed.params.find(([k]) => decode(k) === key)?.[1];
}

/** The cube a Tesseract URL reads. */
export function cubeOf(url: string): string | null {
  const raw = getParam(parseUrl(url), "cube");
  return raw === undefined ? null : decode(raw).trim();
}

/** The endpoint path of a URL (`/tesseract/data.jsonrecords`). */
export function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  }
  catch {
    return parseUrl(url).base;
  }
}

/** Data endpoints whose queries can be batched and split (not `complexity/`, `calcs/`, `members`). */
export const isDataEndpoint = (url: string) => /\/tesseract\/data(\.jsonrecords|\.json)?$/.test(pathOf(url));

/**
 * The level names a query refers to: drilldowns, include/exclude keys and plain cut parameters.
 * Used to find levels a cube does not have (`missingLevels`).
 */
export function levelRefs(url: string): string[] {
  const parsed = parseUrl(url);
  const out: string[] = [];
  for (const [k, v] of parsed.params) {
    const key = decode(k);
    if (key === "drilldowns") decode(v).split(",").forEach(d => out.push(d.trim()));
    else if (key === "include" || key === "exclude") {
      decode(v).split(";").filter(Boolean).forEach(entry => {
        const colon = entry.indexOf(":");
        out.push((colon < 0 ? entry : entry.slice(0, colon)).trim());
      });
    }
    else if (!RESERVED.has(key.toLowerCase())) out.push(key.trim());
  }
  return Array.from(new Set(out));
}

/** The levels of `refs` that the cube lacks (sorted), or [] when it has them all or is unknown. */
export function missingLevels(url: string, cubeLevels: Map<string, Set<string>>): string[] {
  const cube = cubeOf(url);
  const levels = cube ? cubeLevels.get(cube) : undefined;
  if (!levels) return [];
  return levelRefs(url).filter(l => !levels.has(l)).sort();
}

export interface MemberRef {
  /** The URL with the member id replaced by `{M}`. */
  shape: string;
  /** The level the id is a member of, as written (raw) and decoded. */
  levelRaw: string;
  level: string;
  /** Where the id sits. */
  position: "include" | "compound-include" | "cut" | "filter";
}

const tokenCount = (text: string, token: string) => {
  if (!token) return 0;
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(`(^|[^A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, "g")) ?? []).length;
};

/**
 * Where the member id sits in a URL, as a shape; or a reason why the URL is not a member shape
 * (`null` reason: the id is not in the URL at all, so the URL is shared or parent-keyed).
 */
export function memberRef(url: string, memberId: string): {ref: MemberRef} | {ref: null; reason: string | null} {
  const encodedId = encodeURIComponent(memberId);
  const occurrences = tokenCount(url, memberId) + (encodedId !== memberId ? tokenCount(url, encodedId) : 0);
  if (!occurrences) return {ref: null, reason: null};
  const parsed = parseUrl(url);
  const matches: {index: number; entry?: number; levelRaw: string; position: MemberRef["position"]}[] = [];
  parsed.params.forEach(([k, v], index) => {
    const key = decode(k);
    if (key === "filter" && /\/complexity\//.test(parsed.base)) {
      // complexity endpoints compute over every location and keep the `filter` ones
      const colon = v.indexOf(":");
      if (colon >= 0 && !v.includes(";") && decode(v.slice(colon + 1)) === memberId) matches.push({index, entry: 0, levelRaw: v.slice(0, colon), position: "filter"});
    }
    else if (key === "include") {
      const entries = v.split(";");
      entries.forEach((entry, i) => {
        const colon = entry.indexOf(":");
        if (colon < 0) return;
        const value = entry.slice(colon + 1);
        if (decode(value) === memberId) matches.push({index, entry: i, levelRaw: entry.slice(0, colon), position: entries.length > 1 ? "compound-include" : "include"});
      });
    }
    else if (!RESERVED.has(key.toLowerCase()) && key !== "exclude" && decode(v) === memberId) {
      matches.push({index, levelRaw: k, position: "cut"});
    }
  });
  if (matches.length !== 1 || occurrences !== 1) {
    return {ref: null, reason: matches.length ? "member id in several places" : "member id not in an include or cut"};
  }
  const m = matches[0];
  const params = parsed.params.map(([k, v], i): Param => {
    if (i !== m.index) return [k, v];
    if (m.entry === undefined) return [k, "{M}"];
    return [k, v.split(";").map((entry, j) => j === m.entry ? `${entry.slice(0, entry.indexOf(":"))}:{M}` : entry).join(";")];
  });
  return {ref: {shape: buildUrl({base: parsed.base, params}), levelRaw: m.levelRaw, level: decode(m.levelRaw), position: m.position}};
}

/**
 * A member id as a key for matching rows: Tesseract answers numeric ids as numbers, so a CIP4 asked
 * as `0101` comes back as `101`. Digit-only ids are compared as numbers.
 */
export function normId(id: unknown): string {
  const s = String(id);
  return /^\d+$/.test(s) ? String(Number(s)) : s;
}

/** A parsed `top=<n>.<levels>.<measure>.<order>`: the top n rows per combination of `levels`. */
export interface TopParam {
  amount: string;
  groups: string[];
  measure: string;
  order: string;
}

export function parseTop(raw: string): TopParam | null {
  const m = decode(raw).match(/^(\d+)\.(.+?)\.([^.]+)\.(asc|desc)$/i);
  if (!m) return null;
  return {amount: m[1], groups: m[2].split(",").map(s => s.trim()).filter(Boolean), measure: m[3], order: m[4]};
}

/** How a batched query is built from a shape. */
export interface Strategy {
  /** Where the level goes when `drilldowns` lacks it; `present` when it is already there. */
  drill: "append" | "prepend" | "present";
  /** `limit` shapes: the batch drops the limit and each member is cut locally. */
  limit: number | null;
  /**
   * `time=Year.latest[.N]` (or `.oldest`): Tesseract picks the periods among the rows the query
   * matches, so a batch answers with the group's latest periods. A member with rows in all of them
   * has the same latest periods alone and is split as usual; one with rows in only some of them is
   * fetched alone; one without rows is looked up in a presence query (the batch without `time`):
   * with no rows at all it gets the shape's verified empty response, otherwise it is fetched alone.
   */
  time: {level: string; n: number} | null;
  /**
   * `sort=<column>.<asc|desc>`: Tesseract orders tied rows in no order a split can reproduce, so a
   * member whose rows tie on the sort column is fetched alone.
   */
  sortKey: string | null;
  /**
   * `top=<n>.<levels>.…`: the batch adds the member level to `levels`, so Tesseract keeps the top n
   * rows per member, as a single query does.
   */
  top?: boolean;
  /**
   * The gate saw members whose rows tie on the sort column split exactly as their single responses
   * (Tesseract's sort keeps tied rows in the same order in both): ties are no longer unsafe.
   */
  tiesOk?: boolean;
}

/** The strategies to try for a shape, in order; empty with a reason when it cannot be batched. */
export function strategiesFor(shape: string, ref: MemberRef): {strategies: Strategy[]; reason?: string} {
  const parsed = parseUrl(shape);
  const complexityFilter = ref.position === "filter" && /\/complexity\/rca_historical(\.jsonrecords)?$/.test(pathOf(shape));
  if (!isDataEndpoint(shape) && !complexityFilter) return {strategies: [], reason: `endpoint ${pathOf(shape)} is not a data query`};
  const rawTop = getParam(parsed, "top");
  const top = rawTop !== undefined;
  if (top) {
    if (!parseTop(rawTop)) return {strategies: [], reason: `top=${decode(rawTop)} not understood`};
    if (getParam(parsed, "limit") !== undefined) return {strategies: [], reason: "top= with limit= is not cut locally"};
  }
  const rawLimit = getParam(parsed, "limit");
  let limit: number | null = null;
  if (rawLimit !== undefined) {
    const value = decode(rawLimit);
    if (!/^\d+$/.test(value)) return {strategies: [], reason: `limit=${value} (with an offset) is not cut locally`};
    limit = Number(value);
    if (getParam(parsed, "sort") === undefined) return {strategies: [], reason: "limit without sort: which rows a single query keeps is undefined"};
  }
  const drilldowns = decode(getParam(parsed, "drilldowns") ?? "").split(",").map(s => s.trim()).filter(Boolean);
  let time: Strategy["time"] = null;
  const rawTime = getParam(parsed, "time");
  if (rawTime !== undefined) {
    const m = decode(rawTime).match(/^([^.]+)\.(latest|oldest)(?:\.(\d+))?$/);
    if (m) {
      time = {level: m[1], n: Number(m[3] ?? 1)};
      if (time.n > 1 && !drilldowns.includes(time.level)) return {strategies: [], reason: `time=${decode(rawTime)} without ${time.level} in drilldowns: which periods a member has cannot be told`};
    }
    else if (/latest|oldest/.test(decode(rawTime))) return {strategies: [], reason: `time=${decode(rawTime)} not understood`};
  }
  const rawSort = getParam(parsed, "sort");
  const sortKey = rawSort === undefined ? null : decode(rawSort).replace(/\.(asc|desc)$/i, "");
  const base = {limit, time, sortKey, ...(top ? {top: true} : {})};
  if (complexityFilter || drilldowns.includes(ref.level)) return {strategies: [{drill: "present", ...base}]};
  return {strategies: [{drill: "append", ...base}, {drill: "prepend", ...base}]};
}

/** The batched query for `ids` of a shape. */
export function batchUrl(shape: string, ref: MemberRef, ids: string[], strategy: Strategy): string {
  const parsed = parseUrl(shape);
  const list = ids.map(id => encodeURIComponent(id)).join(",");
  let params: Param[] = parsed.params
    .filter(([k]) => !(strategy.limit !== null && decode(k) === "limit"))
    .map(([k, v]): Param => {
      if (strategy.top && decode(k) === "top") {
        const top = parseTop(v)!;
        const groups = top.groups.includes(ref.level) ? top.groups : [...top.groups, ref.level];
        return [k, encodeURIComponent(`${top.amount}.${groups.join(",")}.${top.measure}.${top.order}`)];
      }
      return [k, v.replace("{M}", list)];
    });
  if (strategy.drill !== "present") {
    const i = params.findIndex(([k]) => decode(k) === "drilldowns");
    if (i < 0) params = [...params, ["drilldowns", ref.levelRaw]];
    else {
      const [k, v] = params[i];
      const value = v ? (strategy.drill === "append" ? `${v},${ref.levelRaw}` : `${ref.levelRaw},${v}`) : ref.levelRaw;
      params = params.map((p, j) => j === i ? [k, value] : p);
    }
  }
  return buildUrl({base: parsed.base, params});
}

/** The presence query of a `time` shape: the batch without `time`, to tell members with no data at all. */
export function presenceUrl(shape: string, ref: MemberRef, ids: string[], strategy: Strategy): string {
  const parsed = parseUrl(batchUrl(shape, ref, ids, strategy));
  return buildUrl({base: parsed.base, params: parsed.params.filter(([k]) => decode(k) !== "time" && decode(k) !== "sort")});
}

/** The ids of the members with rows in a batched response. */
export function membersWithRows(body: Json, level: string): Set<string> {
  const out = new Set<string>();
  const data = Array.isArray(body.data) ? body.data as unknown[] : [];
  if (!data.length) return out;
  const idCol = idColumn(body, level);
  if (!idCol) return out;
  const columns = Array.isArray(body.columns) ? body.columns as string[] : [];
  for (const r of data) out.add(normId(Array.isArray(r) ? r[columns.indexOf(idCol)] : (r as Json)[idCol]));
  return out;
}

/** Members (normalized ids) whose rows tie on the sort column, whatever `tiesOk` says. */
export function tiedMembers(body: Json, level: string, strategy: Strategy): Set<string> {
  if (!strategy.sortKey) return new Set();
  return unsafeMembers(body, level, {...strategy, time: null, tiesOk: false});
}

/**
 * Members whose split cannot be trusted whatever the gate saw: rows tied on the sort column (their
 * order is Tesseract's, not reproducible), or rows in only some of the periods a `time=…latest.N`
 * batch picked. They are fetched alone.
 */
export function unsafeMembers(body: Json, level: string, strategy: Strategy): Set<string> {
  const out = new Set<string>();
  const data = Array.isArray(body.data) ? body.data as unknown[] : [];
  const checkTies = Boolean(strategy.sortKey) && !strategy.tiesOk;
  if (!data.length || (!checkTies && !(strategy.time && strategy.time.n > 1))) return out;
  const idCol = idColumn(body, level);
  const columns = Array.isArray(body.columns) ? body.columns as string[] : [];
  const value = (r: unknown, col: string) => Array.isArray(r) ? r[columns.indexOf(col)] : (r as Json)[col];
  const first = data[0];
  const has = (col: string) => Array.isArray(first) ? columns.includes(col) : col in (first as Json);
  const sortCol = strategy.sortKey ? (has(strategy.sortKey) ? strategy.sortKey : has(`${strategy.sortKey} ID`) ? `${strategy.sortKey} ID` : null) : null;
  const timeCol = strategy.time && strategy.time.n > 1 ? (has(strategy.time.level) ? strategy.time.level : null) : null;
  const periods = timeCol ? new Set(data.map(r => String(value(r, timeCol)))) : null;
  const rows = new Map<string, unknown[]>();
  for (const r of data) {
    const id = normId(value(r, idCol!));
    if (!rows.has(id)) rows.set(id, []);
    rows.get(id)!.push(r);
  }
  for (const [id, list] of rows) {
    if (checkTies) {
      if (!sortCol) { out.add(id); continue; }
      const values = list.map(r => JSON.stringify(value(r, sortCol)));
      // with `limit N` only the rows a single query keeps matter: the member is unsafe when one of
      // its first N rows (the batch is sorted, so they come first) ties with any other of its rows
      const kept = strategy.limit !== null ? values.slice(0, strategy.limit) : values;
      const count = new Map<string, number>();
      for (const v of values) count.set(v, (count.get(v) ?? 0) + 1);
      if (kept.some(v => (count.get(v) ?? 0) > 1)) { out.add(id); continue; }
    }
    if (strategy.time && strategy.time.n > 1) {
      if (!timeCol || new Set(list.map(r => String(value(r, timeCol)))).size !== periods!.size) out.add(id);
    }
  }
  return out;
}

/** The length of a URL as sent (spaces and other characters percent-encoded). */
export function sentLength(url: string): number {
  try {
    return new URL(url).href.length;
  }
  catch {
    return encodeURI(url).length;
  }
}

/** Splits `ids` into chunks whose batched URL stays under `maxLength` characters. */
export function chunkIds(shape: string, ref: MemberRef, ids: string[], strategy: Strategy, maxLength: number, maxIds: number): string[][] {
  const chunks: string[][] = [];
  let current: string[] = [];
  const base = sentLength(batchUrl(shape, ref, [], strategy));
  let length = base;
  for (const id of ids) {
    const add = encodeURIComponent(id).length + 1;
    if (current.length && (length + add > maxLength || current.length >= maxIds)) {
      chunks.push(current);
      current = [];
      length = base;
    }
    current.push(id);
    length += add;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

type Json = Record<string, unknown>;

/** What a verified shape knows about the single responses. */
export interface SplitSpec {
  /** Columns of a single response with data, in order. */
  columns: string[];
  strategy: Strategy;
}

/** The id column of a level in a batched response. */
export function idColumn(body: Json, level: string): string | null {
  const columns = Array.isArray(body.columns) ? body.columns as string[] : [];
  if (columns.includes(`${level} ID`)) return `${level} ID`;
  if (columns.includes(level)) return level;
  const first = Array.isArray(body.data) && body.data.length && !Array.isArray(body.data[0]) ? body.data[0] as Json : null;
  if (first && `${level} ID` in first) return `${level} ID`;
  if (first && level in first) return level;
  return null;
}

/**
 * Cuts a batched response into one response per member that has rows. Members without rows are
 * absent from the result (they get the shape's verified empty response, or a single query).
 * Throws when the response cannot be split (no id column, unknown row format).
 */
export function splitBatch(body: Json, level: string, spec: SplitSpec): Map<string, Json> {
  const idCol = idColumn(body, level);
  if (!idCol) throw new Error(`no id column for ${level}`);
  const data = Array.isArray(body.data) ? body.data as unknown[] : null;
  if (!data) throw new Error("no data array");
  const batchColumns = Array.isArray(body.columns) ? body.columns as string[] : null;
  const keep = new Set(spec.columns);
  const byMember = new Map<string, unknown[]>();
  const arrays = data.length > 0 && Array.isArray(data[0]);
  if (arrays && !batchColumns) throw new Error("array rows without columns");
  const idIndex = arrays ? batchColumns!.indexOf(idCol) : -1;
  const keepIndexes = arrays ? batchColumns!.map((c, i) => keep.has(c) ? i : -1).filter(i => i >= 0) : [];
  for (const row of data) {
    let id: string;
    let out: unknown;
    if (arrays) {
      const r = row as unknown[];
      id = normId(r[idIndex]);
      out = keepIndexes.map(i => r[i]);
    }
    else {
      const r = row as Json;
      id = normId(r[idCol]);
      const o: Json = {};
      for (const k of Object.keys(r)) if (keep.has(k)) o[k] = r[k];
      out = o;
    }
    let rows = byMember.get(id);
    if (!rows) byMember.set(id, rows = []);
    rows.push(out);
  }
  const columns = batchColumns ? batchColumns.filter(c => keep.has(c)) : spec.columns;
  const result = new Map<string, Json>();
  for (const [id, allRows] of byMember) {
    const limit = spec.strategy.limit;
    const rows = limit !== null ? allRows.slice(0, limit) : allRows;
    const out: Json = {};
    for (const key of Object.keys(body)) {
      if (key === "data") out.data = rows;
      else if (key === "columns") out.columns = columns;
      else if (key === "page" && body.page && typeof body.page === "object") {
        out.page = {...(body.page as Json), ...(limit !== null ? {limit} : {}), total: allRows.length};
      }
      else out[key] = body[key];
    }
    result.set(id, out);
  }
  return result;
}

/**
 * Canonical JSON for the gate: the response as Tesseract sends it, with only the keys of
 * `annotations` sorted (Tesseract returns them in a different order from one identical request to
 * the next). Row order, key order and every value are compared as they are.
 */
export function canonical(body: unknown): string {
  if (!body || typeof body !== "object" || Array.isArray(body)) return JSON.stringify(body);
  const b = body as Json;
  const out: Json = {};
  for (const key of Object.keys(b)) {
    const v = b[key];
    out[key] = key === "annotations" && v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.keys(v as Json).sort().map(k => [k, (v as Json)[k]]))
      : v;
  }
  return JSON.stringify(out);
}

/** Where two responses first differ, in a few words (for the shapes sheet). */
export function firstDifference(expected: Json, actual: Json): string {
  const ek = Object.keys(expected).join(",");
  const ak = Object.keys(actual).join(",");
  if (ek !== ak) return `top-level keys ${ak} vs ${ek}`;
  if (canonical({annotations: expected.annotations}) !== canonical({annotations: actual.annotations})) return "annotations differ";
  if (JSON.stringify(expected.columns) !== JSON.stringify(actual.columns)) return `columns ${JSON.stringify(actual.columns)} vs ${JSON.stringify(expected.columns)}`;
  if (JSON.stringify(expected.page) !== JSON.stringify(actual.page)) return `page ${JSON.stringify(actual.page)} vs ${JSON.stringify(expected.page)}`;
  const e = Array.isArray(expected.data) ? expected.data : [];
  const a = Array.isArray(actual.data) ? actual.data : [];
  if (e.length !== a.length) return `${a.length} rows vs ${e.length}`;
  const es = e.map(r => JSON.stringify(r));
  const as = a.map(r => JSON.stringify(r));
  if (es.join("\n") === as.join("\n")) return "equal";
  if ([...es].sort().join("\n") === [...as].sort().join("\n")) return "row order differs";
  for (let i = 0; i < es.length; i++) {
    if (es[i] !== as[i]) {
      const ek2 = Object.keys(e[i] as Json).join(",");
      const ak2 = Object.keys(a[i] as Json).join(",");
      if (ek2 !== ak2) return `row keys ${ak2} vs ${ek2}`;
      // sums Tesseract computes in parallel can change in the last digits from one request to the next
      const er = e[i] as Json, ar = a[i] as Json;
      const tiny = Object.keys(er).every(k => er[k] === ar[k] || (typeof er[k] === "number" && typeof ar[k] === "number" && Math.abs((er[k] as number) - (ar[k] as number)) <= 1e-9 * Math.max(1, Math.abs(er[k] as number))));
      return tiny ? `row ${i} values differ in the last digits (float sums)` : `row ${i} values differ`;
    }
  }
  return "differs";
}

/**
 * List shapes: a URL without the member id whose `include` keeps a list of members of a level the
 * query also drills down by, like a university's own CIP2 codes (`include=…;CIP2:15,24,19`). URLs
 * that differ only by that list are answered by one query for the union of their lists, filtered
 * locally to each list: the rows of a member never depend on the other members asked for. Whether a
 * shape's filtered answers equal the real ones is decided by the gate, as for member shapes.
 */
export interface ListRef {
  /** The URL with the list replaced by `{S}`. */
  shape: string;
  level: string;
  values: string[];
}

export function listRef(url: string): ListRef | null {
  if (!isDataEndpoint(url)) return null;
  const parsed = parseUrl(url);
  if (getParam(parsed, "limit") !== undefined || getParam(parsed, "top") !== undefined) return null;
  const drilldowns = new Set(decode(getParam(parsed, "drilldowns") ?? "").split(",").map(s => s.trim()).filter(Boolean));
  const found: {index: number; entry: number; level: string; values: string[]}[] = [];
  parsed.params.forEach(([k, v], index) => {
    if (decode(k) !== "include") return;
    v.split(";").forEach((entry, i) => {
      const colon = entry.indexOf(":");
      if (colon < 0) return;
      const level = decode(entry.slice(0, colon)).trim();
      if (!drilldowns.has(level)) return;
      const values = decode(entry.slice(colon + 1)).split(",").map(s => s.trim()).filter(Boolean);
      if (values.length) found.push({index, entry: i, level, values});
    });
  });
  if (found.length !== 1) return null;
  const f = found[0];
  // a single value is a parent filter (`include=State:<id>`), not a list: the union of several
  // states answered without some of them on 2026-11-04, so those stay plain shared queries
  if (f.values.length < 2) return null;
  const params = parsed.params.map(([k, v], i): Param => i !== f.index ? [k, v] : [k, v.split(";").map((entry, j) => j === f.entry ? `${entry.slice(0, entry.indexOf(":"))}:{S}` : entry).join(";")]);
  return {shape: buildUrl({base: parsed.base, params}), level: f.level, values: f.values};
}

/** The query for the union of several lists of a list shape. */
export function unionUrl(ref: ListRef, values: string[]): string {
  return ref.shape.replace("{S}", values.map(v => encodeURIComponent(v)).join(","));
}

/**
 * The rows of a union answer that belong to `values`, as the response of the query for that list
 * alone; null when the answer cannot be filtered (no id column for the level).
 */
export function filterByList(body: Json, level: string, values: string[]): Json | null {
  const data = Array.isArray(body.data) ? body.data as unknown[] : null;
  if (!data) return null;
  if (!data.length) return {...body};
  const idCol = idColumn(body, level);
  if (!idCol) return null;
  const columns = Array.isArray(body.columns) ? body.columns as string[] : [];
  const keep = new Set(values.map(normId));
  const rows = data.filter(r => keep.has(normId(Array.isArray(r) ? r[columns.indexOf(idCol)] : (r as Json)[idCol])));
  const out: Json = {};
  for (const key of Object.keys(body)) {
    if (key === "data") out.data = rows;
    else if (key === "page" && body.page && typeof body.page === "object") out.page = {...(body.page as Json), total: rows.length};
    else out[key] = body[key];
  }
  return out;
}

/**
 * The query of a list shape without the list: every member of the level, which a local filter cuts
 * to any list (`filterByList`). Used for lists the planner cannot see, such as the CIP2 codes an
 * in-process endpoint computes for each university.
 */
export function allUrl(url: string): string | null {
  const parsed = parseUrl(url);
  const drilldowns = new Set(decode(getParam(parsed, "drilldowns") ?? "").split(",").map(s => s.trim()).filter(Boolean));
  let changed = false;
  const params: Param[] = [];
  for (const [k, v] of parsed.params) {
    if (decode(k) !== "include") { params.push([k, v]); continue; }
    const kept = v.split(";").filter(entry => {
      const colon = entry.indexOf(":");
      const level = colon < 0 ? "" : decode(entry.slice(0, colon)).trim();
      const drop = drilldowns.has(level) && decode(entry.slice(colon + 1)).includes(",");
      if (drop) changed = true;
      return !drop;
    });
    if (kept.length) params.push([k, kept.join(";")]);
  }
  return changed ? buildUrl({base: parsed.base, params}) : null;
}
