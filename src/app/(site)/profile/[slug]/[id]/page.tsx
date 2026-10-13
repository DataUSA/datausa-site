import type {Metadata} from "next";
import {notFound, permanentRedirect} from "next/navigation";
import {Suspense} from "react";
import {JsonLd} from "@/components/seo/JsonLd";
import {getMember} from "@/lib/dimensions/db";
import {reportJsonLd} from "@/lib/seo/jsonld";
import {social} from "@/lib/seo/metadata";
import {plainText, reportDescription, reportTitle} from "@/lib/seo/report";
import {familyBySlug, SITE_URL} from "@/lib/seo/site";
import {imageMember, loadMemberReport, memberImageUrl, splitComparisonQuery} from "@/lib/reports/load";
import {resolveReportUrl} from "@/lib/reports/resolve";
import type {SelectorQuery} from "@/lib/reports/engine";
import {ReportPage} from "@/components/report/ReportPage";
import {ReportSkeleton} from "@/components/report/ReportSkeleton";
import {districtLabel} from "@/lib/dimensions/district-labels";
import {isPendingLevel} from "@/lib/geo/levels";

interface PageProps {
  params: Promise<{slug: string; id: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Reports are resolved per request (member lookup, redirects, 404s) before anything streams, so the
 * route is deliberately blocking rather than served from a prerendered shell.
 */
export const instant = false;

export async function generateMetadata({params, searchParams}: PageProps): Promise<Metadata> {
  const {slug, id} = await params;
  const resolved = resolveReportUrl(slug, id);
  if (resolved.status !== "ok") return {title: "Data USA"};
  const {report, member, built} = await loadMemberReport(slug, resolved.member);
  const family = familyBySlug(slug);
  const name = plainText(report.title) || member.name;
  // Comparison mode names both members ("Cambridge, MA & Beverly, MA"), as the legacy page did. A
  // comparison is a view of the first report: it keeps that report's canonical URL.
  const {compare} = await searchParams;
  const compared = typeof compare === "string" ? resolveReportUrl(slug, compare) : undefined;
  const other = compared?.status === "ok" && compared.member.id !== member.id ? compared.member : undefined;
  // The plain name is the share-card title, and what the nav bar shows once the hero has scrolled
  // away (`Nav` reads `og:title`); the `<title>` adds what the report covers.
  const cardTitle = other ? `${name} & ${other.name}` : name;
  const summary = reportDescription(family, report, member, typeof built.variables.nameLower === "string" ? built.variables.nameLower : undefined);
  const description = other ? `Compare ${name} and ${other.name} side by side on Data USA. ${summary}` : summary;
  const path = reportPath(slug, member.slug);
  return {
    title: other ? cardTitle : reportTitle(family, name, member),
    description,
    alternates: {canonical: path},
    // a placeholder report (its level has no data yet) stays out of search engines until it has content
    ...(isPendingLevel(member.hierarchy) ? {robots: {index: false, follow: true}} : {}),
    ...social({
      title: cardTitle,
      description,
      path,
      image: reportImage(slug, member.slug, other?.slug),
      imageAlt: `${cardTitle}: key figures from Data USA`,
      type: "article"
    })
  };
}

const reportPath = (slug: string, memberSlug: string) => `/profile/${slug}/${memberSlug}`;
const reportImage = (slug: string, memberSlug: string, compareSlug?: string) =>
  `/og/report/${slug}/${memberSlug}${compareSlug ? `?compare=${encodeURIComponent(compareSlug)}` : ""}`;

/** Locations inside one state (the id carries the state's FIPS code) name it in their breadcrumb trail. */
const IN_STATE = new Set(["County", "Place", "PUMA", "Congressional District", "School District"]);

/** Structured data of the report: the page, its breadcrumb trail and what it is about. */
function ReportJsonLd({slug, loaded}: {slug: string; loaded: Awaited<ReturnType<typeof loadMemberReport>>}) {
  const {report, member, built} = loaded;
  const family = familyBySlug(slug);
  const name = plainText(report.title) || member.name;
  const state = member.dimension === "Geography" && IN_STATE.has(member.hierarchy) ? getMember("Geography", `04000US${member.id.slice(7, 9)}`) : undefined;
  // a university's hero subtitle is its website
  const subtitle = plainText(report.sections.find(s => s.type === "Hero")?.subtitles[0]?.html);
  const website = member.dimension === "University" && /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(subtitle) ? `https://${subtitle}` : undefined;
  return (
    <JsonLd
      data={reportJsonLd({
        profileSlug: slug,
        member,
        name,
        title: reportTitle(family, name, member),
        description: reportDescription(family, report, member, typeof built.variables.nameLower === "string" ? built.variables.nameLower : undefined),
        image: `${SITE_URL}${reportImage(slug, member.slug)}`,
        state,
        website
      })}
    />
  );
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
  return (
    <>
      <ReportJsonLd slug={slug} loaded={loaded} />
      <ReportPage loaded={loaded} comparison={compared} />
    </>
  );
}

export default async function ProfilePage({params, searchParams}: PageProps) {
  // Resolve the member before streaming so redirects and 404s carry real HTTP statuses.
  const {slug, id} = await params;
  const resolved = resolveReportUrl(slug, id);
  if (resolved.status === "redirect") permanentRedirect(resolved.to);
  if (resolved.status !== "ok") notFound();
  return (
    <Suspense fallback={<ReportSkeleton name={resolved.member.name} profileSlug={slug} imageUrl={memberImageUrl(slug, imageMember(resolved.member).slug, "splash")} tagline={districtLabel(resolved.member.id)} brief={isPendingLevel(resolved.member.hierarchy)} />}>
      <Report slug={slug} memberSlug={resolved.member.slug} searchParams={searchParams} />
    </Suspense>
  );
}
