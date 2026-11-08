// Pure Clean Architecture Domain Logic for Athlete Physiology, Biometrics & Training Zones

export interface HeartRateZone {
  zone: number;
  name: string;
  nameId: string;
  minBpm: number;
  maxBpm: number;
  percentHrrMin: number;
  percentHrrMax: number;
  description: string;
  targetSportBenefit: string;
  accentColor: string;
}

export type BmiCategory = 'UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE';

export interface PhysiologicalCapacities {
  bmi: number;
  bmiCategory: BmiCategory;
  bmiCategoryLabel: string;
  hrMaxEstimated: number;
  hrMaxAuthoritative: number;
  heartRateReserve: number;
  zones: HeartRateZone[];
  ftpWatts: number | null;
  wattsPerKg: number | null;
  wattsPerKgCategory: string | null;
  vo2MaxEstimate: number | null;
  runningThresholdPaceSec: number | null;
}

export interface CalculateCapacitiesParams {
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  resting_heart_rate?: number | null;
  max_heart_rate?: number | null;
  ftp_watts?: number | null;
  vo2_max?: number | null;
  running_threshold_pace_sec?: number | null;
}

/**
 * Calculates BMI from height and weight.
 * BMI = weight (kg) / (height (m) ^ 2)
 */
export function calculateBmi(heightCm: number, weightKg: number): number {
  if (!heightCm || heightCm <= 0 || !weightKg || weightKg <= 0) return 22.0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function getBmiCategory(bmi: number): { category: BmiCategory; label: string } {
  if (bmi < 18.5) return { category: 'UNDERWEIGHT', label: 'Kurang (Underweight)' };
  if (bmi <= 24.9) return { category: 'NORMAL', label: 'Ideal Atletik (Normal)' };
  if (bmi <= 29.9) return { category: 'OVERWEIGHT', label: 'Berlebih (Overweight)' };
  return { category: 'OBESE', label: 'Tinggi (Obese)' };
}

/**
 * Tanaka Formula for estimated maximum heart rate:
 * HRmax = 208 - (0.7 * age)
 */
export function estimateMaxHeartRateTanaka(age: number = 22): number {
  const safeAge = Math.max(15, Math.min(90, age));
  return Math.round(208 - (0.7 * safeAge));
}

/**
 * Computes 5-Zone Cardiac Spectrum using the Karvonen Heart Rate Reserve (HRR) formula:
 * Target HR = RHR + (% Intensity * (HRmax - RHR))
 */
export function calculateKarvonenZones(rhr: number, hrMax: number): HeartRateZone[] {
  const safeRhr = Math.max(35, Math.min(100, rhr));
  const safeHrMax = Math.max(safeRhr + 40, Math.min(230, hrMax));
  const hrr = safeHrMax - safeRhr;

  const zoneDefinitions = [
    {
      zone: 1,
      name: 'Active Recovery',
      nameId: 'Pemulihan Aktif',
      pctMin: 0.50,
      pctMax: 0.60,
      description: 'Pemulihan sirkulasi metabolik, aktivasi pembuangan sisa laktat tanpa membebani sendi.',
      benefit: 'Recovery ride santai pasca cedera & jalan pemanasan.',
      color: '#64748B', // Slate gray
    },
    {
      zone: 2,
      name: 'Aerobic Base',
      nameId: 'Fondasi Aerobik (Target Utama)',
      pctMin: 0.60,
      pctMax: 0.70,
      description: 'Efisiensi pembakaran lemak, densitas kapiler, dan ketahanan kardiovaskular fundamental.',
      benefit: 'Target utama sesi MTB santai & lari jarak jauh berkelanjutan.',
      color: '#10B981', // Mint emerald
    },
    {
      zone: 3,
      name: 'Tempo / Aerobic Endurance',
      nameId: 'Tempo & Ritme Terjaga',
      pctMin: 0.70,
      pctMax: 0.80,
      description: 'Peningkatan kecepatan jelajah aerobik dan ritme nafas yang stabil.',
      benefit: 'Sesi bersepeda tanjakan sedang & tempo run terkontrol.',
      color: '#00F0FF', // Neon Cyan
    },
    {
      zone: 4,
      name: 'Lactate Threshold',
      nameId: 'Ambang Laktat (Threshold)',
      pctMin: 0.80,
      pctMax: 0.90,
      description: 'Meningkatkan toleransi laktat asam darah pada batas kapasitas fungsional.',
      benefit: 'Interval 10K - Half Marathon pace & sustained climbing.',
      color: '#F97316', // Orange flame
    },
    {
      zone: 5,
      name: 'Anaerobic Capacity',
      nameId: 'Kapasitas Anaerobik & Daya Maksimal',
      pctMin: 0.90,
      pctMax: 1.00,
      description: 'Sistem energi glikolitik dan fosfagen tanpa oksigen, sprint maksimal.',
      benefit: 'Sprint pendek, tanjakan curam singkat, & finish burst.',
      color: '#EF4444', // Red alert
    },
  ];

  return zoneDefinitions.map((z) => {
    const minBpm = Math.round(safeRhr + (z.pctMin * hrr));
    const maxBpm = Math.round(safeRhr + (z.pctMax * hrr));
    return {
      zone: z.zone,
      name: z.name,
      nameId: z.nameId,
      minBpm,
      maxBpm,
      percentHrrMin: Math.round(z.pctMin * 100),
      percentHrrMax: Math.round(z.pctMax * 100),
      description: z.description,
      targetSportBenefit: z.benefit,
      accentColor: z.color,
    };
  });
}

/**
 * Calculates cycling power-to-weight ratio (Watts/kg) and classification.
 */
export function calculateWattsPerKg(ftpWatts?: number | null, weightKg?: number | null): {
  wkg: number | null;
  category: string | null;
} {
  if (!ftpWatts || !weightKg || ftpWatts <= 0 || weightKg <= 0) {
    return { wkg: null, category: null };
  }
  const wkg = Math.round((ftpWatts / weightKg) * 100) / 100;

  let category = 'Rekreasi / Dasar';
  if (wkg >= 5.0) category = 'Elit / Pro Kontinental';
  else if (wkg >= 4.0) category = 'Kompetitif Mahir (Cat 1/2)';
  else if (wkg >= 3.0) category = 'Menengah Kuat (Cat 3/4)';
  else if (wkg >= 2.0) category = 'Fondasi Aerobik Terlatih';

  return { wkg, category };
}

/**
 * Master domain aggregator for athlete physiological telemetry.
 */
export function calculatePhysiologicalCapacities(params: CalculateCapacitiesParams): PhysiologicalCapacities {
  const age = params.age ?? 22;
  const heightCm = params.height_cm ?? 170.0;
  const weightKg = params.weight_kg ?? 65.0;
  const rhr = params.resting_heart_rate ?? 68;
  const estimatedHrMax = estimateMaxHeartRateTanaka(age);
  const authoritativeHrMax = params.max_heart_rate ?? estimatedHrMax;

  const bmi = calculateBmi(heightCm, weightKg);
  const { category: bmiCategory, label: bmiCategoryLabel } = getBmiCategory(bmi);
  const zones = calculateKarvonenZones(rhr, authoritativeHrMax);
  const { wkg, category: wkgCategory } = calculateWattsPerKg(params.ftp_watts, weightKg);

  return {
    bmi,
    bmiCategory,
    bmiCategoryLabel,
    hrMaxEstimated: estimatedHrMax,
    hrMaxAuthoritative: authoritativeHrMax,
    heartRateReserve: Math.max(0, authoritativeHrMax - rhr),
    zones,
    ftpWatts: params.ftp_watts ?? null,
    wattsPerKg: wkg,
    wattsPerKgCategory: wkgCategory,
    vo2MaxEstimate: params.vo2_max ?? null,
    runningThresholdPaceSec: params.running_threshold_pace_sec ?? null,
  };
}

