"use client";

import {useRouter} from "next/navigation";
import {useId} from "react";

interface StateSelectProps {
  /** What a state's slug is appended to (`/universities/colleges/`). */
  base: string;
  /** The level's national page (`/universities`). */
  national: string;
  states: {slug: string; name: string}[];
  /** Slug of the state the page is about, or "" on the national page. */
  current: string;
  /** What the menu chooses among ("Counties"). */
  label: string;
}

/** A menu that takes the level's page to one state, or back to the whole country. */
export function StateSelect({base, national, states, current, label}: StateSelectProps) {
  const router = useRouter();
  const id = useId();
  return (
    <div className="landing-state-select">
      <label htmlFor={id}>{label} in</label>
      <select id={id} value={current} onChange={e => router.push(e.target.value ? `${base}${e.target.value}` : national)}>
        <option value="">All states</option>
        {states.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
      </select>
    </div>
  );
}
