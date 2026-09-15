/**
 * The app-wide date and time format.
 *
 * Every timestamp a PayGlocal dashboard shows a user goes through here, so a
 * transaction row, a settlement detail page, an audit log line and a chart
 * tooltip all read the same: `27 Jul '26, 09:49 AM`.
 *
 * Nothing here goes through `toLocaleDateString` / `toLocaleTimeString`. That
 * is deliberate: Intl output varies with the machine's locale, so the same
 * record would read differently for an operator in Bengaluru and a merchant in
 * Frankfurt, and a screenshot in a support ticket would not match what the
 * agent sees. These build the string from fixed tables instead.
 *
 * Times are rendered in the **viewer's own timezone**, which is what every
 * `Date` getter below returns. That is the right default for an operations
 * console — "did this settle before close of business *here*" is the question
 * being asked — but it does mean two people in different zones see different
 * clock times for one event, so anywhere that matters should label the zone.
 */

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** What an absent or unparseable value renders as, everywhere. */
export const EMPTY_DATE = "—";

/**
 * Parses the shapes PayGlocal APIs actually send, in the order they are most
 * likely to appear:
 *
 * - `DD/MM/YYYY HH:mm:ss` — the transactions search response's
 *   `formattedCreationDateTime`. Tried **first**, because `new Date()` reads
 *   `03/07/2026` as *March 7th* under US parsing rules, silently swapping the
 *   day and month for the first twelve days of every month.
 * - epoch milliseconds, as a number **or a string** — several endpoints send
 *   `"1771329858260"`. The string form needs `Number()` first: the `Date`
 *   constructor reads a string as a date *format*, not a count of
 *   milliseconds, so `new Date("1771329858260")` is an Invalid Date.
 * - ISO 8601 — `settlementDate`, and most newer endpoints.
 */
export function parseApiDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === "number") {
    const fromMillis = new Date(value);
    return Number.isNaN(fromMillis.getTime()) ? null : fromMillis;
  }

  const raw = value.trim();

  const slashed = raw.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (slashed) {
    const [, dd, mm, yyyy, hh = "0", min = "0", ss = "0"] = slashed;
    const parsed = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(min),
      Number(ss)
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // A string of digits is epoch millis, not a date format.
  if (/^\d+$/.test(raw)) {
    const parsed = new Date(Number(raw));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** `09:49 AM` — 12-hour, zero-padded, uppercase meridiem. */
export function formatTime(date: Date): string {
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  return `${String(hours12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} ${meridiem}`;
}

/** `27 Jul '26` — the date half, on its own. */
export function formatDateOnly(date: Date): string {
  const yy = String(date.getFullYear() % 100).padStart(2, "0");
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} '${yy}`;
}

/** `27 Jul '26, 09:49 AM` — the canonical form. */
export function formatDateTime(date: Date): string {
  return `${formatDateOnly(date)}, ${formatTime(date)}`;
}

/**
 * Any API value → `27 Jul '26, 09:49 AM`.
 *
 * This is the one to reach for in a column renderer or a detail field: it takes
 * whatever shape the endpoint sends, and returns the em dash rather than
 * "Invalid Date" when there is nothing to show.
 *
 * `fallback` is what an absent or unparseable value renders as. It defaults to
 * the em dash; pass `""` where the timestamp sits inside a sentence that should
 * simply omit it rather than show a placeholder.
 */
export function formatTimestamp(
  value: string | number | Date | null | undefined,
  fallback: string = EMPTY_DATE
): string {
  const date = parseApiDate(value);
  return date ? formatDateTime(date) : fallback;
}

/** Any API value → `27 Jul '26`, with no time of day. */
export function formatDateStamp(
  value: string | number | Date | null | undefined,
  fallback: string = EMPTY_DATE
): string {
  const date = parseApiDate(value);
  return date ? formatDateOnly(date) : fallback;
}

/** Any API value → `09:49 AM`, with no date. */
export function formatTimeStamp(
  value: string | number | Date | null | undefined,
  fallback: string = EMPTY_DATE
): string {
  const date = parseApiDate(value);
  return date ? formatTime(date) : fallback;
}

/**
 * `Mon, 27 Jul` — weekday and date, no year. For a date close enough to the
 * present that naming the day of the week reads better than a bare calendar
 * date, such as a "next settlement" line.
 */
export function formatWeekdayDate(
  value: string | number | Date | null | undefined,
  fallback: string = EMPTY_DATE
): string {
  const date = parseApiDate(value);
  if (!date) return fallback;
  return `${DAYS_SHORT[date.getDay()]}, ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** `Jan 2026` — a month key (`YYYY-MM`) as a label. */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const name = MONTHS_SHORT[Number(month) - 1];
  if (!year || !name) return monthKey;
  return `${name} ${year}`;
}

export { MONTHS_SHORT, DAYS_SHORT };
