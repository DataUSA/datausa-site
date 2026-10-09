import {stripP} from "@/content/formatters";
import type {PreparedSection} from "@/lib/reports/engine";
import {VizIsland} from "@/components/viz/VizIsland";
import {PrismNotice} from "@/components/prism/PrismNotice";
import {PrismGate} from "@/components/prism/PrismGate";
import {SelectorControl} from "./SelectorControl";
import {SourceGroup} from "./SourceGroup";
import {StatGroup, groupStats} from "./StatGroup";
import styles from "./Topic.module.css";

interface TopicProps {
  topic: PreparedSection;
  /** Which report's variables the charts use (comparison mode renders topics twice). */
  which?: "primary" | "comparison";
  /** Embed mode with `?viz=true`: hide the text and show only the charts. */
  vizOnly?: boolean;
  /** Gated Prism topics show placeholder statistics until the visitor registers. */
  prismLocked?: boolean;
}

/**
 * A topic inside a Grouping. Mirrors the legacy TextViz / Column / Default / SubGrouping layouts:
 * title, subtitles, selectors, stats, descriptions, then one or more charts. The first chart of a
 * multi-chart TextViz topic is a small "mini viz" rendered beside the text. Prism topics add the
 * sponsor notice and, for the gated form variant, lock their content until the visitor registers.
 */
export function Topic({topic, which = "primary", vizOnly = false, prismLocked = true}: TopicProps) {
  const Heading = topic.type === "SubGrouping" || topic.type === "Column" ? "h3" : "h4";
  const vizzes = topic.visualizations;
  const isTextViz = topic.type === "TextViz" || topic.type === "Default" || topic.type.startsWith("Prism");
  const miniviz = isTextViz && vizzes.length > 1 ? vizzes[0] : null;
  const mainviz = miniviz ? vizzes.slice(1) : vizzes;
  const locked = topic.type === "PrismSectionForm" && prismLocked;
  // Legacy behaviour: locked topics never send the real facility names to the browser.
  const statGroups = groupStats(locked
    ? topic.stats.map((s, i) => ({...s, value: "<p>Health Practice Name</p>", subtitle: `<p class="stat-subtitle">12345 Community Center Dr., Hayward, CA 94540 Census Tract # 400${i + 1}</p>`}))
    : topic.stats);
  const selectors = topic.selectors.filter(s => s.options.length > 1);
  const isPrism = topic.type.startsWith("Prism");
  const compareKey = which === "comparison" ? "compare_" : "";
  const sectionKey = which === "comparison" ? `${topic.slug}_compare` : topic.slug;

  const body = (
    <div className={`${styles.topic} ${styles[topic.type] ?? ""} ${topic.slug}`} id={which === "comparison" ? `${topic.slug}-compare` : topic.slug}>
      <div className={styles.content}>
        {topic.title && (
          <Heading className={styles.title}>
            <a className="anchor" href={`#${topic.slug}`} dangerouslySetInnerHTML={{__html: stripP(topic.title)}} />
          </Heading>
        )}
        {topic.subtitles.map(s => <div key={s.id} className={styles.subtitle} dangerouslySetInnerHTML={{__html: stripP(s.html)}} />)}
        {selectors.map(selector => <SelectorControl key={selector.name} selector={selector} queryPrefix={compareKey} />)}
        {!vizOnly && statGroups.length > 0 && (
          <div className={styles.stats}>
            {statGroups.map(group => <StatGroup key={group.title} title={group.title} stats={group.stats} />)}
          </div>
        )}
        {!vizOnly && (
          <div className={styles.descriptions}>
            {topic.descriptions.map(d => <div key={d.id} className={styles.description} dangerouslySetInnerHTML={{__html: d.html}} />)}
          </div>
        )}
        {miniviz && <VizIsland vizId={miniviz.id} sectionSlug={sectionKey} which={which} title={stripP(topic.title)} className={styles.miniviz} />}
        <SourceGroup sectionSlug={sectionKey} />
      </div>
      {mainviz.map(viz => (
        <VizIsland key={viz.id} vizId={viz.id} sectionSlug={sectionKey} which={which} title={stripP(topic.title)} className={styles.visualization} />
      ))}
    </div>
  );

  if (!isPrism) return body;
  return (
    <div className={styles.prismContainer}>
      <div className={styles.prismSection}>
        {topic.type === "PrismSectionForm" ? <PrismGate sectionSlug={topic.slug}>{body}</PrismGate> : body}
        <PrismNotice sectionSlug={topic.slug} />
      </div>
    </div>
  );
}
