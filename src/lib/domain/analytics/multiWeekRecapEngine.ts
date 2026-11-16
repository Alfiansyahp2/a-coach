import { Activity } from '@/types';
import {
  RecapScope,
  MultiWeekRollupSummary,
  HistoricalWeekOption,
} from './weeklyRecapTypes';
import { getWeekBounds } from './weeklyRecapEngine';
import { formatDateOnly, formatDuration } from '@/lib/formatters';

const INDO_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

function formatIndoDayMonth(d: Date): string {
  return `${d.getDate().toString().padStart(2, '0')} ${INDO_MONTHS[d.getMonth()]}`;
}

function formatIndoDateFull(d: Date): string {
  return `${formatIndoDayMonth(d)} ${d.getFullYear()}`;
}

/**
 * Evaluates whether the recap system should default to the last completed week.
 * Rule: On Monday (00:00–23:59) or when current week has 0 completed sessions,
 * endurance athletes review the completed cycle by default.
 */
export function shouldDefaultToCompletedWeek(
  currentDate: Date = new Date(),
  currentWeekSessionsCount: number = 0
): boolean {
  // If today is Monday (1)
  if (currentDate.getDay() === 1) return true;
  // If current week has zero sessions recorded
  return currentWeekSessionsCount === 0;
}

/**
 * Discovers up to 12 past calendar weeks that have recorded activities or completed workouts.
 */
export function discoverAvailableRecapWeeks(
  activities: Activity[] = [],
  referenceDate?: Date | string
): HistoricalWeekOption[] {
  const currentBounds = getWeekBounds(referenceDate);
  const currentMondayMs = currentBounds.start.getTime();

  // Create buckets for past 12 weeks
  const weeksMap = new Map<string, HistoricalWeekOption>();

  for (let i = 0; i < 12; i++) {
    const monday = new Date(currentMondayMs - i * 7 * 86400000);
    const bounds = getWeekBounds(monday);
    const key = formatDateOnly(bounds.start);

    weeksMap.set(key, {
      startDate: formatDateOnly(bounds.start),
      endDate: formatDateOnly(bounds.end),
      label: `${formatIndoDayMonth(bounds.start)} – ${formatIndoDateFull(bounds.end)}`,
      weeksAgo: i,
      sessionCount: 0,
      totalDistanceKm: 0,
      totalDurationSeconds: 0,
      isCurrentWeek: i === 0,
      isCompletedWeek: i === 1,
      hasActivities: false,
    });
  }

  // Populate activities into weeks
  for (const act of activities) {
    if (!act.start_date) continue;
    const t = new Date(act.start_date);
    if (isNaN(t.getTime())) continue;

    const bounds = getWeekBounds(t);
    const key = formatDateOnly(bounds.start);

    if (weeksMap.has(key)) {
      const w = weeksMap.get(key)!;
      w.sessionCount += 1;
      w.totalDistanceKm += Number(act.distance_meters || 0) / 1000;
      w.totalDurationSeconds += Number(act.moving_time_seconds || 0);
      w.hasActivities = true;
    }
  }

  // Round distances
  for (const w of weeksMap.values()) {
    w.totalDistanceKm = Math.round(w.totalDistanceKm * 10) / 10;
  }

  return Array.from(weeksMap.values());
}

/**
 * Computes a multi-week rollup (2 weeks / 14 days or 4 weeks / 28 days / 1 month).
 */
