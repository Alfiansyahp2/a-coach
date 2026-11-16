import {
  TacticalBridgePrescription,
  BiologicalAdaptationCardData,
  DeloadCelebration,
  DualLoadTelemetry,
} from './weeklyRecapBridgeTypes';

interface BridgeCalcParams {
  currentDistanceKm: number;
  prevDistanceKm: number;
  totalMovingSeconds: number;
  fosterSrpe: number;
  weeklyTss: number;
  monotony: number;
  strain: number;
  lowZonePct: number;
  modZonePct: number;
  highZonePct: number;
  distDeltaPct: number;
  peakPain: number;
  swellingCount: number;
}

export function computeDualLoadTelemetry(
  distanceKm: number,
  movingSeconds: number,
  fosterSrpe: number,
  tss: number,
  lowZonePct: number
): DualLoadTelemetry {
  const hours = movingSeconds / 3600;
  const h = Math.floor(hours);
  const m = Math.floor((movingSeconds % 3600) / 60);
  const formattedDur = `${h}j ${m}m`;

  const safeKm = Math.max(0.1, distanceKm);
  const safeHours = Math.max(0.1, hours);

  const costPerKm = Math.round((fosterSrpe / safeKm) * 10) / 10;
  const costPerHour = Math.round(fosterSrpe / safeHours);

  let verdict = 'Keseimbangan Beban Normal';
  if (costPerKm <= 5.0 && lowZonePct >= 75) {
    verdict = 'Efisiensi Metabolik Tinggi (Hemat glikogen & beban internal terkelola).';
  } else if (costPerKm > 8.0) {
    verdict = 'Biaya Metabolik Tinggi (Respon stres tubuh meningkat tajam per km).';
  }

  return {
    external_distance_km: Math.round(distanceKm * 10) / 10,
    external_duration_formatted: formattedDur,
    external_moving_time_hours: Math.round(hours * 10) / 10,
    internal_srpe_load_au: Math.round(fosterSrpe),
    internal_tss: Math.round(tss * 10) / 10,
    internal_cost_ratio_au_per_km: costPerKm,
    internal_cost_ratio_au_per_hour: costPerHour,
    efficiency_verdict: verdict,
  };
}

export function computeDeloadCelebration(
  distDeltaPct: number,
  peakPain: number
): DeloadCelebration {
  const isDeload = distDeltaPct <= -15 && peakPain < 6;
  const redPct = Math.abs(distDeltaPct);

  if (!isDeload) {
    return {
      is_deload_week: false,
      volume_reduction_pct: 0,
      title: 'Siklus Progresif / Pemeliharaan',
      appreciation_badge: 'Beban Adaptif',
      scientific_rationale: 'Volume stabil dalam ambang batas pemeliharaan kebugaran.',
    };
  }

  return {
    is_deload_week: true,
    volume_reduction_pct: redPct,
    title: 'Siklus Deload & Restorasi Superkompensasi',
    appreciation_badge: 'Pemulihan Terencana (Bukan Kemalasan)',
    scientific_rationale: `Penurunan volume ${redPct}% minggu ini diakui secara ilmiah sebagai fase deload terencana. Ini BUKAN kemalasan atau kegagalan latihan, melainkan investasi biologis wajib untuk resintesis glikogen, perbaikan kolagen sendi/tendon, dan superkompensasi mitokondria.`,
  };
}

export function computeBiologicalAdaptationStatus(
  lowZonePct: number,
  modZonePct: number,
  monotony: number,
  strain: number,
  peakPain: number,
  swellingCount: number,
  isDeload: boolean
): BiologicalAdaptationCardData {
  let cardStatus: 'OPTIMAL_AEROBIC' | 'CARDIAC_DRIFT_WARNING' | 'ANAEROBIC_FATIGUE' = 'OPTIMAL_AEROBIC';
  let cardLabel = `Purity Aerobik Murni (${lowZonePct}% Z1-2)`;

  if (lowZonePct >= 75) {
    cardStatus = 'OPTIMAL_AEROBIC';
    cardLabel = `Purity Aerobik Murni (${lowZonePct}% Z1-2)`;
  } else if (modZonePct > 25) {
    cardStatus = 'CARDIAC_DRIFT_WARNING';
    cardLabel = `Zona Abu-Abu / Black Hole (${modZonePct}% Z3)`;
  } else {
    cardStatus = 'ANAEROBIC_FATIGUE';
    cardLabel = `Stres Intensitas Tinggi / Glukolitik`;
  }

  let autoBalance: 'BALANCED' | 'ELEVATED_STRAIN' | 'SYMPATHETIC_OVERDRIVE' = 'BALANCED';
  let autoLabel = 'Keseimbangan Otonom Stabil';

  if (monotony < 1.5) {
    autoBalance = 'BALANCED';
    autoLabel = 'Variabilitas Sehat (Otonom Stabil)';
  } else if (monotony <= 2.0) {
    autoBalance = 'ELEVATED_STRAIN';
    autoLabel = 'Monotoni Meningkat (Stres Akumulatif)';
  } else {
    autoBalance = 'SYMPATHETIC_OVERDRIVE';
    autoLabel = 'Risiko Saraf Simpatis Overdrive';
  }

  let tissueStatus: 'SUPERCOMPENSATION' | 'ADAPTED' | 'MICROTRAUMA_REPAIR' = 'ADAPTED';
  let tissueLabel = 'Adaptasi Jaringan Positif';

  if (isDeload) {
    tissueStatus = 'SUPERCOMPENSATION';
    tissueLabel = 'Restorasi & Superkompensasi Tendon';
  } else if (peakPain >= 4 || swellingCount > 0) {
    tissueStatus = 'MICROTRAUMA_REPAIR';
    tissueLabel = `Proteksi Aktif (Nyeri ${peakPain}/10)`;
  }

  return {
    cardiovascular_purity_pct: lowZonePct,
    cardiovascular_status: cardStatus,
    cardiovascular_label: cardLabel,
    autonomic_balance: autoBalance,
    autonomic_label: autoLabel,
    monotony_score: monotony,
    strain_score: strain,
    tissue_recovery_status: tissueStatus,
    tissue_label: tissueLabel,
  };
}

