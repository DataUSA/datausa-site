"use client";

import {useEffect, useId, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import styles from "./SearchBox.module.css";

export interface SearchHit {
  id: string;
  slug: string;
  name: string;
  dimension: string;
  hierarchy: string;
  profile: string;
}

interface SearchBoxProps {
  placeholder: string;
  dimension?: string;
  /** Called with the chosen member; defaults to navigating to its report. */
  onSelect?: (hit: SearchHit) => void;
  className?: string;
  /** Collapsed icon that expands into the input (navigation bar style). */
  collapsible?: boolean;
  autoFocus?: boolean;
  /** Renders a submit button that opens the search page with the current query (home page). */
  buttonLabel?: string;
  /** Prefill the input (search page deep links). */
  initialQuery?: string;
  /** Called whenever the query text changes. */
  onQueryChange?: (query: string) => void;
}

/** Autocomplete search over all reports, backed by `/api/search` (legacy `Search.jsx`). */
export function SearchBox({placeholder, dimension, onSelect, className = "", collapsible = false, autoFocus = false, buttonLabel, initialQuery = "", onQueryChange}: SearchBoxProps) {
  const router = useRouter();
  const [query, setQueryState] = useState(initialQuery);
  const setQuery = (value: string) => { setQueryState(value); onQueryChange?.(value); };
  const [results, setResults] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(!collapsible);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const params = new URLSearchParams({q: query, limit: "10"});
      if (dimension) params.set("dimension", dimension);
      fetch(`/api/search?${params}`, {signal: controller.signal})
        .then(r => r.json())
        .then(data => { setResults(data.results ?? []); setHighlight(0); })
        .catch(() => {});
    }, 150);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, dimension]);

  useEffect(() => {
    if (open && collapsible) inputRef.current?.focus();
  }, [open, collapsible]);

  const choose = (hit: SearchHit) => {
    setQuery("");
    setResults([]);
    if (collapsible) setOpen(false);
    if (onSelect) onSelect(hit);
    else router.push(`/profile/${hit.profile}/${hit.slug || hit.id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(h + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && results[highlight]) { e.preventDefault(); choose(results[highlight]); }
    else if (e.key === "Enter" && buttonLabel) { e.preventDefault(); router.push(`/search${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`); }
    else if (e.key === "Escape") { setQuery(""); setResults([]); if (collapsible) setOpen(false); }
  };

  return (
    <div className={`${styles.search} ${collapsible ? styles.collapsible : ""} ${open ? styles.open : ""} ${className}`}>
      {collapsible && (
        <button type="button" className={styles.toggle} aria-label={open ? "Close search" : "Open search"} onClick={() => setOpen(o => !o)}>
          <img src="/images/icons/search.svg" alt="" width={16} height={16} />
        </button>
      )}
      {open && (
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
        />
      )}
      {buttonLabel && (
        <a className={styles.button} href={`/search${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`}>{buttonLabel}</a>
      )}
      {open && results.length > 0 && (
        <ul id={listId} className={styles.results} role="listbox">
          {results.map((hit, i) => (
            <li key={`${hit.dimension}-${hit.id}`} role="option" aria-selected={i === highlight} className={`${styles.result} ${i === highlight ? styles.highlighted : ""}`} onMouseEnter={() => setHighlight(i)}>
              <button type="button" className={styles.resultButton} onClick={() => choose(hit)}>
                <img className={`${styles.resultIcon} ${styles[hit.profile] ?? ""}`} src={`/icons/dimensions/${hit.dimension}.svg`} alt="" />
                <span className={styles.resultText}>
                  <span className={styles.resultTitle}>{hit.name}</span>
                  <span className={styles.resultLevel}>{hit.hierarchy}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && results.length === 0 && (
        <ul className={styles.results}><li className={styles.noResults}>No results found</li></ul>
      )}
    </div>
  );
}