export function computeMultiWeekRollup(
  activities: Activity[] = [],
  referenceDate?: Date | string,
  scope: RecapScope = '2_WEEKS'
): MultiWeekRollupSummary {
  const numWeeks = scope === '4_WEEKS' ? 4 : scope === '2_WEEKS' ? 2 : 1;
  const currentBounds = getWeekBounds(referenceDate);
  const currentMondayMs = currentBounds.start.getTime();

  const weeksBreakdown: MultiWeekRollupSummary['weeksBreakdown'] = [];
  let totalDistanceKm = 0;
  let totalDurationSeconds = 0;
  let totalSessions = 0;
  let totalElevationMeters = 0;
  let totalCalories = 0;

  // Process oldest to newest for trend calculation
  for (let i = numWeeks - 1; i >= 0; i--) {
    const monday = new Date(currentMondayMs - i * 7 * 86400000);
    const bounds = getWeekBounds(monday);
    const startMs = bounds.start.getTime();
    const endMs = bounds.end.getTime();

    const weekActs = activities.filter((a) => {
      const t = new Date(a.start_date).getTime();
      return t >= startMs && t <= endMs;
    });

    let weekDist = 0;
    let weekDur = 0;
    let weekSrpe = 0;
    let weekTss = 0;

    for (const a of weekActs) {
      const dist = Number(a.distance_meters || 0) / 1000;
      const dur = Number(a.moving_time_seconds || 0);
      weekDist += dist;
      weekDur += dur;
      totalElevationMeters += Number(a.elevation_gain_meters || 0);
      totalCalories += Number(a.calories || 0);

      // Simple approximate sRPE & TSS for rollup
      const avgHr = a.average_heartrate || 135;
      const rpe = avgHr >= 160 ? 7.5 : avgHr >= 145 ? 5.5 : 4.0;
      weekSrpe += rpe * (dur / 60);

      const deltaHr = Math.max(0, Math.min(1, (avgHr - 52) / (185 - 52)));
      weekTss += (dur / 60) * deltaHr * 0.64 * Math.exp(1.92 * deltaHr) * 0.95;
    }

    totalDistanceKm += weekDist;
    totalDurationSeconds += weekDur;
    totalSessions += weekActs.length;

    weeksBreakdown.push({
      weekNumber: numWeeks - i,
      label: `Minggu ${numWeeks - i} (${formatIndoDayMonth(bounds.start)} – ${formatIndoDayMonth(bounds.end)})`,
      startDate: formatDateOnly(bounds.start),
      endDate: formatDateOnly(bounds.end),
      sessionsCount: weekActs.length,
      distanceKm: Math.round(weekDist * 10) / 10,
      durationSeconds: weekDur,
      formattedDuration: formatDuration(weekDur),
      srpeLoad: Math.round(weekSrpe),
      tss: Math.round(weekTss),
    });
  }

  // Volume Trend: Compare first half vs second half
  let volumeTrendPct = 0;
  if (numWeeks >= 2 && weeksBreakdown.length >= 2) {
    const half = Math.floor(numWeeks / 2);
    const firstHalfDist = weeksBreakdown.slice(0, half).reduce((sum, w) => sum + w.distanceKm, 0);
    const secondHalfDist = weeksBreakdown.slice(half).reduce((sum, w) => sum + w.distanceKm, 0);
    if (firstHalfDist > 0) {
      volumeTrendPct = Math.round(((secondHalfDist - firstHalfDist) / firstHalfDist) * 1000) / 10;
    }
  }

  const activeWeeks = weeksBreakdown.filter((w) => w.sessionsCount > 0).length;
  const consistencyScorePct = Math.round((activeWeeks / numWeeks) * 100);
  const avgDist = numWeeks > 0 ? Math.round((totalDistanceKm / numWeeks) * 10) / 10 : 0;

  const startBound = getWeekBounds(new Date(currentMondayMs - (numWeeks - 1) * 7 * 86400000)).start;
  const endBound = currentBounds.end;
  const scopeLabel =
    scope === '4_WEEKS'
      ? `Mesosiklus 1 Bulan (${numWeeks} Minggu)`
      : scope === '2_WEEKS'
      ? `Blok 2-Minggu (${numWeeks} Minggu)`
      : `Siklus Mingguan`;

  // Mesocycle phase detection
  let mesocyclePhase = 'Volume Base Building';
  if (volumeTrendPct > 15) mesocyclePhase = 'Progressive Overload Surge';
  else if (volumeTrendPct < -15) mesocyclePhase = 'Recovery / Deload Block';
  else if (avgDist >= 75) mesocyclePhase = 'High Aerobic Sustained Base';

  const coachSynthesis =
    scope === '4_WEEKS'
      ? `Akumulasi 4-minggu mencapai ${Math.round(totalDistanceKm)} km dengan konsistensi ${consistencyScorePct}%. Beban adaptasi aerobik stabil di zona aman.`
      : `Blok 2-minggu mencatat ${Math.round(totalDistanceKm)} km (${totalSessions} sesi). Tren volume: ${volumeTrendPct >= 0 ? `+${volumeTrendPct}%` : `${volumeTrendPct}%`}.`;

  return {
    scope,
    scopeLabel,
    dateRangeFormatted: `${formatIndoDayMonth(startBound)} – ${formatIndoDateFull(endBound)}`,
    totalSessions,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    averageWeeklyDistanceKm: avgDist,
    totalDurationSeconds,
    formattedDuration: formatDuration(totalDurationSeconds),
    totalElevationMeters: Math.round(totalElevationMeters),
    totalCalories: Math.round(totalCalories),
    weeksBreakdown,
    volumeTrendPct,
    consistencyScorePct,
    mesocyclePhase,
    coachSynthesis,
  };
}
