// Utility for formatting dates in the UI
export function formatDate(dateStr?: string | null, showTimeIfPresent = false): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  // Detect if original string likely contains time information (ISO with 'T' or contains ':')
  const hasTime = /T|:\d{2}/.test(dateStr);
  const showTime = showTimeIfPresent && hasTime;
  // Use Ukrainian locale and show day/month/year, optionally time
  const datePart = d.toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  if (showTime) {
    const timePart = d.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} ${timePart}`;
  }
  return datePart;
}

export function parseDateSafe(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const t = new Date(dateStr).getTime();
  return Number.isNaN(t) ? null : t;
}
