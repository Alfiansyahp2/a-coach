import { Activity, ScheduledWorkout } from '@/types';

export interface DashboardSummary {
  totalDistanceThisWeek: number; // meters
  prevWeekDistance: number; // meters
  weeklyDistanceDeltaPct: number; // e.g. +12.5%
  totalDurationThisWeek: number; // seconds
  completedActivitiesCount: number;
  averagePaceSecondsPerKm: number; // seconds/km
  totalElevationThisWeek: number; // meters
  consistencyScore: number; // 0 - 100%
  recentActivities: Activity[];
  upcomingWorkouts: ScheduledWorkout[];
}

export function computeDashboardSummary(
  activities: Activity[],
  workouts: ScheduledWorkout[]
): DashboardSummary {
  const now = new Date();
  
  // Calculate Start of Current Week (Monday)
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() + diffToMonday);
  currentWeekStart.setHours(0, 0, 0, 0);

  // Previous Week Start & End
  const prevWeekStart = new Date(currentWeekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(currentWeekStart);

  let totalDistanceThisWeek = 0;
  let prevWeekDistance = 0;
  let totalDurationThisWeek = 0;
  let completedActivitiesCount = 0;
  let totalElevationThisWeek = 0;
  let runningPaceSum = 0;
  let runningPaceCount = 0;

  for (const act of activities) {
    const actTime = new Date(act.start_date).getTime();
    if (actTime >= currentWeekStart.getTime()) {
      totalDistanceThisWeek += Number(act.distance_meters || 0);
      totalDurationThisWeek += Number(act.moving_time_seconds || 0);
      totalElevationThisWeek += Number(act.elevation_gain_meters || 0);
      completedActivitiesCount++;

      if (act.sport_type.toLowerCase().includes('run') && act.average_speed_mps > 0) {
        runningPaceSum += 1000 / act.average_speed_mps;
        runningPaceCount++;
      }
    } else if (actTime >= prevWeekStart.getTime() && actTime < prevWeekEnd.getTime()) {
      prevWeekDistance += Number(act.distance_meters || 0);
    }
  }

  const weeklyDistanceDeltaPct =
    prevWeekDistance > 0
      ? Math.round(((totalDistanceThisWeek - prevWeekDistance) / prevWeekDistance) * 100)
      : 0;

  const averagePaceSecondsPerKm =
    runningPaceCount > 0 ? Math.round(runningPaceSum / runningPaceCount) : 0;

  // Consistency Score: Workouts completed / total scheduled this week
  const currWeekStr = currentWeekStart.toISOString().split('T')[0];
  const nextWeekStr = new Date(currentWeekStart.getTime() + 7 * 86400000).toISOString().split('T')[0];

  const thisWeekWorkouts = workouts.filter(
    (w) => w.scheduled_date >= currWeekStr && w.scheduled_date < nextWeekStr && w.workout_category !== 'Rest Day'
  );
  const completedWorkouts = thisWeekWorkouts.filter((w) => w.status === 'COMPLETED');

  const consistencyScore =
    thisWeekWorkouts.length > 0
      ? Math.min(100, Math.round((completedWorkouts.length / thisWeekWorkouts.length) * 100))
      : 100;

  // Upcoming workouts (today onwards)
  const todayStr = now.toISOString().split('T')[0];
  const upcomingWorkouts = workouts
    .filter((w) => w.scheduled_date >= todayStr)
    .slice(0, 5);

  return {
    totalDistanceThisWeek,
    prevWeekDistance,
    weeklyDistanceDeltaPct,
    totalDurationThisWeek,
    completedActivitiesCount,
    averagePaceSecondsPerKm,
    totalElevationThisWeek,
    consistencyScore,
    recentActivities: activities.slice(0, 5),
    upcomingWorkouts,
  };
}

/**
 * Aggregate volume per week/day for the Analytics Module
 */
export function aggregateVolumeProgression(
  activities: Activity[],
  days: number = 30
): Array<{ date: string; runKm: number; rideKm: number; swimKm: number; totalKm: number; elevation: number }> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 86400000);

  const bucketMap: Record<string, { runKm: number; rideKm: number; swimKm: number; totalKm: number; elevation: number }> = {};

  // Initialize buckets
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().split('T')[0];
    bucketMap[key] = { runKm: 0, rideKm: 0, swimKm: 0, totalKm: 0, elevation: 0 };
  }

  for (const act of activities) {
    const key = act.start_date.split('T')[0];
    if (bucketMap[key]) {
      const distKm = Math.round((Number(act.distance_meters || 0) / 1000) * 100) / 100;
      const elev = Number(act.elevation_gain_meters || 0);
      const sport = act.sport_type.toLowerCase();

      if (sport.includes('run')) bucketMap[key].runKm += distKm;
      else if (sport.includes('ride') || sport.includes('cycl')) bucketMap[key].rideKm += distKm;
      else if (sport.includes('swim')) bucketMap[key].swimKm += distKm;

      bucketMap[key].totalKm += distKm;
      bucketMap[key].elevation += elev;
    }
  }

  return Object.entries(bucketMap).map(([date, data]) => ({
    date,
    ...data,
    totalKm: Math.round(data.totalKm * 100) / 100,
  }));
}
