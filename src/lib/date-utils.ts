/**
 * Returns today's date string (YYYY-MM-DD) in Colombia timezone (UTC-5).
 * Using toISOString() would return UTC and show the wrong date after 7pm local time.
 */
export function getTodayString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
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
