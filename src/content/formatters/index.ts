/**
 * Formatters used by report text templates (`Formatter{{variable}}`) and by report code.
 *
 * Converted by hand from the 35 rows of the legacy `canon_cms_formatter` table. Names are the
 * legacy names lower-camel-cased exactly as Canon did (`Abbreviate` -> `abbreviate`,
 * `GINI` -> `gini`, `StripHTML` -> `stripHTML`). Behaviour, including the `"N/A"` fallbacks,
 * is preserved; only the typing is new.
 */
import {sum} from "d3-array";
import {format} from "d3-format";
import {timeFormat} from "d3-time-format";
import {parseDate} from "@/lib/formatting/parse-date";

type Input = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Legacy #1 Dollar: adds a US dollar sign to the beginning of a string or number. */
export function dollar(n: Input): string {
  if (typeof n === "number") n = abbreviate(n);
  return n ? (n as string).charAt(0) === "-" ? (n as string).replace("-", "-$") : `$${n}` : "N/A";
}

/** Legacy #2 Date: formats a date into "%B %d, %Y" format. */
export function date(n: Input): string {
  if (typeof n === "string" || typeof n === "number") n = parseDate(n);
  return timeFormat("%B %d, %Y")(n as Date);
}

/** Legacy #3 List: joins an array of strings together, adding commas and "and" when necessary. */
export function list(n: Input): string {
  const arr = n as string[];
  return arr.reduce((str, item, i) => {
    if (!i) str += item;
    else if (i === arr.length - 1 && i === 1) str += ` and ${item}`;
    else if (i === arr.length - 1) str += `, and ${item}`;
    else str += `, ${item}`;
    return str;
  }, "");
}

/** Legacy #4 StripHTML: removes all HTML tags from a string. */
export function stripHTML(n: Input): string {
  return n ? String(n).replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ") : "N/A";
}

/** Legacy #5 Abbreviate: abbreviates a number into a smaller more human-readable number. */
export function abbreviate(n: Input): string {
  if (typeof n !== "number") return "N/A";

  const negative = n < 0;
  const length = n.toString().split(".")[0].replace("-", "").length;
  let val: string;

  if (n === 0) val = "0";
  else if (length >= 3) {
    const f = format(".3s")(n).replace("G", "B");
    const num = f.slice(0, -1).replace("−", "");
    const char = f.slice(f.length - 1);
    val = `${parseFloat(num)}${char}`;
  }
  else if (length === 3) val = format(",f")(n);
  else val = format(".3g")(n);

  return `${negative && val.charAt(0) !== "−" ? "−" : ""}${val}`
    .replace(/(\.[0-9]*[1-9])[0]*$/g, "$1") /* removes any trailing zeros */
    .replace(/[.][0]*$/g, ""); /* removes any trailing decimal point */
}

/** Legacy #6 Salary: displays salary values with proper precision ("$74,200" instead of "$74.2k"). */
export function salary(n: Input): string {
  return dollar(abbreviateBig(n));
}

/** Legacy #7 Growth: growth percentage between two numbers given `{curr, currMoe, prev, prevMoe}`. */
export function growth(n: Input): number {
  const {curr, currMoe = 0, prev, prevMoe = 0} = n as {curr: number; currMoe?: number; prev: number; prevMoe?: number};
  let value: number;
  if (currMoe || prevMoe) {
    const f1 = Math.pow(-prev / Math.pow(curr, 2), 2) * Math.pow(currMoe, 2);
    const f2 = Math.pow(1 / curr, 2) * Math.pow(prevMoe, 2);
    value = Math.sqrt(f1 + f2);
  }
  else value = (curr - prev) / prev;
  return value * 100;
}

/** Legacy #8 GrowthWord */
export function growthWord(n: Input): string {
  return n < 0 ? "decline" : "growth";
}

/** Legacy #9 GrewWord */
export function grewWord(n: Input): string {
  return n < 0 ? "declined" : n > 0 ? "grew" : "stayed";
}

/** Legacy #10 IncreaseWord */
export function increaseWord(n: Input): string {
  return n < 0 ? "decrease" : n > 0 ? "increase" : "change";
}

/** Legacy #11 MoreWord */
export function moreWord(n: Input): string {
  return n < 0 ? "less than" : n > 0 ? "more than" : "approximately the same";
}

