"use client";

import {usePathname} from "next/navigation";
import {usePrism, withPrismReferral} from "./PrismProvider";
import styles from "./Prism.module.css";

/** Deloitte PeoplePrism sponsor notice under a Prism topic (legacy `PrismSectionLayout.renderNotice`). */
export function PrismNotice({sectionSlug}: {sectionSlug: string}) {
  const pathname = usePathname() ?? "";
  const {userId} = usePrism();
  const prismUrl = withPrismReferral("https://peopleprism.ai/", {pathname, sectionSlug, userId});
  return (
    <aside className={styles.notice}>
      <img className={styles.noticeLogo} src="/images/footer/deloitte_dark.png" alt="Deloitte." />
      <p className={styles.noticeCall}>
        {"Deloitte's PeoplePrism™ harnesses "}
        <strong>predictive and geospatial analytics and one of the largest population insights datasets</strong>
        {" to provide actionable information on the environmental and social factors that influence health and quality of life for people and communities. "}
        <a href="mailto:PeoplePrism@deloitte.com">Contact Deloitte</a>
        {" for additional PeoplePrism data features, including distance to primary and specialized care."}
      </p>
      <a href={prismUrl} className={styles.noticeButton} target="_blank" rel="noopener noreferrer">More Info</a>
    </aside>
  );
}
