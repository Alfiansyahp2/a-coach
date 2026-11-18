import { AnatomicalRegionMeta } from '../types';
import { HEAD_NECK_REGIONS } from './headNeck';
import { UPPER_LIMB_REGIONS } from './upperLimb';
import { AXIAL_SPINE_REGIONS } from './axialSpine';
import { PELVIS_HIP_REGIONS } from './pelvisHip';
import { THIGH_REGIONS } from './thigh';
import { KNEE_REGIONS } from './knee';
import { LOWER_LEG_REGIONS } from './lowerLeg';
import { ANKLE_ACHILLES_REGIONS } from './ankleAchilles';
import { FOOT_PLANTAR_REGIONS } from './footPlantar';

export const ANATOMICAL_REGIONS: AnatomicalRegionMeta[] = [
  ...HEAD_NECK_REGIONS,
  ...UPPER_LIMB_REGIONS,
  ...AXIAL_SPINE_REGIONS,
  ...PELVIS_HIP_REGIONS,
  ...THIGH_REGIONS,
  ...KNEE_REGIONS,
  ...LOWER_LEG_REGIONS,
  ...ANKLE_ACHILLES_REGIONS,
  ...FOOT_PLANTAR_REGIONS,
];

export * from './headNeck';
export * from './upperLimb';
export * from './axialSpine';
export * from './pelvisHip';
export * from './thigh';
export * from './knee';
export * from './lowerLeg';
export * from './ankleAchilles';
export * from './footPlantar';
