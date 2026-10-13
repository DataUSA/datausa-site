import {memberTotals, memberTotalsByHierarchy} from "@/lib/dimensions/db";
import {ogLogo} from "@/lib/og/assets";
import {PageCard} from "@/lib/og/cards";
import {ogImage} from "@/lib/og/render";
import {STATIC_PAGES, type StaticPage} from "@/lib/seo/metadata";
import {familyByDimension, levelPlural, REPORT_FAMILIES} from "@/lib/seo/site";

const commas = new Intl.NumberFormat("en-US");

/** Reports per family, for the category tiles. */
function familyCounts(): Record<string, number> {
  const totals = memberTotals();
  return Object.fromEntries(REPORT_FAMILIES.map(f => [f.slug, totals[f.dimension] ?? 0]));
}

/**
 * Share image of the home page (`home`), the fixed pages (`search`, `glossary`…) and the pages that
 * list one classification level (`search` or `classifications` with `?dimension=&hierarchy=`).
 * The parameters only select among existing levels; no text is taken from the URL.
 */
export async function GET(request: Request, {params}: {params: Promise<{key: string}>}) {
  const {key} = await params;
  const logo = await ogLogo();
  const counts = familyCounts();

  if (key === "home") {
    return ogImage(<PageCard logo={logo} headline={["The definitive place", "to explore US public data"]} text="Explore, map, compare, and download U.S. data." counts={counts} />);
  }

  const query = new URL(request.url).searchParams;
  const dimension = query.get("dimension") ?? "";
  const hierarchy = query.get("hierarchy") ?? "";
  if ((key === "search" || key === "classifications") && dimension) {
    const family = familyByDimension(dimension);
    const levels = memberTotalsByHierarchy()[dimension];
    if (!family || !levels || (hierarchy && !levels[hierarchy])) return new Response("Not found", {status: 404});
    const total = hierarchy ? levels[hierarchy] : counts[family.slug];
    const what = hierarchy ? levelPlural(hierarchy) : family.label;
    const single = total === 1;
    return ogImage(
      <PageCard
        logo={logo}
        eyebrow={key === "search" ? "Search" : "Classifications"}
        headline={single ? what : `${commas.format(total)} ${what}`}
        text={key === "search"
          ? `Every ${family.singular.toLowerCase()} report at this level on Data USA${dimension === "Geography" && hierarchy && !single ? ", ranked by population" : ""}.`
          : "Identifiers and names for this classification level, linked to their reports."}
        counts={counts}
        active={family.slug}
      />
    );
  }

  if (key === "classifications") {
    return ogImage(<PageCard logo={logo} eyebrow="Data" headline="Classifications" text="Identifiers and names of every location, industry, occupation, degree and university." counts={counts} />);
  }

  const page = (STATIC_PAGES as Record<string, StaticPage>)[key];
  if (!page) return new Response("Not found", {status: 404});
  return ogImage(<PageCard logo={logo} eyebrow={page.eyebrow} headline={page.headline} text={page.text} counts={key === "search" ? counts : undefined} />);
}
