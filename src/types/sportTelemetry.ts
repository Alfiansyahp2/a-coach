// Multi-Sport Telemetry & Decoupled AI Coach Domain Types

export type SportCluster =
  | 'CYCLIC_ENDURANCE'
  | 'STRENGTH_POWER'
  | 'COMBAT_MARTIAL_ARTS'
  | 'TEAM_FIELD_COURT'
  | 'RACQUET_PRECISION'
  | 'FUNCTIONAL_EXTREME';

export type PrimaryEnergySystem =
  | 'OXIDATIVE'
  | 'PHOSPHAGEN_ATP_PC'
  | 'ANAEROBIC_GLYCOLYTIC'
  | 'MIXED_INTERMITTENT';

export interface SubjectiveSymptomsReport {
  painLocations: string[];
  painScoreScale10: number; // 0 - 10
  jointInstabilityReported: boolean;
  swellingObserved: boolean;
  notes?: string;
}

export interface SportActivityTelemetry<T = Record<string, unknown>> {
  id: string;
  user_id: string;
  sport_code: string; // e.g. 'SPORT_DISTANCE_RUNNING', 'SPORT_POWERLIFTING'
  session_timestamp: string;
  duration_minutes: number;
  session_rpe: number; // 1 - 10 Foster Scale
  telemetry_data: T;
  agent_prescription?: SportPrescriptionPayload;
  created_at: string;
  updated_at?: string;
}

export interface SportPrescriptionPayload {
  coach_identity: string;
  governing_standard: string;
  workload_score: {
    external_load: number;
    external_unit: string;
    internal_strain: number;
    internal_method: 'TRIMP_BANISTER' | 'SESSION_RPE_FOSTER' | 'NEUROMUSCULAR_TONNAGE' | 'PLAYER_LOAD_AU';
  };
  safety_circuit_breakers: {
    is_progressive_overload_allowed: boolean;
    halt_directives: string[];
    contraindicated_movements: string[];
    rehabilitation_alternative?: string;
  };
  periodization_directive: {
    mesocycle_phase: 'ACCUMULATION' | 'TRANSMUTATION' | 'REALIZATION' | string;
    target_intensity_zone: string;
    recommended_rest_hours: number;
    next_session_prescription: string;
  };
  nutritional_prescription: {
    carbohydrate_target_g_kg: number;
    protein_target_g_kg: number;
    hydration_electrolyte_protocol: string;
    supplementation_evidence_tier_a: string[];
  };
}
