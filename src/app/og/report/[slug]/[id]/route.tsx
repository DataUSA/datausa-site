import {getImage, type MemberRow} from "@/lib/dimensions/db";
import {districtLabel} from "@/lib/dimensions/district-labels";
import {fetchPhoto, ogLogo} from "@/lib/og/assets";
import {CompareCard, ReportCard, type CompareSide} from "@/lib/og/cards";
import {geoLocator} from "@/lib/og/locator";
import {ogImage} from "@/lib/og/render";
import {imageMember, loadMemberReport, memberImageUrl} from "@/lib/reports/load";
import {resolveReportUrl} from "@/lib/reports/resolve";
import {headlineFacts, heroFacts, levelLabel, plainText, sectionFacts, type Fact} from "@/lib/seo/report";
import {familyBySlug} from "@/lib/seo/site";

interface Side {
  member: MemberRow;
  name: string;
  facts: Fact[];
  /** Title and figures of the topic named by `?topic=` (single-chart embeds). */
  topic?: {title: string; facts: Fact[]};
}

/** A report's name and figures. A report whose data cannot be loaded still gets a card, without figures. */
async function side(slug: string, member: MemberRow, topicSlug?: string | null): Promise<Side> {
  try {
    const {report} = await loadMemberReport(slug, member);
    const section = topicSlug ? report.sections.find(s => s.slug === topicSlug) : undefined;
    return {
      member,
      name: plainText(report.title) || member.name,
      facts: heroFacts(report),
      topic: section ? {title: plainText(section.title), facts: sectionFacts(section.stats)} : undefined
    };
  }
  catch (error) {
    console.error(`og report: ${slug}/${member.slug}: ${(error as Error).message}`);
    return {member, name: member.name, facts: []};
  }
}

/**
 * Share image of a report (`og:image` of `/profile/<slug>/<id>`): `?compare=<id>` draws the
 * two-report comparison, `?topic=<section slug>` the card of a single chart embed. Both parameters
 * only select among members and sections that exist; no text is taken from the URL.
 */
export async function GET(request: Request, {params}: {params: Promise<{slug: string; id: string}>}) {
  const {slug, id} = await params;
  const resolved = resolveReportUrl(slug, id);
  if (resolved.status === "redirect") return Response.redirect(new URL(resolved.to.replace(/^\/profile\//, "/og/report/"), request.url), 308);
  if (resolved.status !== "ok") return new Response("Not found", {status: 404});
  const {member} = resolved;
  const family = familyBySlug(slug);
  const query = new URL(request.url).searchParams;
  const compareId = query.get("compare");
  const compared = compareId ? resolveReportUrl(slug, compareId) : undefined;
  const photoOf = (m: MemberRow) => fetchPhoto(memberImageUrl(slug, imageMember(m).slug, "splash"));

  if (compared?.status === "ok" && compared.member.id !== member.id) {
    const [logo, a, b, photoA, photoB] = await Promise.all([ogLogo(), side(slug, member), side(slug, compared.member), photoOf(member), photoOf(compared.member)]);
    const sides = (withPhotos: boolean): [CompareSide, CompareSide] => [
      {name: a.name, photo: withPhotos ? photoA : undefined, facts: headlineFacts(slug, a.facts, 6)},
      {name: b.name, photo: withPhotos ? photoB : undefined, facts: headlineFacts(slug, b.facts, 6)}
    ];
    return ogImage(<CompareCard logo={logo} family={family} sides={sides(true)} />, {
      photo: Boolean(photoA || photoB),
      fallback: <CompareCard logo={logo} family={family} sides={sides(false)} />
    });
  }

  const [logo, data, photo] = await Promise.all([ogLogo(), side(slug, member, query.get("topic")), photoOf(member)]);
  const pictured = imageMember(member);
  const author = photo && pictured.imageId !== null && pictured.imageId !== undefined ? getImage(pictured.imageId)?.author : undefined;
  const topicFacts = data.topic?.facts.slice(0, 3) ?? [];
  const card = (withPhoto: boolean) => (
    <ReportCard
      logo={logo}
      photo={withPhoto ? photo : undefined}
      credit={withPhoto && author ? `Photo by ${author}` : undefined}
      family={family}
      level={levelLabel(member)}
      name={data.name}
      tagline={data.topic?.title ?? districtLabel(member.id)}
      facts={topicFacts.length ? topicFacts : headlineFacts(slug, data.facts)}
      locator={member.dimension === "Geography" ? geoLocator(member.id, member.hierarchy, 330, 220) : null}
    />
  );
  return ogImage(card(true), {photo: Boolean(photo), fallback: card(false)});
}
