import { DEFAULT_USER_ID } from '../client';
import { Activity, ScheduledWorkout, WorkoutActivityMatch, AthleteTrainingResponse } from '@/types';
import { upsertAthleteTrainingResponse } from '../healthRepo';
import { CreateManualActivityParams } from './activityTypes';
import { upsertActivity } from './activityMutationRepo';
import { correlateManualActivityWithWorkout } from './activityWorkoutCorrelator';

export async function createManualActivity(
  userId: string = DEFAULT_USER_ID,
  params: CreateManualActivityParams
): Promise<{
  activity: Activity;
  matchedWorkout: ScheduledWorkout | null;
  match: WorkoutActivityMatch | null;
  trainingResponse?: AthleteTrainingResponse | null;
}> {
  const distance_meters = Number(params.distance_meters || 0);
  const moving_time_seconds = Number(params.moving_time_seconds || 0);
  const elapsed_time_seconds = Number(params.elapsed_time_seconds || moving_time_seconds);
  const elevation_gain_meters = Number(params.elevation_gain_meters || 0);

  let average_speed_mps = params.average_speed_mps;
  if (!average_speed_mps && moving_time_seconds > 0 && distance_meters > 0) {
    average_speed_mps = Number((distance_meters / moving_time_seconds).toFixed(2));
  }

  const { activity } = await upsertActivity({
    user_id: userId,
    strava_activity_id: null,
    is_manual: true,
    name: params.name || 'Manual Workout Activity',
    sport_type: (params.sport_type || 'Ride') as any,
    start_date: params.start_date || new Date().toISOString(),
    distance_meters,
    moving_time_seconds,
    elapsed_time_seconds,
    elevation_gain_meters,
    average_speed_mps: average_speed_mps || 0,
    max_speed_mps: params.max_speed_mps !== undefined && params.max_speed_mps !== null ? params.max_speed_mps : undefined,
    average_heartrate: params.average_heartrate || null,
    max_heartrate: params.max_heartrate || null,
    average_cadence: params.average_cadence || null,
    average_watts: params.average_watts || null,
    calories: params.calories || null,
    description: params.description || null,
  });

  // Attempt workout correlation
  const { matchedWorkout, match } = await correlateManualActivityWithWorkout(
    userId,
    activity,
    distance_meters,
    moving_time_seconds,
    params.start_date,
    params.sport_type,
    params.workout_id
  );

  // Record athlete training response if check-in metrics provided
  let trainingResponse: AthleteTrainingResponse | null = null;
  if (
    params.rpe_score != null ||
    params.pain_during_activity != null ||
    params.pain_after_activity != null ||
    params.swelling_observed != null ||
    params.athlete_comments != null
  ) {
    try {
      trainingResponse = await upsertAthleteTrainingResponse({
        user_id: userId,
        activity_id: activity.id,
        strava_activity_id: null,
        sport_type: params.sport_type,
        distance_km: Number((distance_meters / 1000).toFixed(2)),
        duration_seconds: moving_time_seconds,
        rpe_score: params.rpe_score ?? null,
        pain_during_activity: params.pain_during_activity ?? 0,
        pain_after_activity: params.pain_after_activity ?? 0,
        pain_next_day: params.pain_next_day ?? null,
        swelling_observed: Boolean(params.swelling_observed),
        instability_observed: Boolean(params.instability_observed),
        fatigue_response: (params.rpe_score ?? 0) >= 8 ? 'HIGH' : (params.rpe_score ?? 0) >= 5 ? 'NORMAL' : 'LOW',
        athlete_comments: params.athlete_comments || params.description || null,
        checkin_completed_at: new Date().toISOString(),
      });
    } catch (respErr) {
      console.warn('Failed to save athlete training response:', respErr);
    }
  }

  return {
    activity,
    matchedWorkout,
    match,
    trainingResponse,
  };
}

