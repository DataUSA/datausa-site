/**
 * What a report says about itself outside the page: its `<title>`, meta description and the key
 * figures shown on its share image. All of it is derived from the hero statistics the report page
 * already renders, so the head never states a number the page does not.
 */
import {stripHTML} from "@/content/formatters";
import {decodeEntities} from "@/lib/formatting/html";
import type {MemberRow} from "@/lib/dimensions/db";
import type {PreparedReport, PreparedStat} from "@/lib/reports/engine";
import {isPendingLevel} from "@/lib/geo/levels";
import {SITE_NAME, type ReportFamily} from "./site";

/** Plain text of a CMS field: tags and entities removed, zero-width breaks turned into spaces. */
export function plainText(html: string | undefined | null): string {
  if (!html) return "";
  return decodeEntities(stripHTML(html)).replace(/[​­]/g, " ").replace(/\s+/g, " ").trim();
}

export interface Fact {
  /** "Median Household Income": the statistic's title without its year. */
  label: string;
  value: string;
  year?: string;
  /** The statistic's subtitle ("3.38% 1-year growth"). */
  note?: string;
}

const YEAR = /\b(?:19|20)\d{2}\b/;

/** A section's statistics that are figures (people such as senators are left out). */
export function sectionFacts(stats: PreparedStat[]): Fact[] {
  const facts: Fact[] = [];
  for (const stat of stats) {
    const title = plainText(stat.title);
    const value = plainText(stat.value);
    const note = plainText(stat.subtitle);
    if (!title || !/^[−\-+$]?\d/.test(value) || facts.some(f => f.label === title)) continue;
    const year = title.match(YEAR)?.[0] ?? (/^(?:(?:19|20)\d{2}$|(?:19|20)\d{2} fiscal year$)/i.test(note) ? note.match(YEAR)![0] : undefined);
    const label = title.replace(YEAR, "").replace(/\s+in\s*$/i, "").replace(/\s+/g, " ").trim();
    facts.push({label: label || title, value, year, note: note || undefined});
  }
  return facts;
}

/** The figures of the report's hero. */
export function heroFacts(report: PreparedReport): Fact[] {
  return sectionFacts(report.sections.find(s => s.type === "Hero")?.stats ?? []);
}

/** How a member's level reads beside its family name ("Location / Census Place"); empty when it adds nothing. */
export function levelLabel(member: MemberRow): string {
  const {hierarchy} = member;
  if (hierarchy === "Place") return "Census Place";
  if (hierarchy === "MSA") return "Metropolitan Area";
  if (/^CIP\d$/.test(hierarchy)) return "Field of Study";
  if (hierarchy === "University") return "";
  if (/^Carnegie/.test(hierarchy)) return "Carnegie Classification";
  return hierarchy;
}

function find(facts: Fact[], pattern: RegExp): Fact | undefined {
  return facts.find(f => pattern.test(f.label));
}