/** Legacy #12 Commas: rounds to nearest whole number and adds commas. */
export function commas(n: Input): string {
  return format(",")(Math.round(n));
}

/** Legacy #13 GINI: calculates a GINI coefficient from bucketed data. */
export function gini(n: Input): number {
  const {data, bucket, value, weight} = n as {data: Record<string, any>[]; bucket: string; value: string; weight: string}; // eslint-disable-line @typescript-eslint/no-explicit-any
  const newData: {data: Record<string, any>; bucket: number; total: number; pctTotal?: number; pctWeight?: number; pctBetter?: number; score?: number}[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  const weightTotal = sum(data, d => d[weight]);
  data.forEach(d => {
    const bucketName = `${d[bucket]}`
      .replace(/^[\s\<\>\$A-z]*/g, "")
      .replace(/[A-z0-9]+\-/g, "");
    const mod = d[bucket].includes(">") || d[bucket].includes("+")
      || d[bucket].includes("more") || d[bucket].includes("over") || d[bucket].includes("greater")
      ? 1 : 0;
    newData.push({
      data: d,
      bucket: parseFloat(bucketName) + mod,
      total: d[value] * d[weight]
    });
  });
  newData.sort((a, b) => a.bucket - b.bucket);
  const total = sum(newData, d => d.total);
  newData.forEach(d => {
    d.pctTotal = d.total / total;
    d.pctWeight = d.data[weight] / weightTotal;
  });
  newData.forEach((d, i) => {
    d.pctBetter = i === newData.length - 1 ? 0 : sum(newData.slice(i + 1), x => x.pctWeight ?? 0);
    d.score = (d.pctTotal ?? 0) * ((d.pctWeight ?? 0) + 2 * (d.pctBetter ?? 0));
  });
  return 1 - sum(newData, d => d.score ?? 0);
}

/** Legacy #14 GrowthPct: abbreviates a growth value, turns it absolute, and adds a percent sign. */
export function growthPct(n: Input): string {
  return `${abbreviate(Math.abs(n))}%`;
}

/** Legacy #15 MoreLess */
export function moreLess(n: Input): string {
  return n < 0 ? "less" : "more";
}

/** Legacy #16 Bucket: sanitizes bucket strings to "< n", "n1 - n2", and "n+". */
export function bucket(n: Input): string {
  const str = String(n);
  const re = /([\$0-9\,]+)[A-z\-\s\&]*([\$0-9\,]*)/g;
  const match = re.exec(str);
  if (match) {
    const nums = match.slice(1)
      .filter(d => d.length)
      .map(d => {
        if (d.includes(",")) {
          if (d.indexOf(",") === d.length - 4) {
            d = d.replace(/,000$/g, "k")
              .replace(/([0-9]+)(,999$)/g, x => `${parseInt(x, 10) + 1}k`);
          }
          else if (d.indexOf(",") === d.length - 8) {
            d = d.replace(/,000,000$/g, "M")
              .replace(/([0-9]+)(,999,999$)/g, x => `${parseInt(x, 10) + 1}M`);
          }
        }
        return d;
      });
    if (nums.length === 2) return nums.join(" - ");
    else if (str.toLowerCase().match(/under|less|\</g)) return `< ${nums[0]}`;
    else if (str.toLowerCase().match(/over|more|\+|\>/g)) return `${nums[0]}+`;
    else return `${nums[0]}`;
  }
  else return "None";
}

/** Legacy #17 Plural: pluralizes a word. */
export function plural(n: Input): string {
  return n ? String(n).replace(/\w$/g, chr => chr === "y" ? "ies" : `${chr}s`) : "N/A";
}

/** Legacy #18 HighWord */
export function highWord(n: Input): string {
  return n < 0 ? "lower than" : n > 0 ? "higher than" : "approximately the same as";
}

/** Legacy #19 OlderWord */
export function olderWord(n: Input): string {
  return n < 0 ? "getting younger" : n > 0 ? "getting older" : "staying the same age";
}

/** Legacy #20 OlderYounger */
export function olderYounger(n: Input): string {
  return n < 0 ? "younger than" : n > 0 ? "older than" : "the same age as";
}

/** Legacy #21 Increasing */
export function increasing(n: Input): string {
  return n < 0 ? "decreasing" : n > 0 ? "increasing" : "maintaining";
}

/** Legacy #22 GrewTo */
export function grewTo(n: Input): string {
  return n < 0 ? "declined from" : n > 0 ? "grew to" : "stayed at";
}

/** Legacy #23 LongWord */
export function longWord(n: Input): string {
  return n < 0 ? "shorter" : n > 0 ? "longer" : "similar";
}

/** Legacy #24 LargerThan */
export function largerThan(n: Input): string {
  return n < 0 ? "smaller than" : n > 0 ? "larger than" : "the same as";
}

/** Legacy #25 Growing */
export function growing(n: Input): string {
  return n < 0 ? "declining" : "growing";
}

/** Legacy #26 IncreasedWord */
export function increasedWord(n: Input): string {
  return n < 0 ? "decreased" : n > 0 ? "increased" : "remained the same";
}

/** Legacy #27 MoreFewerWord */
export function moreFewerWord(n: Input): string {
  return n < 0 ? "fewer" : "more";
}

/** Legacy #28 Abs */
export function abs(n: Input): number {
  return Math.abs(n);
}

/** Legacy #29 Lower: lowercases a string except for reserved proper nouns. */
export function lower(n: Input): string {
  const reserved = ["Medicare", "Medicaid", "HIV"];
  return String(n)
    .split(" ")
    .map(d => reserved.includes(d) ? d : d.toLowerCase())
    .join(" ");
}

/** Legacy #30 Sentence: lowercases except for the first character. */
export function sentence(n: Input): string {
  return n ? String(n).charAt(0).toUpperCase() + String(n).slice(1).toLowerCase() : "N/A";
}

/** Legacy #31 AbbreviateBig: numbers smaller than 1,000,000 are shown rounded with commas. */
export function abbreviateBig(n: Input): string {
  if (typeof n !== "number") return "N/A";
  else if (n < 1000000) return format(",")(Number(n.toFixed(0)));
  else return abbreviate(n);
}

/** Legacy #32 StripP: removes all P tags from a string. */
export function stripP(n: Input): string {
  return n ? String(n).replace(/<p>/g, "").replace(/<\/p>/g, "") : "";
}

/** Legacy #33 Transportation: formats commute means dimension names to be used in sentences. */
export function transportation(n: Input): string {
  const str = String(n).toLowerCase();
  if (["bicycle", "motorcycle", "taxi"].includes(str)) return `used a ${str} to get to work`;
  else if (["public transit"].includes(str)) return `used ${str} to get to work`;
  else if (["carpooled", "drove alone", "walked"].includes(str)) return `${str} to work`;
  else if (["other"].includes(str)) return `used some unspecified means to get work`;
  return str;
}

/** Legacy #34 declinedGrewWord */
export function declinedGrewWord(n: Input): string {
  return n < 0 ? "declined" : "grew";
}

/** Legacy #35 listOr: joins an array with commas and "or". */
export function listOr(n: Input): string {
  const arr = n as string[];
  return arr.reduce((str, item, i) => {
    if (!i) str += item;
    else if (i === arr.length - 1 && i === 1) str += ` or ${item}`;
    else if (i === arr.length - 1) str += ` or ${item}`;
    else str += `, ${item}`;
    return str;
  }, "");
}

export const formatters = {
  dollar, date, list, stripHTML, abbreviate, salary, growth, growthWord, grewWord, increaseWord,
  moreWord, commas, gini, growthPct, moreLess, bucket, plural, highWord, olderWord, olderYounger,
  increasing, grewTo, longWord, largerThan, growing, increasedWord, moreFewerWord, abs, lower,
  sentence, abbreviateBig, stripP, transportation, declinedGrewWord, listOr
};

export type Formatters = typeof formatters;
export type FormatterName = keyof Formatters;

/**
 * Looks up a formatter by its template name. Canon lower-cased the first character of the stored
 * name, or the whole name when it was all caps (`GINI` -> `gini`); the same rule applies here so
 * that `Abbreviate{{x}}`, `abbreviate{{x}}` and `GINI{{x}}` all resolve.
 */
export function getFormatter(name: string): ((n: Input) => string | number) | undefined {
  const key = name === name.toUpperCase() ? name.toLowerCase() : name.replace(/^\w/, c => c.toLowerCase());
  return (formatters as Record<string, (n: Input) => string | number>)[key];
}
