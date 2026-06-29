/**
 * Format a "YYYY-MM" date string into a human-readable form.
 * Handles "present" and empty strings gracefully.
 */
export function formatDate(date: string): string {
  if (!date || date === "present") {
    return date === "present" ? "Present" : "";
  }

  // Try YYYY-MM format
  const match = date.match(/^(\d{4})-(\d{2})$/);
  if (!match) return date;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  if (month >= 1 && month <= 12) {
    return `${monthNames[month - 1]} ${year}`;
  }
  return String(year);
}

/**
 * Format a date range for display: "Jan 2020 – Present"
 */
export function formatDateRange(start: string, end: string): string {
  const s = formatDate(start);
  const e = formatDate(end);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}
