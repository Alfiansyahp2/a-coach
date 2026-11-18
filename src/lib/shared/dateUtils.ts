/**
 * Comprehensive Date & Time Telemetry Utilities.
 * Unified authority for timezone-safe Monday boundaries, ISO week calculations,
 * and sports periodization formatting.
 */

export const MONTH_NAMES_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTH_NAMES_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

export const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Returns the Monday (00:00:00 local time) of the given date's week.
 */
export function getMondayOfWeek(dateInput: Date | string): Date {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.getTime());
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const diff = (day === 0 ? -6 : 1) - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff, 0, 0, 0, 0);
}

/**
 * Returns the Sunday (23:59:59.999 local time) of the given date's week.
 */
export function getSundayOfWeek(mondayInput: Date): Date {
  return new Date(mondayInput.getFullYear(), mondayInput.getMonth(), mondayInput.getDate() + 6, 23, 59, 59, 999);
}

/**
 * Normalizes day of week index such that Monday is 0 and Sunday is 6.
 */
export function getDayIndexMondayZero(d: Date): number {
  return (d.getDay() + 6) % 7;
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

/**
 * Normalizes a date or ISO string to strict YYYY-MM-DD string representation.
 */
export function formatDateOnly(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return val.split('T')[0];
  }
  return String(val);
}
