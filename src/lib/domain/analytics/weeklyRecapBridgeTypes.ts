export interface TacticalBridgePrescription {
  safe_km_quota: {
    total_max_km: number;
    cycling_km_cap: number;
    running_status: 'ALLOWED' | 'RESTRICTED' | 'ON_HOLD';
    running_max_km: number;
    rule_applied: string;
    rationale: string;
  };
  mandatory_rest_days: {
    count: number;
    recommended_days: string[];
    rationale: string;
  };
  target_hr_zones: {
    zone1_2_aerobic_min_pct: number;
    zone4_5_anaerobic_max_minutes: number;
    focus: string;
  };
  clinical_recovery_action: string;
}

export interface BiologicalAdaptationCardData {
  cardiovascular_purity_pct: number;
  cardiovascular_status: 'OPTIMAL_AEROBIC' | 'CARDIAC_DRIFT_WARNING' | 'ANAEROBIC_FATIGUE';
  cardiovascular_label: string;
  autonomic_balance: 'BALANCED' | 'ELEVATED_STRAIN' | 'SYMPATHETIC_OVERDRIVE';
  autonomic_label: string;
  monotony_score: number;
  strain_score: number;
  tissue_recovery_status: 'SUPERCOMPENSATION' | 'ADAPTED' | 'MICROTRAUMA_REPAIR';
  tissue_label: string;
}

export interface DeloadCelebration {
  is_deload_week: boolean;
  volume_reduction_pct: number;
  title: string;
  appreciation_badge: string;
  scientific_rationale: string;
}

export interface DualLoadTelemetry {
  external_distance_km: number;
  external_duration_formatted: string;
  external_moving_time_hours: number;
  internal_srpe_load_au: number;
  internal_tss: number;
  internal_cost_ratio_au_per_km: number;
  internal_cost_ratio_au_per_hour: number;
  efficiency_verdict: string;
}
