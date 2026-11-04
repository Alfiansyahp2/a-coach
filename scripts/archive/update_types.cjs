const fs = require('fs');
const path = require('path');

// 1. Update src/types/index.ts
const indexFile = path.join(__dirname, '..', 'src', 'types', 'index.ts');
let indexContent = fs.readFileSync(indexFile, 'utf8');

const targetGoal = `export interface FitnessGoal {
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
}`;

const replacementGoal = `export interface FitnessGoal {
  id: string;
  user_id: string;
  title: string;
  goal_type: GoalType;
  sport_type?: string; // 'Ride', 'Run', 'Swim', 'All'
  priority?: number; // 1 = Primary, 2 = Secondary, 3 = Maintenance
  target_event_name?: string; // e.g. "Gran Fondo 100K", "10K Trail"
  target_value: number; // e.g., 100000 meters for 100km, or 4 for 4x/week
  current_value: number;
  start_date: string; // YYYY-MM-DD
  target_date: string; // YYYY-MM-DD
  is_achieved: boolean;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface AthleteAvailability {
  id: string;
  user_id: string;
  available_days: string[]; // ['Tuesday', 'Friday', 'Sunday']
  preferred_days: string[]; // ['Tuesday', 'Friday', 'Sunday']
  preferred_time_of_day?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FLEXIBLE';
  max_duration_weekday_minutes: number;
  max_duration_weekend_minutes: number;
  fasting_schedule?: string; // 'NONE', 'INTERMITTENT_16_8', 'RAMADHAN'
  occupation_activity_level?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE';
  sleep_target_hours: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AthleteEquipment {
  id: string;
  user_id: string;
  equipment_type: 'SHOES' | 'BIKE' | 'WATCH' | 'OTHER';
  name: string;
  brand?: string;
  model?: string;
  sport_type: string; // 'Run', 'Ride', 'All'
  total_distance_meters: number;
  max_recommended_distance_meters?: number; // e.g. 800000 meters (800km) for shoes
  is_primary: boolean;
  is_active: boolean;
  retired_at?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AthleteDailyWellness {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  sleep_hours?: number;
  sleep_quality_score?: number; // 1-10
  resting_heart_rate?: number;
  fatigue_score?: number; // 1-10 (1 = fresh, 10 = exhausted)
  stress_level_score?: number; // 1-10
  muscle_soreness_score?: number; // 1-10
  mood_score?: number; // 1-10
  readiness_flag: 'OPTIMAL' | 'MODERATE' | 'CAUTION' | 'REST_RECOMMENDED';
  subjective_notes?: string;
  created_at: string;
  updated_at: string;
}`;

let normIndex = indexContent.replace(/\r\n/g, '\n');
let normTargetGoal = targetGoal.replace(/\r\n/g, '\n');
let normReplGoal = replacementGoal.replace(/\r\n/g, '\n');

if (normIndex.includes(normTargetGoal)) {
  fs.writeFileSync(indexFile, normIndex.replace(normTargetGoal, normReplGoal), 'utf8');
  console.log('src/types/index.ts successfully updated');
} else {
  console.error('Target not found in src/types/index.ts');
}

// 2. Update src/types/health.ts
const healthFile = path.join(__dirname, '..', 'src', 'types', 'health.ts');
let healthContent = fs.readFileSync(healthFile, 'utf8');

const targetTrainingResponse = `export interface AthleteTrainingResponse {
  id: string;
  user_id: string;
  activity_id?: string | null;
  strava_activity_id?: number | null;
  sport_type: string;
  distance_km: number;
  duration_seconds: number;
  rpe_score?: number | null;
  pain_during_activity?: number | null;
  pain_after_activity?: number | null;
  pain_next_day?: number | null;
  swelling_observed: boolean;
  instability_observed: boolean;
  fatigue_response: FatigueResponse;
  athlete_comments?: string | null;
  checkin_completed_at?: string | null;
  created_at: string;
}`;

const replTrainingResponse = `export interface AthleteTrainingResponse {
  id: string;
  user_id: string;
  activity_id?: string | null;
  strava_activity_id?: number | null;
  pain_log_id?: string | null;
  sport_type: string;
  distance_km: number;
  duration_seconds: number;
  rpe_score?: number | null;
  pain_during_activity?: number | null;
  pain_after_activity?: number | null;
  pain_next_day?: number | null;
  swelling_observed: boolean;
  instability_observed: boolean;
  fatigue_response: FatigueResponse;
  athlete_comments?: string | null;
  checkin_completed_at?: string | null;
  created_at: string;
}`;

const targetHealthContext = `export interface AuthoritativeAthleteHealthContext {
  profile: AthleteProfile | null;
  injuries: AthleteInjury[];
  recentPainLogs: AthletePainLog[];
  recentResponses: AthleteTrainingResponse[];
  medicalAssessments: AthleteMedicalAssessment[];
  latestReadiness: AthleteTrainingReadiness | null;
  clinicianRestrictions: string[];
}`;

const replHealthContext = `import type { AthleteAvailability, AthleteEquipment, AthleteDailyWellness } from './index';

export interface AuthoritativeAthleteHealthContext {
  profile: AthleteProfile | null;
  injuries: AthleteInjury[];
  recentPainLogs: AthletePainLog[];
  recentResponses: AthleteTrainingResponse[];
  medicalAssessments: AthleteMedicalAssessment[];
  latestReadiness: AthleteTrainingReadiness | null;
  clinicianRestrictions: string[];
  availability?: AthleteAvailability | null;
  equipment?: AthleteEquipment[];
  todayWellness?: AthleteDailyWellness | null;
}`;

let normHealth = healthContent.replace(/\r\n/g, '\n');
let normTargetResp = targetTrainingResponse.replace(/\r\n/g, '\n');
let normReplResp = replTrainingResponse.replace(/\r\n/g, '\n');
let normTargetCtx = targetHealthContext.replace(/\r\n/g, '\n');
let normReplCtx = replHealthContext.replace(/\r\n/g, '\n');

if (normHealth.includes(normTargetResp)) {
  normHealth = normHealth.replace(normTargetResp, normReplResp);
  console.log('src/types/health.ts: TrainingResponse updated');
}

if (normHealth.includes(normTargetCtx)) {
  normHealth = normHealth.replace(normTargetCtx, normReplCtx);
  console.log('src/types/health.ts: HealthContext updated');
}

fs.writeFileSync(healthFile, normHealth, 'utf8');
console.log('All types updated successfully.');

