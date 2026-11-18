// TypeScript domain types for Athlete Health, Injury History & Training Readiness

export type BodyRegionSide = 'LEFT' | 'RIGHT' | 'BILATERAL' | 'AXIAL';

export type MedicalEvaluationStatus =
  | 'PENDING_CLINICAL_ASSESSMENT'
  | 'CLINICALLY_ASSESSED'
  | 'UNDER_TREATMENT'
  | 'DISCHARGED_CLEARED';

export type InjuryCurrentStatus =
  | 'ACTIVE_SYMPTOMATIC'
  | 'ASYMPTOMATIC_RECOVERING'
  | 'RECURRENT'
  | 'RESOLVED'
  | 'CHRONIC';

export type PainType = 'ACHING' | 'SHARP' | 'THROBBING' | 'STIFFNESS' | 'BURNING' | 'DULL' | string;

export type FatigueResponse = 'LOW' | 'NORMAL' | 'HIGH' | 'EXHAUSTED';

export type HealthcareProviderType =
  | 'Physiotherapist'
  | 'Sports Medicine Physician'
  | 'Orthopedic Surgeon'
  | 'General Practitioner'
  | 'Athletic Trainer'
  | string;

export type VerificationStatus = 'ATHLETE_ENTERED' | 'CLINICIAN_VERIFIED' | 'AUDITED';

export type AthleteStatus =
  | 'OPTIMAL_CLEAR'
  | 'ACTIVE_WITH_UNRESOLVED_SYMPTOMS'
  | 'UNDER_ACTIVE_REHAB'
  | 'SUSPENDED_MEDICAL_EVAL_REQUIRED';

export type ReadinessState =
  | 'READY'
  | 'CONDITIONAL'
  | 'ON_HOLD'
  | 'REQUIRES_CLINICAL_REVIEW'
  | 'RESTRICTED_BY_CLINICIAN'
  | 'UNKNOWN';

export interface PhysiologicalMeasurements {
  hr_max: number | null;
  lthr: number | null;
  ftp_watts: number | null;
  vo2_max: number | null;
  running_threshold_pace_sec: number | null;
  cycling_power_zones: Record<string, [number, number]> | null;
  baseline_consistency_weeks: number | null;
  sleep_recovery_baseline: string | null;
}

export interface AthleteProfile {
  id: string;
  user_id: string;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  resting_heart_rate: number | null;
  training_days_per_week: number;
  preferred_sports: string[];
  training_experience: string;
  performance_objectives: string;
  physiological_measurements: PhysiologicalMeasurements;
  created_at: string;
  updated_at: string;
}

export interface AthleteInjury {
  id: string;
  user_id: string;
  body_region: string;
  side: BodyRegionSide;
  injury_mechanism: string;
  timeframe_description: string;
  estimated_injury_date?: string | null;
  previous_symptoms?: string | null;
  initial_severity: 'MILD' | 'MODERATE' | 'SEVERE';
  previous_swelling: boolean;
  previous_swelling_duration?: string | null;
  medical_evaluation_status: MedicalEvaluationStatus;
  current_status: InjuryCurrentStatus;
  clinician_restrictions?: string | null;
  functional_limitations?: string | null;
  recovery_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AthletePainLog {
  id: string;
  user_id: string;
  injury_id?: string | null;
  body_region: string;
  side: BodyRegionSide;
  pain_score?: number | null; // 0-10 or null if non-numeric
  pain_type?: PainType | null;
  associated_activity?: string | null;
  pain_during_activity?: number | null;
  pain_immediately_after?: number | null;
  pain_24h_after?: number | null;
  swelling_present: boolean;
  joint_instability: boolean;
  functional_limitations?: string | null;
  logged_at: string;
  created_at: string;
}

export interface AthleteTrainingResponse {
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
}

export interface AthleteMedicalAssessment {
  id: string;
  user_id: string;
  injury_id?: string | null;
  assessment_date: string;
  healthcare_provider_type: HealthcareProviderType;
  provider_name?: string | null;
  clinical_findings: string;
  confirmed_diagnosis?: string | null;
  imaging_summary?: string | null;
  clinician_restrictions: string;
  rehabilitation_protocol?: string | null;
  return_to_sport_criteria?: string | null;
  follow_up_date?: string | null;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface AthleteTrainingReadiness {
  id: string;
  user_id: string;
  evaluated_at: string;
  athlete_status: AthleteStatus;
  running_readiness: ReadinessState;
  cycling_readiness: ReadinessState;
  general_readiness: ReadinessState;
  running_restrictions?: string | null;
  cycling_restrictions?: string | null;
  rationale: string;
  trigger_symptoms: Array<{
    region: string;
    description: string;
    severity: string;
  }>;
  source_telemetry_refs: Array<{
    source: string;
    details: string;
  }>;
  medical_clearance: boolean;
  automatic_progression_allowed: boolean;
  created_at: string;
}

export interface HealthAuditTrail {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'OVERRIDE';
  state_before?: Record<string, any> | null;
  state_after?: Record<string, any> | null;
  modified_by: string;
  created_at: string;
}

import type { AthleteAvailability, AthleteEquipment, AthleteDailyWellness } from './index';

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
}

export interface SafetyValidationResult {
  isApproved: boolean;
  blockedReason?: string;
  alternativeRecommendation?: string;
  warningNotice?: string;
  triggeredRestrictions?: string[];
}

