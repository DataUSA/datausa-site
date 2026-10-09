import {sectionIconMarkup} from "./Subnav";
import {stripP} from "@/content/formatters";
import type {PreparedSection} from "@/lib/reports/engine";
import {Topic} from "./Topic";
import styles from "./Section.module.css";

interface ComparisonGroup {
  grouping?: PreparedSection;
  topics: PreparedSection[];
  title: string;
  primaryTitle: string;
  joiner: string;
}

/** Appends " in <place>" to a topic title in comparison mode (legacy `titleCompare`). */
function compareTitle(title: string, joiner: string, name: string): string {
  return title.includes("</p>") ? title.replace("</p>", ` ${joiner} ${name}</p>`) : `${title} ${joiner} ${name}`;
}

/** A top-level report section (legacy "Grouping"): title, intro text, then its topics. */
export function GroupingSection({grouping, topics, comparison, prismLocked = true}: {grouping: PreparedSection; topics: PreparedSection[]; comparison?: ComparisonGroup; prismLocked?: boolean}) {
  const groupings = [grouping, ...(comparison?.grouping ? [comparison.grouping] : [])];
  return (
    <section className={`${styles.section} ${grouping.slug} ${comparison ? styles.compareSection : ""}`} id={grouping.slug}>
      <h2 className={styles.sectionTitle}>
        {sectionIconMarkup(grouping.icon) && <span className={styles.sectionIcon} aria-hidden="true" dangerouslySetInnerHTML={{__html: sectionIconMarkup(grouping.icon)}} />}
        <a className="anchor" href={`#${grouping.slug}`} dangerouslySetInnerHTML={{__html: stripP(grouping.title)}} />
      </h2>
      <div className={styles.body}>
        {groupings.map((g, i) => (
          <div key={g.id + i} className={styles.sectionContent}>
            <div className={styles.description}>
              {g.descriptions.map(d => <div key={d.id} dangerouslySetInnerHTML={{__html: d.html}} />)}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.topics}>
        {topics.map(topic => {
          if (!comparison) return <Topic key={topic.id} topic={topic} prismLocked={prismLocked} />;
          const twin = comparison.topics.find(t => t.id === topic.id);
          return (
            <div key={topic.id} className={`${styles.topicPair} topic-pair`}>
              <Topic topic={{...topic, title: compareTitle(topic.title, comparison.joiner, comparison.primaryTitle)}} />
              {twin && <Topic topic={{...twin, title: compareTitle(twin.title, comparison.joiner, comparison.title)}} which="comparison" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
