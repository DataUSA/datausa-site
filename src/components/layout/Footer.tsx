import Link from "next/link";
import styles from "./Footer.module.css";

/** Site footer (legacy `Footer/index.jsx`). */
export function Footer() {
  return (
    <footer id="Footer" className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.links}>
          <img className={styles.logo} src="/images/logo_sm.png" alt="Data USA" />
          <p>Explore, map, compare, and download U.S. data</p>
          <div className={styles.column}>
            <div className={styles.linkColumn}><Link href="/">Home</Link></div>
            <div className={styles.linkColumn}><Link href="/search">Reports</Link></div>
            <div className={styles.linkColumn}><Link href="/about/background">About</Link></div>
          </div>
        </div>
        <div className={styles.contact}>
          <p className={styles.contactLabel}>Have Questions or Feedback?</p>
          <p className={styles.contactEmail}>
            Contact us at <a href="mailto:hello@datausa.io?subject=Data%20USA%20Feedback">hello@datausa.io</a>
          </p>
        </div>
      </div>
      <div className={styles.logos}>
        <a target="_blank" rel="noopener noreferrer" href="http://www2.deloitte.com/us/en.html">
          <img className={styles.deloitte} src="/images/footer/deloitte.png" alt="Deloitte" />
        </a>
        <a target="_blank" rel="noopener noreferrer" href="http://www.datawheel.us/">
          <img className={styles.datawheel} src="/images/footer/datawheel.png" alt="Datawheel" />
        </a>
      </div>
    </footer>
  );
}
