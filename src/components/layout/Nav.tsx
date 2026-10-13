"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";
import {SearchBox} from "@/components/search/SearchBox";
import styles from "./Nav.module.css";

/** Fixed top navigation (legacy `Nav/index.jsx`): transparent over splash pages until scrolled. */
export function Nav() {
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [title, setTitle] = useState("");

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
  const showSearch = !(home || pathname.startsWith("/search"));

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
          <li><Link href="/search">Reports</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/about/api">Data</Link></li>
        </ul>
        {showSearch && <SearchBox placeholder="Search reports" collapsible />}
      </div>
      {menu && (
        <div className={styles.menu} role="dialog" aria-label="Site menu">
          <ul>
            {!home && <li><Link href="/" onClick={() => setMenu(false)}>Home</Link></li>}
            <li>
              <Link href="/search" onClick={() => setMenu(false)}>Reports</Link>
              <ul>
                <li><Link href="/search?dimension=Geography" onClick={() => setMenu(false)}>Locations</Link></li>
                <li><Link href="/search?dimension=PUMS Industry" onClick={() => setMenu(false)}>Industries</Link></li>
                <li><Link href="/search?dimension=PUMS Occupation" onClick={() => setMenu(false)}>Occupations</Link></li>
                <li><Link href="/search?dimension=CIP" onClick={() => setMenu(false)}>Degrees</Link></li>
                <li><Link href="/search?dimension=University" onClick={() => setMenu(false)}>Universities</Link></li>
                <li><Link href="/search?dimension=NAPCS" onClick={() => setMenu(false)}>Products &amp; Services</Link></li>
              </ul>
            </li>
            <li><Link href="/about" onClick={() => setMenu(false)}>About</Link></li>
            <li><Link href="/about/datasets" onClick={() => setMenu(false)}>Data Sources</Link></li>
          </ul>
          <button type="button" className={styles.menuClose} aria-label="Close menu" onClick={() => setMenu(false)}>×</button>
        </div>
      )}
      {menu && <div className={styles.backdrop} onClick={() => setMenu(false)} />}
    </nav>
  );
}
