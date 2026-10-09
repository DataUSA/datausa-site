import type {PreparedStat} from "@/lib/reports/engine";
import styles from "./StatGroup.module.css";

const sanitize = (html: string) => html
  .replace(/<p>/g, "").replace(/<\/p>/g, "")
  .replace(/\±/g, "<span class='plus-minus'>±</span>");

/** Statistics inside a topic, grouped by title (legacy `StatGroup.jsx`). */
export function StatGroup({title, stats}: {title: string; stats: PreparedStat[]}) {
  const multi = stats.length > 1;
  return (
    <div className={`${styles.group} ${multi ? styles.multi : styles.single}`}>
      {title && multi && <div className={styles.title} dangerouslySetInnerHTML={{__html: sanitize(title)}} />}
      {multi && (
        <ol className={styles.list}>
          {stats.map(stat => (
            <li key={stat.id}>
              <div className={styles.value} dangerouslySetInnerHTML={{__html: sanitize(stat.value)}} />
              <div className={styles.subtitle} dangerouslySetInnerHTML={{__html: sanitize(stat.subtitle)}} />
            </li>
          ))}
        </ol>
      )}
      {!multi && <div className={styles.value} dangerouslySetInnerHTML={{__html: sanitize(stats[0].value)}} />}
      {title && !multi && <div className={styles.title} dangerouslySetInnerHTML={{__html: sanitize(title)}} />}
      {!multi && <div className={styles.subtitle} dangerouslySetInnerHTML={{__html: sanitize(stats[0].subtitle)}} />}
    </div>
  );
}

/** Groups stats by their title preserving first-seen order (legacy d3-collection `nest().key(title)`). */
export function groupStats(stats: PreparedStat[]): {title: string; stats: PreparedStat[]}[] {
  const groups: {title: string; stats: PreparedStat[]}[] = [];
  for (const stat of stats) {
    const group = groups.find(g => g.title === stat.title);
    if (group) group.stats.push(stat);
    else groups.push({title: stat.title, stats: [stat]});
  }
  return groups;
}