/** "a, b and c". */
function list(items: string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** The three figures a share image leads with, most telling first. */
const HEADLINE_FACTS: Record<string, RegExp[]> = {
  geo: [/^population$/i, /median household income/i, /median age/i, /poverty rate/i, /median property value/i],
  naics: [/workforce/i, /^average salary$/i, /job growth/i],
  soc: [/workforce/i, /^average salary$/i, /job growth/i],
  cip: [/degrees awarded/i, /average wage/i, /people in workforce/i],
  university: [/undergraduate tuition/i, /acceptance rate/i, /enrolled students/i, /graduation rate/i]
};

export function headlineFacts(profileSlug: string, facts: Fact[], count = 3): Fact[] {
  const picked: Fact[] = [];
  for (const pattern of HEADLINE_FACTS[profileSlug] ?? []) {
    const fact = find(facts, pattern);
    if (fact && !picked.includes(fact)) picked.push(fact);
  }
  for (const fact of facts) if (!picked.includes(fact)) picked.push(fact);
  return picked.slice(0, count);
}

/**
 * `<title>` text (the layout appends the site name): the name followed by what the report covers,
 * dropped to a shorter list and then to the bare name as the name gets longer.
 */
export function reportTitle(family: ReportFamily | undefined, name: string, member?: MemberRow): string {
  // a placeholder report covers none of the family's topics yet
  if (!family || isPendingLevel(member?.hierarchy)) return name;
  const fits = (title: string) => `${title} | ${SITE_NAME}`.length <= 70;
  return [`${name}: ${family.topics[0]}`, `${name}: ${family.topics[1]}`].find(fits) ?? name;
}

/** Sentences of key figures for one family, or nothing when the figures they need are missing. */
function summary(profileSlug: string, facts: Fact[], name: string, sentenceName: string): string[] {
  const get = (pattern: RegExp) => find(facts, pattern);
  const withYear = (fact: Fact | undefined) => fact?.year ? `In ${fact.year}, ` : "";
  const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

  if (profileSlug === "geo") {
    const population = get(/^population$/i);
    if (!population) return [];
    const first = [`a population of ${population.value}`];
    const age = get(/median age/i), income = get(/median household income/i);
    if (age) first.push(`a median age of ${age.value}`);
    if (income) first.push(`a median household income of ${income.value}`);
    const sentences = [cap(`${withYear(population)}${sentenceName} had ${list(first)}.`)];
    const poverty = get(/poverty rate/i), property = get(/median property value/i);
    const second = [...(poverty ? [`the poverty rate was ${poverty.value}`] : []), ...(property ? [`the median property value was ${property.value}`] : [])];
    if (second.length) sentences.push(cap(`${list(second)}.`));
    return sentences;
  }

  if (profileSlug === "university") {
    const items: string[] = [];
    const enrolled = get(/enrolled students/i), tuition = get(/undergraduate tuition/i), acceptance = get(/acceptance rate/i), graduation = get(/graduation rate/i);
    if (enrolled) items.push(`${enrolled.value} enrolled students`);
    if (tuition) items.push(`an undergraduate tuition of ${tuition.value}`);
    if (acceptance) items.push(`an acceptance rate of ${acceptance.value}`);
    if (graduation) items.push(`a graduation rate of ${graduation.value}`);
    if (items.length < 2) return [];
    return [cap(`${withYear(enrolled ?? tuition ?? acceptance ?? graduation)}${name} had ${list(items)}.`)];
  }

  if (profileSlug === "naics") {
    const workforce = get(/workforce/i), salary = get(/^average salary$/i), age = get(/average employee age/i), growth = get(/job growth/i);
    if (!workforce) return [];
    const details = [...(salary ? [`an average salary of ${salary.value}`] : []), ...(age ? [`an average employee age of ${age.value}`] : [])];
    const sentences = [`${name} employed ${workforce.value} people${workforce.year ? ` in ${workforce.year}` : ""}${details.length ? `, with ${list(details)}` : ""}.`];
    if (growth) sentences.push(`Estimated 10-year job growth: ${growth.value}.`);
    return sentences;
  }

  if (profileSlug === "soc") {
    const workforce = get(/workforce/i), salary = get(/^average salary$/i), age = get(/^average age$/i), growth = get(/job growth/i);
    if (!workforce) return [];
    const details = [...(salary ? [`an average salary of ${salary.value}`] : []), ...(age ? [`an average age of ${age.value}`] : [])];
    const sentences = [`The ${name} workforce numbered ${workforce.value} people${workforce.year ? ` in ${workforce.year}` : ""}${details.length ? `, with ${list(details)}` : ""}.`];
    if (growth) sentences.push(`Estimated 10-year job growth: ${growth.value}.`);
    return sentences;
  }

  if (profileSlug === "cip") {
    const degrees = get(/degrees awarded/i), wage = get(/average wage/i), workforce = get(/people in workforce/i), tuition = get(/in-state public tuition/i);
    if (!degrees) return [];
    const sentences = [cap(`${withYear(degrees)}${degrees.value} ${name} degrees were awarded in the United States.`)];
    if (workforce && wage) sentences.push(`Graduates in the workforce number ${workforce.value}, with an average wage of ${wage.value}.`);
    if (tuition) sentences.push(`Median in-state public tuition is ${tuition.value}.`);
    return sentences;
  }

  return [];
}

const ABBREVIATION = /(?:^|[\s(])(?:St|Ste|Mt|Ft|Pt|Dr|Jr|Sr|No|Co|Inc|vs|U\.S|D\.C)\.$/;

/** Splits prose into sentences without breaking after "St." or before a lower-case word. */
function sentencesOf(text: string): string[] {
  const out: string[] = [];
  for (const piece of text.split(/(?<=[.!?])\s+/)) {
    const previous = out[out.length - 1];
    if (previous !== undefined && (ABBREVIATION.test(previous) || /^[a-z]/.test(piece))) out[out.length - 1] = `${previous} ${piece}`;
    else out.push(piece);
  }
  return out;
}

/** Cuts text at the last sentence that fits, or at a word with an ellipsis when even the first is too long. */
export function clampSentences(text: string, max: number): string {
  if (text.length <= max) return text;
  let out = "";
  for (const sentence of sentencesOf(text)) {
    const next = out ? `${out} ${sentence}` : sentence;
    if (next.length > max) break;
    out = next;
  }
  return out || `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

/**
 * Meta description: the family's key figures as sentences, then what the report lets a visitor
 * explore. Falls back to the opening of the About section when the figures are missing.
 */
export function reportDescription(family: ReportFamily | undefined, report: PreparedReport, member: MemberRow, sentenceName?: string): string {
  const name = plainText(report.title) || member.name;
  const facts = heroFacts(report);
  const sentences = family ? summary(family.slug, facts, name, sentenceName || name) : [];
  if (!sentences.length) {
    const about = report.sections.find(s => s.slug === "about")?.descriptions.map(d => plainText(d.html)).filter(Boolean).join(" ");
    if (about) sentences.push(clampSentences(about, 220));
  }
  if (family && !isPendingLevel(member.hierarchy)) sentences.push(family.explore(sentenceName || name));
  if (!sentences.length) sentences.push(`Explore data about ${name} on ${SITE_NAME}.`);
  return clampSentences(sentences.join(" "), 320);
}
