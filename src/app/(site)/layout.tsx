import {Suspense, type ReactNode} from "react";
import {Nav} from "@/components/layout/Nav";
import {Footer} from "@/components/layout/Footer";
import {Analytics} from "@/components/layout/Analytics";
import {CookieBanner} from "@/components/layout/CookieBanner";

/** Site chrome (navigation + footer) for every regular page; embeds use the bare root layout. */
export default function SiteLayout({children}: {children: ReactNode}) {
  return (
    <div id="App">
      <Suspense fallback={<div style={{height: "var(--nav-height)"}} />}>
        <Nav />
      </Suspense>
      {children}
      <Footer />
      <Suspense fallback={null}>
        <Analytics />
      </Suspense>
      <CookieBanner />
    </div>
  );
}
