"use client";

import {useEffect, useRef, useState, type ReactNode} from "react";

interface Topic {slug: string; title: string; sections: {slug: string; title: string}[]}

/**
 * Sticky table of contents built from the `h2[id]`/`h3[id]` headings of the sibling content, with the
 * current heading highlighted while scrolling (legacy `components/SideNav`).
 */
export function SideNav({children}: {children: ReactNode}) {
  const container = useRef<HTMLDivElement>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [active, setActive] = useState<{topic: string; section: string}>({topic: "", section: ""});

  useEffect(() => {
    const parent = container.current?.parentElement;
    if (!parent) return;
    const found: Topic[] = [];
    parent.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]").forEach(heading => {
      const title = heading.querySelector("a")?.textContent?.trim() || heading.textContent?.trim() || heading.id;
      if (heading.tagName === "H2") found.push({slug: heading.id, title, sections: []});
      else if (found.length) found[found.length - 1].sections.push({slug: heading.id, title});
    });
    setTopics(found);
    setActive({topic: found[0]?.slug ?? "", section: ""});

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        let topic = "", section = "";
        for (const t of found) {
          const el = document.getElementById(t.slug);
          if (el && el.getBoundingClientRect().top <= 1) {
            topic = t.slug;
            section = "";
            for (const s of t.sections) {
              const sel = document.getElementById(s.slug);
              if (sel && sel.getBoundingClientRect().top <= 1) section = s.slug;
            }
          }
        }
        setActive(prev => prev.topic === topic && prev.section === section ? prev : {topic: topic || found[0]?.slug || "", section});
      }, 10);
    };
    window.addEventListener("scroll", onScroll, {passive: true});
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(timer); };
  }, []);

  return (
    <div ref={container} id="SideNav">
      <div className="content">
        <h1>{children}</h1>
        {topics.length > 0 && (
          <ul>
            {topics.map(topic => (
              <li key={topic.slug} className={active.topic === topic.slug ? "active" : ""}>
                <a href={`#${topic.slug}`}>{topic.title}</a>
                {topic.sections.length > 0 && (
                  <ul>
                    {topic.sections.map(section => (
                      <li key={section.slug} className={active.section === section.slug ? "active" : ""}>
                        <a href={`#${section.slug}`}><span className="dot" aria-hidden="true" />{section.title}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
