"use client";

import {useId, useState} from "react";

interface RowFilterProps {
  /** Id of the element whose rows are filtered. */
  target: string;
  placeholder: string;
}

/**
 * Narrows a server-rendered list to the rows whose name contains what is typed. The rows stay in
 * the page's HTML (they are the list search engines read); this only hides the ones that do not
 * match: each row carries its name in `data-name`, and a group (`data-group`) with no row left is
 * hidden with them.
 */
export function RowFilter({target, placeholder}: RowFilterProps) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState<number | null>(null);
  const id = useId();

  const apply = (value: string) => {
    setQuery(value);
    const root = document.getElementById(target);
    if (!root) return;
    const terms = value.toLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const row of root.querySelectorAll<HTMLElement>("[data-name]")) {
      const name = row.dataset.name ?? "";
      const match = terms.every(term => name.includes(term));
      row.hidden = !match;
      if (match) count++;
    }
    for (const group of root.querySelectorAll<HTMLElement>("[data-group]")) {
      group.hidden = !group.querySelector("[data-name]:not([hidden])");
    }
    setShown(terms.length ? count : null);
  };

  return (
    <div className="landing-filter">
      <label htmlFor={id} className="landing-visually-hidden">{placeholder}</label>
      <input id={id} type="search" value={query} placeholder={placeholder} autoComplete="off" onChange={e => apply(e.target.value)} />
      <span className="landing-filter-count" aria-live="polite">{shown === null ? "" : `${shown.toLocaleString("en-US")} match${shown === 1 ? "" : "es"}`}</span>
    </div>
  );
}
