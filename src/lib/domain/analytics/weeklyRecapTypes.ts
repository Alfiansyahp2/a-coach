import {
  Activity,
  AthleteInjury,
  AthletePainLog,
  AthleteTrainingResponse,
  ScheduledWorkout,
  SportType,
} from '@/types';

export interface WeeklyRecapTimeframe {
  startDate: string; // ISO string (UTC)
  endDate: string; // ISO string (UTC)
  startDateFormatted: string; // e.g. "02 Nov 2026"
  endDateFormatted: string; // e.g. "08 Nov 2026"
  label: string; // e.g. "02 Nov – 08 Nov 2026"
  daysCount: number; // 7
  isCurrentWeek?: boolean;
  weeksAgo?: number;
}

export interface SportRecapBreakdown {
  sport_type: SportType;
  session_count: number;
  total_distance_km: number;
  total_duration_seconds: number;
  formatted_duration: string;
  total_elevation_gain_meters: number;
  average_speed_kmh: number;
  average_pace_formatted?: string;
  percentage_of_volume: number;
}

export interface DailyActivityRecap {
  date: string; // YYYY-MM-DD
  day_name: string; // e.g. "Senin", "Selasa"
  session_count: number;
  total_distance_km: number;
  total_duration_seconds: number;
  formatted_duration: string;
  activities: Array<{
    id: string;
    name: string;
    sport_type: SportType;
    distance_km: number;
    formatted_duration: string;
    start_date: string;
  }>;
}

export interface WeeklyActivityRecap {
  total_sessions: number;
  total_distance_km: number;
  total_duration_seconds: number;
  formatted_duration: string;
  total_elevation_gain_meters: number;
  total_calories: number;
  sport_breakdown: SportRecapBreakdown[];
  daily_breakdown: DailyActivityRecap[];
  active_days_count: number;
  rest_days_count: number;
  compliance?: {
    scheduled_count: number;
    completed_count: number;
    compliance_rate_pct: number;
    missed_count: number;
  };
}

export interface NewInjuryDossier {
  id: string;
  body_region: string;
  side: string;
  injury_mechanism: string;
  initial_severity: 'MILD' | 'MODERATE' | 'SEVERE';
  estimated_injury_date?: string | null;
  current_status: string;
  swelling_history: boolean;
  medical_evaluation_status: string;
}

export interface ActiveInjuryDossier {
  id: string;
  body_region: string;
  side: string;
  current_status: string;
  medical_evaluation_status: string;
  clinician_restrictions?: string | null;
}

export interface WeeklyPainTelemetry {
  total_logs_count: number;
  average_pain_score: number;
  peak_pain_score: number;
  peak_pain_location: string | null;
  swelling_observed_count: number;
  joint_instability_count: number;
  dominant_pain_types: string[];
}

export interface WeeklyPostActivityResponse {
  total_checkins: number;
  average_rpe: number;
  pain_free_sessions_count: number;
  mild_pain_sessions_count: number;
  significant_pain_sessions_count: number;
  swelling_occurrences: number;
  instability_occurrences: number;
  fatigue_distribution: Record<string, number>;
}

export interface WeeklyInjuryRecap {
  new_injuries_count: number;
  new_injuries: NewInjuryDossier[];
  active_monitored_injuries: ActiveInjuryDossier[];
  affected_anatomical_regions: string[];
  pain_telemetry: WeeklyPainTelemetry;
  training_responses_summary: WeeklyPostActivityResponse;
}

export interface WeeklyClinicalVerdict {
  status: 'OPTIMAL' | 'CAUTION' | 'RESTRICTED' | 'SUSPENDED';
  joint_safety_status: string;
  load_vs_injury_correlation: string;
  running_guidance: string;
  cycling_guidance: string;
  actionable_recommendations: string[];
}

export interface WeeklyProMetrics {
  foster_srpe_load: number;
  weekly_tss: number;
  training_monotony: number;
  training_strain: number;
  polarization: {
    low_zone_pct: number;
    moderate_zone_pct: number;
    high_zone_pct: number;
    is_optimal_polarized: boolean;
    classification: string;
    verdict: string;
  };
  wow_delta: {
    distance_change_pct: number;
    tss_change_pct: number;
    safety_flag: string;
    interpretation: string;
  };
  musculoskeletal: {
    impact_running_pct: number;
    non_impact_cycling_pct: number;
    joint_safety_rating: string;
    pain_gradient_note: string;
  };
  periodization_phase: string;
  pro_coach_verdict: string;
  next_week_bridge_advice: string;
}

export interface WeeklyActivityAndInjuryRecap {
  timeframe: WeeklyRecapTimeframe;
  activity_summary: WeeklyActivityRecap;
  injury_summary: WeeklyInjuryRecap;
  clinical_verdict: WeeklyClinicalVerdict;
  pro_metrics?: WeeklyProMetrics;
}

export interface ComputeWeeklyRecapParams {
  activities: Activity[];
  injuries: AthleteInjury[];
  painLogs?: AthletePainLog[];
  trainingResponses?: AthleteTrainingResponse[];
  scheduledWorkouts?: ScheduledWorkout[];
  referenceDate?: Date | string;
}
