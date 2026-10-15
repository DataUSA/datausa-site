"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {useEffect, useRef, useState} from "react";

import {SEARCH_DIMENSIONS, UNIVERSITY_RANK_OPTIONS, type SearchMetric, type SearchPageResult} from "@/content/search/dimensions";
import type {UniversityState} from "./UniversityMap";

const commas = new Intl.NumberFormat("en-US");
const dollars = new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1});

/** Geography levels with a map; the list mirrors `hasSearchMap` so the chart code loads only when needed. */
const MAP_LEVELS = ["State", "County", "MSA", "PUMA", "Congressional District", "Place", "School District"];
const SearchMap = dynamic(() => import("./SearchMap").then(m => m.SearchMap), {ssr: false});
const UniversityMap = dynamic(() => import("./UniversityMap").then(m => m.UniversityMap), {ssr: false});

/** Whether a filter lists universities, which can be ranked by a figure and limited to a state. */
const isUniversityList = (dimension: string, hierarchy: string) => dimension === "University" && (!hierarchy || hierarchy === "University");

/** A university's figure as listed: students, dollars ("$53.2B") or the share of applicants admitted. */
function formatFigure(key: string, value: number): string {
  if (key === "endowment") return dollars.format(value);
  if (key === "acceptance") return `${(value * 100).toFixed(1)}%`;
  return commas.format(value);
}

/** What the page is showing, as kept in its address: the typed text, the filters and, for universities, the ranking, its order and the state. */
interface View {query: string; dimension: string; hierarchy: string; rank: string; order: string; region: string}

/**
 * The query string of a view, written one way only: defaults are left out (enrollment, a ranking's
 * usual order) and so are the university options when the list is not one of universities. Two
 * addresses show the same view exactly when this gives the same string for both.
 */
function viewQuery({query, dimension, hierarchy, rank, order, region}: View): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (dimension) params.set("dimension", dimension);
  if (hierarchy) params.set("hierarchy", hierarchy);
  if (isUniversityList(dimension, hierarchy)) {
    const option = UNIVERSITY_RANK_OPTIONS.find(d => d.key === rank) ?? UNIVERSITY_RANK_OPTIONS[0];
    if (option !== UNIVERSITY_RANK_OPTIONS[0]) params.set("rank", option.key);
    if ((order === "asc" || order === "desc") && (order === "asc") !== option.ascending) params.set("order", order);
    if (region) params.set("state", region);
  }
  return params.toString();
}

const viewOf = (params: URLSearchParams): View => ({
  query: params.get("q") ?? "",
  dimension: params.get("dimension") ?? "",
  hierarchy: params.get("hierarchy") ?? "",
  rank: params.get("rank") ?? "",
  order: params.get("order") ?? "",
  region: params.get("state") ?? ""
});

interface UniversityStates {year: number | null; states: UniversityState[]}
let universityStates: Promise<UniversityStates> | undefined;
function loadUniversityStates(): Promise<UniversityStates> {
  if (!universityStates) {
    const request = universityStates = fetch("/api/university/states")
      .then(r => r.ok ? r.json() as Promise<UniversityStates> : {year: null, states: []})
      .catch(() => ({year: null, states: []}));
    // an empty answer (the data API was down) is asked for again next time
    request.then(d => { if (!d.states?.length && universityStates === request) universityStates = undefined; });
  }
  return universityStates;
}

const formatSubLabel = (key: string) => key
  .replace(/^Industry\s/g, "")
  .replace(/^CIP([0-9])/g, "$1 Digit Course")
  .replace(/\sOccupation\s/g, " ")
  .replace(/^NAPCS\s/g, "");

interface Props {
  initialQuery: string;
  initialDimension: string;
  initialHierarchy: string;
  initialResults: SearchPageResult[];
  initialPopulationYear: number | null;
  /** Ranking, order ("asc" or "desc") and state of a list of universities, when the URL asks for them. */
  initialRank: string;
  initialOrder: string;
  initialState: string;
  initialMetric: SearchMetric | null;
  totals: Record<string, Record<string, number>>;
  limit: number;
}

/** Dimension icon from the sprite rendered by the page; coloured through CSS `color`. */
function Icon({cls}: {cls: string}) {
  return <svg className={`dim-icon ${cls}`} aria-hidden="true"><use href={`#dim-${cls}`} /></svg>;
}

const CLASS_BY_DIMENSION = Object.fromEntries(SEARCH_DIMENSIONS.map(d => [d.key, d.cls]));

