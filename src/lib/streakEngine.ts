import { Activity, ScheduledWorkout } from '@/types';

export interface FlameHeatTier {
  stage: number;
  name: string;
  minWeeks: number;
  maxWeeks: number | null;
  colorHex: string;
  glowRgba: string;
  temperatureText: string;
  description: string;
  nextTierWeeks: number | null;
  weeksToNextTier: number | null;
}

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

const MONTH_NAMES_EN = [
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

/**
 * Maps streak duration into thermodynamic flame heat progression tiers.
 * Physics/Heat order (Least hot -> Hottest):
 * Stage 1 (1–9 minggu):   Api Merah (~800°C) - Paling tidak panas / Suhu awal
 * Stage 2 (10–19 minggu): Api Oranye (~1,100°C) - Panas sedang membara
 * Stage 3 (20–29 minggu): Api Kuning (~1,300°C) - Panas tinggi
 * Stage 4 (30–39 minggu): Api Putih (~1,500°C) - Sangat panas (White hot)
 * Stage 5 (40–49 minggu): Api Biru (~1,800°C) - Api pembakaran terpanas
 * Stage 6 (50+ minggu):   Api Ungu Plasma (>2,200°C) - Puncak suhu kosmik
 */
export function getFlameHeatTier(
  streakWeeks: number,
  isFlameBurning: boolean = true
): FlameHeatTier {
  if (streakWeeks <= 0 || !isFlameBurning) {
    return {
      stage: 0,
      name: 'Api Padam',
      minWeeks: 0,
      maxWeeks: 0,
      colorHex: '#5A6272',
      glowRgba: 'rgba(90, 98, 114, 0.2)',
      temperatureText: '0°C',
      description: 'Api padam — selesaikan 1 sesi minggu ini untuk menyalakan api',
      nextTierWeeks: 1,
      weeksToNextTier: 1,
    };
  }

  // Tahap 1: 1 - 9 Minggu (Paling tidak panas / Merah ~800°C)
  if (streakWeeks < 10) {
    return {
      stage: 1,
      name: 'Api Merah',
      minWeeks: 1,
      maxWeeks: 9,
      colorHex: '#EF4444',
      glowRgba: 'rgba(239, 68, 68, 0.45)',
      temperatureText: '~800°C',
      description: 'Tahap 1: Api Merah (Suhu awal / paling tidak panas)',
      nextTierWeeks: 10,
      weeksToNextTier: 10 - streakWeeks,
    };
  }

  // Tahap 2: 10 - 19 Minggu (Oranye / Panas Sedang ~1,100°C)
  if (streakWeeks < 20) {
    return {
      stage: 2,
      name: 'Api Oranye',
      minWeeks: 10,
      maxWeeks: 19,
      colorHex: '#F97316',
      glowRgba: 'rgba(249, 115, 22, 0.45)',
      temperatureText: '~1,100°C',
      description: 'Tahap 2: Api Oranye (Panas sedang membara)',
      nextTierWeeks: 20,
      weeksToNextTier: 20 - streakWeeks,
    };
  }

  // Tahap 3: 20 - 29 Minggu (Kuning Emas / Panas Tinggi ~1,300°C)
  if (streakWeeks < 30) {
    return {
      stage: 3,
      name: 'Api Kuning',
      minWeeks: 20,
      maxWeeks: 29,
      colorHex: '#EAB308',
      glowRgba: 'rgba(234, 179, 8, 0.45)',
      temperatureText: '~1,300°C',
      description: 'Tahap 3: Api Kuning (Panas tinggi stabil)',
      nextTierWeeks: 30,
      weeksToNextTier: 30 - streakWeeks,
    };
  }

  // Tahap 4: 30 - 39 Minggu (Putih Terang / Sangat Panas ~1,500°C)
  if (streakWeeks < 40) {
    return {
      stage: 4,
      name: 'Api Putih',
      minWeeks: 30,
      maxWeeks: 39,
      colorHex: '#F8FAFC',
      glowRgba: 'rgba(248, 250, 252, 0.5)',
      temperatureText: '~1,500°C',
      description: 'Tahap 4: Api Putih (Sangat panas / White hot)',
      nextTierWeeks: 40,
      weeksToNextTier: 40 - streakWeeks,
    };
  }

  // Tahap 5: 40 - 49 Minggu (Biru Cyan / Api Terpanas Pembakaran ~1,800°C)
  if (streakWeeks < 50) {
    return {
      stage: 5,
      name: 'Api Biru',
      minWeeks: 40,
      maxWeeks: 49,
      colorHex: '#00F0FF',
      glowRgba: 'rgba(0, 240, 255, 0.5)',
      temperatureText: '~1,800°C',
      description: 'Tahap 5: Api Biru (Api pembakaran terpanas)',
      nextTierWeeks: 50,
      weeksToNextTier: 50 - streakWeeks,
    };
  }

  // Tahap 6: 50+ Minggu / 1 Tahun+ (Ungu Plasma / Puncak Suhu Kosmik >2,200°C)
  return {
    stage: 6,
    name: 'Api Ungu Plasma',
    minWeeks: 50,
    maxWeeks: null,
    colorHex: '#C084FC',
    glowRgba: 'rgba(192, 132, 252, 0.55)',
    temperatureText: '>2,200°C',
    description: 'Tahap 6: Api Ungu Plasma (Puncak suhu kosmik legendaris)',
    nextTierWeeks: null,
    weeksToNextTier: null,
  };
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
  // 1. Gather all activity dates
  const timestamps: number[] = [];

  for (const act of activities) {
    if (act.start_date) {
      const t = new Date(act.start_date).getTime();
      if (!isNaN(t)) timestamps.push(t);
    }
  }

  // Also include COMPLETED workouts from the schedule if any
  for (const w of workouts) {
    if (w.status === 'COMPLETED' && w.scheduled_date) {
      const t = new Date(w.scheduled_date).getTime();
      if (!isNaN(t)) timestamps.push(t);
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
