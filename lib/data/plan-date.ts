export const PLAN_TIME_ZONE = "Asia/Jakarta";

const FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: PLAN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function planDateISO(now: Date = new Date()): string {
  return FORMATTER.format(now);
}
