"use client";

import {usePathname} from "next/navigation";
import {useEffect} from "react";

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function hasConsentCookie(): boolean | null {
  const match = /(?:^|; )hasConsent=([^;]*)/.exec(document.cookie);
  if (!match) return null;
  return decodeURIComponent(match[1]) === "true";
}

/**
 * Google Analytics 4 with Consent Mode (legacy `App.jsx` behaviour): consent defaults come from the
 * `hasConsent` cookie set by the cookie banner, the tag loads after the page is interactive, and a
 * `page_view` is sent for the initial load and every client-side navigation.
 */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!MEASUREMENT_ID) return;
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments); // eslint-disable-line prefer-rest-params
      };
      const granted = hasConsentCookie() === true;
      const state = granted ? "granted" : "denied";
      window.gtag("consent", "default", {ad_storage: state, ad_user_data: state, ad_personalization: state, analytics_storage: state, wait_for_update: 500});
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
      document.body.appendChild(script);
      window.gtag("js", new Date());
      window.gtag("config", MEASUREMENT_ID, {send_page_view: false});
    }
    window.gtag("event", "page_view", {page_location: window.location.href, page_path: pathname});
  }, [pathname]);

  return null;
}

/** Updates Google consent signals after the visitor accepts or rejects cookies. */
export function updateConsent(granted: boolean) {
  const state = granted ? "granted" : "denied";
  window.gtag?.("consent", "update", {ad_storage: state, ad_user_data: state, ad_personalization: state, analytics_storage: state});
}
