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
 * newly acquired and monitored injuries, pain telemetry, and clinical correlations.
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
  } = params;

  // 1. Tentukan Rentang Waktu Minggu (Senin 00:00:00 - Minggu 23:59:59)
  let ref = referenceDate;
  if (!ref && activities.length > 0) {
    const timestamps = activities.map((a) => new Date(a.start_date).getTime());
    const latestTime = Math.max(...timestamps);
    ref = new Date(latestTime);
  }

  const { start, end } = getWeekBounds(ref);

  const timeframe: WeeklyRecapTimeframe = {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    startDateFormatted: formatIndoDate(start),
    endDateFormatted: formatIndoDate(end),
    label: `${formatIndoDate(start)} – ${formatIndoDate(end)}`,
    daysCount: 7,
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

  return {
    timeframe,
    activity_summary: activitySummary,
    injury_summary: injurySummary,
    clinical_verdict: clinicalVerdict,
  };
}

export * from './weeklyRecapTypes';
export * from './weeklyRecapActivity';
export * from './weeklyRecapInjury';
