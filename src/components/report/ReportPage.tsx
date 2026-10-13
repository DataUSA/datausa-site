import {stripHTML, stripP} from "@/content/formatters";
import {imageMember, memberImageUrl, type LoadedReport} from "@/lib/reports/load";
import type {PreparedSection} from "@/lib/reports/engine";
import {similarGeographies} from "@/lib/dimensions/similar";
import {getImage} from "@/lib/dimensions/db";
import {isPendingLevel} from "@/lib/geo/levels";
import {Hero} from "./Hero";
import {Subnav} from "./Subnav";
import {AboutSection} from "./AboutSection";
import {GroupingSection} from "./GroupingSection";
import {KeepExploring} from "./KeepExploring";
import {ReportProvider} from "./ReportProvider";
import {PrismProvider} from "@/components/prism/PrismProvider";
import {getPrismUser} from "@/lib/prism/session";
import styles from "./ReportPage.module.css";

/** Splits the flat section list into Grouping blocks with their topics, like the legacy profile page. */
export function groupSections(sections: PreparedSection[]) {
  const groups: {grouping: PreparedSection; topics: PreparedSection[]}[] = [];
  for (const section of sections) {
    if (section.type === "Hero" || section.type === "About" || section.position === "modal") continue;
    if (section.type === "Grouping") groups.push({grouping: section, topics: []});
    else if (groups.length) groups[groups.length - 1].topics.push(section);
  }
  return groups;
}

/** A report and the pieces the page needs from it. */
export interface ReportView {
  loaded: LoadedReport;
  hero?: PreparedSection;
  about?: PreparedSection;
  groups: ReturnType<typeof groupSections>;
  title: string;
  imageUrl: string;
  image?: ReturnType<typeof getImage>;
}

function view(loaded: LoadedReport): ReportView {
  const {report, member, template} = loaded;
  // the photo, and so its credit, may be another member's (a school district shows its state's)
  const pictured = imageMember(member);
  return {
    loaded,
    hero: report.sections.find(s => s.type === "Hero"),
    about: report.sections.find(s => s.type === "About"),
    groups: groupSections(report.sections),
    title: stripHTML(report.title),
    imageUrl: memberImageUrl(template.meta.slug, pictured.slug, "splash"),
    image: pictured.imageId ? getImage(pictured.imageId) : undefined
  };
}

export async function ReportPage({loaded, comparison}: {loaded: LoadedReport; comparison?: LoadedReport}) {
  const {member, template} = loaded;
  const profileSlug = template.meta.slug;
  const primary = view(loaded);
  const compare = comparison ? view(comparison) : undefined;
  // similar places are found through the geoservice and ranked by population: neither knows a level without data
  const similar = profileSlug === "geo" && !compare && !isPendingLevel(member.hierarchy) ? await similarGeographies(member) : [];
  const joiner = profileSlug === "geo" ? "in" : "for";
  const hasPrism = loaded.report.sections.some(s => s.type.startsWith("Prism"));
  const prismUser = hasPrism ? await getPrismUser() : null;
  const prismLocked = prismUser === null;

  return (
    <ReportProvider
      profileSlug={profileSlug}
      primary={{variables: loaded.clientVariables, selectors: loaded.report.selectors, labels: loaded.report.labels, memberSlug: member.slug}}
      comparison={comparison ? {variables: comparison.clientVariables, selectors: comparison.report.selectors, labels: comparison.report.labels, memberSlug: comparison.member.slug} : undefined}
    >
      <PrismProvider initialUserId={prismUser?.user_id ?? null}>
      <article id="Profile" className={`${styles.profile} ${compare ? styles.compare : ""}`}>
        <Hero
          reports={[primary, ...(compare ? [compare] : [])]}
          profileSlug={profileSlug}
          label={stripP(template.meta.label)}
          dimension={member.dimension}
        />
        <Subnav groups={primary.groups} />
        {primary.about && (
          <AboutSection
            sections={[primary.about, ...(compare?.about ? [compare.about] : [])]}
            breadcrumbs={[loaded, ...(comparison ? [comparison] : [])].map(l => (l.built.variables.breadcrumbs ?? []) as {id: string; slug: string; name: string}[])}
            images={[primary.image, compare?.image]}
            profileSlug={profileSlug}
          />
        )}
        {primary.groups.map((group, i) => (
          <GroupingSection
            key={group.grouping.id}
            grouping={group.grouping}
            topics={group.topics}
            comparison={compare ? {grouping: compare.groups[i]?.grouping, topics: compare.groups[i]?.topics ?? [], title: compare.title, primaryTitle: primary.title, joiner} : undefined}
            prismLocked={prismLocked}
          />
        ))}
        {similar.length > 0 && <KeepExploring profileSlug={profileSlug} members={similar} />}
      </article>
      </PrismProvider>
    </ReportProvider>
  );
}
