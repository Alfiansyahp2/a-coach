export const MONTH_NAMES_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Returns the Monday (00:00:00 local time) of the given date's week.
 */
export function getMondayOfWeek(dateInput: Date | string): Date {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.getTime());
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff, 0, 0, 0, 0);
  return monday;
}

/**
 * Returns the Sunday (23:59:59.999 local time) of the given date's week.
 */
export function getSundayOfWeek(mondayInput: Date): Date {
  return new Date(mondayInput.getFullYear(), mondayInput.getMonth(), mondayInput.getDate() + 6, 23, 59, 59, 999);
}

/**
 * Formats a Date object to YYYY-MM-DD using local year/month/date.
 */
export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Formats a date to "MMM D" (e.g. "Jul 12" or "Nov 2").
 */
export function formatMonthDay(d: Date): string {
  return `${MONTH_NAMES_EN[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Formats a date to "MMM D, YYYY" (e.g. "Sep 4, 2023").
 */
export function formatMonthDayYear(d: Date): string {
  return `${MONTH_NAMES_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

