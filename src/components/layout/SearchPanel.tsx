"use client";

import Link from "next/link";
import {SearchBox} from "@/components/search/SearchBox";
import styles from "./Nav.module.css";

/**
 * The search the navigation opens (its magnifier, or the "s" key anywhere on the site): a panel over
 * the top of the page with a large search box, closed by Escape (once the suggestions are closed),
 * the close button, a click on the page behind it, or the page changing (a suggestion chosen).
 */
export function SearchPanel({onClose}: {onClose: () => void}) {
  return (
    <>
      <div className={styles.searchBackdrop} onClick={onClose} />
      <div className={styles.searchPanel} role="dialog" aria-modal="true" aria-label="Search Data USA">
        <div className={styles.searchInner}>
          <SearchBox
            placeholder="Search reports: try “Boston”, “nurses” or “computer science”…"
            label="Search reports"
            buttonLabel="Search"
            size="large"
            autoFocus
            onEscape={onClose}
          />
          <p className={styles.searchHint}>
            <span>Press <kbd>S</kbd> on any page to search, <kbd>Esc</kbd> to close.</span>
            <span className={styles.searchLinks}>
              <Link href="/reports" onClick={onClose}>Browse all reports</Link>
              <Link href="/search" onClick={onClose}>Advanced search</Link>
            </span>
          </p>
        </div>
        <button type="button" className={styles.searchClose} aria-label="Close search" onClick={onClose}>×</button>
      </div>
    </>
  );
}
