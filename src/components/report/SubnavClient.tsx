"use client";

import {useEffect, useRef, useState} from "react";
import type {SubnavItem} from "./Subnav";
import styles from "./Subnav.module.css";

/**
 * Sticky section navigation. Renders fully on the server (links are plain anchors); the client
 * only adds the fixed-position behaviour and the active-section highlight on scroll.
 */
export function SubnavClient({items}: {items: SubnavItem[]}) {
  const [fixed, setFixed] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);
  const spacerHeight = useRef(50);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const hero = document.getElementById("Splash");
        const navHeight = 40;
        const topBorder = navHeight + (ref.current?.getBoundingClientRect().height ?? 45);
        const screenTop = window.scrollY + topBorder;
        const heroHeight = hero ? hero.getBoundingClientRect().height : 0;
        setFixed(screenTop > heroHeight);
        if (ref.current) spacerHeight.current = ref.current.getBoundingClientRect().height;
        let current: string | null = null;
        let currentChild: string | null = null;
        for (const item of items) {
          const el = document.getElementById(item.slug);
          if (el && Math.floor(el.getBoundingClientRect().top) <= topBorder) current = item.slug;
        }
        const section = items.find(i => i.slug === current);
        for (const child of section?.children ?? []) {
          const el = document.getElementById(child.slug);
          if (el && Math.floor(el.getBoundingClientRect().top) <= topBorder) currentChild = child.slug;
        }
        setActive(current);
        setActiveChild(currentChild);
      });
    };
    window.addEventListener("scroll", onScroll, {passive: true});
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  const activeItem = items.find(i => i.slug === active);

  return (
    <>
      <nav ref={ref} className={`${styles.subnav} ${fixed ? styles.fixed : ""}`} aria-label="Report sections">
        <ol className={styles.list}>
          {items.map(item => (
            <li
              key={item.slug}
              className={`${styles.item} ${active === item.slug || open === item.slug ? styles.active : ""}`}
              onMouseEnter={() => setOpen(item.slug)}
              onMouseLeave={() => setOpen(null)}
            >
              <a className={styles.link} href={`#${item.slug}`} onFocus={() => setOpen(item.slug)}>
                {item.iconMarkup && <span className={styles.icon} aria-hidden="true" dangerouslySetInnerHTML={{__html: item.iconMarkup}} />}
                {item.title}
              </a>
              {item.children.length > 0 && (
                <ul className={`${styles.groupList} ${open === item.slug ? styles.open : ""}`}>
                  {item.children.map(child => (
                    <li key={child.slug} className={styles.groupItem}>
                      <a className={styles.groupLink} href={`#${child.slug}`}>{child.title}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
        {activeItem && activeItem.children.length > 0 && fixed && (
          <ol className={`${styles.list} ${styles.secondary}`}>
            {activeItem.children.map(child => (
              <li key={child.slug} className={`${styles.item} ${activeChild === child.slug ? styles.active : ""}`}>
                <a className={styles.link} href={`#${child.slug}`}>{child.title}</a>
              </li>
            ))}
          </ol>
        )}
      </nav>
      <div className={styles.spacer} style={{height: fixed ? spacerHeight.current : 0}} />
    </>
  );
}
