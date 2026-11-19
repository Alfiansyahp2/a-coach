// Pure Sports Science Kernel: Concurrent Training Interference & Anatomical Overlap Engine
// Grounded in Hickson (1980) Interference Phenomenon, Baar (2014) Molecular Signaling (AMPK vs mTORC1),
// and Millet et al. (2011) Central Nervous System (CNS) Neuromuscular Depletion.

import { SportCluster } from '@/types/sportTelemetry';

export interface InterferenceDiagnosticResult {
  hasMolecularInterference: boolean;
  severity: 'NONE' | 'MODERATE' | 'CRITICAL';
  pathwayConflict: string;
  recommendedSpacingHours: number;
  directive: string;
}

export interface CnsFatigueResult {
  isCnsDepleted: boolean;
  highCnsSessionCount48h: number;
  severity: 'LOW' | 'ELEVATED' | 'CRITICAL_EXHAUSTION';
  directive: string;
  contraindicatedModalities: string[];
}

export type AnatomicalRegion =
  | 'ANKLE_ACHILLES'
  | 'KNEE_PATELLA'
  | 'LUMBAR_SPINE'
  | 'SHOULDER_ROTATOR_CUFF'
  | 'WRIST_HAND'
  | 'CERVICAL_NECK';

export interface AnatomicalOverlapResult {
  hasHighOverlapRisk: boolean;
  criticalRegions: AnatomicalRegion[];
  regionStressScores: Record<AnatomicalRegion, number>;
  conflictingSportCodes: string[];
  directive: string;
}

/**
 * 1. Evaluates molecular pathway collision (AMPK activation blunting mTORC1 protein synthesis).
 * Hickson (1980), Baar (2014): High-load resistance followed immediately by endurance blunts MPS by 40-50%.
 */
export function evaluateAmpkMtorInterference(
  priorCluster: SportCluster,
  priorRpe: number,
  nextCluster: SportCluster,
  hoursApart: number = 12
): InterferenceDiagnosticResult {
  const isPriorHeavyStrength = priorCluster === 'STRENGTH_POWER' && priorRpe >= 7;
  const isNextHighEndurance =
    (nextCluster === 'CYCLIC_ENDURANCE' || nextCluster === 'TEAM_FIELD_COURT') && hoursApart < 24;

  if (isPriorHeavyStrength && isNextHighEndurance) {
    if (hoursApart < 14) {
      return {
        hasMolecularInterference: true,
        severity: 'CRITICAL',
        pathwayConflict: 'AMPK_PHOSPHORYLATION_SUPPRESSING_MTORC1',
        recommendedSpacingHours: 24,
        directive:
          '[INTERFERENSI MOLEKULER TINGGI: AMPK vs mTORC1] Sesi ketahanan/kardio intensitas tinggi berjarak < 14 jam dari angkatan beban maksimal akan mengaktivasi AMPK yang memfosforilasi TSC2 & Raptor, sehingga menekan sintesis protein miofibrilar hingga 40-50%. Tunda sesi kardio berat minimal 18-24 jam, atau alihkan ke jalan pemulihan / gowes santai Zone 1 tanpa beban eksentrik.',
      };
    }

    return {
      hasMolecularInterference: true,
      severity: 'MODERATE',
      pathwayConflict: 'PARTIAL_MTOR_BLUNTING',
      recommendedSpacingHours: 16,
      directive:
        'Interferensi molekuler moderat terdeteksi. Sesi ketahanan dapat dilakukan jika intensitas dijaga di bawah ambang laktat (Zone 2 murni) dan nutrisi pasca-latihan mencukupi 25-35g protein leusin tinggi.',
    };
  }

  return {
    hasMolecularInterference: false,
    severity: 'NONE',
    pathwayConflict: 'COMPATIBLE_PATHWAYS',
    recommendedSpacingHours: 0,
    directive: 'Tidak ada konflik jalur molekuler yang signifikan antara kedua modalitas olahraga.',
  };
}

/**
 * 2. Evaluates Central Nervous System (CNS) & Motor Unit Recruitment Depletion.
 */
