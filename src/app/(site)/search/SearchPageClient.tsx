"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";

import {SEARCH_DIMENSIONS, type SearchPageResult} from "@/content/search/dimensions";

const commas = new Intl.NumberFormat("en-US");

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
  totals: Record<string, Record<string, number>>;
  limit: number;
}

/** Dimension icon from the sprite rendered by the page; coloured through CSS `color`. */
function Icon({cls}: {cls: string}) {
  return <svg className={`dim-icon ${cls}`} aria-hidden="true"><use href={`#dim-${cls}`} /></svg>;
}

const CLASS_BY_DIMENSION = Object.fromEntries(SEARCH_DIMENSIONS.map(d => [d.key, d.cls]));

export function SearchPageClient({initialQuery, initialDimension, initialHierarchy, initialResults, totals, limit}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [dimension, setDimension] = useState(initialDimension);
  const [hierarchy, setHierarchy] = useState(initialHierarchy);
  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (dimension) params.set("dimension", dimension);
    if (hierarchy) params.set("hierarchy", hierarchy);
    const qs = params.toString();
    router.replace(`/search${qs ? `?${qs}` : ""}`, {scroll: false});
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      params.set("limit", String(limit));
      fetch(`/api/search?${params}`, {signal: controller.signal})
        .then(r => r.json())
        .then(data => { setResults(data.results ?? []); setLoading(false); })
        .catch(() => {});
    }, 150);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, dimension, hierarchy, limit, router]);

  const sum = (obj: Record<string, number> = {}) => Object.values(obj).reduce((a, b) => a + b, 0);

  return (
    <div id="SearchPage">
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
          {results.map(d => (
            <li className="result" key={`${d.dimension}-${d.id}`}>
              <Link href={`/profile/${d.profile}/${d.slug || d.id}`}>
                <Icon cls={CLASS_BY_DIMENSION[d.dimension] ?? d.profile} />
                <span className="result-text">
                  <span className="title">{d.name}</span>
                  <span className="sumlevel">{d.hierarchy}</span>
                </span>
              </Link>
            </li>
          ))}
          {!results.length && <li className="no-results">No results found</li>}
        </ul>
      </div>
      <div className="controls">
        {dimension && (
          <button type="button" className="clear" onClick={() => { setDimension(""); setHierarchy(""); }}>
            <span className="x">×</span> Clear Filter
          </button>
        )}
        <ul>
          <li>Report Type <span className="num">Results</span></li>
          {SEARCH_DIMENSIONS.map(({key, label, cls}) => {
            const totalsForDim = totals[key] ?? {};
            return (
              <li className={cls} key={key}>
                <button type="button" className="dim-button" onClick={() => { setDimension(key); setHierarchy(""); }}>
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
                          <button type="button" onClick={() => setHierarchy(k)}>
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
