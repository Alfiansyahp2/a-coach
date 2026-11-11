// Full-Body Anatomical Taxonomy & Sports Kinematics Matrix Types
// Authoritative definitions for athlete health tracking, injury localization,
// and sport-specific biomechanical impact modeling.

export type AnatomicalZoneKey =
  | 'head_neck'
  | 'upper_limb'
  | 'axial_spine'
  | 'pelvis_hip'
  | 'thigh'
  | 'knee'
  | 'lower_leg'
  | 'ankle_achilles'
  | 'foot_plantar';

export interface AnatomicalRegionMeta {
  id: string;
  name: string;
  clinicalTerm: string;
  zoneKey: AnatomicalZoneKey;
  zoneLabel: string;
  allowedSides: ('RIGHT' | 'LEFT' | 'BILATERAL' | 'AXIAL')[];
  defaultSide: 'RIGHT' | 'LEFT' | 'BILATERAL' | 'AXIAL';
  isLowerExtremity: boolean;
  isAxial: boolean;
  isUpperExtremity: boolean;
  runningImpactSeverity: 'HIGH_RISK' | 'MODERATE' | 'LOW';
  cyclingImpactSeverity: 'SAFE_FLAT' | 'MODERATE_TORQUE' | 'RESTRICTED_AERO';
  suggestedMechanism: string;
  suggestedTimeframe: string;
  suggestedLimitations: string;
  trainingGuidance: {
    running: string;
    cycling: string;
    crossTraining: string;
  };
  primaryMuscles?: string[];
  biomechanicalRole?: string;
  commonPathologies?: string[];
  rehabilitationFocus?: string[];
}

export interface AnatomicalZoneGroup {
  key: AnatomicalZoneKey;
  label: string;
  iconName: string;
  description: string;
  regions: AnatomicalRegionMeta[];
}
