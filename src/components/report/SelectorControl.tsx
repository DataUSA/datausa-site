"use client";

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useTransition} from "react";
import type {PreparedSelector} from "@/lib/reports/engine";
import styles from "./Topic.module.css";

/**
 * A topic dropdown. Changing it updates the URL query (the legacy behaviour, so views are shareable)
 * and re-renders the report with the new selection. Comparison topics prefix their keys with
 * `compare_`.
 */
export function SelectorControl({selector, queryPrefix = ""}: {selector: PreparedSelector; queryPrefix?: string}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(`${queryPrefix}${selector.name}`, value);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, {scroll: false});
    });
  };

  const showTitle = selector.title && selector.title !== "New Selector";
  return (
    <div className={`${styles.select} ${pending ? styles.selectPending : ""}`}>
      {showTitle && <span className={styles.selectLabel}>{selector.title}</span>}
      <select value={selector.value} onChange={e => onChange(e.target.value)} disabled={pending} aria-label={selector.title || selector.name}>
        {selector.options.map(o => <option key={o.option} value={o.option}>{o.label}</option>)}
      </select>
    </div>
  );
}
