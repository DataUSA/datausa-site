import {stripP} from "@/content/formatters";
import type {PreparedStat} from "@/lib/reports/engine";
import styles from "./Stat.module.css";

/** A headline statistic in the hero (legacy `Stat.jsx`). Candidate images get a name wrapper. */
export function Stat({stat}: {stat: PreparedStat}) {
  let {value} = stat;
  let l = value.length - 7;
  if (value.includes("candidate-image")) {
    l += 5;
    value = value
      .replace("</span></span>", "</span></span></span><span class='candidate-name'>")
      .replace("</p>", "</span></p>");
  }
  const size = l > 15 ? "small" : l > 10 ? "medium" : "large";
  return (
    <div className={`${styles.stat} ${styles[size]}`}>
      <div className={styles.title} dangerouslySetInnerHTML={{__html: stripP(stat.title)}} />
      <div className={styles.value} dangerouslySetInnerHTML={{__html: stripP(value)}} />
      <div className={styles.subtitle} dangerouslySetInnerHTML={{__html: stripP(stat.subtitle)}} />
    </div>
  );
}
