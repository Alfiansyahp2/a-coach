// Pure Sports Science Kernel: Tim J. Gabbett Acute:Chronic Workload Ratio (ACWR) Engine
// Reference: Gabbett, T. J. (2016). "The training—injury prevention paradox." BJSM, 50(5), 273–280.

export type AcwrRiskZone = 'UNDERLOAD' | 'SWEET_SPOT' | 'ELEVATED_RISK' | 'DANGER_ZONE';

export interface AcwrCalculationInput {
  acuteWorkload7Days: number; // Cumulative load of past 7 days (AU / KM / Tonase)
  chronicWorkload28DaysTotal: number; // Cumulative load of past 28 days
}

export interface AcwrEvaluationResult {
  acwrRatio: number;
  acuteWorkload: number;
  chronicWorkloadAverage: number;
  riskZone: AcwrRiskZone;
  isSafeForOverload: boolean;
  maxSafeAcuteLoadNextWeek: number;
  prescriptiveGuideline: string;
}

/**
 * Computes Acute:Chronic Workload Ratio (ACWR).
 * Chronic workload is the weekly average of the past 28 days (total / 4).
 * Ratio = Acute 7-Day Load / (Chronic 28-Day Load / 4)
 */
export function calculateGabbettAcwr(input: AcwrCalculationInput): AcwrEvaluationResult {
  const acute = Math.max(0, input.acuteWorkload7Days);
  const chronicTotal = Math.max(0, input.chronicWorkload28DaysTotal);
  const chronicAverage = chronicTotal > 0 ? chronicTotal / 4 : acute; // Default baseline if historical data is limited

  if (chronicAverage <= 0) {
    return {
      acwrRatio: 1.0,
      acuteWorkload: acute,
      chronicWorkloadAverage: acute,
      riskZone: 'SWEET_SPOT',
      isSafeForOverload: true,
      maxSafeAcuteLoadNextWeek: acute * 1.1,
      prescriptiveGuideline: 'Data baseline awal: Pertahankan kenaikan beban tidak melebihi 10% per minggu.',
    };
  }

  const ratio = Math.round((acute / chronicAverage) * 100) / 100;
  let riskZone: AcwrRiskZone = 'SWEET_SPOT';
  let isSafeForOverload = true;
  let prescriptiveGuideline = '';

  if (ratio < 0.8) {
    riskZone = 'UNDERLOAD';
    isSafeForOverload = true;
    prescriptiveGuideline =
      'Beban latihan berada di bawah kapasitas kebugaran kronis (ACWR < 0.8). Kebugaran mulai menurun; disarankan peningkatan beban bertahap menuju Sweet Spot.';
  } else if (ratio <= 1.3) {
    riskZone = 'SWEET_SPOT';
    isSafeForOverload = true;
    prescriptiveGuideline =
      'Zona Optimal / Sweet Spot (0.8 - 1.3): Tingkat kebugaran meningkat dengan risiko cedera jaringan lunak minimal.';
  } else if (ratio <= 1.5) {
    riskZone = 'ELEVATED_RISK';
    isSafeForOverload = false;
    prescriptiveGuideline =
      'Zona Waspada (1.3 - 1.5): Peningkatan beban akut mendekati batas toleransi jaringan. Batasi latihan kecepatan maksimal dan prioritaskan pemulihan.';
  } else {
    riskZone = 'DANGER_ZONE';
    isSafeForOverload = false;
    prescriptiveGuideline =
      'Zona Bahaya Cedera Akut (ACWR >= 1.5): Lonjakan beban terlalu cepat! Risiko cedera meningkat 3-4x lipat. Wajib pangkas volume sesi berikutnya sebesar 30-50%.';
  }

  // Safe ceiling calculation (ACWR 1.25 maximum target)
  const maxSafeAcuteLoadNextWeek = Math.round(chronicAverage * 1.25);

  return {
    acwrRatio: ratio,
    acuteWorkload: acute,
    chronicWorkloadAverage: Math.round(chronicAverage * 10) / 10,
    riskZone,
    isSafeForOverload,
    maxSafeAcuteLoadNextWeek,
    prescriptiveGuideline,
  };
}
