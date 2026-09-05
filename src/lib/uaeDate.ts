/** Formats a Date as YYYY-MM-DD in Asia/Dubai time — the single source of truth
 * for "which day" a play attempt or leaderboard window belongs to. */
export const formatUaeDate = (d: Date): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(d);
