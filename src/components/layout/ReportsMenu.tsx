"use client";

import Link from "next/link";
import {useEffect, useId, useRef, useState} from "react";
import {LANDING_FAMILIES, landingPath} from "@/content/landing/levels";
import styles from "./Nav.module.css";

/**
 * "Reports" in the navigation bar: a menu of the six report families. A mouse opens it by hovering;
 * a tap, a click or Enter opens it the first time and goes to `/reports` the second, so "Reports"
 * itself still leads to the page of all reports. Arrow down moves into the menu, Escape closes it.
 */
export function ReportsMenu({pathname}: {pathname: string}) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState(pathname);
  const item = useRef<HTMLLIElement>(null);
  const link = useRef<HTMLAnchorElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const id = useId();

  // a new page closes the menu
  if (path !== pathname) {
    setPath(pathname);
    setOpen(false);
  }

  const show = () => { window.clearTimeout(timer.current); setOpen(true); };
  // a short delay, so that crossing the gap between "Reports" and the menu does not close it
  const hide = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(false), 200); };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!item.current?.contains(e.target as Node)) setOpen(false); };
    const escape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      if (item.current?.contains(document.activeElement)) link.current?.focus();
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const current = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <li
      ref={item}
      className={styles.reportsItem}
      onPointerEnter={e => { if (e.pointerType === "mouse") show(); }}
      onPointerLeave={e => { if (e.pointerType === "mouse") hide(); }}
      onBlur={e => { if (!item.current?.contains(e.relatedTarget as Node | null)) setOpen(false); }}
    >
      <Link
        ref={link}
        href="/reports"
        className={`${styles.reportsLink} ${open ? styles.reportsLinkOpen : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
        onClick={e => { if (!open) { e.preventDefault(); show(); } }}
        onKeyDown={e => {
          if (e.key !== "ArrowDown") return;
          e.preventDefault();
          show();
          requestAnimationFrame(() => document.getElementById(id)?.querySelector("a")?.focus());
        }}
      >
        Reports<span className={styles.caret} aria-hidden="true" />
      </Link>
      {open && (
        // any link chosen closes the menu (the page may not change: the menu's own page)
        <div id={id} className={styles.reportsPanel} onClick={e => { if ((e.target as Element).closest("a")) setOpen(false); }}>
          <ul className={styles.families}>
            {LANDING_FAMILIES.map(family => {
              const href = landingPath(family);
              return (
                <li key={family.slug}>
                  <Link
                    href={href}
                    className={styles.family}
                    style={{"--family": `var(--${family.profile})`} as React.CSSProperties}
                    aria-current={current(href) ? "page" : undefined}
                  >
                    <span className={styles.familyIcon} style={{maskImage: `url("/icons/dimensions/${family.dimension}.svg")`, WebkitMaskImage: `url("/icons/dimensions/${family.dimension}.svg")`}} aria-hidden="true" />
                    <span className={styles.familyText}>
                      <span className={styles.familyName}>{family.label}</span>
                      <span className={styles.familyTagline}>{family.tagline}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className={styles.reportsFoot}>
            <Link href="/reports" aria-current={pathname === "/reports" ? "page" : undefined}>All reports <span aria-hidden="true">→</span></Link>
            <Link href="/search">Advanced search</Link>
          </div>
        </div>
      )}
    </li>
  );
}
