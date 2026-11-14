import { formatDateOnly } from '../client';
import { Activity, ScheduledWorkout, WorkoutActivityMatch } from '@/types';
import { getScheduledWorkouts, updateScheduledWorkout, saveWorkoutActivityMatch } from '../trainingRepo';

export async function correlateManualActivityWithWorkout(
  userId: string,
  activity: Activity,
  distance_meters: number,
  moving_time_seconds: number,
  startDate?: string,
  sportType?: string,
  preferredWorkoutId?: string
): Promise<{
  matchedWorkout: ScheduledWorkout | null;
  match: WorkoutActivityMatch | null;
}> {
  let matchedWorkout: ScheduledWorkout | null = null;
  let match: WorkoutActivityMatch | null = null;

  try {
    const workouts = await getScheduledWorkouts(userId);
    const activityDate = formatDateOnly(startDate || activity.start_date);

    if (preferredWorkoutId) {
      matchedWorkout = workouts.find((w) => w.id === preferredWorkoutId) || null;
    } else {
      const candidateWorkouts = workouts.filter((w) => {
        const wDate = formatDateOnly(w.scheduled_date);
        return wDate === activityDate && (w.status === 'PLANNED' || w.status === 'MISSED');
      });

      if (candidateWorkouts.length > 0) {
        const normSport = (sportType || activity.sport_type || '').toLowerCase();
        const sameSport = candidateWorkouts.find((w) => {
          const wCategory = (w.workout_category || '').toLowerCase();
          return (
            (normSport.includes('ride') && (wCategory.includes('ride') || wCategory.includes('cycl'))) ||
            (normSport.includes('run') && (wCategory.includes('run') || wCategory.includes('lari'))) ||
            wCategory === normSport
          );
        });
        matchedWorkout = sameSport || candidateWorkouts[0];
      }
    }

    if (matchedWorkout) {
      let completionPercentage = 100;
      if (matchedWorkout.target_distance_meters && matchedWorkout.target_distance_meters > 0) {
        completionPercentage = Math.min(200, Math.round((distance_meters / matchedWorkout.target_distance_meters) * 100));
      } else if (matchedWorkout.target_duration_seconds && matchedWorkout.target_duration_seconds > 0) {
        completionPercentage = Math.min(200, Math.round((moving_time_seconds / matchedWorkout.target_duration_seconds) * 100));
      }

      const distDelta = distance_meters - (matchedWorkout.target_distance_meters || 0);
      const durDelta = moving_time_seconds - (matchedWorkout.target_duration_seconds || 0);

      match = await saveWorkoutActivityMatch({
        workout_id: matchedWorkout.id,
        activity_id: activity.id,
        is_manual_match: true,
        completion_percentage: completionPercentage,
        distance_delta_meters: distDelta,
        duration_delta_seconds: durDelta,
        pace_delta_seconds_per_km: 0,
      });

      await updateScheduledWorkout(matchedWorkout.id, {
        status: 'COMPLETED',
      });
      matchedWorkout.status = 'COMPLETED';
    }
  } catch (matchErr) {
    console.warn('Failed to correlate workout with manual activity:', matchErr);
  }

  return { matchedWorkout, match };
}

