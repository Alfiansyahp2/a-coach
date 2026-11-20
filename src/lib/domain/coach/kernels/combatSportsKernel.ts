// Shared Sports Science Kernel: Combat Sports & Martial Arts
// Grounded in SCAT6 Concussion Consensus (Patricios et al. 2023, BJSM),
// ACSM Fluid & Weight Management (Sawka et al. 2007), and ISSN Combat Nutrition (Jäger et al. 2017)

export interface Scat6ConcussionEvaluation {
  isLocked: boolean;
  remainingLockoutDays: number;
  grtpStage: 1 | 2 | 3 | 4 | 5 | 6;
  grtpStageName: string;
  clinicalDirective: string;
  requiresMedicalClearance: boolean;
}

export interface CombatRoundDensityResult {
  totalWorkSeconds: number;
  totalRestSeconds: number;
  workRestRatio: number;
  workDensityPct: number;
  glycolyticLactateTier: 'AEROBIC_DRILL' | 'MODERATE_GLYCOLYTIC' | 'HIGH_LACTATE_ACCUMULATION' | 'EXTREME_ACIDOSIS';
  estimatedLactateMmolL: string;
  recommendedRecoveryHours: number;
}

export interface WeightCutSafetyResult {
  acuteLossPct: number;
  weightCutTier: 'SAFE_GRADUAL' | 'MONITORED_DEFICIT' | 'CRITICAL_HAZARD';
  proteinPrescriptionGKg: number;
  rehydrationFluidMlPerKgLost: number;
  isEmergencyAlert: boolean;
  directive: string;
}

/**
 * 1. Evaluates mandatory SCAT6 concussion stand-down lockout and Graduated Return-to-Play (GRTP).
 * Non-negotiable medical circuit breaker: Any symptomatic head impact locks contact for >= 14 days.
 */
export function evaluateScat6ConcussionGate(
  hasHeadImpact: boolean,
  symptomsCount: number = 0,
  daysSinceImpact: number = 0,
  hasAmnesiaOrLoc: boolean = false
): Scat6ConcussionEvaluation {
  if (!hasHeadImpact && symptomsCount === 0 && !hasAmnesiaOrLoc) {
    return {
      isLocked: false,
      remainingLockoutDays: 0,
      grtpStage: 6,
      grtpStageName: 'Stage 6: Full Contact & Unrestricted Competition',
      clinicalDirective: 'Tidak ada laporan trauma kepala atau gejala gegar otak. Izin latihan kontak aktif.',
      requiresMedicalClearance: false,
    };
  }

  // Symptomatic head impact or LOC/Amnesia triggers strict 14-day stand-down
  const days = Math.max(0, Number(daysSinceImpact || 0));
  const remainingLockoutDays = Math.max(0, 14 - days);
  const isLocked = remainingLockoutDays > 0;

  // Determine Graduated Return to Play (GRTP) Stage based on elapsed days symptom-free
  let grtpStage: 1 | 2 | 3 | 4 | 5 | 6 = 1;
  let grtpStageName = 'Stage 1: Aktivitas Terbatas Gejala (Istirahat Kognitif & Fisik Ringan)';

  if (days >= 14) {
    grtpStage = 5;
    grtpStageName = 'Stage 5: Latihan Kontak Penuh Terkendali (Wajib Surat Izin Dokter Spesialis)';
  } else if (days >= 10) {
    grtpStage = 4;
    grtpStageName = 'Stage 4: Latihan Non-Kontak Kompleks (Pad Work, Koordinasi Taktis & Beban)';
  } else if (days >= 6) {
    grtpStage = 3;
    grtpStageName = 'Stage 3: Latihan Spesifik Cabor Non-Kontak (Shadow Boxing, Footwork, Heavy Bag Tanpa Sentakan)';
  } else if (days >= 3) {
    grtpStage = 2;
    grtpStageName = 'Stage 2: Latihan Aerobik Ringan Non-Impak (Sepeda Statis, Jalan Santai HR <70% HRmax)';
  }

  const directive = isLocked
    ? `[MANDATORY SCAT6 LOCKOUT] Terdeteksi riwayat benturan kepala dengan gejala neurologis (${symptomsCount} gejala${
        hasAmnesiaOrLoc ? ', riwayat pingsan/amnesia' : ''
      }). Berdasarkan konsensus internasional SCAT6 (BJSM 2023), atlet DILARANG KERAS melakukan sparring atau kontak fisik selama ${remainingLockoutDays} hari ke depan. Berada pada ${grtpStageName}.`
    : `Masa isolasi SCAT6 14 hari telah tuntas (${days} hari pasca-kejadian). Atlet wajib menjalani evaluasi klinis dokter sebelum kembali ke sparring penuh.`;

  return {
    isLocked,
    remainingLockoutDays,
    grtpStage,
    grtpStageName,
    clinicalDirective: directive,
    requiresMedicalClearance: true,
  };
}

