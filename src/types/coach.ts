export interface PMCDataPoint {
  date: string;
  date_key: string;
  day_load: number;
  ctl: number;
  atl: number;
  tsb: number;
  tsb_zone:
    | 'HIGH_FATIGUE_OVERREACHING'
    | 'OPTIMAL_OVERLOAD'
    | 'NEUTRAL_MAINTENANCE'
    | 'PEAK_RACE_FORM'
    | 'DETRAINING_TRANSITION';
  interpretation: string;
}

export interface PMCResponse {
  data_points: PMCDataPoint[];
  current_ctl: number;
  current_atl: number;
  current_tsb: number;
  current_zone:
    | 'HIGH_FATIGUE_OVERREACHING'
    | 'OPTIMAL_OVERLOAD'
    | 'NEUTRAL_MAINTENANCE'
    | 'PEAK_RACE_FORM'
    | 'DETRAINING_TRANSITION';
  ewma_acwr: number;
  recommended_action: string;
}

export interface SessionDebriefResult {
  activity_id: string;
  aerobic_decoupling_pct: number | null;
  has_cardiac_drift: boolean;
  drift_severity: 'NONE' | 'EXCELLENT' | 'STABLE' | 'MILD' | 'MODERATE';
  zone_compliance_pct: number;
  zone_compliance_rating: string;
  coach_debrief_feedback: string;
  corrective_tactical_advice: string;
}

export interface DailyCoachBriefing {
  greeting: string;
  todayStatus: string;
  badgeTone: 'positive' | 'warning' | 'info' | 'critical';
  recommendationHeadline: string;
  recommendedAction: string;
  tacticalInstructions: {
    nutritionalStrategy: string;
    cadenceBiomechanicalTarget: string;
    safetyRedFlags: string;
  };
  fastingAwareness?: {
    isFastingDay: boolean;
    guideline: string;
  };
  pmcSnapshot: {
    ctl: number;
    atl: number;
    tsb: number;
    zoneName: string;
  };
}

