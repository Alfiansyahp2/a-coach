// Schema-Driven Telemetry & Adaptive UI Generator Specifications for Decoupled Sport Coaches
import { SportCluster, PrimaryEnergySystem } from '@/types/sportTelemetry';

export type FieldInputType = 'number' | 'text' | 'select' | 'slider' | 'boolean';

export interface SportTelemetryFieldSchema {
  key: string;
  label: string;
  type: FieldInputType;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  tooltip?: string;
  category: 'workload' | 'technique' | 'safety';
}

export interface SportCoachUiDefinition {
  sportCode: string;
  sportName: string;
  cluster: SportCluster;
  iconName: string;
  governingStandard: string;
  primaryEnergySystem: PrimaryEnergySystem;
  fields: SportTelemetryFieldSchema[];
  calculateSummary?: (values: Record<string, any>) => Array<{ label: string; value: string | number; badge?: string }>;
}

export const CLUSTER_DEFAULTS: Record<SportCluster, { label: string; icon: string; defaultFields: SportTelemetryFieldSchema[] }> = {
  STRENGTH_POWER: {
    label: 'Kekuatan & Daya Maksimal',
    icon: 'dumbbell',
    defaultFields: [
      { key: 'weightKg', label: 'Beban Angkatan', type: 'number', unit: 'kg', min: 1, max: 500, defaultValue: 100, category: 'workload' },
      { key: 'setsCount', label: 'Jumlah Set', type: 'number', min: 1, max: 20, defaultValue: 5, category: 'workload' },
      { key: 'repsPerSet', label: 'Repetisi per Set', type: 'number', min: 1, max: 30, defaultValue: 5, category: 'workload' },
      { key: 'targetRpe', label: 'Tingkat Usaha (RPE 1-10)', type: 'slider', min: 1, max: 10, step: 0.5, defaultValue: 8, category: 'workload' },
      { key: 'jointPainReported', label: 'Nyeri Sendi / Bahu / Lutut', type: 'boolean', defaultValue: false, category: 'safety' },
    ],
  },
  CYCLIC_ENDURANCE: {
    label: 'Daya Tahan Siklik',
    icon: 'bike',
    defaultFields: [
      { key: 'distanceKm', label: 'Jarak Tempuh', type: 'number', unit: 'km', min: 0.1, max: 300, step: 0.1, defaultValue: 25, category: 'workload' },
      { key: 'averageHeartRate', label: 'Detak Jantung Rata-Rata', type: 'number', unit: 'bpm', min: 40, max: 220, defaultValue: 145, category: 'workload' },
      { key: 'cadenceRpm', label: 'Kadens Rata-Rata', type: 'number', unit: 'rpm/spm', min: 30, max: 220, defaultValue: 85, category: 'technique' },
      { key: 'elevationGainMeters', label: 'Kenaikan Elevasi', type: 'number', unit: 'm', min: 0, max: 5000, defaultValue: 150, category: 'workload' },
    ],
  },
  COMBAT_MARTIAL_ARTS: {
    label: 'Bela Diri & Kontak Fisik',
    icon: 'swords',
    defaultFields: [
      { key: 'roundsCount', label: 'Jumlah Ronde', type: 'number', min: 1, max: 15, defaultValue: 5, category: 'workload' },
      { key: 'roundMinutes', label: 'Durasi per Ronde', type: 'number', unit: 'menit', min: 1, max: 10, defaultValue: 3, category: 'workload' },
      { key: 'sparringIntensity', label: 'Intensitas Sparring', type: 'select', options: [
        { value: 'DRILL', label: 'Teknik / Drill Ringan' },
        { value: 'MODERATE', label: 'Sparring Terkontrol (70%)' },
        { value: 'HARD', label: 'Simulasi Pertandingan (100%)' },
      ], defaultValue: 'MODERATE', category: 'workload' },
      { key: 'headImpactObserved', label: 'Benturan Kepala Terjadi (SCAT6)', type: 'boolean', defaultValue: false, category: 'safety' },
    ],
  },
  TEAM_FIELD_COURT: {
    label: 'Olahraga Beregu & Lapangan',
    icon: 'trophy',
    defaultFields: [
      { key: 'matchMinutes', label: 'Durasi Bermain Aktif', type: 'number', unit: 'menit', min: 5, max: 120, defaultValue: 60, category: 'workload' },
      { key: 'highSpeedRunningMeters', label: 'High-Speed Running (HSR)', type: 'number', unit: 'm', min: 0, max: 5000, defaultValue: 800, category: 'workload' },
      { key: 'sprintCount', label: 'Jumlah Sprint Maksimal', type: 'number', min: 0, max: 80, defaultValue: 15, category: 'workload' },
      { key: 'fifaWarmupDone', label: 'Protokol Pemanasan FIFA 11+ Dilakukan', type: 'boolean', defaultValue: true, category: 'safety' },
    ],
  },
  RACQUET_PRECISION: {
    label: 'Raket, Akuatik & Presisi',
    icon: 'target',
    defaultFields: [
      { key: 'activeMinutes', label: 'Waktu Aktif', type: 'number', unit: 'menit', min: 5, max: 300, defaultValue: 60, category: 'workload' },
      { key: 'primaryScore', label: 'Skor Efisiensi (SWOLF / Akurasi)', type: 'number', min: 1, max: 300, defaultValue: 72, category: 'technique' },
      { key: 'powerHitsCount', label: 'Pukulan Keras / Smash / Tarikan', type: 'number', min: 0, max: 500, defaultValue: 45, category: 'workload' },
      { key: 'upperLimbStrain', label: 'Gejala Regangan Bahu / Siku / Pergelangan', type: 'boolean', defaultValue: false, category: 'safety' },
    ],
  },
  FUNCTIONAL_EXTREME: {
    label: 'Kebugaran Fungsional & Ekstrem',
    icon: 'flame',
    defaultFields: [
      { key: 'amrapRounds', label: 'Jumlah Ronde / Rute / Ombak', type: 'number', min: 1, max: 50, defaultValue: 6, category: 'workload' },
      { key: 'workoutDensityRpe', label: 'Kerapatan Latihan (RPE 1-10)', type: 'slider', min: 1, max: 10, step: 0.5, defaultValue: 8.5, category: 'workload' },
      { key: 'timeUnderTensionSeconds', label: 'Time Under Tension (TUT)', type: 'number', unit: 'detik', min: 0, max: 1800, defaultValue: 300, category: 'technique' },
      { key: 'extremeFatigueExhaustion', label: 'Gejala Kelelahan Ekstrem / Otot Kaku Akut', type: 'boolean', defaultValue: false, category: 'safety' },
    ],
  },
};

