import { Activity, ScheduledWorkout } from '@/types';
import {
  MONTH_NAMES_EN,
  getMondayOfWeek,
  getSundayOfWeek,
  formatLocalDateKey,
  formatMonthDay,
  formatMonthDayYear,
} from './streakDateUtils';
import { FlameHeatTier, getFlameHeatTier } from './flameHeatTiers';

// Re-exports for clean modular access and backwards compatibility
export {
  MONTH_NAMES_EN,
  getMondayOfWeek,
  getSundayOfWeek,
  formatLocalDateKey,
  formatMonthDay,
  formatMonthDayYear,
  getFlameHeatTier,
};
export type { FlameHeatTier };

export interface WeeklyStreakResult {
  totalContributions: number;
  totalDateRange: string;
  currentStreakWeeks: number;
  currentStreakDateRange: string;
  longestStreakWeeks: number;
  longestStreakDateRange: string;
  isFlameBurning: boolean;
  isFlameAtRisk: boolean;
  daysRemainingThisWeek: number;
  flameStatusTitle: string;
  flameStatusDescription: string;
  activeWeeksCount: number;
  heatTier: FlameHeatTier;
}

/**
 * Pure deterministic engine to compute weekly streaks and flame persistence.
 * Rule: An athlete maintains the weekly flame by logging at least 1 session
 * during each calendar week (Monday 00:00:00 to Sunday 23:59:59).
 */
