// Shared Sports Science Kernel: Racquet, Precision, Aquatic & Functional Extreme Sports
// Grounded in SWOLF Swimming Efficiency, Nirschl Epicondylitis Scale,
// Schweizer Finger Pulley Biomechanics, and ACSM Rhabdomyolysis Prevention

export interface SwolfCalculationResult {
  swolfScore: number;
  efficiencyTier: 'ELITE_EFFICIENCY' | 'COMPETITIVE' | 'RECREATIONAL' | 'POOR_STROKE_MECHANICS';
  directive: string;
}

export interface RhabdomyolysisRiskEvaluation {
  isEmergencyAlert: boolean;
  riskTier: 'LOW' | 'MODERATE' | 'CRITICAL_HAZARD';
  directive: string;
}

export interface ClimbingFingerPulleyEvaluation {
  isSafeForHardCrimp: boolean;
  isPulleyStrainDetected: boolean;
  directive: string;
}

/**
 * 1. Computes SWOLF (Swim Golf) swimming stroke efficiency: Time (seconds) + Stroke Count per pool length.
 */
export function calculateSwolfScore(
  lapTimeSeconds: number,
  strokeCount: number,
  poolLengthMeters: 25 | 50 = 25
): SwolfCalculationResult {
  const time = Math.max(10, Number(lapTimeSeconds || 30));
  const strokes = Math.max(5, Number(strokeCount || 18));
  const swolfScore = Math.round(time + strokes);

  const baseline25m = 35;
  const baseline50m = 70;
  const baseline = poolLengthMeters === 50 ? baseline50m : baseline25m;

  let efficiencyTier: 'ELITE_EFFICIENCY' | 'COMPETITIVE' | 'RECREATIONAL' | 'POOR_STROKE_MECHANICS' = 'RECREATIONAL';
  let directive = '';

  if (swolfScore <= baseline) {
    efficiencyTier = 'ELITE_EFFICIENCY';
    directive = `Skor SWOLF ${swolfScore} menunjukkan efisiensi hidrodinamika tinggi dan slip kayuhan minimal (Distance Per Stroke optimal).`;
  } else if (swolfScore <= baseline + 10) {
    efficiencyTier = 'COMPETITIVE';
    directive = `Skor SWOLF ${swolfScore} dalam rentang kompetitif yang stabil. Pertahankan ritme kayuhan tanpa memperpendek jangkauan lengan.`;
  } else if (swolfScore <= baseline + 22) {
    efficiencyTier = 'RECREATIONAL';
    directive = `Skor SWOLF ${swolfScore} menunjukkan kecenderungan slip kayuhan. Fokus pada teknik catching awal dan rotasi panggul (body roll).`;
  } else {
    efficiencyTier = 'POOR_STROKE_MECHANICS';
    directive = `Skor SWOLF ${swolfScore} tinggi menunjukkan kelelahan mekanika kayuhan. Kurangi laju kayuhan (stroke rate) dan maksimalkan glide fase dorong.`;
  }

  return {
    swolfScore,
    efficiencyTier,
    directive,
  };
}

/**
 * 2. Computes archery draw volume tonnage: Arrows * Draw Weight (lbs) * 0.453592 kg.
 */
export function calculateArcheryVolumeTonnage(
  arrowCount: number,
  drawWeightLbs: number
): { arrowCount: number; drawWeightLbs: number; volumeTonnageKg: number } {
  const arrows = Math.max(0, Number(arrowCount || 0));
  const weightLbs = Math.max(10, Number(drawWeightLbs || 30));
  const volumeTonnageKg = Number((arrows * weightLbs * 0.453592).toFixed(1));

  return {
    arrowCount: arrows,
    drawWeightLbs: weightLbs,
    volumeTonnageKg,
  };
}

/**
 * 3. Evaluates functional fitness extreme eccentric volume for Rhabdomyolysis risk.
 */
export function evaluateRhabdomyolysisRisk(
  durationMinutes: number,
  sessionRpe: number,
  isHighVolumeEccentric: boolean = false,
  hasDarkUrineOrExtremeSwelling: boolean = false
): RhabdomyolysisRiskEvaluation {
  const dur = Math.max(1, Number(durationMinutes || 0));
  const rpe = Math.max(1, Math.min(10, Number(sessionRpe || 6)));

  if (hasDarkUrineOrExtremeSwelling) {
    return {
      isEmergencyAlert: true,
      riskTier: 'CRITICAL_HAZARD',
      directive:
        '[ALARM DARURAT MEDIS: GEJALA RHABDOMYOLYSIS] Terdeteksi urin gelap/teh pekat atau pembengkakan otot ekstrim pasca-volume eksentrik masif. Ini adalah tanda mioglobinuria akibat nekrosis serat otot rangka yang dapat memicu gagal ginjal akut. Wajib SEGERA ke Instalasi Gawat Darurat (IGD) medis untuk hidrasi intravena. Hentikan seluruh latihan fisik!',
    };
  }

  if (isHighVolumeEccentric && dur >= 35 && rpe >= 9) {
    return {
      isEmergencyAlert: false,
      riskTier: 'MODERATE',
      directive:
        'Volume eksentrik tinggi (AMRAP/Metcon) dengan kelelahan maksimal. Tingkatkan hidrasi cairan elektrolit minimal 2.5 - 3.5 liter dan monitor warna urine. Hindari latihan beban eksentrik pada kelompok otot yang sama selama 72 jam.',
    };
  }

  return {
    isEmergencyAlert: false,
    riskTier: 'LOW',
    directive: 'Beban fungsional dalam toleransi normal. Pertahankan hidrasi reguler pasca-metcon.',
  };
}

/**
 * 4. Evaluates climbing A2/A4 annular finger pulley strain (Andreas Schweizer Biomechanics).
 */
export function evaluateClimbingFingerPulleyRisk(
  fingerPainScale10: number = 0,
  hasAudibleBowstringPop: boolean = false,
  isFullCrimpHeavy: boolean = false
): ClimbingFingerPulleyEvaluation {
  const pain = Math.max(0, Math.min(10, Number(fingerPainScale10 || 0)));

  if (hasAudibleBowstringPop || pain >= 6) {
    return {
      isSafeForHardCrimp: false,
      isPulleyStrainDetected: true,
      directive:
        '[FINGER PULLEY RUPTURE WARNING] Terdeteksi bunyi "pop" atau nyeri akut tajam pada katrol A2/A4 jari tangan. Dilarang keras memanjat atau menggantung (hangboard). Wajib evaluasi USG muskuloskeletal atau MRI untuk memeriksa integritas ligamen katrol.',
    };
  }

  if (pain >= 3 || isFullCrimpHeavy) {
    return {
      isSafeForHardCrimp: false,
      isPulleyStrainDetected: true,
      directive:
        'Terdeteksi regangan katrol jari A2/A4 (skor nyeri ' +
        pain +
        '/10). Dilarang menggunakan teknik full crimp bersudut tajam. Alihkan pegangan ke open hand / drag grip dan gunakan taping H-tape.',
    };
  }

  return {
    isSafeForHardCrimp: true,
    isPulleyStrainDetected: false,
    directive: 'Kondisi tendon dan katrol jari fleksor tangan dalam batas aman.',
  };
}
