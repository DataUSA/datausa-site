import type {Metadata} from "next";
import {Suspense} from "react";
import {memberTotalsByHierarchy} from "@/lib/dimensions/db";
import {isPendingLevel} from "@/lib/geo/levels";
import {searchReports} from "@/lib/search/reports";
import {svgSymbolMarkup} from "@/lib/inline-svg";
import {SEARCH_DIMENSIONS} from "@/content/search/dimensions";
import {pageImage, social, staticMetadata} from "@/lib/seo/metadata";
import {familyByDimension, inSentence, levelPlural, searchPath, SITE_NAME} from "@/lib/seo/site";
import {SearchPageClient} from "./SearchPageClient";
import "./search.css";

const RESULT_LIMIT = 100;
const commas = new Intl.NumberFormat("en-US");

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/**
 * Three kinds of search URL: the bare page, a browsable level (`?dimension=Geography&hierarchy=County`,
 * a landing page in its own right with a self-canonical URL) and typed queries, which are kept out
 * of the index (their titles would echo whatever was typed) and point at what they filter.
 */
export async function generateMetadata({searchParams}: {searchParams: SearchParams}): Promise<Metadata> {
  const params = await searchParams;
  const q = first(params.q).trim();
  const dimension = first(params.dimension);
  const hierarchy = first(params.hierarchy);
  const base = staticMetadata("search");
  const family = familyByDimension(dimension);
  const levels = family ? memberTotalsByHierarchy()[dimension] : undefined;
  const level = levels && hierarchy && levels[hierarchy] ? hierarchy : "";

  let metadata: Metadata = base;
  if (family && levels) {
    const total = level ? levels[level] : Object.values(levels).reduce((a, b) => a + b, 0);
    const what = level ? levelPlural(level) : family.label;
    // a level without data yet (school districts) is listed by name, and stays out of search
    // engines with its placeholder reports
    const pending = isPendingLevel(level);
    const ranked = dimension === "Geography" && Boolean(level) && total > 1 && !pending;
    const path = searchPath(dimension, level || undefined);
    const title = total > 1 ? `${commas.format(total)} ${what}${ranked ? " Ranked by Population" : `: Browse ${family.singular} Reports`}` : `${what}: Browse ${family.singular} Reports`;
    const description = pending
      ? `Find any of the ${commas.format(total)} ${inSentence(what)} on Data USA and see where it is on a map. Data for ${inSentence(what)} is not available yet.`
      : `Browse ${total > 1 ? `all ${commas.format(total)} ` : ""}${inSentence(what)} on Data USA${ranked ? ", ranked by population and shown on a map" : ""}. Each links to a free report with charts, maps and downloadable data.`;
    metadata = {
      title,
      description,
      alternates: {canonical: path},
      ...(pending ? {robots: {index: false, follow: true}} : {}),
      ...social({title, description, path, image: pageImage("search", level ? {dimension, hierarchy: level} : {dimension}), imageAlt: `${title} | ${SITE_NAME}`})
    };
  }
  if (q) return {...metadata, title: `Search: ${q.slice(0, 60)}`, robots: {index: false, follow: true}};
  return metadata;
}

async function SearchContent({searchParams}: {searchParams: SearchParams}) {
  const params = await searchParams;
  const q = first(params.q);
  const dimension = first(params.dimension);
  const hierarchy = first(params.hierarchy);
  // First result set is server-rendered so the page is useful before hydration (and for crawlers).
  const {results, populationYear} = await searchReports(q, {dimension: dimension || undefined, hierarchy: hierarchy || undefined, limit: RESULT_LIMIT});
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
        initialPopulationYear={populationYear}
        totals={memberTotalsByHierarchy()}
        limit={RESULT_LIMIT}
      />
    </>
  );
}

/** Sitewide search page with the report-type filter panel (legacy `app/pages/SearchPage.jsx`). */
export default function SearchPage({searchParams}: {searchParams: SearchParams}) {
  return (
    <Suspense fallback={<div id="SearchPage" />}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
}
