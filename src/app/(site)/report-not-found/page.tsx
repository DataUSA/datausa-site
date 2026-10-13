import type {Metadata} from "next";
import {notFound} from "next/navigation";

export const metadata: Metadata = {title: "Page Not Found", robots: {index: false, follow: true}};

/**
 * Target of the proxy's rewrite for unknown report URLs. Calling `notFound()` while prerendering
 * makes this a static response with a real 404 status and the site's not-found page, which a
 * streamed report page cannot produce once its shell has been sent (see `src/proxy.ts`).
 */
export default function ReportNotFoundPage() {
  notFound();
}
