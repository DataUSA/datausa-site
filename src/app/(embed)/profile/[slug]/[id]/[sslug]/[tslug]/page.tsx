import type {Metadata} from "next";
import {notFound, permanentRedirect} from "next/navigation";
import {loadMemberReport, splitComparisonQuery} from "@/lib/reports/load";
import {social} from "@/lib/seo/metadata";
import {clampSentences, plainText} from "@/lib/seo/report";
import {resolveReportUrl} from "@/lib/reports/resolve";
import type {SelectorQuery} from "@/lib/reports/engine";
import {groupSections} from "@/components/report/ReportPage";
import {ReportProvider} from "@/components/report/ReportProvider";
import {PrismProvider} from "@/components/prism/PrismProvider";
import {Topic} from "@/components/report/Topic";
import {getPrismUser} from "@/lib/prism/session";
import styles from "./embed.module.css";

interface PageProps {
  params: Promise<{slug: string; id: string; sslug: string; tslug: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const instant = false;

/**
 * A single chart of a report, made to sit in an iframe on another site. It is kept out of the index
 * and names its report as the canonical page; shared on its own it still gets a card with the
 * chart's title and figures.
 */
export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {slug, id, sslug, tslug} = await params;
  const resolved = resolveReportUrl(slug, id);
  if (resolved.status !== "ok") return {title: "Data USA"};
  const {report, member, built} = await loadMemberReport(slug, resolved.member);
  const topic = report.sections.find(s => s.slug === tslug);
  if (!topic) return {title: "Data USA"};
  const joiner = member.dimension === "Geography" ? "in" : "for";
  const name = String(built.variables.nameLower ?? built.variables.name ?? member.name);
  const title = `${plainText(topic.title)} ${joiner} ${name}`;
  const description = topic.descriptions[0] ? clampSentences(plainText(topic.descriptions[0].html), 320) : undefined;
  return {
    title,
    description,
    robots: {index: false, follow: true},
    alternates: {canonical: `/profile/${slug}/${member.slug}`},
    ...social({
      title,
      description,
      path: `/profile/${slug}/${member.slug}/${sslug}/${tslug}`,
      image: `/og/report/${slug}/${member.slug}?topic=${encodeURIComponent(tslug)}`,
      imageAlt: `${title}: figures from Data USA`,
      type: "article"
    })
  };
}

/** Single-topic embed (legacy `/profile/:slug/:id/:sslug/:tslug`); `?viz=true` shows the charts only. */
export default async function EmbedPage({params, searchParams}: PageProps) {
  const [{slug, id, sslug, tslug}, query] = await Promise.all([params, searchParams]);
  const resolved = resolveReportUrl(slug, id);
  if (resolved.status === "redirect") permanentRedirect(`${resolved.to}/${sslug}/${tslug}`);
  if (resolved.status !== "ok") notFound();
  const {primary} = splitComparisonQuery(query as SelectorQuery);
  const loaded = await loadMemberReport(slug, resolved.member, {query: primary});
  const groups = groupSections(loaded.report.sections);
  const group = groups.find(g => g.grouping.slug === sslug) ?? groups.find(g => g.topics.some(t => t.slug === tslug));
  const topic = group?.topics.find(t => t.slug === tslug);
  if (!topic) notFound();
  const prismUser = topic.type.startsWith("Prism") ? await getPrismUser() : null;
  return (
    <ReportProvider profileSlug={slug} primary={{variables: loaded.clientVariables, selectors: loaded.report.selectors, labels: loaded.report.labels, memberSlug: resolved.member.slug}}>
      <PrismProvider initialUserId={prismUser?.user_id ?? null}>
        <div id="Embed" className={styles.embed}>
          <Topic topic={topic} vizOnly={query.viz === "true"} prismLocked={prismUser === null} />
        </div>
      </PrismProvider>
    </ReportProvider>
  );
}
