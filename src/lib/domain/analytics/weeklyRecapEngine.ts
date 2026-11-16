import {
  WeeklyActivityAndInjuryRecap,
  ComputeWeeklyRecapParams,
  WeeklyRecapTimeframe,
} from './weeklyRecapTypes';
import { aggregateWeeklyActivities } from './weeklyRecapActivity';
import {
  aggregateWeeklyInjuries,
  evaluateWeeklyClinicalCorrelation,
} from './weeklyRecapInjury';
import { computeLocalWeeklyProMetrics } from './weeklyRecapProCalculator';
import {
  shouldDefaultToCompletedWeek,
  discoverAvailableRecapWeeks,
  computeMultiWeekRollup,
} from './multiWeekRecapEngine';
import { formatDateOnly } from '@/lib/formatters';

const INDO_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

function formatIndoDate(d: Date): string {
  const day = d.getDate().toString().padStart(2, '0');
  const month = INDO_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function getWeekBounds(referenceDate?: Date | string): { start: Date; end: Date } {
  let ref: Date;
  if (!referenceDate) {
    ref = new Date();
  } else if (typeof referenceDate === 'string') {
    // If date-only string YYYY-MM-DD, initialize at local noon to prevent midnight timezone shifting
    if (/^\d{4}-\d{2}-\d{2}$/.test(referenceDate.trim())) {
      const [y, m, d] = referenceDate.trim().split('-').map(Number);
      ref = new Date(y, m - 1, d, 12, 0, 0);
    } else {
      ref = new Date(referenceDate);
      if (isNaN(ref.getTime())) ref = new Date();
    }
  } else {
    ref = new Date(referenceDate);
  }

  const day = ref.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = (day === 0 ? -6 : 1) - day;

  const start = new Date(ref);
  start.setDate(ref.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Pure domain orchestrator for weekly activity and injury recap.
 * Computes deterministic volume progression, sport breakdowns,
 * newly acquired and monitored injuries, pain telemetry, clinical correlations,
 * multi-week rollups, and smart Monday 00:00 completed-week defaults.
 */
export function computeWeeklyActivityAndInjuryRecap(
  params: ComputeWeeklyRecapParams
): WeeklyActivityAndInjuryRecap {
  const {
    activities = [],
    injuries = [],
    painLogs = [],
    trainingResponses = [],
    scheduledWorkouts = [],
    referenceDate,
    scope = '1_WEEK',
    autoMonday = true,
  } = params;

  const now = new Date();
  const currentWeekBounds = getWeekBounds(now);

  // 1. Intelligent Monday 00:00 Default Rule
  let isMondayAutoCompleted = false;
  let targetRef = referenceDate;

  if (!targetRef && autoMonday) {
    const currentWeekSessions = activities.filter((a) => {
      const t = new Date(a.start_date).getTime();
      return t >= currentWeekBounds.start.getTime() && t <= currentWeekBounds.end.getTime();
    }).length;

    if (shouldDefaultToCompletedWeek(now, currentWeekSessions)) {
      targetRef = new Date(currentWeekBounds.start.getTime() - 7 * 86400000);
      isMondayAutoCompleted = true;
    }
  }

  const ref = targetRef || now;
  const { start, end } = getWeekBounds(ref);

  const currentWeekMonday = currentWeekBounds.start;
  const isCurrentWeek = formatDateOnly(start) === formatDateOnly(currentWeekMonday);
  const weeksAgo = Math.max(
    0,
    Math.round((currentWeekMonday.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
  );

  const timeframe: WeeklyRecapTimeframe = {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    startDateFormatted: formatIndoDate(start),
    endDateFormatted: formatIndoDate(end),
    label: `${formatIndoDate(start)} – ${formatIndoDate(end)}`,
    daysCount: 7,
    isCurrentWeek,
    weeksAgo,
  };

  // 2. Rekapitulasi Aktivitas Mingguan
  const activitySummary = aggregateWeeklyActivities(
    activities,
    start,
    end,
    scheduledWorkouts
  );

  // 3. Rekapitulasi Cidera & Keluhan Gejala Biomekanis
  const injurySummary = aggregateWeeklyInjuries(
    injuries,
    painLogs,
    trainingResponses,
    start,
    end
  );

  // 4. Korelasi Klinis & Keputusan Keselamatan (Clinical Verdict)
  const clinicalVerdict = evaluateWeeklyClinicalCorrelation(
    activitySummary,
    injurySummary
  );

  // 5. Metrik Fisiologis Level PRO (Foster sRPE, Seiler 80/20, WoW Delta, Monotony)
  const proMetrics = computeLocalWeeklyProMetrics(
    activities,
    start,
    end,
    painLogs,
    trainingResponses
  );

  // 6. Penemuan Riwayat Minggu yang Tersedia (Discovery of Historical Weeks)
  const availableWeeks = discoverAvailableRecapWeeks(activities, now);

  // 7. Agregasi Multi-Minggu (2-Minggu / Fortnightly atau 4-Minggu / Mesosiklus Bulanan)
  const multiWeekRollup = computeMultiWeekRollup(activities, ref, scope);

  return {
    timeframe,
    activity_summary: activitySummary,
    injury_summary: injurySummary,
    clinical_verdict: clinicalVerdict,
    pro_metrics: proMetrics,
    availableWeeks,
    multiWeekRollup,
    isMondayAutoCompleted,
  };
}

export * from './weeklyRecapTypes';
export * from './weeklyRecapActivity';
export * from './weeklyRecapInjury';
export * from './multiWeekRecapEngine';