export function evaluateCentralNervousSystemFatigue(
  recentSportCodes: string[],
  sessionRpes: number[]
): CnsFatigueResult {
  const highCnsSports = new Set([
    'SPORT_POWERLIFTING',
    'SPORT_WEIGHTLIFTING',
    'SPORT_STRONGMAN',
    'SPORT_MMA',
    'SPORT_BOXING',
    'SPORT_GYMNASTICS',
    'SPORT_SKATEBOARDING',
  ]);

  let highCnsCount = 0;
  for (let i = 0; i < recentSportCodes.length; i++) {
    const code = (recentSportCodes[i] || '').toUpperCase();
    const rpe = sessionRpes[i] || 5;
    if (highCnsSports.has(code) && rpe >= 7) {
      highCnsCount++;
    }
  }

  if (highCnsCount >= 3) {
    return {
      isCnsDepleted: true,
      highCnsSessionCount48h: highCnsCount,
      severity: 'CRITICAL_EXHAUSTION',
      directive:
        '[DEPLESI SISTEM SARAF PUSAT (CNS CRITICAL)] Terdeteksi 3+ sesi beban neuromuskular aksial / benturan tinggi dalam 48 jam terakhir. Kecepatan transmisi potensial aksi saraf motorik tertekan drastis. DILARANG melakukan angkatan beban maksimal (1RM) atau akrobatik benturan keras.',
      contraindicatedModalities: [
        'Maximal Olympic Lifts (Snatch / Clean & Jerk)',
        'Heavy axial Deadlifts / Squats (>80% 1RM)',
        'Full-contact sparring and high-impact gymnastics tumbling',
      ],
    };
  }

  if (highCnsCount >= 2) {
    return {
      isCnsDepleted: true,
      highCnsSessionCount48h: highCnsCount,
      severity: 'ELEVATED',
      directive:
        'Kelelahan neuromuskular terangkat. Hindari pengujian batas maksimal hari ini. Fokus pada volume sub-maksimal atau latihan pemulihan parasimpatis.',
      contraindicatedModalities: ['Maximal velocity sprints', 'Maximal 1RM attempts'],
    };
  }

  return {
    isCnsDepleted: false,
    highCnsSessionCount48h: highCnsCount,
    severity: 'LOW',
    directive: 'Kesiapan neuromuskular dan sistem saraf motorik dalam kondisi optimal.',
    contraindicatedModalities: [],
  };
}

/**
 * 3. Maps sports to primary anatomical stress regions.
 */
export const SPORT_ANATOMICAL_MAPPING: Record<string, AnatomicalRegion[]> = {
  // Endurance
  SPORT_DISTANCE_RUNNING: ['ANKLE_ACHILLES', 'KNEE_PATELLA'],
  SPORT_ROAD_CYCLING: ['KNEE_PATELLA', 'LUMBAR_SPINE'],
  SPORT_MTB_XC: ['KNEE_PATELLA', 'LUMBAR_SPINE', 'SHOULDER_ROTATOR_CUFF'],
  SPORT_SWIMMING: ['SHOULDER_ROTATOR_CUFF', 'CERVICAL_NECK'],
  SPORT_ROWING: ['LUMBAR_SPINE', 'KNEE_PATELLA'],
  SPORT_TRIATHLON: ['ANKLE_ACHILLES', 'KNEE_PATELLA', 'SHOULDER_ROTATOR_CUFF'],
  // Strength & Power
  SPORT_POWERLIFTING: ['LUMBAR_SPINE', 'KNEE_PATELLA', 'SHOULDER_ROTATOR_CUFF'],
  SPORT_WEIGHTLIFTING: ['LUMBAR_SPINE', 'KNEE_PATELLA', 'SHOULDER_ROTATOR_CUFF', 'WRIST_HAND'],
  SPORT_CALISTHENICS: ['SHOULDER_ROTATOR_CUFF', 'WRIST_HAND'],
  SPORT_STRONGMAN: ['LUMBAR_SPINE', 'KNEE_PATELLA', 'SHOULDER_ROTATOR_CUFF'],
  SPORT_BODYBUILDING: ['SHOULDER_ROTATOR_CUFF', 'KNEE_PATELLA'],
  // Team Sports
  SPORT_FOOTBALL: ['ANKLE_ACHILLES', 'KNEE_PATELLA'],
  SPORT_BASKETBALL: ['ANKLE_ACHILLES', 'KNEE_PATELLA'],
  SPORT_VOLLEYBALL: ['KNEE_PATELLA', 'ANKLE_ACHILLES', 'SHOULDER_ROTATOR_CUFF'],
  SPORT_FUTSAL: ['ANKLE_ACHILLES', 'KNEE_PATELLA'],
  SPORT_RUGBY: ['CERVICAL_NECK', 'SHOULDER_ROTATOR_CUFF', 'KNEE_PATELLA'],
  SPORT_FIELD_HOCKEY: ['LUMBAR_SPINE', 'KNEE_PATELLA', 'ANKLE_ACHILLES'],
  // Combat Sports
  SPORT_BOXING: ['SHOULDER_ROTATOR_CUFF', 'WRIST_HAND', 'CERVICAL_NECK'],
  SPORT_MMA: ['CERVICAL_NECK', 'SHOULDER_ROTATOR_CUFF', 'KNEE_PATELLA', 'WRIST_HAND'],
  SPORT_BJJ: ['CERVICAL_NECK', 'SHOULDER_ROTATOR_CUFF', 'KNEE_PATELLA'],
  SPORT_PENCAK_SILAT: ['KNEE_PATELLA', 'ANKLE_ACHILLES'],
  SPORT_JUDO: ['SHOULDER_ROTATOR_CUFF', 'CERVICAL_NECK', 'KNEE_PATELLA'],
  SPORT_MUAY_THAI: ['CERVICAL_NECK', 'ANKLE_ACHILLES', 'KNEE_PATELLA'],
  // Racquet & Precision
  SPORT_BADMINTON: ['ANKLE_ACHILLES', 'KNEE_PATELLA', 'SHOULDER_ROTATOR_CUFF'],
  SPORT_TENNIS: ['SHOULDER_ROTATOR_CUFF', 'WRIST_HAND', 'ANKLE_ACHILLES'],
  SPORT_TABLE_TENNIS: ['WRIST_HAND', 'KNEE_PATELLA'],
  SPORT_ARCHERY: ['SHOULDER_ROTATOR_CUFF', 'WRIST_HAND'],
  SPORT_SHOOTING: ['CERVICAL_NECK', 'LUMBAR_SPINE'],
  // Functional & Extreme
  SPORT_FUNCTIONAL_FITNESS: ['LUMBAR_SPINE', 'SHOULDER_ROTATOR_CUFF', 'KNEE_PATELLA'],
  SPORT_CLIMBING: ['WRIST_HAND', 'SHOULDER_ROTATOR_CUFF'],
  SPORT_GYMNASTICS: ['LUMBAR_SPINE', 'WRIST_HAND', 'KNEE_PATELLA', 'ANKLE_ACHILLES'],
  SPORT_SURFING: ['SHOULDER_ROTATOR_CUFF', 'CERVICAL_NECK', 'LUMBAR_SPINE'],
  SPORT_SKATEBOARDING: ['ANKLE_ACHILLES', 'WRIST_HAND', 'KNEE_PATELLA'],
};

