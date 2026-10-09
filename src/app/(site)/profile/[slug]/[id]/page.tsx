import type {Metadata} from "next";
import {notFound, permanentRedirect} from "next/navigation";
import {Suspense} from "react";
import {stripHTML} from "@/content/formatters";
import {decodeEntities} from "@/lib/formatting/html";
import {loadMemberReport, memberImageUrl, splitComparisonQuery} from "@/lib/reports/load";
import {resolveReportUrl} from "@/lib/reports/resolve";
import type {SelectorQuery} from "@/lib/reports/engine";
import {ReportPage} from "@/components/report/ReportPage";
import {ReportSkeleton} from "@/components/report/ReportSkeleton";

interface PageProps {
  params: Promise<{slug: string; id: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const SITE_URL = (process.env.SITE_URL ?? "https://datausa.io").replace(/\/$/, "");

/**
 * Reports are resolved per request (member lookup, redirects, 404s) before anything streams, so the
 * route is deliberately blocking rather than served from a prerendered shell.
 */
export const instant = false;

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {slug, id} = await params;
  const resolved = resolveReportUrl(slug, id);
  if (resolved.status !== "ok") return {title: "Data USA"};
  const {report, member} = await loadMemberReport(slug, resolved.member);
  const title = decodeEntities(stripHTML(report.title));
  const about = report.sections.find(s => s.slug === "about");
  const description = about?.descriptions[0] ? decodeEntities(stripHTML(about.descriptions[0].html)) : undefined;
  const canonical = `${SITE_URL}/profile/${slug}/${member.slug}`;
  return {
    title,
    description,
    alternates: {canonical},
    openGraph: {
      title: `${title} | Data USA`,
      description,
      type: "article",
      url: canonical,
      images: [memberImageUrl(slug, member.slug, "splash")]
    }
  };
}

async function Report({slug, memberSlug, searchParams}: {slug: string; memberSlug: string; searchParams: PageProps["searchParams"]}) {
  const query = await searchParams;
  const resolved = resolveReportUrl(slug, memberSlug);
  if (resolved.status !== "ok") notFound();
  const {primary, comparison} = splitComparisonQuery(query as SelectorQuery);
  const compareSlug = typeof query.compare === "string" ? query.compare : undefined;
  const compareResolved = compareSlug ? resolveReportUrl(slug, compareSlug) : undefined;
  const [loaded, compared] = await Promise.all([
    loadMemberReport(slug, resolved.member, {query: primary, print: query.print === "true"}),
    compareResolved?.status === "ok" ? loadMemberReport(slug, compareResolved.member, {query: comparison}) : Promise.resolve(undefined)
  ]);
  return <ReportPage loaded={loaded} comparison={compared} />;
}

export default async function ProfilePage({params, searchParams}: PageProps) {
  // Resolve the member before streaming so redirects and 404s carry real HTTP statuses.
  const {slug, id} = await params;
  const resolved = resolveReportUrl(slug, id);
  if (resolved.status === "redirect") permanentRedirect(resolved.to);
  if (resolved.status !== "ok") notFound();
  return (
    <Suspense fallback={<ReportSkeleton />}>
      <Report slug={slug} memberSlug={resolved.member.slug} searchParams={searchParams} />
    </Suspense>
  );
}
