"use client";

import type {ReactNode} from "react";
import {usePrism} from "./PrismProvider";
import styles from "./Prism.module.css";

/**
 * Wraps a gated Prism topic. The server renders placeholder statistics while the visitor is not
 * registered; this component only marks the state for styling and exposes the "unlock" action to
 * the map inside it.
 */
export function PrismGate({children, sectionSlug}: {children: ReactNode; sectionSlug: string}) {
  const {unlocked} = usePrism();
  return (
    <div className={unlocked ? styles.unlocked : styles.locked} data-section-locked={unlocked ? "false" : "true"} data-section={sectionSlug}>
      {children}
    </div>
  );
}