/**
 * 4. Evaluates anatomical joint stress accumulation across multi-sport sessions.
 */
export function evaluateAnatomicalOverlapStrain(
  recentSportCodes: string[],
  activeInjuryLocations: string[] = []
): AnatomicalOverlapResult {
  const regionScores: Record<AnatomicalRegion, number> = {
    ANKLE_ACHILLES: 0,
    KNEE_PATELLA: 0,
    LUMBAR_SPINE: 0,
    SHOULDER_ROTATOR_CUFF: 0,
    WRIST_HAND: 0,
    CERVICAL_NECK: 0,
  };

  const normalizedInjury = activeInjuryLocations.map((l) => (l || '').toLowerCase());

  for (const sport of recentSportCodes) {
    const code = (sport || '').toUpperCase();
    const regions = SPORT_ANATOMICAL_MAPPING[code] || [];
    for (const r of regions) {
      regionScores[r] = (regionScores[r] || 0) + 1;
    }
  }

  const criticalRegions: AnatomicalRegion[] = [];
  for (const [reg, score] of Object.entries(regionScores) as [AnatomicalRegion, number][]) {
    // Check if region matches active clinical injury record
    const matchesInjury =
      (reg === 'ANKLE_ACHILLES' && normalizedInjury.some((i) => i.includes('ankle') || i.includes('atfl') || i.includes('achilles'))) ||
      (reg === 'KNEE_PATELLA' && normalizedInjury.some((i) => i.includes('knee') || i.includes('lutut') || i.includes('patel'))) ||
      (reg === 'LUMBAR_SPINE' && normalizedInjury.some((i) => i.includes('lumbar') || i.includes('spine') || i.includes('pinggang'))) ||
      (reg === 'SHOULDER_ROTATOR_CUFF' && normalizedInjury.some((i) => i.includes('shoulder') || i.includes('bahu') || i.includes('rotator'))) ||
      (reg === 'WRIST_HAND' && normalizedInjury.some((i) => i.includes('wrist') || i.includes('tangan') || i.includes('pulley'))) ||
      (reg === 'CERVICAL_NECK' && normalizedInjury.some((i) => i.includes('neck') || i.includes('leher') || i.includes('servikal')));

    if (score >= 3 || (score >= 1 && matchesInjury)) {
      criticalRegions.push(reg);
    }
  }

  const hasHighOverlapRisk = criticalRegions.length > 0;
  const directive = hasHighOverlapRisk
    ? `[ANATOMICAL OVERLAP CIRCUIT BREAKER] Terdeteksi akumulasi stres berlebih atau tubrukan cedera aktif pada regio: ${criticalRegions.join(
        ', '
      )}. Hindari olahraga yang membebani sendi yang sama dalam 24-48 jam ke depan.`
    : 'Beban anatomis tersebar seimbang antar kelompok sendi.';

  return {
    hasHighOverlapRisk,
    criticalRegions,
    regionStressScores: regionScores,
    conflictingSportCodes: recentSportCodes,
    directive,
  };
}
