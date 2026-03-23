/**
 * Returns today's date string (YYYY-MM-DD) in Colombia timezone (UTC-5).
 * Using toISOString() would return UTC and show the wrong date after 7pm local time.
 */
export function getTodayString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

/**
 * Returns the UTC date range [start, end) that covers a full day in Colombia (UTC-5).
 * Midnight Colombia = 05:00 UTC, so the range is T05:00Z → T05:00Z+24h.
 */
export function getColombiaDateRange(dateStr: string): { startUTC: Date; endUTC: Date } {
  const startUTC = new Date(`${dateStr}T05:00:00.000Z`);
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
  return { startUTC, endUTC };
}

/**
 * Formats a YYYY-MM-DD date string as a human-readable label in Spanish.
 * Uses T12:00:00 to avoid timezone shifts when parsing date-only strings.
 */
export function formatDateLabel(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formats a date range as a short human-readable label in Spanish.
 * Single day → uses formatDateLabel. Range → "20 mar – 23 mar 2026"
 */
export function formatRangeLabel(startDate: string, endDate: string): string {
  if (startDate === endDate) return formatDateLabel(startDate);
  const start = new Date(startDate + "T12:00:00").toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
  const end = new Date(endDate + "T12:00:00").toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${start} – ${end}`;
}

/**
 * Converts a Date object to a YYYY-MM-DD string in Colombia timezone.
 */
export function dateToString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}
