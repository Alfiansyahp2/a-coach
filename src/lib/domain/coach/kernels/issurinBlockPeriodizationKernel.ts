// Pure Sports Science Kernel: Vladimir B. Issurin & Tudor Bompa Block Periodization Engine
// References:
// - Issurin, V. B. (2008). "Block periodization versus traditional training theory." Sports Medicine, 38(1), 17–31.
// - Bompa, T. O., & Buzzichelli, C. A. (2015). "Periodization: Theory and Methodology of Training."

export type BlockPhase = 'ACCUMULATION' | 'TRANSMUTATION' | 'REALIZATION';

export interface BlockPhaseConfig {
  phase: BlockPhase;
  nameId: string;
  typicalDurationWeeks: { min: number; max: number };
  primaryObjective: string;
  volumeMultiplier: number; // vs normal baseline
  intensityMultiplier: number;
  residualDurationDays: Record<string, number>;
  guideline: string;
}

export const BLOCK_PHASE_DEFINITIONS: Record<BlockPhase, BlockPhaseConfig> = {
  ACCUMULATION: {
    phase: 'ACCUMULATION',
    nameId: 'Fase Akumulasi (Fondasi Dasar)',
    typicalDurationWeeks: { min: 2, max: 6 },
    primaryObjective: 'Pengembangan kapasitas aerobik fundamental, hipertrofi otot umum, dan perbaikan biomekanika gerak.',
    volumeMultiplier: 1.2, // Volume tinggi (+20%)
    intensityMultiplier: 0.7, // Intensitas moderat/rendah (70%)
    residualDurationDays: {
      aerobic_system: 30, // 30 ± 5 hari
      maximum_strength: 30, // 30 ± 5 hari
    },
    guideline: 'Fokuskan pada akumulasi jam terbang di Zona 2 aerobik atau repetisi teknik terkontrol. Hindari sprint maksimal.',
  },
  TRANSMUTATION: {
    phase: 'TRANSMUTATION',
    nameId: 'Fase Transmutasi (Spesifikasi Cabor)',
    typicalDurationWeeks: { min: 2, max: 4 },
    primaryObjective: 'Transformasi kapasitas umum menjadi daya tahan laktat, toleransi ambang asam, dan kekuatan kecepatan spesifik cabor.',
    volumeMultiplier: 0.9, // Volume sedang (-10%)
    intensityMultiplier: 1.15, // Intensitas tinggi (+15%)
    residualDurationDays: {
      anaerobic_endurance: 18, // 18 ± 4 hari
      strength_endurance: 15, // 15 ± 5 hari
    },
    guideline: 'Sesi interval spesifik cabor, simulasi ronde tanding, dan latihan di ambang laktat. Pemulihan antar-sesi harus dipatuhi.',
  },
  REALIZATION: {
    phase: 'REALIZATION',
    nameId: 'Fase Realisasi (Tapering & Puncak Performa)',
    typicalDurationWeeks: { min: 1, max: 2 },
    primaryObjective: 'Pembersihan kelelahan metabolik (*supercompensation*), stimulasi neuromuskular eksplosif, dan kesiapan kompetisi.',
    volumeMultiplier: 0.5, // Pangkas volume drastis 40-50%
    intensityMultiplier: 1.0, // Pertahankan intensitas singkat
    residualDurationDays: {
      maximum_speed_alactic: 5, // 5 ± 3 hari
    },
    guideline: 'Pangkas volume 50% namun jaga kecepatan dan daya ledak singkat. Prioritaskan tidur, hidrasi, dan simpanan glikogen.',
  },
};

/**
 * Determines current mesocycle recommendations based on active phase and week progress.
 */
export function evaluateBlockPeriodization(phase: BlockPhase, weekInPhase: number): {
  config: BlockPhaseConfig;
  isPhaseTransitionDue: boolean;
  recommendedNextPhase?: BlockPhase;
  prescriptiveSummary: string;
} {
  const config = BLOCK_PHASE_DEFINITIONS[phase] || BLOCK_PHASE_DEFINITIONS.ACCUMULATION;
  const isPhaseTransitionDue = weekInPhase >= config.typicalDurationWeeks.max;

  let recommendedNextPhase: BlockPhase | undefined;
  if (isPhaseTransitionDue) {
    if (phase === 'ACCUMULATION') recommendedNextPhase = 'TRANSMUTATION';
    else if (phase === 'TRANSMUTATION') recommendedNextPhase = 'REALIZATION';
    else if (phase === 'REALIZATION') recommendedNextPhase = 'ACCUMULATION';
  }

  const prescriptiveSummary = `[${config.nameId} - Minggu ${weekInPhase}] ${config.primaryObjective} ${
    isPhaseTransitionDue
      ? `Transisi siklus jatuh tempo: Waktu tepat bertransisi ke ${recommendedNextPhase}.`
      : config.guideline
  }`;

  return {
    config,
    isPhaseTransitionDue,
    recommendedNextPhase,
    prescriptiveSummary,
  };
}
