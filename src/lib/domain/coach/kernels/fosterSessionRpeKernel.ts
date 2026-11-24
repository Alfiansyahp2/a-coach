// Pure Sports Science Kernel: Carl Foster Session-RPE Universal Training Load Engine
// Reference: Foster, C., et al. (2001). "A new approach to monitoring exercise training." JSCR, 15(1), 109-115.

export interface DailySessionRpeInput {
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  rpeScale10: number; // 1 - 10 Foster modified Borg scale
}

export interface WeeklyRpeAnalytics {
  totalWeeklyLoadAU: number;
  dailyMeanLoadAU: number;
  monotony: number; // Mean / SD
  strain: number; // Total Weekly Load * Monotony
  riskAssessment: 'OPTIMAL' | 'MODERATE' | 'HIGH_MONOTONY' | 'CRITICAL_STRAIN';
  recommendations: string[];
}

/**
 * Calculates single-session training load in Arbitrary Units (AU).
 * AU = Duration (minutes) * RPE (1-10)
 */
export function calculateSessionRpeLoad(durationMinutes: number, rpeScale10: number): number {
  const safeDuration = Math.max(0, durationMinutes);
  const safeRpe = Math.max(1, Math.min(10, rpeScale10));
  return Math.round(safeDuration * safeRpe);
}

/**
 * Calculates weekly load, training monotony, and overall physiological strain.
 */
export function computeWeeklyRpeAnalytics(sessions: DailySessionRpeInput[]): WeeklyRpeAnalytics {
  if (!sessions || sessions.length === 0) {
    return {
      totalWeeklyLoadAU: 0,
      dailyMeanLoadAU: 0,
      monotony: 0,
      strain: 0,
      riskAssessment: 'OPTIMAL',
      recommendations: ['Tidak ada sesi latihan terdeteksi untuk minggu ini.'],
    };
  }

  // Aggregate into 7 days of the week (default to 0 for rest days)
  const dailyLoads: number[] = sessions.map((s) => calculateSessionRpeLoad(s.durationMinutes, s.rpeScale10));
  while (dailyLoads.length < 7) {
    dailyLoads.push(0);
  }

  const totalWeeklyLoadAU = dailyLoads.reduce((sum, val) => sum + val, 0);
  const dailyMeanLoadAU = Math.round((totalWeeklyLoadAU / 7) * 10) / 10;

  // Standard Deviation
  const variance = dailyLoads.reduce((sum, val) => sum + Math.pow(val - dailyMeanLoadAU, 2), 0) / 7;
  const standardDeviation = Math.sqrt(variance);

  // Monotony = Mean / SD (Protects against division by zero if all loads are identical)
  const monotony = standardDeviation > 0.1
    ? Math.round((dailyMeanLoadAU / standardDeviation) * 100) / 100
    : 1.0;

  // Strain = Total Load * Monotony
  const strain = Math.round(totalWeeklyLoadAU * monotony);

  let riskAssessment: WeeklyRpeAnalytics['riskAssessment'] = 'OPTIMAL';
  const recommendations: string[] = [];

  if (strain > 4000 || (monotony > 2.0 && totalWeeklyLoadAU > 2000)) {
    riskAssessment = 'CRITICAL_STRAIN';
    recommendations.push(
      'Regangan latihan kritis (Strain > 4,000 AU atau Monotoni > 2.0): Variasi beban terlalu datar dan berat. Risiko tinggi infeksi saluran nafas atas (ISPA) dan overtraining.'
    );
    recommendations.push('Wajib sisipkan 1-2 hari istirahat total (0 AU) atau sesi pemulihan aktif sangat ringan (RPE 2).');
  } else if (monotony > 1.8) {
    riskAssessment = 'HIGH_MONOTONY';
    recommendations.push(
      'Monotoni latihan tinggi (> 1.8): Beban harian kurang bervariasi. Berikan kontras antara hari latihan berat dan hari latihan ringan.'
    );
  } else if (totalWeeklyLoadAU > 3000) {
    riskAssessment = 'MODERATE';
    recommendations.push('Beban mingguan tinggi (> 3,000 AU) namun variabilitas beban terjaga baik.');
  } else {
    riskAssessment = 'OPTIMAL';
    recommendations.push('Profil beban dan variabilitas latihan berada dalam ambang adaptasi optimal.');
  }

  return {
    totalWeeklyLoadAU,
    dailyMeanLoadAU,
    monotony,
    strain,
    riskAssessment,
    recommendations,
  };
}
