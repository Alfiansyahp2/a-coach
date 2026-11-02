// TypeScript interfaces for Athlete Performance & Training Platform

export type SportType = 'Run' | 'Ride' | 'Swim' | 'Walk' | 'Hike' | 'WeightTraining' | 'Workout' | string;

export type WorkoutCategory =
  | 'Easy Run'
  | 'Long Run'
  | 'Tempo Run'
  | 'Interval Training'
  | 'Recovery Run'
  | 'Fartlek'
  | 'Cycling'
  | 'Swimming'
  | 'Strength Training'
  | 'Cross Training'
  | 'Rest Day';

export type WorkoutStatus = 'PLANNED' | 'COMPLETED' | 'MISSED' | 'SKIPPED';

export type GoalType = 'DISTANCE_MONTHLY' | 'PACE_TARGET' | 'FREQUENCY_WEEKLY' | 'CUSTOM';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  weight_kg?: number;
  height_cm?: number;
  resting_heart_rate?: number;
  max_heart_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface StravaConnection {
  id: string;
  user_id: string;
  strava_athlete_id: number;
  athlete_name?: string;
  athlete_username?: string;
  avatar_url?: string;
  scopes: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StravaToken {
  id: string;
  connection_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  expires_at: string; // ISO string
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  strava_activity_id: number;
  name: string;
  sport_type: SportType;
  start_date: string; // ISO string
  distance_meters: number;
  moving_time_seconds: number;
  elapsed_time_seconds: number;
  elevation_gain_meters: number;
  average_speed_mps: number;
  max_speed_mps?: number;
  average_heartrate?: number | null;
  max_heartrate?: number | null;
  average_cadence?: number | null;
  average_watts?: number | null;
  calories?: number | null;
  raw_summary_polyline?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduledWorkout {
  id: string;
  user_id: string;
  plan_id?: string | null;
  scheduled_date: string; // YYYY-MM-DD
  workout_category: WorkoutCategory;
  target_distance_meters?: number | null;
  target_duration_seconds?: number | null;
  target_pace_seconds_per_km?: number | null; // e.g., 330 = 5:30 min/km
  target_intensity?: string | null; // 'Zone 2', 'RPE 7/10', 'Threshold'
  description?: string | null;
  status: WorkoutStatus;
  created_at: string;
  updated_at: string;
}

export interface WorkoutActivityMatch {
  id: string;
  workout_id: string;
  activity_id: string;
  is_manual_match: boolean;
  completion_percentage: number;
  distance_delta_meters: number;
  duration_delta_seconds: number;
  pace_delta_seconds_per_km: number;
  matched_at: string;
  // Hydrated joins
  workout?: ScheduledWorkout;
  activity?: Activity;
}

export interface FitnessGoal {
  id: string;
  user_id: string;
  title: string;
  goal_type: GoalType;
  target_value: number; // e.g., 100000 meters for 100km, or 4 for 4x/week
  current_value: number;
  start_date: string; // YYYY-MM-DD
  target_date: string; // YYYY-MM-DD
  is_achieved: boolean;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  activity_id?: string | null;
  sport_type?: 'Run' | 'Ride' | string;
  category: string;
  record_value: number; // time in seconds, distance in meters, speed in km/h, or elevation in meters
  record_display: string;
  achieved_date: string;
  activity_name?: string;
  subtext?: string;
  created_at: string;
  updated_at?: string;
}

export interface TrainingInsight {
  id: string;
  type: 'volume_warning' | 'pace_progress' | 'consistency' | 'recovery' | 'weekly_plan_suggestion';
  title: string;
  description: string;
  severity: 'info' | 'positive' | 'warning';
  metric_ref?: string;
  grounded_data: Record<string, any>;
  created_at: string;
}

export interface SyncLog {
  id: string;
  user_id: string;
  status: 'SUCCESS' | 'RATE_LIMITED' | 'FAILED' | 'CONFIG_MISSING';
  activities_fetched: number;
  activities_created: number;
  activities_updated: number;
  error_message?: string | null;
  started_at: string;
  completed_at: string;
}
