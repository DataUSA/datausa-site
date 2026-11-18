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
  /** Accessible name of the input ("Search reports"); the placeholder when not given. */
  label?: string;
  dimension?: string;
  /** Called with the chosen member; defaults to navigating to its report. */
  onSelect?: (hit: SearchHit) => void;
  className?: string;
  /** A taller input (the navigation's search panel). */
  size?: "large";
  autoFocus?: boolean;
  /** Renders a submit button that opens the search page with the current query (home page). */
  buttonLabel?: string;
  /** Prefill the input (search page deep links). */
  initialQuery?: string;
  /** Called whenever the query text changes. */
  onQueryChange?: (query: string) => void;
  /** Called when Escape is pressed while no suggestions are showing (the navigation's panel closes). */
  onEscape?: () => void;
}

/** The report a search result opens. */
export const reportHref = (hit: SearchHit) => `/profile/${hit.profile}/${hit.slug || hit.id}`;

type Status = "idle" | "loading" | "ready" | "error";

/** How long typing has to pause before the suggestions are asked for. */
const DEBOUNCE_MS = 150;

/** A click that asks for a new tab or window: the report opens there and the box stays as it is. */
const wantsNewTab = (e: {metaKey: boolean; ctrlKey: boolean; shiftKey: boolean}) => e.metaKey || e.ctrlKey || e.shiftKey;

/**
 * Autocomplete search over all reports, backed by `/api/search`: an editable combobox with list
 * autocomplete and manual selection (WAI-ARIA Authoring Practices, "Combobox"). Focus stays in the
 * input; the suggestion the arrow keys reach is announced through `aria-activedescendant` and only
 * Enter (or a click) opens it.
 *
 * Keys: ArrowDown/ArrowUp open the list (at the first/last suggestion) and move through it, wrapping
 * at the ends; Alt+ArrowDown opens it without moving, Alt+ArrowUp closes it. Enter opens the
 * highlighted suggestion; with none highlighted it submits: the search page when the box has a
 * Search button, otherwise the first suggestion. Escape closes the list and keeps the text; with
 * the list closed it calls `onEscape`, or clears the text. Tab and Shift+Tab close the list and move
 * on. Home and End stay text editing keys.
 *
 * Styling hooks for pages that restyle the box (`home.css`): `data-search-popup`,
 * `data-search-option` (with `data-active` on the highlighted one) and `data-search-message`.
 */