/**
 * 2. Computes combat round work density, work-to-rest ratio, and glycolytic acidosis tier.
 */
export function calculateCombatRoundDensity(
  roundsCount: number,
  roundDurationSeconds: number,
  restDurationSeconds: number,
  sessionRpe: number
): CombatRoundDensityResult {
  const rounds = Math.max(1, Number(roundsCount || 1));
  const workSec = Math.max(30, Number(roundDurationSeconds || 180));
  const restSec = Math.max(0, Number(restDurationSeconds || 60));
  const rpe = Math.max(1, Math.min(10, Number(sessionRpe || 6)));

  const totalWorkSeconds = rounds * workSec;
  const totalRestSeconds = Math.max(0, (rounds - 1) * restSec);
  const totalSeconds = totalWorkSeconds + totalRestSeconds;
  const workRestRatio = Number((workSec / Math.max(1, restSec)).toFixed(2));
  const workDensityPct = Number(((totalWorkSeconds / totalSeconds) * 100).toFixed(1));

  let glycolyticLactateTier: 'AEROBIC_DRILL' | 'MODERATE_GLYCOLYTIC' | 'HIGH_LACTATE_ACCUMULATION' | 'EXTREME_ACIDOSIS' = 'MODERATE_GLYCOLYTIC';
  let estimatedLactateMmolL = '4.0 - 8.0';
  let recommendedRecoveryHours = 36;

  if (rpe <= 4 || workDensityPct < 55) {
    glycolyticLactateTier = 'AEROBIC_DRILL';
    estimatedLactateMmolL = '< 4.0';
    recommendedRecoveryHours = 24;
  } else if (rpe >= 9 || (workDensityPct >= 75 && rounds >= 5)) {
    glycolyticLactateTier = 'EXTREME_ACIDOSIS';
    estimatedLactateMmolL = '> 14.0 (Akumulasi H+ Ekstrem)';
    recommendedRecoveryHours = 72;
  } else if (rpe >= 7 || rounds >= 4) {
    glycolyticLactateTier = 'HIGH_LACTATE_ACCUMULATION';
    estimatedLactateMmolL = '8.0 - 14.0';
    recommendedRecoveryHours = 48;
  }

  return {
    totalWorkSeconds,
    totalRestSeconds,
    workRestRatio,
    workDensityPct,
    glycolyticLactateTier,
    estimatedLactateMmolL,
    recommendedRecoveryHours,
  };
}

/**
 * 3. Evaluates acute combat weight-cut safety and dehydration limits (ACSM / ISSN Standards).
 */
