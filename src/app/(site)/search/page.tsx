import type {Metadata} from "next";
import {Suspense} from "react";
import {getProfiles, memberTotalsByHierarchy, searchMembers} from "@/lib/dimensions/db";
import {svgSymbolMarkup} from "@/lib/inline-svg";
import {SEARCH_DIMENSIONS, type SearchPageResult} from "@/content/search/dimensions";
import {SearchPageClient} from "./SearchPageClient";
import "./search.css";

export const metadata: Metadata = {
  title: "Search",
  description: "Find any of the 47,000+ Data USA reports on locations, industries, occupations, degrees, universities and products.",
  alternates: {canonical: "/search"}
};

const RESULT_LIMIT = 100;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

async function SearchContent({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const params = await searchParams;
  const q = first(params.q);
  const dimension = first(params.dimension);
  const hierarchy = first(params.hierarchy);
  const slugByDimension = Object.fromEntries(getProfiles().filter(p => p.ordering === 0).map(p => [p.dimension, p.slug]));
  // First result set is server-rendered so the page is useful before hydration (and for crawlers).
  const results: SearchPageResult[] = searchMembers(q, {dimension: dimension || undefined, hierarchy: hierarchy || undefined, limit: RESULT_LIMIT})
    .map(m => ({id: m.id, slug: m.slug, name: m.name, dimension: m.dimension, hierarchy: m.hierarchy, profile: slugByDimension[m.dimension] ?? "geo"}));
  // One sprite of the six dimension icons; every result references its symbol with <use>.
  const sprite = SEARCH_DIMENSIONS.map(d => svgSymbolMarkup(`/icons/dimensions/${d.icon}.svg`, `dim-${d.cls}`)).join("");
  return (
    <>
      <svg aria-hidden="true" style={{position: "absolute", width: 0, height: 0, overflow: "hidden"}} dangerouslySetInnerHTML={{__html: `<defs>${sprite}</defs>`}} />
      <SearchPageClient
        initialQuery={q}
        initialDimension={dimension}
        initialHierarchy={hierarchy}
        initialResults={results}
        totals={memberTotalsByHierarchy()}
        limit={RESULT_LIMIT}
      />
    </>
  );
}

/** Sitewide search page with the report-type filter panel (legacy `app/pages/SearchPage.jsx`). */
export default function SearchPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  return (
    <Suspense fallback={<div id="SearchPage" />}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
}