export function SearchPageClient({initialQuery, initialDimension, initialHierarchy, initialResults, initialPopulationYear, initialRank, initialOrder, initialState, initialMetric, totals, limit}: Props) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [dimension, setDimension] = useState(initialDimension);
  const [hierarchy, setHierarchy] = useState(initialHierarchy);
  const [results, setResults] = useState(initialResults);
  const [populationYear, setPopulationYear] = useState(initialPopulationYear);
  // universities: the ranking ("" is the default, enrollment), its order ("" is the ranking's usual
  // one), the state's geoid and the listed figure
  const [rank, setRank] = useState(initialRank);
  const [order, setOrder] = useState(initialOrder);
  const [region, setRegion] = useState(initialState);
  const [metric, setMetric] = useState(initialMetric);
  const [states, setStates] = useState<UniversityStates | null>(null);
  // what the listed results were searched with (the inputs change before the results arrive)
  const [shown, setShown] = useState({query: initialQuery, dimension: initialDimension, hierarchy: initialHierarchy});
  const [loading, setLoading] = useState(false);
  const firstRun = useRef(true);

  // The address and the page's state are kept in step in both directions. The page writes its
  // state to the address (below); an address it did not write is a navigation (a link to another
  // report type, the back button) and replaces the state. Next keeps this page's state while
  // another page is shown and runs its effects again on return, so without the second direction a
  // link to the search page arrived at whatever had been selected the last time.
  const server: View = {query: initialQuery, dimension: initialDimension, hierarchy: initialHierarchy, rank: initialRank, order: initialOrder, region: initialState};
  const serverQuery = viewQuery(server);
  /** The view this page last put in the address (to start with, the one the server rendered). */
  const written = useRef(serverQuery);
  /** A view taken from the address that the state has not caught up with yet. */
  const adopting = useRef<string | null>(null);
  const address = viewQuery(viewOf(searchParams));
  const fromServer = useRef({serverQuery, initialResults, initialPopulationYear, initialMetric});
  useEffect(() => { fromServer.current = {serverQuery, initialResults, initialPopulationYear, initialMetric}; });

  useEffect(() => {
    if (address === written.current) return;
    const view = viewOf(new URLSearchParams(address));
    written.current = adopting.current = address;
    setQuery(view.query);
    setDimension(view.dimension);
    setHierarchy(view.hierarchy);
    setRank(view.rank);
    setOrder(view.order);
    setRegion(view.region);
    // the server rendered the results of the address it was asked for: show them at once
    const rendered = fromServer.current;
    if (rendered.serverQuery === address) {
      setResults(rendered.initialResults);
      setPopulationYear(rendered.initialPopulationYear);
      setMetric(rendered.initialMetric);
      setShown({query: view.query, dimension: view.dimension, hierarchy: view.hierarchy});
    }
  }, [address]);

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const qs = viewQuery({query, dimension, hierarchy, rank, order, region});
    // a view is being taken from the address: this run still has the previous state, which must not go back there
    if (adopting.current !== null) {
      if (adopting.current !== qs) return;
      adopting.current = null;
    }
    // written without a navigation: the server need not render the page again for every keystroke
    if (qs !== written.current || viewQuery(viewOf(new URLSearchParams(window.location.search))) !== qs) {
      written.current = qs;
      window.history.replaceState(null, "", `/search${qs ? `?${qs}` : ""}`);
    }
    const params = new URLSearchParams(qs);
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      params.set("limit", String(limit));
      params.set("population", "1");
      fetch(`/api/search?${params}`, {signal: controller.signal})
        .then(r => r.json())
        .then(data => {
          setResults(data.results ?? []);
          setPopulationYear(data.populationYear ?? null);
          setMetric(data.metric ?? null);
          // a state the data does not know (a mistyped address) is not kept as the selection
          if (region && isUniversityList(dimension, hierarchy) && data.metric && !data.state) setRegion("");
          setShown({query, dimension, hierarchy});
          setLoading(false);
        })
        .catch(() => {});
    }, 150);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, dimension, hierarchy, rank, order, region, limit]);

  const universities = isUniversityList(dimension, hierarchy);
  const activeRank = UNIVERSITY_RANK_OPTIONS.find(d => d.key === rank) ?? UNIVERSITY_RANK_OPTIONS[0];
  const ascending = order === "asc" || order === "desc" ? order === "asc" : activeRank.ascending;
  useEffect(() => {
    if (!universities) return;
    let cancelled = false;
    loadUniversityStates().then(d => { if (!cancelled) setStates(d); });
    return () => { cancelled = true; };
  }, [universities]);
  /** Leaving the universities drops their ranking and state, so coming back starts from the whole country. */
  const pick = (key: string, level = "") => {
    setDimension(key);
    setHierarchy(level);
    if (!isUniversityList(key, level)) { setRank(""); setOrder(""); setRegion(""); }
  };
  /** A ranking's button: picks the ranking in its usual order, or turns the list round when it is already picked. */
  const rankBy = (option: typeof UNIVERSITY_RANK_OPTIONS[number]) => {
    if (option.key !== activeRank.key) { setRank(option.key); setOrder(""); }
    else setOrder(ascending === option.ascending ? ascending ? "desc" : "asc" : "");
  };

  const sum = (obj: Record<string, number> = {}) => Object.values(obj).reduce((a, b) => a + b, 0);
  // One geography level selected: its members can be drawn on a map. Mixed levels and other report
  // types have no common map.
  const mapLevel = shown.dimension === "Geography" && MAP_LEVELS.includes(shown.hierarchy) ? shown.hierarchy : "";
  const hasPopulation = results.some(d => d.population !== undefined);
  // the state map and the figures belong to the list that is shown, the controls to the filter that is set
  const universityMap = isUniversityList(shown.dimension, shown.hierarchy);
  const figure = universityMap && metric && results.some(d => d.value !== undefined) ? metric : null;
  const column = figure ? `${figure.year ? `${figure.year} ` : ""}${figure.label}` : `${populationYear ? `${populationYear} ` : ""}Population`;

  return (
    <div id="SearchPage" className={mapLevel || universityMap ? "has-map" : ""}>
      <div className="search">
        <label className="search-input-group">
          <span className="search-icon" aria-hidden="true" />
          <input
            type="search"
            value={query}
            placeholder="Find a report..."
            autoFocus
            aria-label="Find a report"
            onChange={e => setQuery(e.target.value)}
          />
        </label>
        <ul className={`results ${loading ? "loading" : ""}`} aria-live="polite">
          {(hasPopulation || figure || universities) && (
            <li className={`results-header ${universities ? "with-tools" : ""}`} aria-hidden={universities ? undefined : true}>
              {universities && (
                <div className="results-tools">
                  <div className="rank" role="group" aria-label="Rank universities by">
                    {UNIVERSITY_RANK_OPTIONS.map(option => {
                      const active = activeRank === option;
                      const direction = ascending ? "lowest first" : "highest first";
                      return (
                        <button
                          type="button"
                          key={option.key}
                          className={active ? "active" : ""}
                          aria-pressed={active}
                          title={active ? `${option.label}, ${direction}. Click to reverse the order.` : `Rank by ${option.label.toLowerCase()}`}
                          onClick={() => rankBy(option)}
                        >
                          {option.label}
                          {active && <span className={`direction ${ascending ? "asc" : "desc"}`} role="img" aria-label={direction} />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="state">
                    <select aria-label="State" value={region} onChange={e => setRegion(e.target.value)}>
                      <option value="">All states</option>
                      {(states?.states ?? []).map(d => <option key={d.id} value={d.id}>{d.name} ({commas.format(d.universities)})</option>)}
                    </select>
                    {region && <button type="button" className="clear-state" aria-label="Clear the state" title="Show every state" onClick={() => setRegion("")}>×</button>}
                  </div>
                </div>
              )}
              {(hasPopulation || figure) && <span>{column}</span>}
            </li>
          )}
          {results.map(d => (
            <li className="result" key={`${d.dimension}-${d.id}`}>
              <Link href={`/profile/${d.profile}/${d.slug || d.id}`}>
                <Icon cls={CLASS_BY_DIMENSION[d.dimension] ?? d.profile} />
                <span className="result-text">
                  <span className="title">{d.name}</span>
                  {d.label && <span className="label">{d.label}</span>}
                  <span className="sumlevel">{d.hierarchy}{d.state ? ` · ${d.state}` : ""}</span>
                </span>
                {typeof d.population === "number" && (
                  <span className="result-population" title={`${populationYear ? `${populationYear} ` : ""}population`}>{commas.format(d.population)}</span>
                )}
                {figure && typeof d.value === "number" && (
                  <span className="result-population" title={column}>{formatFigure(figure.key, d.value)}</span>
                )}
              </Link>
            </li>
          ))}
          {!results.length && <li className="no-results">No results found</li>}
        </ul>
        {mapLevel && (
          <div className="search-map">
            {/* keyed by level: switching levels starts a new map, zoomed out */}
            <SearchMap key={mapLevel} hierarchy={mapLevel} results={results} filtered={Boolean(shown.query.trim())} year={populationYear} />
          </div>
        )}
        {universityMap && (
          <div className="search-map">
            <UniversityMap states={states?.states ?? []} year={states?.year ?? null} selected={region} onSelect={setRegion} />
          </div>
        )}
      </div>
      <div className="controls">
        {dimension && (
          <button type="button" className="clear" onClick={() => pick("")}>
            <span className="x">×</span> Clear Filter
          </button>
        )}
        <ul>
          <li>Report Type <span className="num">Results</span></li>
          {SEARCH_DIMENSIONS.map(({key, label, cls}) => {
            const totalsForDim = totals[key] ?? {};
            return (
              <li className={cls} key={key}>
                <button type="button" className="dim-button" onClick={() => pick(key)}>
                  <Icon cls={cls} />
                  {label}
                  <span className="num">{commas.format(sum(totalsForDim))}</span>
                </button>
                {dimension === key && (
                  <ul>
                    {Object.keys(totalsForDim)
                      .sort((a, b) => totalsForDim[a] - totalsForDim[b])
                      .filter(k => totalsForDim[k] > 1)
                      .map(k => (
                        <li className={hierarchy === k ? "active" : ""} key={k}>
                          <button type="button" onClick={() => pick(key, k)}>
                            {formatSubLabel(k)}
                            <span className="num">{commas.format(totalsForDim[k])}</span>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