export function calculateWeeklyStreak(
  activities: Activity[] = [],
  workouts: ScheduledWorkout[] = [],
  referenceDate: Date = new Date()
): WeeklyStreakResult {
  // 1. Gather all activity dates with deduplication against completed workout slots
  const timestamps: number[] = [];
  const loggedDateSet = new Set<string>();

  for (const act of activities) {
    if (act.start_date) {
      const t = new Date(act.start_date).getTime();
      if (!isNaN(t)) {
        timestamps.push(t);
        const d = new Date(act.start_date);
        loggedDateSet.add(formatLocalDateKey(d));
      }
    }
  }

  // Include COMPLETED workouts from the schedule ONLY if no activity was already logged on that calendar day
  for (const w of workouts) {
    if (w.status === 'COMPLETED' && w.scheduled_date) {
      const wDateStr =
        typeof w.scheduled_date === 'string'
          ? w.scheduled_date.split('T')[0]
          : formatLocalDateKey(new Date(w.scheduled_date));

      if (!loggedDateSet.has(wDateStr)) {
        const t = new Date(w.scheduled_date).getTime();
        if (!isNaN(t)) {
          timestamps.push(t);
          loggedDateSet.add(wDateStr);
        }
      }
    }
  }

  timestamps.sort((a, b) => a - b);
  const totalContributions = timestamps.length;

  if (totalContributions === 0) {
    const heatTier = getFlameHeatTier(0, false);
    return {
      totalContributions: 0,
      totalDateRange: 'No recorded sessions',
      currentStreakWeeks: 0,
      currentStreakDateRange: 'None',
      longestStreakWeeks: 0,
      longestStreakDateRange: 'None',
      isFlameBurning: false,
      isFlameAtRisk: false,
      daysRemainingThisWeek: 7,
      flameStatusTitle: 'Api Belum Menyala',
      flameStatusDescription: 'Selesaikan 1 sesi latihan minggu ini untuk menyalakan api rentetan!',
      activeWeeksCount: 0,
      heatTier,
    };
  }

  // 2. Map all timestamps into unique active weeks (keyed by Monday YYYY-MM-DD)
  const activeWeeksMap = new Map<string, { monday: Date; sunday: Date; latestDate: Date; earliestDate: Date; count: number }>();

  for (const t of timestamps) {
    const actDate = new Date(t);
    const mon = getMondayOfWeek(actDate);
    const key = formatLocalDateKey(mon);

    const existing = activeWeeksMap.get(key);
    if (!existing) {
      activeWeeksMap.set(key, {
        monday: mon,
        sunday: getSundayOfWeek(mon),
        earliestDate: actDate,
        latestDate: actDate,
        count: 1,
      });
    } else {
      existing.count++;
      if (actDate.getTime() < existing.earliestDate.getTime()) existing.earliestDate = actDate;
      if (actDate.getTime() > existing.latestDate.getTime()) existing.latestDate = actDate;
    }
  }

  const sortedWeekKeys = Array.from(activeWeeksMap.keys()).sort();
  const activeWeeksCount = sortedWeekKeys.length;

  // 3. Current week & Previous week relative to referenceDate
  const currentWeekMonday = getMondayOfWeek(referenceDate);
  const currentWeekKey = formatLocalDateKey(currentWeekMonday);

  const prevWeekMonday = new Date(currentWeekMonday.getFullYear(), currentWeekMonday.getMonth(), currentWeekMonday.getDate() - 7, 0, 0, 0, 0);
  const prevWeekKey = formatLocalDateKey(prevWeekMonday);

  const isFlameBurning = activeWeeksMap.has(currentWeekKey);
  const isFlameAtRisk = !isFlameBurning && activeWeeksMap.has(prevWeekKey);

  // Days remaining in current week until Sunday 23:59:59
  const refDay = referenceDate.getDay(); // 0 is Sun, 1 is Mon, ... 6 is Sat
  const daysRemainingThisWeek = refDay === 0 ? 0 : 7 - refDay;

  // 4. Calculate Current Streak
  let currentStreakWeeks = 0;
  let currentStreakStartDate: Date | null = null;
  let currentStreakEndDate: Date | null = null;

  const startCheckKey = isFlameBurning ? currentWeekKey : isFlameAtRisk ? prevWeekKey : null;

  if (startCheckKey && activeWeeksMap.has(startCheckKey)) {
    const endWeekData = activeWeeksMap.get(startCheckKey)!;
    currentStreakEndDate = endWeekData.latestDate;

    let cursorMonday = new Date(endWeekData.monday.getTime());

    while (true) {
      const k = formatLocalDateKey(cursorMonday);
      const wData = activeWeeksMap.get(k);
      if (wData) {
        currentStreakWeeks++;
        currentStreakStartDate = wData.earliestDate;
        cursorMonday.setDate(cursorMonday.getDate() - 7);
      } else {
        break;
      }
    }
  }

  // 5. Calculate Longest Streak Across History
  let longestStreakWeeks = 0;
  let longestStreakStartDate: Date | null = null;
  let longestStreakEndDate: Date | null = null;

  for (let i = 0; i < sortedWeekKeys.length; i++) {
    const startKey = sortedWeekKeys[i];
    const startWeekData = activeWeeksMap.get(startKey)!;

    let streakLen = 1;
    let earliest = startWeekData.earliestDate;
    let latest = startWeekData.latestDate;
    let cursorMonday = new Date(startWeekData.monday.getTime());

    for (let j = i + 1; j < sortedWeekKeys.length; j++) {
      const nextMonday = new Date(cursorMonday.getFullYear(), cursorMonday.getMonth(), cursorMonday.getDate() + 7, 0, 0, 0, 0);
      const nextKey = formatLocalDateKey(nextMonday);

      if (sortedWeekKeys[j] === nextKey) {
        const nextWeekData = activeWeeksMap.get(nextKey)!;
        streakLen++;
        latest = nextWeekData.latestDate;
        cursorMonday = nextMonday;
      } else {
        break;
      }
    }

    if (streakLen > longestStreakWeeks) {
      longestStreakWeeks = streakLen;
      longestStreakStartDate = earliest;
      longestStreakEndDate = latest;
    }
  }

  // 6. Format Display Date Ranges
  const firstOverallDate = new Date(timestamps[0]);
  const totalDateRange = `${formatMonthDayYear(firstOverallDate)} - Present`;

  const currentStreakDateRange =
    currentStreakStartDate && currentStreakEndDate
      ? `${formatMonthDay(currentStreakStartDate)} - ${formatMonthDay(currentStreakEndDate)}`
      : 'None';

  const longestStreakDateRange =
    longestStreakStartDate && longestStreakEndDate
      ? `${formatMonthDay(longestStreakStartDate)} - ${formatMonthDay(longestStreakEndDate)}`
      : 'None';

  // 7. Determine Flame Heat Progression Tier
  const heatTier = getFlameHeatTier(currentStreakWeeks, isFlameBurning || isFlameAtRisk);

  // 8. Status Titles and Explanations
  let flameStatusTitle = '';
  let flameStatusDescription = '';

  if (isFlameBurning) {
    flameStatusTitle = `${heatTier.name} Menyala! (${heatTier.temperatureText}) 🔥`;
    flameStatusDescription = `Rentetan ${currentStreakWeeks} minggu aktif. ${
      heatTier.weeksToNextTier
        ? `${heatTier.weeksToNextTier} minggu lagi menuju tahap ${heatTier.stage + 1}.`
        : 'Tahap puncak tercapai!'
    }`;
  } else if (isFlameAtRisk) {
    flameStatusTitle = 'Api Mode Siaga ⏳';
    flameStatusDescription = `Sisa ${daysRemainingThisWeek} hari untuk latihan minggu ini agar ${heatTier.name} tidak padam!`;
  } else {
    flameStatusTitle = 'Api Padam 💨';
    flameStatusDescription = 'Selesaikan 1 sesi latihan minggu ini untuk menyalakan kembali api rentetan mingguan.';
  }

  return {
    totalContributions,
    totalDateRange,
    currentStreakWeeks,
    currentStreakDateRange,
    longestStreakWeeks,
    longestStreakDateRange,
    isFlameBurning,
    isFlameAtRisk,
    daysRemainingThisWeek,
    flameStatusTitle,
    flameStatusDescription,
    activeWeeksCount,
    heatTier,
  };
}
