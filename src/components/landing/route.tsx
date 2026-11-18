/**
 * What the six landing routes share (`/locations/[[...path]]` and its siblings): each route file
 * names its family and takes its metadata and page from here. `path` is empty for the hub, one
 * segment for a level and two for a level in one state.
 */
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {connection} from "next/server";
import {cache, Suspense} from "react";
import {landingFamily, landingPath, pluralInSentence} from "@/content/landing/levels";
import {memberTotalsByHierarchy} from "@/lib/dimensions/db";
import {isPendingLevel} from "@/lib/geo/levels";
import {buildLandingModel, stateScope} from "@/lib/landing/model";
import {resolveLanding} from "@/lib/landing/resolve";
import {pageImage, social} from "@/lib/seo/metadata";
import {SITE_NAME} from "@/lib/seo/site";
import {HubPage, LandingPage, LandingSkeleton, type LandingQuery} from "./LandingPage";
import {landingHeading, landingLede, landingTitle} from "./text";

interface RouteProps {
  params: Promise<{path?: string[]}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// one model per request, shared by the metadata and the page
const model = cache((familySlug: string, levelSlug: string, stateSlug: string, brief = false) => {
  const family = landingFamily(familySlug)!;
  const level = family.levels.find(l => l.slug === levelSlug)!;
  return buildLandingModel(family, level, stateSlug ? stateScope(stateSlug) : undefined, brief);
});

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export function landingMetadata(familySlug: string) {
  return async function generateMetadata({params}: RouteProps): Promise<Metadata> {
    // rendered per request (figures are read through caches that keep time): a hub's address has no
    // parameter to wait for, so say so
    await connection();
    const resolved = resolveLanding(familySlug, (await params).path);
    if (!resolved) return {title: SITE_NAME};
    const {family, level, scope} = resolved;
    if (!level) {
      const path = landingPath(family);
      const title = `${family.label}: Browse U.S. ${family.label} by Level`;
      const description = `Browse Data USA's reports on ${family.about}. Compare the members of each level, see rankings and open any report.`;
      return {title, description, alternates: {canonical: path}, ...social({title, description, path, image: pageImage("search", {dimension: family.dimension}), imageAlt: `${family.label} | ${SITE_NAME}`})};
    }
    const data = await model(family.slug, level.slug, scope?.state.slug ?? "");
    const path = landingPath(family, level, scope?.state.slug);
    const title = landingTitle(family, level, data, scope);
    const description = `${landingLede(family, level, data, scope)} Compare ${pluralInSentence(level)} on a ${family.dimension === "Geography" ? "map" : "chart"}, see rankings and open any report.`;
    // a level without data yet stays out of search engines with its placeholder reports, and so
    // does a page with nothing to compare (one county, a territory without figures, or the data
    // API not answering: the page is then a bare list until the next request)
    const thin = isPendingLevel(level.hierarchy) || data.rows.length < 2 || !data.withData;
    return {
      title,
      description,
      alternates: {canonical: path},
      ...(thin ? {robots: {index: false, follow: true}} : {}),
      ...social({title: landingHeading(family, level, scope), description, path, image: pageImage("search", {dimension: family.dimension, hierarchy: level.hierarchy}), imageAlt: `${title} | ${SITE_NAME}`})
    };
  };
}

async function Content({familySlug, params, searchParams}: RouteProps & {familySlug: string}) {
  await connection();
  const resolved = resolveLanding(familySlug, (await params).path);
  if (!resolved) notFound();
  const {family, level, scope} = resolved;
  if (!level) {
    const levels = await Promise.all(family.levels
      .filter(l => memberTotalsByHierarchy()[family.dimension]?.[l.hierarchy])
      .map(async l => ({level: l, model: await model(family.slug, l.slug, "", true)})));
    return <HubPage family={family} levels={levels} />;
  }
  const raw = await searchParams;
  const query: LandingQuery = {sort: first(raw.sort), dir: first(raw.dir), page: first(raw.page)};
  return <LandingPage family={family} level={level} scope={scope} model={await model(family.slug, level.slug, scope?.state.slug ?? "")} query={query} />;
}

export function landingPage(familySlug: string) {
  return function LandingRoute(props: RouteProps) {
    return (
      <Suspense fallback={<LandingSkeleton family={landingFamily(familySlug)} />}>
        <Content familySlug={familySlug} {...props} />
      </Suspense>
    );
  };
}
