"use client";

import {useEffect, useState} from "react";
import {hasConsentCookie, updateConsent} from "./Analytics";
import styles from "./CookieBanner.module.css";

const ENABLED = process.env.NEXT_PUBLIC_GDPR === "true";
const SERVICES = "Google Analytics";

/** EU cookie notice (legacy Canon `#cookies-eu-banner`), shown until the visitor accepts or rejects. */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ENABLED) return;
    setVisible(hasConsentCookie() === null);
  }, []);

  if (!visible) return null;

  const decide = (granted: boolean) => {
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `hasConsent=${granted}; expires=${expires}; path=/; SameSite=Lax`;
    updateConsent(granted);
    setVisible(false);
  };

  return (
    <div id="cookies-eu-banner" className={styles.banner} role="dialog" aria-label="Cookie notice">
      <span className={styles.desc}>By continuing to visit this site, you accept to the use of cookies by {SERVICES} for statistical purposes.</span>
      <a className={styles.more} href="https://cookienotice.deloitte.com/" target="_blank" rel="noopener noreferrer">Read More</a>
      <button type="button" className={styles.reject} onClick={() => decide(false)}>Reject</button>
      <button type="button" className={styles.accept} onClick={() => decide(true)}>Accept</button>
    </div>
  );
}
