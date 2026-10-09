import {stripP} from "@/content/formatters";
import type {ReportView} from "./ReportPage";
import {Stat} from "./Stat";
import {HeroSearch} from "./HeroSearch";
import styles from "./Hero.module.css";

interface HeroProps {
  /** One report, or two in comparison mode. */
  reports: ReportView[];
  profileSlug: string;
  label: string;
  dimension: string;
}

/** The report header ("splash"): background photo(s), title(s), subtitle and headline statistics. */
export function Hero({reports, profileSlug, label, dimension}: HeroProps) {
  const statCount = reports[0].hero?.stats.length ?? 0;
  return (
    <header id="Splash" className={`${styles.hero} splash-${profileSlug} splash-${statCount}`}>
      <div className={styles.imageContainer}>
        {reports.map(r => <div key={r.loaded.member.id} className={styles.image} style={{backgroundImage: `url("${r.imageUrl}")`}} />)}
      </div>
      <div className={styles.content}>
        {reports.map(r => <h1 key={r.loaded.member.id} className={styles.title} dangerouslySetInnerHTML={{__html: stripP(r.loaded.report.title)}} />)}
      </div>
      <div className={styles.content}>
        {reports.map(r => {
          const subtitle = r.hero?.subtitles[0]?.html;
          return subtitle ? <div key={r.loaded.member.id} className={styles.subtitle} dangerouslySetInnerHTML={{__html: stripP(subtitle)}} /> : null;
        })}
      </div>
      <div className={styles.search}>
        <HeroSearch placeholder={`Search ${label.replace(/([A-z]$)/g, chr => chr === "y" ? "ies" : `${chr}s`)}`} dimension={dimension} />
      </div>
      <div className={styles.content}>
        {reports.map(r => (r.hero?.stats.length ? (
          <div key={r.loaded.member.id} className={styles.stats}>
            {r.hero.stats.map(stat => <Stat key={stat.id} stat={stat} />)}
          </div>
        ) : null))}
      </div>
    </header>
  );
}
