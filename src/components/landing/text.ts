/**
 * The sentences of a landing page, written from its figures: the heading, the `<title>`, and the
 * opening paragraph (also the meta description). Nothing here is fixed copy about a level's data,
 * so the text follows each data release.
 */
import {pluralInSentence, type LandingFamily, type LandingLevel} from "@/content/landing/levels";
import {formatValue} from "@/lib/landing/data";
import {shortName, type LandingModel, type LandingScope} from "@/lib/landing/model";

const commas = new Intl.NumberFormat("en-US");
const long = new Intl.NumberFormat("en-US", {notation: "compact", compactDisplay: "long", maximumFractionDigits: 1});

/** A figure inside a sentence: counts of a million or more are spelled out ("1.6 million"). */
function spoken(format: Parameters<typeof formatValue>[0], value: number): string {
  if (value >= 1e6 && format === "number") return long.format(value);
  if (value >= 1e6 && (format === "dollars" || format === "compactDollars")) return `$${long.format(value)}`;
  return formatValue(format, value, true);
}

/** Whether the level's members are places in the country, so that "in the United States" reads naturally. */
const located = (family: LandingFamily, level: LandingLevel) => family.dimension === "Geography" || level.hierarchy === "University";

export function landingHeading(family: LandingFamily, level: LandingLevel, scope?: LandingScope): string {
  if (scope) return `${level.plural} in ${scope.state.name}`;
  return located(family, level) ? `${level.plural} in the United States` : level.plural;
}

/** `<title>`: the heading and what the page compares ("Counties in Massachusetts: Population, Income & Home Value"). */
export function landingTitle(family: LandingFamily, level: LandingLevel, model: LandingModel, scope?: LandingScope): string {
  const labels = model.measures.map(m => m.short === "Avg. Wage" ? "Average Wage" : m.short).filter(l => l !== "Age");
  const what = labels.length > 1 ? `${labels.slice(0, -1).join(", ")} & ${labels[labels.length - 1]}` : labels[0];
  const subject = scope ? `${level.plural} in ${scope.state.name}` : located(family, level) ? `U.S. ${level.plural}` : level.plural;
  return `${subject}: ${what}${labels.length > 1 ? "" : " Rankings"}`;
}

export function landingLede(family: LandingFamily, level: LandingLevel, model: LandingModel, scope?: LandingScope): string {
  const {rows, primary, measures, years} = model;
  const name = (n: string) => scope ? shortName(n) : n;
  const count = commas.format(rows.length);
  const things = rows.length === 1 ? level.singular : pluralInSentence(level);
  const year = years[primary.key];
  const parts: string[] = [];

  const where = scope ? scope.state.name : "The United States";
  let opening = located(family, level)
    ? `${where} has ${count} ${things}`
    : `Data USA covers ${count} ${things}`;
  if (model.total !== null && rows.length > 1) {
    const total = spoken(primary.format, model.total);
    opening += primary.key === "population" ? `, home to ${total} people`
      : primary.key === "workforce" ? `, employing ${total} people`
        : primary.key === "enrollment" ? `, enrolling ${total} students`
          : primary.key === "completions" ? `, which awarded ${total} degrees`
            : `, with ${total} in ${primary.phrase}`;
    if (year) opening += ` in ${year}`;
  }
  parts.push(`${opening}.`);

  const ranking = model.rankings.find(r => r.key === primary.key);
  if (ranking && ranking.rows.length > 1) {
    const first = ranking.rows[0];
    parts.push(`The largest by ${primary.phrase} is ${name(first.row.name)} (${spoken(primary.format, first.value)}).`);
  }
  const second = measures[1];
  const lead = second ? model.rankings.find(r => r.key === second.key) : undefined;
  const best = lead && !lead.tied ? lead.rows[0] : undefined;
  if (second && best) {
    parts.push(`${name(best.row.name)} has the ${second.ascending ? "lowest" : "highest"} ${second.phrase} (${spoken(second.format, best.value)}).`);
  }
  if (!model.withData) parts.push(`Figures for ${pluralInSentence(level)} are not available yet.`);
  return parts.join(" ");
}
