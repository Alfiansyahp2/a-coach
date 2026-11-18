import { Activity, ScheduledWorkout, WorkoutActivityMatch, AthleteTrainingResponse } from '@/types';

export function normalizeActivityRow(row: any): Activity {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    strava_activity_id: row.strava_activity_id != null ? Number(row.strava_activity_id) : null,
    is_manual: row.is_manual != null ? Boolean(row.is_manual) : (row.strava_activity_id == null),
    name: String(row.name || ''),
    sport_type: String(row.sport_type || 'Run'),
    start_date:
      row.start_date instanceof Date
        ? row.start_date.toISOString()
        : typeof row.start_date === 'string'
          ? row.start_date
          : String(row.start_date || ''),
    distance_meters: Number(row.distance_meters || 0),
    moving_time_seconds: Number(row.moving_time_seconds || 0),
    elapsed_time_seconds: Number(row.elapsed_time_seconds || 0),
    elevation_gain_meters: Number(row.elevation_gain_meters || 0),
    average_speed_mps: Number(row.average_speed_mps || 0),
    max_speed_mps: row.max_speed_mps != null ? Number(row.max_speed_mps) : undefined,
    average_heartrate: row.average_heartrate != null ? Number(row.average_heartrate) : null,
    max_heartrate: row.max_heartrate != null ? Number(row.max_heartrate) : null,
    average_cadence: row.average_cadence != null ? Number(row.average_cadence) : null,
    average_watts: row.average_watts != null ? Number(row.average_watts) : null,
    calories: row.calories != null ? Number(row.calories) : null,
    raw_summary_polyline: row.raw_summary_polyline || null,
    description: row.description || null,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : typeof row.created_at === 'string'
          ? row.created_at
          : String(row.created_at || ''),
    updated_at:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : typeof row.updated_at === 'string'
          ? row.updated_at
          : String(row.updated_at || ''),
  };
}

export interface UpsertActivityResult {
  activity: Activity;
  isCreated: boolean;
}

export interface CreateManualActivityParams {
  name: string;
  sport_type: string;
  start_date: string;
  distance_meters?: number;
  moving_time_seconds?: number;
  elapsed_time_seconds?: number;
  elevation_gain_meters?: number;
  average_speed_mps?: number;
  max_speed_mps?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  average_watts?: number;
  calories?: number;
  description?: string;
  workout_id?: string;
  // Clinical / Check-in responses
  rpe_score?: number | null;
  pain_during_activity?: number | null;
  pain_after_activity?: number | null;
  pain_next_day?: number | null;
  swelling_observed?: boolean | null;
  instability_observed?: boolean | null;
  athlete_comments?: string | null;
}

