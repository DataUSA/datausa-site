import hero from "./Hero.module.css";
import section from "./Section.module.css";
import stat from "./Stat.module.css";
import topic from "./Topic.module.css";
import styles from "./ReportSkeleton.module.css";

interface ReportSkeletonProps {
  /** Known before the report is computed: the member was resolved to answer redirects and 404s. */
  name: string;
  profileSlug: string;
  imageUrl: string;
  /** Familiar name of a congressional district, shown under the title like the finished hero. */
  tagline?: string;
  /** A placeholder report (a level with no data yet): the hero and About section only. */
  brief?: boolean;
}

const bar = (width: string, extra = "") => <span className={`${styles.block} ${styles.line} ${extra}`} style={{width}} />;

/** Widths of the text lines in a paragraph placeholder; the short last line reads as a paragraph end. */
const paragraph = ["100%", "96%", "99%", "93%", "97%", "62%"];
/** Heights of the bars in a chart placeholder. */
const bars = [38, 62, 49, 81, 70, 94, 58, 76, 45, 66, 87, 53];

function Lines({widths, dark = false}: {widths: string[]; dark?: boolean}) {
  return <div className={styles.lines}>{widths.map((w, i) => <span key={i} className={`${styles.block} ${styles.line} ${dark ? styles.onDark : ""}`} style={{width: w}} />)}</div>;
}

function TopicSkeleton({titleWidth}: {titleWidth: string}) {
  return (
    <div className={topic.topic}>
      <div className={topic.content}>
        <span className={`${styles.block} ${styles.topicTitle}`} style={{width: titleWidth}} />
        <div className={styles.topicStats}>
          {[0, 1].map(i => (
            <div key={i} className={styles.topicStat}>
              <span className={`${styles.block} ${styles.topicStatValue}`} />
              {bar("70%")}
            </div>
          ))}
        </div>
        <Lines widths={paragraph} />
      </div>
      <div className={`${topic.visualization} ${styles.chart}`}>
        {bars.map((h, i) => <span key={i} className={`${styles.block} ${styles.chartBar}`} style={{height: `${h}%`}} />)}
      </div>
    </div>
  );
}

/**
 * Streamed while a report is being computed. It reuses the report's own layout classes so the real
 * content replaces it in place: the member's name and photo are shown at once (both are known before
 * any data is fetched), and shimmering blocks stand in for the statistics, text and charts to come.
 */
export function ReportSkeleton({name, profileSlug, imageUrl, tagline, brief = false}: ReportSkeletonProps) {
  const statCount = brief ? 2 : profileSlug === "geo" ? 8 : 6;
  // Geography heroes show two officials (senators, representative) whose two-line names make the
  // first row taller; matching it keeps the title where the real hero will put it.
  const people = profileSlug === "geo" && !brief ? [1, 2] : [];
  return (
    <article className={styles.skeleton} aria-busy="true">
      <p className={styles.status} role="status">Loading {name}…</p>
      <header className={`${hero.hero} splash-${profileSlug} splash-${statCount}`}>
        <div className={hero.imageContainer}>
          <div className={hero.image} style={{backgroundImage: `url("${imageUrl}")`}} />
        </div>
        <div className={hero.content}>
          <h1 className={hero.title}>{name}</h1>
        </div>
        {tagline && <div className={hero.content}><p className={hero.tagline}>{tagline}</p></div>}
        <div className={hero.content}>
          <span className={`${styles.block} ${styles.onDark} ${styles.pill}`} />
        </div>
        <div className={hero.search} />
        <div className={hero.content}>
          <div className={hero.stats} aria-hidden="true">
            {Array.from({length: statCount}, (_, i) => (
              <div key={i} className={stat.stat}>
                <div className={styles.statTitle}>{bar("55%", styles.onDark)}</div>
                <div className={`${styles.statValue} ${people.includes(i) ? styles.statPerson : ""}`}><span className={`${styles.block} ${styles.onDark} ${styles.statNumber}`} /></div>
                <div className={styles.statTitle}>{bar("70%", styles.onDark)}</div>
              </div>
            ))}
          </div>
        </div>
      </header>
      {!brief && (
        <div className={styles.subnav} aria-hidden="true">
          {Array.from({length: 6}, (_, i) => <span key={i} className={`${styles.block} ${styles.onDark} ${styles.subnavItem}`} />)}
        </div>
      )}
      <section className={`${section.section} ${section.about}`} aria-hidden="true">
        <h2 className={`${section.sectionTitle} ${styles.aboutTitle}`}>About</h2>
        <div className={section.body}>
          <div className={section.sectionContent}>
            <div className={`${section.description} ${styles.aboutText}`}>
              <Lines widths={paragraph} dark />
              {!brief && (
                <>
                  <Lines widths={paragraph.slice(1)} dark />
                  <Lines widths={paragraph} dark />
                  <Lines widths={paragraph.slice(2)} dark />
                </>
              )}
            </div>
            <div className={section.visualizations}>
              {bar("60%", styles.onDark)}
              <span className={`${styles.block} ${styles.onDark} ${styles.map}`} />
            </div>
          </div>
        </div>
      </section>
      {!brief && (
        <section className={section.section} aria-hidden="true">
          <div className={section.sectionTitle}><span className={`${styles.block} ${styles.sectionTitle}`} /></div>
          <div className={section.body}>
            <div className={section.sectionContent}>
              <div className={`${section.description} ${styles.intro}`}><Lines widths={["100%", "97%", "58%"]} /></div>
            </div>
          </div>
          <div className={section.topics}>
            <TopicSkeleton titleWidth="62%" />
            <TopicSkeleton titleWidth="48%" />
          </div>
        </section>
      )}
    </article>
  );
}