export function createDynamicSportCoachSchema(
  sportCode: string,
  sportName: string,
  cluster: SportCluster,
  customStandard?: string,
  customEnergySystem?: PrimaryEnergySystem
): SportCoachUiDefinition {
  const clusterMeta = CLUSTER_DEFAULTS[cluster] || CLUSTER_DEFAULTS.CYCLIC_ENDURANCE;

  return {
    sportCode: sportCode.toUpperCase().startsWith('SPORT_') ? sportCode.toUpperCase() : `SPORT_${sportCode.toUpperCase().replace(/\s+/g, '_')}`,
    sportName,
    cluster,
    iconName: clusterMeta.icon,
    governingStandard: customStandard || `${sportName} Evidence-Based Coaching Protocol (Grounded Science)`,
    primaryEnergySystem: customEnergySystem || (cluster === 'STRENGTH_POWER' ? 'PHOSPHAGEN_ATP_PC' : cluster === 'CYCLIC_ENDURANCE' ? 'OXIDATIVE' : 'MIXED_INTERMITTENT'),
    fields: [...clusterMeta.defaultFields],
    calculateSummary: (values) => {
      const summaries: Array<{ label: string; value: string | number; badge?: string }> = [];
      if (values.weightKg && values.setsCount && values.repsPerSet) {
        summaries.push({ label: 'Estimasi Tonase', value: `${Math.round(values.weightKg * values.setsCount * values.repsPerSet)} kg`, badge: 'Kekuatan' });
      }
      if (values.distanceKm) {
        summaries.push({ label: 'Jarak Terkalkulasi', value: `${values.distanceKm} km`, badge: 'Volume' });
      }
      if (values.roundsCount) {
        summaries.push({ label: 'Total Ronde', value: `${values.roundsCount} Ronde`, badge: 'Durasi Tempur' });
      }
      if (values.highSpeedRunningMeters) {
        summaries.push({ label: 'HSR Volume', value: `${values.highSpeedRunningMeters} m`, badge: 'Sprint' });
      }
      if (values.primaryScore) {
        summaries.push({ label: 'Efisiensi / Presisi', value: values.primaryScore, badge: 'Teknik' });
      }
      return summaries;
    },
  };
}
