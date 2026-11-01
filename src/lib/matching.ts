import { Activity, ScheduledWorkout, WorkoutActivityMatch } from '@/types';
import {
  getScheduledWorkouts,
  getWorkoutActivityMatches,
  saveWorkoutActivityMatch,
  updateScheduledWorkout,
} from './db';

/**
 * Check if a Strava sport type maps logically to a workout category
 */
export function isSportCompatible(sportType: string, category: string): boolean {
  const s = sportType.toLowerCase();
  const c = category.toLowerCase();

  if (s === 'run' || s === 'trailrun' || s === 'virtualrun') {
    return (
      c.includes('run') ||
      c.includes('interval') ||
      c.includes('fartlek') ||
      c.includes('tempo') ||
      c.includes('recovery')
    );
  }

  if (s === 'ride' || s === 'virtualride' || s === 'ebikeride' || s === 'gravelride') {
    return c.includes('cycl') || c.includes('ride') || c.includes('bike');
  }

  if (s === 'swim') {
    return c.includes('swim');
  }

  if (s === 'weighttraining' || s === 'workout') {
    return c.includes('strength') || c.includes('cross');
  }

  return false;
}

/**
 * Compute performance delta between a scheduled workout and recorded activity
 */
export function calculateMatchDeltas(
  workout: ScheduledWorkout,
  activity: Activity,
  isManual: boolean = false
): Omit<WorkoutActivityMatch, 'id' | 'matched_at'> {
  const targetDistance = workout.target_distance_meters || 0;
  const actualDistance = activity.distance_meters || 0;

  const targetDuration = workout.target_duration_seconds || 0;
  const actualDuration = activity.moving_time_seconds || 0;

  // Actual pace in seconds per km
  const actualPaceSeconds = activity.average_speed_mps > 0 ? Math.round(1000 / activity.average_speed_mps) : 0;
  const targetPaceSeconds = workout.target_pace_seconds_per_km || 0;

  // Completion percentage
  let completionPercentage = 100;
  if (targetDistance > 0) {
    completionPercentage = Math.round((actualDistance / targetDistance) * 1000) / 10;
  } else if (targetDuration > 0) {
    completionPercentage = Math.round((actualDuration / targetDuration) * 1000) / 10;
  }

  const distanceDelta = actualDistance - targetDistance;
  const durationDelta = actualDuration - targetDuration;
  const paceDelta = targetPaceSeconds > 0 && actualPaceSeconds > 0 ? actualPaceSeconds - targetPaceSeconds : 0;

  return {
    workout_id: workout.id,
    activity_id: activity.id,
    is_manual_match: isManual,
    completion_percentage: completionPercentage,
    distance_delta_meters: distanceDelta,
    duration_delta_seconds: durationDelta,
    pace_delta_seconds_per_km: paceDelta,
  };
}

/**
 * Run heuristic auto-matching for newly ingested activities against planned workouts
 */
export async function runAutoMatch(userId: string, activities: Activity[]): Promise<number> {
  const workouts = await getScheduledWorkouts(userId);
  const existingMatches = await getWorkoutActivityMatches(userId);

  const matchedWorkoutIds = new Set(existingMatches.map((m) => m.workout_id));
  const matchedActivityIds = new Set(existingMatches.map((m) => m.activity_id));

  let newMatchCount = 0;

  for (const activity of activities) {
    if (matchedActivityIds.has(activity.id)) continue;

    const activityDateStr = activity.start_date.split('T')[0];

    // Find candidate workout on the same day that is not yet matched
    const candidate = workouts.find((w) => {
      if (matchedWorkoutIds.has(w.id)) return false;
      if (w.scheduled_date !== activityDateStr) return false;
      return isSportCompatible(activity.sport_type, w.workout_category);
    });

    if (candidate) {
      const matchData = calculateMatchDeltas(candidate, activity, false);
      await saveWorkoutActivityMatch(matchData);
      await updateScheduledWorkout(candidate.id, { status: 'COMPLETED' });

      matchedWorkoutIds.add(candidate.id);
      matchedActivityIds.add(activity.id);
      newMatchCount++;
    }
  }

  return newMatchCount;
}
