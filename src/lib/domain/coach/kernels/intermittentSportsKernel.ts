// Shared Sports Science Kernel: Intermittent Team Field & Court Sports
// Grounded in Bradley & Buchheit (2014), Catapult PlayerLoad™, and FIFA 11+ Consensus

export interface HsrSegmentationResult {
  walkingDistanceMeters: number; // < 7.2 km/h
  joggingDistanceMeters: number; // 7.2 - 14.4 km/h
  runningDistanceMeters: number; // 14.4 - 19.8 km/h
  hsrDistanceMeters: number; // High-Speed Running (19.8 - 25.2 km/h)
  sprintDistanceMeters: number; // Sprint (> 25.2 km/h)
  highIntensityDistanceMeters: number; // HSR + Sprint
  highIntensityPct: number;
}

/**
 * 1. Segments running telemetry into standard Bradley/Buchheit velocity bands.
 */
export function calculateHsrSegmentation(
  totalDistanceMeters: number,
  hsrMeters?: number,
  sprintMeters?: number
): HsrSegmentationResult {
  const total = Math.max(0, Number(totalDistanceMeters || 0));
  const hsr = Math.max(0, Number(hsrMeters || 0));
  const sprint = Math.max(0, Number(sprintMeters || 0));
  const highIntensity = hsr + sprint;

  const highIntensityPct = total > 0 ? Number(((highIntensity / total) * 100).toFixed(1)) : 0;

  // Approximate remaining distance distribution for team sports (Buchheit et al.)
  const remaining = Math.max(0, total - highIntensity);
  const walkingDistanceMeters = Number((remaining * 0.45).toFixed(0));
  const joggingDistanceMeters = Number((remaining * 0.35).toFixed(0));
  const runningDistanceMeters = Number((remaining * 0.20).toFixed(0));

  return {
    walkingDistanceMeters,
    joggingDistanceMeters,
    runningDistanceMeters,
    hsrDistanceMeters: hsr,
    sprintDistanceMeters: sprint,
    highIntensityDistanceMeters: highIntensity,
    highIntensityPct,
  };
}

/**
 * 2. PlayerLoad™ Approximation (Arbitrary Units)
 * Approximates tri-axial mechanical load from duration, high-intensity distance, and cuts/jumps.
 */
export function calculatePlayerLoadAu(
  durationMinutes: number,
  sessionRpe: number,
  accelDecelCount: number = 0,
  jumpsOrCutsCount: number = 0
): { playerLoadAu: number; mechanicalLoadTier: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' } {
  const dur = Math.max(1, Number(durationMinutes || 0));
  const rpe = Math.max(1, Math.min(10, Number(sessionRpe || 5)));
  const dynamicEvents = Math.max(0, Number(accelDecelCount || 0)) + Math.max(0, Number(jumpsOrCutsCount || 0));

  // Base metabolic load (Foster AU) combined with dynamic mechanical micro-events
  const baseLoad = dur * rpe;
  const mechanicalContribution = dynamicEvents * 1.5;
  const playerLoadAu = Number((baseLoad * 0.7 + mechanicalContribution).toFixed(1));

  let mechanicalLoadTier: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'MODERATE';
  if (playerLoadAu < 300) {
    mechanicalLoadTier = 'LOW';
  } else if (playerLoadAu <= 600) {
    mechanicalLoadTier = 'MODERATE';
  } else if (playerLoadAu <= 900) {
    mechanicalLoadTier = 'HIGH';
  } else {
    mechanicalLoadTier = 'EXTREME';
  }

  return {
    playerLoadAu,
    mechanicalLoadTier,
  };
}

/**
 * 3. Hamstring & ACL Injury Risk Evaluator (FIFA 11+ & Gabbett ACWR for Team Sports)
 */
export function evaluateHamstringAndKneeRisk(
  sprintDistanceMeters: number,
  acuteChronicRatio: number = 1.0,
  reportedTightness: boolean = false
): {
  isSpikeDetected: boolean;
  riskRating: 'LOW_RISK' | 'MODERATE_MONITORED' | 'HIGH_SPIKE_RISK';
  preventativeDirectives: string[];
} {
  const sprint = Math.max(0, Number(sprintDistanceMeters || 0));
  const acwr = Number(acuteChronicRatio || 1.0);
  const directives: string[] = [];

  const isSpikeDetected = acwr >= 1.5 || (sprint > 800 && acwr > 1.3);

  let riskRating: 'LOW_RISK' | 'MODERATE_MONITORED' | 'HIGH_SPIKE_RISK' = 'LOW_RISK';

  if (reportedTightness || isSpikeDetected) {
    riskRating = 'HIGH_SPIKE_RISK';
    directives.push(
      'Lonjakan beban sprint akut terdeteksi (ACWR >= 1.5 atau ketegangan hamstring). Batasi sprint kecepatan maksimal (>25.2 km/h).'
    );
    directives.push(
      'Wajib eksekusi protokol FIFA 11+ Part 2: Nordic Hamstring Curl eksentrik (3 set x 5 reps) dan latihan kontrol valgus lutut.'
    );
  } else if (acwr > 1.3 || sprint > 500) {
    riskRating = 'MODERATE_MONITORED';
    directives.push('Beban lari kecepatan tinggi meningkat. Pastikan pemanasan mobilitas adduktor dan aktivasi gluteal sebelum sesi berikutnya.');
  } else {
    directives.push('Beban lari kecepatan tinggi berada dalam toleransi fisiologis adaptif.');
  }

  return {
    isSpikeDetected,
    riskRating,
    preventativeDirectives: directives,
  };
}

/**
 * 4. Post-Match Recovery Timeline Window (48 - 72 Hours)
 */
export function getTeamSportRecoveryTimeline(
  matchMinutes: number,
  rpe: number,
  collisionCount: number = 0
): {
  recommendedRestHours: number;
  recoveryProtocols: string[];
  glycogenRestorationGramsPerKg: number;
} {
  const mins = Number(matchMinutes || 0);
  const collisions = Number(collisionCount || 0);

  let restHours = 24;
  if (mins >= 60 || rpe >= 8 || collisions >= 15) {
    restHours = 48;
  }
  if (mins >= 80 && collisions >= 25) {
    restHours = 72; // Heavy collision match (e.g. Rugby)
  }

  const recoveryProtocols = [
    'Rehidrasi 150% dari defisit cairan tubuh pasca laga dalam 4 jam pertama.',
    'Pemberian karbohidrat indeks glikemik tinggi (1.2 g/kg/jam) untuk resintesis glikogen otot primer.',
    'Protokol kontras dingin/aktif (active recovery flush) 24 jam pasca pertandingan.',
  ];

  if (collisions > 10) {
    recoveryProtocols.push('Pemantauan memar jaringan lunak / hematoma dan skrining benturan leher/kepala.');
  }

  return {
    recommendedRestHours: restHours,
    recoveryProtocols,
    glycogenRestorationGramsPerKg: mins >= 60 ? 7.0 : 5.0,
  };
}
