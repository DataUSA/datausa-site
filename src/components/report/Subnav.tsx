import {stripHTML} from "@/content/formatters";
import {decodeEntities} from "@/lib/formatting/html";
import {inlineSvgMarkup} from "@/lib/inline-svg";
import type {PreparedSection} from "@/lib/reports/engine";
import {SubnavClient} from "./SubnavClient";

export interface SubnavItem {
  slug: string;
  title: string;
  /** Inline SVG markup of the section's Blueprint icon (CMS `icon` name), or "" when it has none. */
  iconMarkup: string;
  children: {slug: string; title: string; icon: string}[];
}

/** The CMS names icons from the Blueprint set (e.g. "pulse"); the files live in public/icons/blueprint. */
export function sectionIconMarkup(icon: string | undefined): string {
  return icon ? inlineSvgMarkup(`/icons/blueprint/${icon}.svg`) : "";
}

/** Section navigation under the hero: one entry per Grouping, with its SubGroupings/topics. */
export function Subnav({groups}: {groups: {grouping: PreparedSection; topics: PreparedSection[]}[]}) {
  if (groups.length < 2) return null;
  const items: SubnavItem[] = groups.map(({grouping, topics}) => {
    const subgroups = topics.filter(t => t.type === "SubGrouping");
    const children = (subgroups.length ? subgroups : topics).map(t => ({
      slug: t.slug,
      title: decodeEntities(stripHTML(t.short || t.title)),
      icon: t.icon
    }));
    return {slug: grouping.slug, title: decodeEntities(stripHTML(grouping.short || grouping.title)), iconMarkup: sectionIconMarkup(grouping.icon), children};
  });
  return <SubnavClient items={items} />;
}
