"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useCallback, useEffect, useRef, useState} from "react";
import {ReportsMenu} from "./ReportsMenu";
import {SearchPanel} from "./SearchPanel";
import styles from "./Nav.module.css";

/** Where a typed "s" is text, not the search shortcut. */
const isTyping = (target: EventTarget | null) => target instanceof HTMLElement
  && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/** Fixed top navigation (legacy `Nav/index.jsx`): transparent over splash pages until scrolled. */
export function Nav() {
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState(false);
  const [path, setPath] = useState(pathname);
  const searchButton = useRef<HTMLButtonElement>(null);

  // a new page closes the search
  if (path !== pathname) {
    setPath(pathname);
    setSearch(false);
  }

  // "s" anywhere opens the search, unless it is being typed somewhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "s" && e.key !== "S") return;
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing || isTyping(e.target)) return;
      e.preventDefault();
      setMenu(false);
      setSearch(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const closeSearch = useCallback(() => {
    setSearch(false);
    // back to the magnifier, for keyboard users
    requestAnimationFrame(() => searchButton.current?.focus({preventScroll: true}));
  }, []);

  // Escape closes it wherever the focus is in the panel; when the box has used the key (to close
  // its suggestions first) the panel stays
  useEffect(() => {
    if (!search) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !e.defaultPrevented) closeSearch(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [search, closeSearch]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 45);
    onScroll();
    window.addEventListener("scroll", onScroll, {passive: true});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On report pages the bar shows the report title once the hero has scrolled away.
  useEffect(() => {
    if (!pathname.startsWith("/profile/")) return;
    // The share-card title is the report's plain name (two names in a comparison); the <title>
    // itself goes on to list what the report covers.
    const read = () => setTitle(
      document.querySelector<HTMLMetaElement>("meta[property='og:title']")?.content
      || document.title.replace(/\s*\|\s*Data USA\s*$/, "")
    );
    // Next streams the metadata in and may replace the <title> element, so watch the whole head.
    const observer = new MutationObserver(read);
    observer.observe(document.head, {attributes: true, childList: true, characterData: true, subtree: true});
    const initial = setTimeout(read, 0);
    return () => { clearTimeout(initial); observer.disconnect(); };
  }, [pathname]);

  const home = pathname === "/";
  const splash = home || pathname.startsWith("/profile");
  const dark = !splash;
  const background = scrolled || dark;

  return (
    <nav id="Nav" className={`${styles.nav} ${background ? styles.background : ""} ${menu ? styles.menuOpen : ""}`}>
      <div className={styles.left}>
        <button type="button" className={styles.menuButton} aria-label="Menu" onClick={() => setMenu(m => !m)}>
          <img src="/images/hamburger.svg" width={21} height={16} alt="" />
        </button>
        {(!home || background) && (
          <Link href="/" className={styles.home}>
            <img src="/images/logo_sm.png" alt="Data USA" />
          </Link>
        )}
        {title && background && pathname.startsWith("/profile/") && <span className={styles.subtitle}>{title}</span>}
      </div>
      <div className={styles.right}>
        <ul className={styles.links}>
          <ReportsMenu pathname={pathname} />
          <li><Link href="/about">About</Link></li>
          <li><Link href="/about/api">Data</Link></li>
        </ul>
        <button
          ref={searchButton}
          type="button"
          className={styles.searchButton}
          aria-label="Search"
          aria-keyshortcuts="s"
          aria-expanded={search}
          title="Search (S)"
          onClick={() => { setMenu(false); setSearch(true); }}
        >
          <img src="/images/icons/search.svg" alt="" width={18} height={18} />
        </button>
      </div>
      {menu && (
        <div className={styles.menu} role="dialog" aria-label="Site menu">
          <ul>
            {!home && <li><Link href="/" onClick={() => setMenu(false)}>Home</Link></li>}
            <li>
              <Link href="/reports" onClick={() => setMenu(false)}>Reports</Link>
              <ul>
                <li><Link href="/locations" onClick={() => setMenu(false)}>Locations</Link></li>
                <li><Link href="/industries" onClick={() => setMenu(false)}>Industries</Link></li>
                <li><Link href="/occupations" onClick={() => setMenu(false)}>Occupations</Link></li>
                <li><Link href="/degrees" onClick={() => setMenu(false)}>Degrees</Link></li>
                <li><Link href="/universities" onClick={() => setMenu(false)}>Universities</Link></li>
                <li><Link href="/products" onClick={() => setMenu(false)}>Products &amp; Services</Link></li>
              </ul>
            </li>
            <li><Link href="/about" onClick={() => setMenu(false)}>About</Link></li>
            <li><Link href="/about/datasets" onClick={() => setMenu(false)}>Data Sources</Link></li>
          </ul>
          <button type="button" className={styles.menuClose} aria-label="Close menu" onClick={() => setMenu(false)}>×</button>
        </div>
      )}
      {menu && <div className={styles.backdrop} onClick={() => setMenu(false)} />}
      {search && <SearchPanel onClose={closeSearch} />}
    </nav>
  );
}
