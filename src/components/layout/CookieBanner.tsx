"use client";

import {useEffect, useRef} from "react";
import {hasConsentCookie, updateConsent} from "./Analytics";
import styles from "./CookieBanner.module.css";

const ENABLED = process.env.NEXT_PUBLIC_GDPR === "true";
const SERVICES = "Google Analytics";

/**
 * EU cookie notice (legacy Canon `#cookies-eu-banner`), shown as a modal that blocks the site until
 * the visitor accepts or rejects. Closing it (×, Escape or a click outside) counts as accepting.
 */
export function CookieBanner() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || hasConsentCookie() !== null) return;
    dialog.showModal();
    // The page behind the notice stays still until the visitor decides.
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    const unlock = () => { root.style.overflow = overflow; };
    dialog.addEventListener("close", unlock);
    return () => {
      dialog.removeEventListener("close", unlock);
      unlock();
    };
  }, []);

  if (!ENABLED) return null;

  const decide = (granted: boolean) => {
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `hasConsent=${granted}; expires=${expires}; path=/; SameSite=Lax`;
    updateConsent(granted);
    dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      id="cookies-eu-banner"
      className={styles.dialog}
      aria-labelledby="cookies-eu-title"
      // Escape closes the dialog; with no explicit choice that counts as accepting.
      onClose={() => { if (hasConsentCookie() === null) decide(true); }}
      // A click on the dialog element itself (not its content) is a click on the backdrop.
      onClick={e => { if (e.target === e.currentTarget) decide(true); }}
    >
      <div className={styles.content}>
        <button type="button" className={styles.close} aria-label="Close and accept cookies" onClick={() => decide(true)}>×</button>
        <h2 id="cookies-eu-title" className={styles.title}>Cookies</h2>
        <p className={styles.desc}>By continuing to visit this site, you accept to the use of cookies by {SERVICES} for statistical purposes.</p>
        <p className={styles.desc}>
          <a className={styles.more} href="https://cookienotice.deloitte.com/" target="_blank" rel="noopener noreferrer">Read More</a>
        </p>
        <p className={styles.note}>By closing this window, you consent to the use of cookies.</p>
        <div className={styles.actions}>
          <button type="button" className={styles.reject} onClick={() => decide(false)}>Reject</button>
          <button type="button" className={styles.accept} onClick={() => decide(true)} autoFocus>Accept</button>
        </div>
      </div>
    </dialog>
  );
}