export function computeTacticalBridgePrescription(
  params: BridgeCalcParams,
  isDeload: boolean
): TacticalBridgePrescription {
  const {
    currentDistanceKm,
    prevDistanceKm,
    monotony,
    strain,
    peakPain,
    swellingCount,
    lowZonePct,
  } = params;

  // 1. Safe KM Quota
  let totalMaxKm = 0;
  let ruleApplied = 'Prinsip 10% Overload Progresif';
  let quotaRationale = '';

  if (isDeload && prevDistanceKm > 0) {
    // Coming out of deload: ramp up moderately towards previous baseline
    totalMaxKm = Math.round(prevDistanceKm * 0.95 * 10) / 10;
    ruleApplied = 'Pemulihan Siklus Pasca-Deload';
    quotaRationale = `Setelah deload (${currentDistanceKm} km), batas aman kembali ke ${totalMaxKm} km (95% kapasitas sebelum deload).`;
  } else {
    // Progressive build: max +10%
    const baseline = currentDistanceKm > 0 ? currentDistanceKm : 30;
    totalMaxKm = Math.round(baseline * 1.10 * 10) / 10;
    quotaRationale = `Maksimal kenaikan +10% dari ${currentDistanceKm} km untuk mencegah cedera overuse jaringan lunak.`;
  }

  // 2. Running vs Cycling Allocation
  let runningStatus: 'ALLOWED' | 'RESTRICTED' | 'ON_HOLD' = 'ALLOWED';
  let runningMaxKm = Math.round(totalMaxKm * 0.25 * 10) / 10;
  const cyclingCap = totalMaxKm;

  if (peakPain >= 3 || swellingCount > 0) {
    runningStatus = 'ON_HOLD';
    runningMaxKm = 0;
    quotaRationale += ' Lari DITANGGUHKAN: alihkan seluruh volume ke sepeda non-impak karena gejala sendi aktif.';
  } else if (peakPain > 0) {
    runningStatus = 'RESTRICTED';
    runningMaxKm = Math.min(5, Math.round(totalMaxKm * 0.1 * 10) / 10);
    quotaRationale += ' Lari DIBATASI: maksimal 5 km di jalan datar tanpa tanjakan terjal.';
  }

  // 3. Mandatory Rest Days
  let restDaysCount = 2;
  let restDaysRationale = '2 hari istirahat wajib untuk resintesis glikogen otot dan variabilitas denyut jantung.';
  let recommendedDays = ['Rabu', 'Jumat'];

  if (monotony >= 2.0 || strain > 800) {
    restDaysCount = 3;
    restDaysRationale = 'Monotoni beban tinggi (>2.0). Wajib 3 hari istirahat untuk memutus stres saraf simpatis.';
    recommendedDays = ['Senin', 'Rabu', 'Jumat'];
  } else if (monotony < 1.3 && currentDistanceKm < 50) {
    restDaysCount = 2;
    recommendedDays = ['Rabu', 'Minggu'];
  }

  // 4. Target HR Zones
  const targetLowZonePct = isDeload ? 85 : 80;
  const targetHighZoneMaxMinutes = isDeload || peakPain >= 3 ? 0 : 20;
  const zoneFocus = isDeload
    ? 'Fokus Zona 1-2 Penuh (Pemulihan Aktif & Dekompresi Sendi)'
    : lowZonePct < 75
    ? 'Re-polarisasi: Wajib minimal 80% di Zona 1-2 Aerobik Murni'
    : 'Pondasi Mitokondria & Ambang Aerobik Terukur';

  // 5. Clinical Recovery Action
  let recoveryAction = 'Fasilitasi pemulihan dengan hidrasi elektrolit teratur dan mobilitas sendi pasif.';
  if (peakPain >= 3 || swellingCount > 0) {
    recoveryAction = 'Protokol kompres es pasca-aktivitas, elevasi tungkai, dan penguatan eksentrik betis tanpa lompatan.';
  } else if (isDeload) {
    recoveryAction = 'Prioritaskan tidur berkualitas 7.5-8.5 jam dan peregangan mobilitas panggul/pergelangan kaki.';
  }

  return {
    safe_km_quota: {
      total_max_km: totalMaxKm,
      cycling_km_cap: cyclingCap,
      running_status: runningStatus,
      running_max_km: runningMaxKm,
      rule_applied: ruleApplied,
      rationale: quotaRationale,
    },
    mandatory_rest_days: {
      count: restDaysCount,
      recommended_days: recommendedDays,
      rationale: restDaysRationale,
    },
    target_hr_zones: {
      zone1_2_aerobic_min_pct: targetLowZonePct,
      zone4_5_anaerobic_max_minutes: targetHighZoneMaxMinutes,
      focus: zoneFocus,
    },
    clinical_recovery_action: recoveryAction,
  };
}
