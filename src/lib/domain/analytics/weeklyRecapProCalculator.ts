import { Activity, AthletePainLog, AthleteTrainingResponse } from '@/types';
import { WeeklyProMetrics } from './weeklyRecapTypes';

export function computeLocalWeeklyProMetrics(
  activities: Activity[],
  start: Date,
  end: Date,
  painLogs: AthletePainLog[] = [],
  trainingResponses: AthleteTrainingResponse[] = []
): WeeklyProMetrics {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const prevStartMs = startMs - 7 * 86400000;
  const prevEndMs = startMs - 1;

  const currentActs = activities.filter((a) => {
    const t = new Date(a.start_date).getTime();
    return t >= startMs && t <= endMs;
  });

  const prevActs = activities.filter((a) => {
    const t = new Date(a.start_date).getTime();
    return t >= prevStartMs && t <= prevEndMs;
  });

  // 1. Foster sRPE Load
  let totalSrpe = 0;
  for (const a of currentActs) {
    const durMin = (a.moving_time_seconds || 0) / 60;
    // Check if there's a matching trainingResponse with RPE
    const resp = trainingResponses.find((r) => r.activity_id === a.id);
    let rpe = resp?.rpe_score;
    if (!rpe || rpe <= 0) {
      if (a.average_heartrate && a.average_heartrate >= 165) rpe = 8.0;
      else if (a.average_heartrate && a.average_heartrate >= 150) rpe = 6.0;
      else if (a.average_heartrate && a.average_heartrate >= 135) rpe = 4.0;
      else rpe = 3.5;
    }
    totalSrpe += rpe * durMin;
  }

  // 2. Weekly TSS & Daily Distribution
  const dailyLoads = [0, 0, 0, 0, 0, 0, 0];
  let weeklyTss = 0;
  for (const a of currentActs) {
    const durMin = (a.moving_time_seconds || 0) / 60;
    const avgHr = a.average_heartrate || 135;
    const deltaHr = Math.max(0, Math.min(1, (avgHr - 52) / (185 - 52)));
    const sessionTss = durMin * deltaHr * 0.64 * Math.exp(1.92 * deltaHr) * 0.95;
    weeklyTss += sessionTss;

    const d = new Date(a.start_date);
    const dayIdx = (d.getDay() + 6) % 7; // Monday = 0
    dailyLoads[dayIdx] += sessionTss;
  }

  // Monotony & Strain
  const meanDaily = weeklyTss / 7.0;
  const variance = dailyLoads.reduce((sum, l) => sum + (l - meanDaily) ** 2, 0) / 7.0;
  const sd = Math.sqrt(variance);
  const monotony = Math.round((meanDaily / Math.max(1, sd)) * 100) / 100;
  const strain = Math.round(weeklyTss * monotony * 10) / 10;

  // 3. Seiler 80/20 Polarization
  const totalDuration = currentActs.reduce((acc, a) => acc + (a.moving_time_seconds || 0), 0);
  let lowSec = 0;
  let modSec = 0;
  let highSec = 0;

  for (const a of currentActs) {
    const dur = a.moving_time_seconds || 0;
    const hr = a.average_heartrate;
    if (hr && hr > 0) {
      if (hr < 138) lowSec += dur;
      else if (hr < 157) modSec += dur;
      else highSec += dur;
    } else {
      lowSec += dur * 0.85;
      modSec += dur * 0.15;
    }
  }

  const lowPct = totalDuration > 0 ? Math.round((lowSec / totalDuration) * 1000) / 10 : 100;
  const modPct = totalDuration > 0 ? Math.round((modSec / totalDuration) * 1000) / 10 : 0;
  const highPct = totalDuration > 0 ? Math.round((highSec / totalDuration) * 1000) / 10 : 0;
  const isOptimal = lowPct >= 75.0;

  // 4. Week-over-Week Delta
  const currDist = currentActs.reduce((acc, a) => acc + (a.distance_meters || 0), 0) / 1000;
  const prevDist = prevActs.reduce((acc, a) => acc + (a.distance_meters || 0), 0) / 1000;
  const distDelta = prevDist <= 0 ? 0 : Math.round(((currDist - prevDist) / prevDist) * 1000) / 10;

  let wowFlag = 'SAFE';
  let wowInterp = `Progresi stabil (${distDelta >= 0 ? `+${distDelta}` : distDelta}% jarak).`;
  if (distDelta > 20) {
    wowFlag = 'SPIKE_WARNING';
    wowInterp = `Lonjakan volume signifikan (+${distDelta}%). Waspadai stres tendon.`;
  } else if (distDelta > 10) {
    wowFlag = 'MODERATE_SURGE';
    wowInterp = `Kenaikan terukur (+${distDelta}% jarak). Mematuhi kaidah volume.`;
  } else if (distDelta < -25) {
    wowFlag = 'DELOAD_DETECTED';
    wowInterp = `Penurunan volume terencana (${distDelta}%). Fase pemulihan aktif.`;
  }

  // 5. Musculoskeletal Impact Breakdown
  const runSec = currentActs
    .filter((a) => (a.sport_type || '').toLowerCase().includes('run'))
    .reduce((acc, a) => acc + (a.moving_time_seconds || 0), 0);
  const rideSec = currentActs
    .filter((a) => (a.sport_type || '').toLowerCase().includes('ride') || (a.sport_type || '').toLowerCase().includes('cycl'))
    .reduce((acc, a) => acc + (a.moving_time_seconds || 0), 0);

  const impactPct = totalDuration > 0 ? Math.round((runSec / totalDuration) * 1000) / 10 : 0;
  const nonImpactPct = totalDuration > 0 ? Math.round((rideSec / totalDuration) * 1000) / 10 : 0;

  const peakPain = Math.max(
    0,
    ...painLogs.map((p) => p.pain_score || 0),
    ...trainingResponses.map((r) => Math.max(r.pain_during_activity || 0, r.pain_after_activity || 0))
  );

  let jointRating = 'OPTIMAL_TOLERANCE';
  let painNote = 'Toleransi sendi stabil tanpa pembengkakan.';
  if (peakPain >= 4) {
    jointRating = 'HIGH_RISK_INFLAMMATION';
    painNote = `Gejala aktif terdeteksi (Nyeri ${peakPain}/10). Proteksi sendi diaktifkan.`;
  } else if (impactPct === 0) {
    jointRating = 'PROTECTIVE_ASYMMETRY';
    painNote = 'Disiplin proteksi sempurna: 100% volume pada sepeda non-impak (engkel & lutut aman).';
  }

  // 6. Periodization Phase
  let phase = 'BASE_BUILD';
  let bridge = 'Fondasi aerobik bertambah kokoh. Pertahankan Long Ride akhir pekan di Zone 2.';
  if (wowFlag === 'DELOAD_DETECTED') {
    phase = 'DELOAD_RECOVERY';
    bridge = 'Fase deload berhasil diserap. Minggu depan siap memulai blok progresif baru.';
  } else if (weeklyTss > 300) {
    phase = 'PEAK_WEEK';
    bridge = 'Volume puncak tercapai. Siapkan 1 minggu pemulihan aktif setelah blok ini.';
  }

  return {
    foster_srpe_load: Math.round(totalSrpe),
    weekly_tss: Math.round(weeklyTss * 10) / 10,
    training_monotony: monotony,
    training_strain: strain,
    polarization: {
      low_zone_pct: lowPct,
      moderate_zone_pct: modPct,
      high_zone_pct: highPct,
      is_optimal_polarized: isOptimal,
      classification: isOptimal ? 'OPTIMAL_POLARIZED_80_20' : modPct > 25 ? 'BLACK_HOLE_WARNING' : 'MODERATE_INTENSITY',
      verdict: isOptimal
        ? `Distribusi intensitas ideal (${lowPct}% Zone 1-2). Menjaga adaptasi mitokondria murni.`
        : `Perhatian: ${modPct}% durasi di Zone 3. Hindari kelelahan berlebih.`,
    },
    wow_delta: {
      distance_change_pct: distDelta,
      tss_change_pct: distDelta,
      safety_flag: wowFlag,
      interpretation: wowInterp,
    },
    musculoskeletal: {
      impact_running_pct: impactPct,
      non_impact_cycling_pct: nonImpactPct,
      joint_safety_rating: jointRating,
      pain_gradient_note: painNote,
    },
    periodization_phase: phase,
    pro_coach_verdict: `Rekap Mingguan Pro: Total TSS ${Math.round(weeklyTss)} (${Math.round(totalSrpe)} AU sRPE). Polarisasi ${lowPct}% Z1-2. ${painNote}`,
    next_week_bridge_advice: bridge,
  };
}

