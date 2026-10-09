"use client";

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useState} from "react";
import {SearchBox, type SearchHit} from "@/components/search/SearchBox";
import styles from "./Hero.module.css";

interface HeroSearchProps {
  placeholder: string;
  dimension: string;
}

/**
 * The "Add Comparison" control in the report header (legacy `CompareButton` + `Search`): a button
 * that reveals a member search; choosing a member opens the side-by-side comparison via `?compare=`.
 */
export function HeroSearch({placeholder, dimension}: HeroSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const comparing = Boolean(searchParams.get("compare"));

  const update = (compare: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (compare) params.set("compare", compare);
    else params.delete("compare");
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, {scroll: false});
  };

  const onSelect = (hit: SearchHit) => {
    setOpen(false);
    update(hit.slug || hit.id);
  };

  if (comparing) {
    return (
      <button type="button" className={styles.compare} onClick={() => update(null)}>
        <img className={styles.compareIcon} src="/images/icons/compare-active.svg" alt="" />
        <span className={styles.compareText}>Remove Comparison</span>
      </button>
    );
  }

  if (!open) {
    return (
      <button type="button" className={styles.compare} onClick={() => setOpen(true)}>
        <img className={styles.compareIcon} src="/images/icons/compare.svg" alt="" />
        <span className={styles.compareText}>Add Comparison</span>
      </button>
    );
  }

  return <SearchBox placeholder={placeholder} dimension={dimension} onSelect={onSelect} autoFocus />;
}
