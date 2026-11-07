import { AnatomicalZoneKey } from './types';

export const ANATOMICAL_ZONES: { key: AnatomicalZoneKey; label: string; icon: string }[] = [
  { key: 'head_neck', label: 'Kepala & Leher', icon: 'brain' },
  { key: 'upper_limb', label: 'Bahu & Lengan', icon: 'shield' },
  { key: 'axial_spine', label: 'Punggung & Core', icon: 'layers' },
  { key: 'pelvis_hip', label: 'Panggul & Pinggul', icon: 'target' },
  { key: 'thigh', label: 'Paha', icon: 'activity' },
  { key: 'knee', label: 'Lutut (Knees)', icon: 'zap' },
  { key: 'lower_leg', label: 'Tungkai Bawah & Betis', icon: 'footprints' },
  { key: 'ankle_achilles', label: 'Engkel & Achilles', icon: 'compass' },
  { key: 'foot_plantar', label: 'Telapak Kaki', icon: 'check-circle' },
];
