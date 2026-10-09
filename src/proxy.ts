/**
 * Request-time URL checks that must happen before a page starts streaming, so the response can
 * carry a real HTTP status (Next.js fixes the status once the static shell is sent):
 *
 *  - `/profile/:slug/:id` and embeds: legacy crosswalk and raw-id redirects answer 308; unknown
 *    profiles, members or sections are rewritten to a static 404 route.
 *  - `/about/classifications/:dimension/:hierarchy`: unknown levels get the same 404.
 *
 * Runs on the Node.js runtime (Next 16 default), so it can read the SQLite dimensions database
 * directly; lookups are indexed primary-key reads.
 */
import {NextResponse, type NextRequest} from "next/server";
import {getTemplate} from "@/content/registry";
import {memberTotalsByHierarchy} from "@/lib/dimensions/db";
import {resolveReportUrl} from "@/lib/reports/resolve";

const NOT_FOUND_ROUTE = "/report-not-found";

let classificationLevels: Set<string> | null = null;
function hasClassification(dimension: string, hierarchy: string): boolean {
  if (!classificationLevels) {
    classificationLevels = new Set();
    for (const [dim, levels] of Object.entries(memberTotalsByHierarchy())) {
      for (const level of Object.keys(levels)) classificationLevels.add(`${dim}\u0000${level}`);
    }
  }
  return classificationLevels.has(`${dimension}\u0000${hierarchy}`);
}

function decode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  }
  catch {
    return segment;
  }
}

export function proxy(request: NextRequest) {
  const {pathname, search} = request.nextUrl;
  const parts = pathname.split("/").filter(Boolean).map(decode);

  if (parts[0] === "profile" && (parts.length === 3 || parts.length === 5)) {
    const [, slug, id, sslug, tslug] = parts;
    const resolved = resolveReportUrl(slug, id);
    if (resolved.status === "redirect") {
      const to = parts.length === 5 ? `${resolved.to}/${encodeURIComponent(sslug)}/${encodeURIComponent(tslug)}` : resolved.to;
      return NextResponse.redirect(new URL(`${to}${search}`, request.url), 308);
    }
    if (resolved.status !== "ok") return NextResponse.rewrite(new URL(NOT_FOUND_ROUTE, request.url));
    if (parts.length === 5) {
      const template = getTemplate(slug);
      if (!template?.sections.some(s => s.slug === tslug)) return NextResponse.rewrite(new URL(NOT_FOUND_ROUTE, request.url));
    }
    return NextResponse.next();
  }

  if (parts[0] === "about" && parts[1] === "classifications" && parts.length === 4) {
    if (!hasClassification(parts[2], parts[3])) return NextResponse.rewrite(new URL(NOT_FOUND_ROUTE, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:slug/:id", "/profile/:slug/:id/:sslug/:tslug", "/about/classifications/:dimension/:hierarchy"]
};
