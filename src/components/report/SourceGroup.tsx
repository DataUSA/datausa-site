"use client";

import {useSources} from "@/components/viz/sources";
import styles from "./SourceGroup.module.css";

/**
 * "Data from <source> <dataset>." line under a topic, filled from the annotations of the data the
 * topic's charts loaded (legacy `SourceGroup.jsx`).
 */
export function SourceGroup({sectionSlug}: {sectionSlug: string}) {
  const sources = useSources(sectionSlug);
  if (!sources.length) return <div className={styles.sourceGroup} />;
  return (
    <div className={styles.sourceGroup}>
      Data from
      {sources.map((source, i) => {
        const org = source.source_name?.replace(/^(T|t)he\s/g, "");
        const dataset = source.dataset_name;
        return (
          <span key={`${org}-${dataset}-${i}`} className={styles.source}>
            {i > 0 && i === sources.length - 1 ? <span> and</span> : null}
            {org && <span>&nbsp;</span>}
            {org && (source.source_link
              ? <a href={source.source_link} target="_blank" rel="noopener noreferrer" title={source.source_description}>{org}</a>
              : <span title={source.source_description}>{org}</span>)}
            {dataset && <span>&nbsp;</span>}
            {dataset && (source.dataset_link
              ? <a href={source.dataset_link} target="_blank" rel="noopener noreferrer" title={source.dataset_description}>{dataset}</a>
              : <span title={source.dataset_description}>{dataset}</span>)}
            {i < sources.length - 1 && <span>,</span>}
          </span>
        );
      })}
      <span>.</span>
    </div>
  );
}
