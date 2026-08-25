// Shared by CampsPage, BrightInnovatorsPage, and ThemeDetailPage to render
// program_sessions rows fetched from /api/sessions consistently.
export function formatSessionDate({ start_date: startDate, end_date: endDate }) {
  const opts = { month: 'short', day: 'numeric' };
  const start = new Date(`${startDate}T00:00:00`).toLocaleDateString('en-US', opts);
  if (!endDate || endDate === startDate) return start;
  const end = new Date(`${endDate}T00:00:00`).toLocaleDateString('en-US', opts);
  return `${start} – ${end}`;
}
