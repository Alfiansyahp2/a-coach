import { Activity, ScheduledWorkout } from '@/types';
import { formatDuration, speedMpsToPace, formatDateOnly } from '@/lib/formatters';
import {
  WeeklyActivityRecap,
  SportRecapBreakdown,
  DailyActivityRecap,
} from './weeklyRecapTypes';

const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function aggregateWeeklyActivities(
  activities: Activity[],
  start: Date,
  end: Date,
  scheduledWorkouts: ScheduledWorkout[] = []
): WeeklyActivityRecap {
  const startMs = start.getTime();
  const endMs = end.getTime();

  const weekActivities = activities.filter((act) => {
    const actTime = new Date(act.start_date).getTime();
    return actTime >= startMs && actTime <= endMs;
  });

  let totalDistanceMeters = 0;
  let totalDurationSec = 0;
  let totalElevationM = 0;
  let totalCalories = 0;

  const sportMap = new Map<string, {
    count: number;
    distMeters: number;
    durationSec: number;
    elevationM: number;
    speedSum: number;
  }>();

  // Inisialisasi 7 Hari (Senin -> Minggu)
  const dailyBreakdown: DailyActivityRecap[] = [];
  for (let i = 0; i < 7; i++) {
    const currentD = new Date(start);
    currentD.setDate(start.getDate() + i);
    const dateStr = formatDateOnly(currentD);
    const dayName = INDO_DAYS[currentD.getDay()];

    const dayActs = weekActivities.filter((a) => formatDateOnly(a.start_date) === dateStr);
    const dayDistKm = dayActs.reduce((acc, a) => acc + (a.distance_meters || 0) / 1000, 0);
    const dayDurSec = dayActs.reduce((acc, a) => acc + (a.moving_time_seconds || 0), 0);

    dailyBreakdown.push({
      date: dateStr,
      day_name: dayName,
      session_count: dayActs.length,
      total_distance_km: Math.round(dayDistKm * 100) / 100,
      total_duration_seconds: dayDurSec,
      formatted_duration: formatDuration(dayDurSec),
      activities: dayActs.map((a) => ({
        id: a.id,
        name: a.name,
        sport_type: a.sport_type,
        distance_km: Math.round(((a.distance_meters || 0) / 1000) * 100) / 100,
        formatted_duration: formatDuration(a.moving_time_seconds || 0),
        start_date: typeof a.start_date === 'string' ? a.start_date : new Date(a.start_date).toISOString(),
      })),
    });
  }

  for (const act of weekActivities) {
    totalDistanceMeters += Number(act.distance_meters || 0);
    totalDurationSec += Number(act.moving_time_seconds || 0);
    totalElevationM += Number(act.elevation_gain_meters || 0);
    totalCalories += Number(act.calories || 0);

    const sport = act.sport_type || 'Workout';
    const existing = sportMap.get(sport) || {
      count: 0,
      distMeters: 0,
      durationSec: 0,
      elevationM: 0,
      speedSum: 0,
    };

    existing.count += 1;
    existing.distMeters += Number(act.distance_meters || 0);
    existing.durationSec += Number(act.moving_time_seconds || 0);
    existing.elevationM += Number(act.elevation_gain_meters || 0);
    existing.speedSum += Number(act.average_speed_mps || 0);
    sportMap.set(sport, existing);
  }

  const sportBreakdown: SportRecapBreakdown[] = Array.from(sportMap.entries()).map(
    ([sport, data]) => {
      const distKm = Math.round((data.distMeters / 1000) * 100) / 100;
      const avgMps = data.count > 0 ? data.speedSum / data.count : 0;
      const avgKmh = Math.round(avgMps * 3.6 * 10) / 10;
      const pct = totalDistanceMeters > 0
        ? Math.round((data.distMeters / totalDistanceMeters) * 100)
        : 0;

      const breakdown: SportRecapBreakdown = {
        sport_type: sport,
        session_count: data.count,
        total_distance_km: distKm,
        total_duration_seconds: data.durationSec,
        formatted_duration: formatDuration(data.durationSec),
        total_elevation_gain_meters: data.elevationM,
        average_speed_kmh: avgKmh,
        percentage_of_volume: pct,
      };

      if (sport.toLowerCase().includes('run') || sport.toLowerCase().includes('walk')) {
        breakdown.average_pace_formatted = speedMpsToPace(avgMps);
      }
      return breakdown;
    }
  );

  const activeDaysCount = dailyBreakdown.filter((d) => d.session_count > 0).length;
  const restDaysCount = 7 - activeDaysCount;

  let complianceData;
  if (scheduledWorkouts.length > 0) {
    const weekWorkouts = scheduledWorkouts.filter((w) => {
      const wDate = new Date(w.scheduled_date).getTime();
      return wDate >= startMs && wDate <= endMs;
    });

    if (weekWorkouts.length > 0) {
      const completedCount = weekWorkouts.filter((w) => w.status === 'COMPLETED').length;
      const missedCount = weekWorkouts.filter((w) => w.status === 'MISSED').length;
      complianceData = {
        scheduled_count: weekWorkouts.length,
        completed_count: completedCount,
        compliance_rate_pct: Math.round((completedCount / weekWorkouts.length) * 100),
        missed_count: missedCount,
      };
    }
  }

  return {
    total_sessions: weekActivities.length,
    total_distance_km: Math.round((totalDistanceMeters / 1000) * 100) / 100,
    total_duration_seconds: totalDurationSec,
    formatted_duration: formatDuration(totalDurationSec),
    total_elevation_gain_meters: totalElevationM,
    total_calories: totalCalories,
    sport_breakdown: sportBreakdown,
    daily_breakdown: dailyBreakdown,
    active_days_count: activeDaysCount,
    rest_days_count: restDaysCount,
    compliance: complianceData,
  };
}