export function SearchBox({placeholder, label, dimension, onSelect, className = "", size, autoFocus = false, buttonLabel, initialQuery = "", onQueryChange, onEscape}: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchHit[]>([]);
  /** The query the results answer (the typed text may have moved on while they load). */
  const [answered, setAnswered] = useState("");
  const [status, setStatus] = useState<Status>(() => initialQuery.trim() ? "loading" : "idle");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const baseId = useId();
  const listId = `${baseId}listbox`;
  const optionId = (i: number) => `${baseId}option-${i}`;
  const trimmed = query.trim();

  // Suggestions for the text, once typing pauses. Every keystroke cancels the request before it.
  useEffect(() => {
    if (!query.trim()) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const params = new URLSearchParams({q: query, limit: "10"});
      if (dimension) params.set("dimension", dimension);
      fetch(`/api/search?${params}`, {signal: controller.signal})
        .then(r => r.ok ? r.json() : Promise.reject(new Error(`search answered ${r.status}`)))
        .then((data: {results?: SearchHit[]}) => {
          setResults(data.results ?? []);
          setAnswered(query);
          setStatus("ready");
          setActive(-1);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setResults([]);
          setAnswered(query);
          setStatus("error");
          setActive(-1);
        });
    }, DEBOUNCE_MS);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, dimension]);

  const showList = open && results.length > 0;
  const message = !open || !trimmed ? null
    : status === "error" ? "Search is unavailable right now. Please try again in a moment."
    : status === "loading" && !results.length ? "Searching…"
    : status === "ready" && !results.length ? `No reports match “${answered.trim()}”.`
    : null;
  const showPopup = showList || message !== null;

  // What a screen reader hears once the suggestions settle (not on every keystroke).
  const announcement = !open || !trimmed ? ""
    : status === "error" ? "Search is unavailable right now."
    : status !== "ready" ? ""
    : results.length ? `${results.length} suggestion${results.length === 1 ? "" : "s"}. Use the up and down arrows to review.`
    : `No reports match “${answered.trim()}”.`;

  // The list never runs past the bottom of the window: the room below the input is written to the
  // box as `--search-room` while the list is open, and the CSS caps the list with it.
  useEffect(() => {
    if (!showPopup) return;
    // the visual viewport leaves out a phone's on-screen keyboard
    const viewport = window.visualViewport;
    const measure = () => {
      const box = input.current?.getBoundingClientRect();
      const bottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
      if (box) root.current?.style.setProperty("--search-room", `${Math.max(0, Math.floor(bottom - box.bottom - 12))}px`);
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, {passive: true});
    viewport?.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      viewport?.removeEventListener("resize", measure);
    };
  }, [showPopup]);

  // a press anywhere outside the box closes the list (a tap on a touch screen included)
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  // new suggestions start at the top of the list
  useEffect(() => { if (list.current) list.current.scrollTop = 0; }, [results]);

  // the highlighted suggestion is kept in view, scrolling the list only (never the page)
  useEffect(() => {
    const box = list.current;
    const option = active >= 0 ? box?.children[active] as HTMLElement | undefined : undefined;
    if (!box || !option) return;
    // the list's own padding counts too: the first suggestion scrolls the list right to its top
    const style = getComputedStyle(box);
    const top = option.offsetTop - parseFloat(style.paddingTop);
    const bottom = option.offsetTop + option.offsetHeight + parseFloat(style.paddingBottom);
    if (top < box.scrollTop) box.scrollTop = top;
    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight;
  }, [active, showList]);

  const change = (value: string) => {
    setQuery(value);
    onQueryChange?.(value);
    setActive(-1);
    if (value.trim()) {
      setStatus("loading");
      setOpen(true);
    }
    else {
      setResults([]);
      setAnswered("");
      setStatus("idle");
      setOpen(false);
    }
  };

  const close = () => { setOpen(false); setActive(-1); };

  const choose = (hit: SearchHit) => {
    change("");
    if (onSelect) onSelect(hit);
    else router.push(reportHref(hit));
  };

  // a report asked for in a new tab (Cmd/Ctrl/Shift-click, middle click, Cmd/Ctrl+Enter)
  const openInNewTab = (hit: SearchHit) => window.open(reportHref(hit), "_blank", "noopener");

  const submit = () => router.push(`/search${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    const count = results.length;
    switch (e.key) {
      case "ArrowDown":
        if (!count) return;
        e.preventDefault();
        if (!showList) { setOpen(true); setActive(e.altKey ? -1 : 0); }
        else if (!e.altKey) setActive(i => (i + 1) % count);
        return;
      case "ArrowUp":
        if (!count) return;
        e.preventDefault();
        if (e.altKey) close();
        else if (!showList) { setOpen(true); setActive(count - 1); }
        else setActive(i => (i <= 0 ? count - 1 : i - 1));
        return;
      case "Enter": {
        const hit = showList && active >= 0 ? results[active] : undefined;
        if (hit) {
          e.preventDefault();
          if (!onSelect && (e.metaKey || e.ctrlKey)) openInNewTab(hit);
          else choose(hit);
        }
        else if (buttonLabel) {
          e.preventDefault();
          submit();
        }
        // without a search page to submit to, Enter opens the first suggestion
        else if (results[0] && trimmed) {
          e.preventDefault();
          choose(results[0]);
        }
        return;
      }
      case "Escape":
        // handled here, so that a dialog around the box (the navigation's panel) stays open
        if (showPopup) { e.preventDefault(); close(); }
        else if (onEscape) { e.preventDefault(); onEscape(); }
        else if (query) { e.preventDefault(); change(""); }
        return;
      case "Tab":
        // focus moves on as usual (to the Search button, or back); nothing is chosen
        close();
        return;
    }
  };

  return (
    <div
      ref={root}
      className={`${styles.search} ${size === "large" ? styles.large : ""} ${buttonLabel ? styles.withButton : ""} ${className}`}
      data-open={showPopup || undefined}
    >
      <input
        ref={input}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        className={styles.input}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        value={query}
        onChange={e => change(e.target.value)}
        onKeyDown={onKeyDown}
        // a click in the box brings back the suggestions it closed
        onClick={() => { if (trimmed && (results.length || status !== "idle")) setOpen(true); }}
        onBlur={e => { if (!root.current?.contains(e.relatedTarget as Node | null)) close(); }}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
      />
      {buttonLabel && (
        <a className={styles.button} href={`/search${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`}>{buttonLabel}</a>
      )}
      {/* a press in the list keeps the focus in the input, so the click that follows lands */}
      <div className={styles.popup} data-search-popup="" hidden={!showPopup} onMouseDown={e => e.preventDefault()}>
        <ul ref={list} id={listId} className={styles.listbox} role="listbox" aria-label="Suggestions" aria-busy={status === "loading"} hidden={!showList}>
          {results.map((hit, i) => (
            <li
              key={`${hit.dimension}-${hit.id}`}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              className={styles.option}
              data-search-option=""
              data-active={i === active || undefined}
              // the report family's colour (--geo, --soc, …) marks the highlighted suggestion
              style={{"--search-family": `var(--${hit.profile})`} as React.CSSProperties}
              onClick={e => { if (!onSelect && wantsNewTab(e)) openInNewTab(hit); else choose(hit); }}
              onAuxClick={e => { if (e.button === 1 && !onSelect) { e.preventDefault(); openInNewTab(hit); } }}
            >
              <img className={styles.optionIcon} src={`/icons/dimensions/${hit.dimension}.svg`} alt="" width={20} height={20} />
              <span className={styles.optionText}>
                <span className={styles.optionTitle}>{hit.name}</span>
                <span className={styles.optionLevel}>{hit.hierarchy}</span>
              </span>
            </li>
          ))}
        </ul>
        {message && <p className={styles.message} data-search-message={status}>{message}</p>}
      </div>
      <span className={styles.status} role="status" aria-live="polite" aria-atomic="true">{announcement}</span>
    </div>
  );
}
