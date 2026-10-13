import Link from "next/link";
import type {ImageRow} from "@/lib/dimensions/db";
import type {PreparedSection} from "@/lib/reports/engine";
import {VizIsland} from "@/components/viz/VizIsland";
import styles from "./Section.module.css";

interface AboutProps {
  /** One section, or two in comparison mode. */
  sections: PreparedSection[];
  breadcrumbs: {id: string; slug: string; name: string}[][];
  images: (ImageRow | undefined)[];
  profileSlug: string;
}

/** The "About" section: narrative, photo credit, breadcrumbs and any introductory visualization. */
export function AboutSection({sections, breadcrumbs, images, profileSlug}: AboutProps) {
  return (
    <section className={`${styles.section} ${styles.about} ${sections.length > 1 ? styles.compareSection : ""}`} id="about">
      <h2 className={styles.sectionTitle}>
        <a className="anchor" href="#about">About</a>
      </h2>
      <div className={styles.body}>
        {sections.map((section, i) => {
          const image = images[i];
          const crumbs = breadcrumbs[i] ?? [];
          return (
            <div key={section.id + i} className={styles.sectionContent}>
              <div className={styles.description}>
                {section.descriptions.map(d => <div key={d.id} dangerouslySetInnerHTML={{__html: d.html}} />)}
                {image?.meta && <div className={styles.imageMeta}>About the photo: <span>{image.meta}</span></div>}
              </div>
              <div className={styles.visualizations}>
                {image?.url && (
                  <a className={styles.photoAttribution} href={image.url} target="_blank" rel="noopener noreferrer">
                    <img src="/images/icons/camera.svg" alt="" width={12} height={12} />Photo by {image.author}
                  </a>
                )}
                {crumbs.length > 0 && (
                  <nav className={styles.breadcrumbs} aria-label="Parent geographies">
                    <img src="/images/go-to-link.svg" alt="" />
                    <div className={styles.links}>
                      {crumbs.map(b => (
                        <Link key={b.slug || b.id} className={styles.bread} href={`/profile/${profileSlug}/${b.slug || b.id}`}>{b.name}</Link>
                      ))}
                    </div>
                  </nav>
                )}
                {section.visualizations.map(viz => (
                  <VizIsland key={viz.id} vizId={viz.id} sectionSlug={section.slug} which={i === 0 ? "primary" : "comparison"} title="About" options={false} className={styles.sectionVisualization} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
