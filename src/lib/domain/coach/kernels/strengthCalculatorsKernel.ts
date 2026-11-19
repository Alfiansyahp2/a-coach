// Shared Sports Science Kernel: Strength, Power, 1RM, Tonnage & INOL Calculations
// Grounded in Brzycki (1993), Sheiko/Hales INOL (2010), and Schoenfeld Hypertrophy (2016)

export interface OneRepMaxResult {
  estimated1rmKg: number;
  formulaUsed: 'BRZYCKI_ESTIMATION' | 'DIRECT_1RM';
  testedReps: number;
  testedWeightKg: number;
  confidenceZone: 'HIGH_VALIDITY' | 'MODERATE_ESTIMATION' | 'POOR_VALIDITY_HIGH_REPS';
}

/**
 * 1. Brzycki 1RM Estimation Formula (Matt Brzycki, 1993)
 * Formula: 1RM = Weight * (36 / (37 - Reps)) or Weight * (1 + Reps / 30)
 * Validated primarily for repetitions <= 10.
 */
export function calculateBrzycki1RM(weightKg: number, reps: number): OneRepMaxResult {
  const w = Number(weightKg || 0);
  const r = Number(reps || 1);

  if (w <= 0 || r <= 0) {
    return {
      estimated1rmKg: 0,
      formulaUsed: 'DIRECT_1RM',
      testedReps: 0,
      testedWeightKg: 0,
      confidenceZone: 'POOR_VALIDITY_HIGH_REPS',
    };
  }

  if (r === 1) {
    return {
      estimated1rmKg: w,
      formulaUsed: 'DIRECT_1RM',
      testedReps: 1,
      testedWeightKg: w,
      confidenceZone: 'HIGH_VALIDITY',
    };
  }

  // Brzycki standard: w * (36 / (37 - r))
  // For reps > 10, accuracy degrades significantly due to lactic glycolytic interference
  const estimated = r <= 10
    ? Number((w * (36 / (37 - r))).toFixed(1))
    : Number((w * (1 + r / 30)).toFixed(1));

  const confidenceZone = r <= 5
    ? 'HIGH_VALIDITY'
    : r <= 10
      ? 'MODERATE_ESTIMATION'
      : 'POOR_VALIDITY_HIGH_REPS';

  return {
    estimated1rmKg: estimated,
    formulaUsed: 'BRZYCKI_ESTIMATION',
    testedReps: r,
    testedWeightKg: w,
    confidenceZone,
  };
}

/**
 * 2. Volume Load (Tonnage) Calculation
 * Tonnage = Sum(Sets * Reps * Weight)
 */
export function calculateVolumeLoadTonnage(
  sets: { weightKg: number; reps: number }[]
): { totalTonnageKg: number; totalReps: number; completedSets: number } {
  if (!Array.isArray(sets) || sets.length === 0) {
    return { totalTonnageKg: 0, totalReps: 0, completedSets: 0 };
  }

  let totalTonnageKg = 0;
  let totalReps = 0;

  for (const s of sets) {
    const w = Number(s.weightKg || 0);
    const r = Number(s.reps || 0);
    if (w > 0 && r > 0) {
      totalTonnageKg += w * r;
      totalReps += r;
    }
  }

  return {
    totalTonnageKg: Number(totalTonnageKg.toFixed(1)),
    totalReps,
    completedSets: sets.length,
  };
}

export type InolFatigueRating =
  | 'VERY_LIGHT'
  | 'OPTIMAL_WORK'
  | 'HARD_OVERLOAD'
  | 'EXCESSIVE_CNS_STRAIN';

/**
 * 3. INOL (Intensity x Number of Lifts) Calculator
 * Developed by Russian weightlifting researchers and popularized by Boris Sheiko & Hales (2010).
 * INOL = Reps / (100 - %1RM)
 */
export function calculateSessionInol(
  sets: { intensityPct1rm: number; reps: number }[]
): { totalInol: number; fatigueRating: InolFatigueRating; recommendation: string } {
  if (!Array.isArray(sets) || sets.length === 0) {
    return {
      totalInol: 0,
      fatigueRating: 'VERY_LIGHT',
      recommendation: 'Tidak ada beban angkatan terdata.',
    };
  }

  let totalInol = 0;

  for (const s of sets) {
    const intensity = Number(s.intensityPct1rm || 0);
    const reps = Number(s.reps || 0);
    if (intensity > 0 && intensity < 100 && reps > 0) {
      const setInol = reps / (100 - intensity);
      totalInol += setInol;
    }
  }

  totalInol = Number(totalInol.toFixed(2));

  let fatigueRating: InolFatigueRating = 'OPTIMAL_WORK';
  let recommendation = 'Beban latihan optimal untuk adaptasi neuromuskular.';

  if (totalInol < 0.4) {
    fatigueRating = 'VERY_LIGHT';
    recommendation = 'Sesi ringan (pemulihan aktif atau deload). Stimulus hipertrofi/kekuatan minimal.';
  } else if (totalInol >= 0.4 && totalInol <= 1.0) {
    fatigueRating = 'OPTIMAL_WORK';
    recommendation = 'Volume dan intensitas berada di zona ideal (sweet spot) perkembangan kekuatan murni.';
  } else if (totalInol > 1.0 && totalInol <= 2.0) {
    fatigueRating = 'HARD_OVERLOAD';
    recommendation = 'Sesi beban berat. Berikan istirahat minimal 48-72 jam sebelum membebani pola gerak yang sama.';
  } else {
    fatigueRating = 'EXCESSIVE_CNS_STRAIN';
    recommendation = 'Peringatan: INOL melampaui batas aman (>2.0). Risiko tinggi kelelahan sistem saraf pusat (CNS) dan cedera tendon. Wajib deload pada sesi berikutnya.';
  }

  return {
    totalInol,
    fatigueRating,
    recommendation,
  };
}

/**
 * 4. Reps in Reserve (RIR) to RPE Borg-Zourdos Mapping (Zourdos et al., 2016)
 */
export function rpeToRir(rpe: number): number {
  const clamped = Math.max(1, Math.min(10, Number(rpe || 5)));
  return Math.max(0, Number((10 - clamped).toFixed(1)));
}

export function rirToRpe(rir: number): number {
  const clamped = Math.max(0, Math.min(9, Number(rir || 0)));
  return Number((10 - clamped).toFixed(1));
}