export function evaluateWeightCutSafety(
  currentWeightKg: number,
  targetWeightKg: number,
  daysUntilWeighIn: number = 7
): WeightCutSafetyResult {
  const current = Math.max(30, Number(currentWeightKg || 60));
  const target = Math.max(25, Number(targetWeightKg || current));
  const days = Math.max(1, Number(daysUntilWeighIn || 1));

  if (target >= current) {
    return {
      acuteLossPct: 0,
      weightCutTier: 'SAFE_GRADUAL',
      proteinPrescriptionGKg: 2.0,
      rehydrationFluidMlPerKgLost: 1200,
      isEmergencyAlert: false,
      directive: 'Berat badan stabil dalam rentang aman kelas tanding. Pertahankan hidrasi optimal.',
    };
  }

  const weightDeficitKg = current - target;
  const acuteLossPct = Number(((weightDeficitKg / current) * 100).toFixed(1));

  // ISSN consensus for combat weight cutting (Jäger et al. 2017)
  let weightCutTier: 'SAFE_GRADUAL' | 'MONITORED_DEFICIT' | 'CRITICAL_HAZARD' = 'SAFE_GRADUAL';
  let isEmergencyAlert = false;
  let proteinPrescriptionGKg = 2.2;
  let directive = '';

  if (acuteLossPct > 5.0 || (acuteLossPct > 3.0 && days <= 2)) {
    weightCutTier = 'CRITICAL_HAZARD';
    isEmergencyAlert = true;
    proteinPrescriptionGKg = 2.6;
    directive = `[PERINGATAN BAHAYA PEMOTONGAN BERAT BADAN EKSTREM] Defisit berat akut ${acuteLossPct}% (${weightDeficitKg.toFixed(1)} kg) dalam ${days} hari melebihi batas kritis fisiologis (>5% atau dehidrasi kilat). Kehilangan cairan akut drastis mengeringkan bantalan cairan serebrospinal otak (risiko knock-out fatal melonjak) dan memicu gagal ginjal akut. Wajib hentikan sauna ekstrem; konsultasikan dengan tim gizi klinis.`;
  } else if (acuteLossPct > 2.5) {
    weightCutTier = 'MONITORED_DEFICIT';
    proteinPrescriptionGKg = 2.4;
    directive = `Pemotongan berat badan berada di ambang moderat (${acuteLossPct}%). Pertahankan asupan protein tinggi ${proteinPrescriptionGKg} g/kg untuk melindungi massa otot bebas lemak (FFM) dan monitor elektrolit urine.`;
  } else {
    directive = `Penurunan berat badan berada pada laju bertahap yang aman (${acuteLossPct}%). Target dapat dicapai dengan defisit energi ringan tanpa dehidrasi patologis.`;
  }

  return {
    acuteLossPct,
    weightCutTier,
    proteinPrescriptionGKg,
    rehydrationFluidMlPerKgLost: 1500, // ACSM: 1.5L fluid per 1kg mass deficit
    isEmergencyAlert,
    directive,
  };
}

/**
 * 4. Grappling joint hyperextension and cervical spine safety evaluator.
 */
export function evaluateGrapplingJointAndCervicalRisk(
  neckPainScale10: number = 0,
  jointHyperextension: boolean = false,
  submissionEscapeAttempts: number = 0
): {
  isSafeForHardSparring: boolean;
  hasCervicalAlert: boolean;
  hasJointLockAlert: boolean;
  clinicalRecommendations: string[];
} {
  const neckPain = Math.max(0, Math.min(10, Number(neckPainScale10 || 0)));
  const hasCervicalAlert = neckPain >= 4;
  const hasJointLockAlert = jointHyperextension || submissionEscapeAttempts >= 6;
  const isSafeForHardSparring = !hasCervicalAlert && !hasJointLockAlert;

  const clinicalRecommendations: string[] = [];

  if (hasCervicalAlert) {
    clinicalRecommendations.push(
      `[CERVICAL SPINE CIRCUIT BREAKER] Skor nyeri leher ${neckPain}/10. Hentikan teknik inverted guard, stack passing, dan guillotine defense. Lakukan kompresi isometrik leher 4 arah (4x10 detik) dan hindari kompresi aksial kepala.`
    );
  }

  if (hasJointLockAlert) {
    clinicalRecommendations.push(
      `[JOINT HYPEREXTENSION SAFEGUARD] Terdeteksi stres hiperekstensi sendi (siku/lutut) akibat upaya lolos kuncian. Kunci sparring submission keras selama 48 jam; alihkan ke drilling posisi dan transisi kontrol non-kuncian.`
    );
  }

  return {
    isSafeForHardSparring,
    hasCervicalAlert,
    hasJointLockAlert,
    clinicalRecommendations,
  };
}
