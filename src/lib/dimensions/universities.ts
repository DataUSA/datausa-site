/**
 * Latest IPEDS figures of every university, for the search page: the rankings a list of universities
 * can be ordered by and the state each one is in. Values come from Tesseract at request time and are
 * cached (in Redis when it is configured); nothing is stored in the repository.
 */
import {UNIVERSITY_RANK_OPTIONS} from "@/content/search/dimensions";
import {fetchData, tesseractDataUrl} from "@/lib/api/tesseract";
import {lookupCodeVersion, sharedLookup, sharedLookupKey} from "@/lib/cache/shared-lookup";
import {listMembers} from "@/lib/dimensions/db";

export type UniversityRanking = typeof UNIVERSITY_RANK_OPTIONS[number]["key"];

const byKey: Partial<Record<UniversityRanking, {label: string; ascending: boolean}>> = {};
for (const option of UNIVERSITY_RANK_OPTIONS) byKey[option.key] = option;
/** The rankings of `UNIVERSITY_RANK_OPTIONS` by key: their label and the order they start in. */
export const UNIVERSITY_RANKINGS = byKey as Record<UniversityRanking, {label: string; ascending: boolean}>;

export const DEFAULT_UNIVERSITY_RANKING: UniversityRanking = "enrollment";

export function isUniversityRanking(key: string | undefined): key is UniversityRanking {
  return Boolean(key) && Object.hasOwn(UNIVERSITY_RANKINGS, key as string);
}

export interface UniversityFigure {
  /** Geoid and name of the state the university reports its enrollment in. */
  state?: string;
  stateName?: string;
  enrollment?: number;
  endowment?: number;
  /** Share of applicants admitted, 0 to 1. */
  acceptance?: number;
}

export interface UniversityState {
  id: string;
  name: string;
  /** Universities with a report and an enrollment figure in the state. */
  universities: number;
  enrollment: number;
}

export interface UniversityFigures {
  /** IPEDS year of each figure (the cubes' latest). */
  years: Record<UniversityRanking, number | null>;
  byId: Map<string, UniversityFigure>;
  states: Map<string, UniversityState>;
}

type Row = Record<string, unknown>;

async function latest(cube: string, drilldowns: string, measures: string): Promise<{rows: Row[]; year: number | null}> {
  const result = await fetchData(tesseractDataUrl({cube, drilldowns: `${drilldowns},Year`, measures, time: "Year.latest"}));
  const rows = (result.data?.data ?? []) as Row[];
  const year = rows.length && Number.isFinite(Number(rows[0].Year)) ? Number(rows[0].Year) : null;
  return {rows, year};
}

const positive = (value: unknown): number | undefined => {
  const n = Number(value);
  return value !== null && value !== undefined && Number.isFinite(n) && n > 0 ? n : undefined;
};

/** The three queries of the lookup: its key changes with them. */
const QUERIES = [
  {cube: "ipeds_enrollment", drilldowns: "University,State", measures: "Enrollment"},
  {cube: "ipeds_finance_financials", drilldowns: "University", measures: "Endowment Value"},
  {cube: "ipeds_admissions", drilldowns: "University", measures: "Applicants Total,Admissions Total"}
] as const;

/** What Tesseract says, shared between workers; the states are counted from it in each one. */
type UniversityData = Omit<UniversityFigures, "states">;

const EMPTY: UniversityData = {years: {enrollment: null, endowment: null, acceptance: null}, byId: new Map()};

async function computeFigures(): Promise<UniversityData> {
  const [enrollment, endowment, admissions] = await Promise.all(QUERIES.map(q => latest(q.cube, q.drilldowns, q.measures)));
  const byId = new Map<string, UniversityFigure>();
  const figure = (row: Row): UniversityFigure => {
    const id = String(row["University ID"] ?? "");
    let item = byId.get(id);
    if (!item) byId.set(id, item = {});
    return item;
  };
  for (const row of enrollment.rows) {
    const students = positive(row.Enrollment);
    if (students === undefined) continue;
    const item = figure(row);
    // a university enrolls in one state; should the cube ever split one, the larger part names it
    if (item.enrollment === undefined || students > item.enrollment) {
      item.state = String(row["State ID"] ?? "") || undefined;
      item.stateName = String(row.State ?? "") || undefined;
    }
    item.enrollment = (item.enrollment ?? 0) + students;
  }
  for (const row of endowment.rows) {
    const dollars = positive(row["Endowment Value"]);
    if (dollars !== undefined) figure(row).endowment = dollars;
  }
  for (const row of admissions.rows) {
    // a school that reports applicants and no admissions has no rate worth ranking by
    const applicants = positive(row["Applicants Total"]), admitted = positive(row["Admissions Total"]);
    if (applicants !== undefined && admitted !== undefined) figure(row).acceptance = admitted / applicants;
  }
  return {years: {enrollment: enrollment.year, endowment: endowment.year, acceptance: admissions.year}, byId};
}

/** The states, counting the universities that have a report here (the dimensions database). */
function statesOf(byId: Map<string, UniversityFigure>): Map<string, UniversityState> {
  const states = new Map<string, UniversityState>();
  for (const member of listMembers("University", "University", 100000)) {
    const item = byId.get(member.id);
    if (!item?.state || !item.stateName || item.enrollment === undefined) continue;
    let state = states.get(item.state);
    if (!state) states.set(item.state, state = {id: item.state, name: item.stateName, universities: 0, enrollment: 0});
    state.universities++;
    state.enrollment += item.enrollment;
  }
  return states;
}

/** The figures with their states, made once per copy of the shared lookup. */
const withStates = new WeakMap<UniversityData, UniversityFigures>();

/**
 * Enrollment (with the state), endowment and admissions of every university, from three Tesseract
 * queries of under 1 MB each, shared between workers like the landing pages' level figures
 * (`src/lib/cache/shared-lookup.ts`) and kept in memory, since the search page reads it on every
 * keystroke. A failed request leaves the lookup without figures and is tried again 10 s later
 * (30 s without Redis).
 */
export async function getUniversityFigures(): Promise<UniversityFigures> {
  const code = lookupCodeVersion("universities");
  const data = await sharedLookup<UniversityData>({
    key: sharedLookupKey("universities", [code, QUERIES]),
    shared: code !== undefined,
    label: "University figures",
    compute: computeFigures,
    encode: d => ({years: d.years, byId: Object.fromEntries(d.byId)}),
    decode: stored => {
      const s = stored as {years: UniversityData["years"]; byId: Record<string, UniversityFigure>};
      return {years: s.years, byId: new Map(Object.entries(s.byId))};
    },
    fallback: EMPTY
  });
  let figures = withStates.get(data);
  if (!figures) withStates.set(data, figures = {...data, states: statesOf(data.byId)});
  return figures;
}
