import styles from "./ReportSkeleton.module.css";

/** Minimal layout-preserving placeholder streamed while a report is being computed. */
export function ReportSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-live="polite">
      <div className={styles.hero} />
      <div className={styles.block} />
      <div className={styles.block} />
    </div>
  );
}
