/**
 * Parses the loose date inputs that appear in Data USA data (years as numbers or strings,
 * "YYYY-MM", "YYYY-MM-DD", or anything the Date constructor accepts). Mirrors the behaviour of
 * d3plus's `date()` helper that the legacy content relied on, without pulling in the full package.
 */
export function parseDate(input: string | number | Date): Date {
  if (input instanceof Date) return input;
  const str = String(input).trim();
  if (/^-?\d{1,6}$/.test(str)) {
    const d = new Date(0);
    d.setFullYear(Number(str), 0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (/^\d{4}-\d{2}$/.test(str)) {
    const [y, m] = str.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(str);
}
