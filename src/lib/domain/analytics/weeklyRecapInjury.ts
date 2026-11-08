import {
  AthleteInjury,
  AthletePainLog,
  AthleteTrainingResponse,
} from '@/types';
import {
  WeeklyActivityRecap,
  WeeklyInjuryRecap,
  WeeklyClinicalVerdict,
  NewInjuryDossier,
  ActiveInjuryDossier,
} from './weeklyRecapTypes';

export function formatAnatomyLabel(side?: string | null, region?: string | null): string {
  const cleanSide = side?.trim() || '';
  const cleanRegion = region?.trim() || '';
  if (!cleanSide) return cleanRegion;
  if (!cleanRegion) return cleanSide;

  // Prevent stutter like "RIGHT Right Ankle" or "LEFT Left Knee"
  if (cleanRegion.toLowerCase().startsWith(cleanSide.toLowerCase())) {
    return cleanRegion;
  }
  return `${cleanSide} ${cleanRegion}`;
}

export function aggregateWeeklyInjuries(
  injuries: AthleteInjury[],
  painLogs: AthletePainLog[],
  trainingResponses: AthleteTrainingResponse[],
  start: Date,
  end: Date
): WeeklyInjuryRecap {
  const startMs = start.getTime();
  const endMs = end.getTime();

  // 1. Cidera baru yang terjadi/diperoleh pada minggu ini
  const newInjuries: NewInjuryDossier[] = injuries
    .filter((inj) => {
      const estimatedTime = inj.estimated_injury_date
        ? new Date(inj.estimated_injury_date).getTime()
        : null;

      if (estimatedTime !== null) {
        return estimatedTime >= startMs && estimatedTime <= endMs;
      }

      // Jika tidak ada estimasi tanggal eksplisit, periksa apakah merupakan riwayat/cedera terdahulu
      const isHistorical =
        inj.timeframe_description &&
        /(ago|riwayat|history|sebelumnya|chronic|months|years|bulan|tahun)/i.test(
          inj.timeframe_description
        );
      if (isHistorical) {
        return false;
      }

      const createdTime = new Date(inj.created_at).getTime();
      return createdTime >= startMs && createdTime <= endMs;
    })
    .map((inj) => ({
      id: inj.id,
      body_region: inj.body_region,
      side: inj.side,
      injury_mechanism: inj.injury_mechanism,
      initial_severity: inj.initial_severity,
      estimated_injury_date: inj.estimated_injury_date,
      current_status: inj.current_status,
      swelling_history: Boolean(inj.previous_swelling),
      medical_evaluation_status: inj.medical_evaluation_status,
    }));

  // 2. Seluruh Cidera Aktif yang Sedang Dimonitor
  const activeMonitoredInjuries: ActiveInjuryDossier[] = injuries
    .filter((inj) => inj.current_status !== 'RESOLVED')
    .map((inj) => ({
      id: inj.id,
      body_region: inj.body_region,
      side: inj.side,
      current_status: inj.current_status,
      medical_evaluation_status: inj.medical_evaluation_status,
      clinician_restrictions: inj.clinician_restrictions,
    }));

  const affectedRegionsSet = new Set<string>();
  for (const inj of activeMonitoredInjuries) {
    affectedRegionsSet.add(formatAnatomyLabel(inj.side, inj.body_region));
  }

  // 3. Telemetri Nyeri Mingguan (Pain Logs)
  const weekPainLogs = painLogs.filter((p) => {
    const logTime = new Date(p.logged_at || p.created_at).getTime();
    return logTime >= startMs && logTime <= endMs;
  });

  let painScoreSum = 0;
  let peakPainScore = 0;
  let peakPainLocation: string | null = null;
  let swellingLogsCount = 0;
  let instabilityLogsCount = 0;
  const painTypesSet = new Set<string>();

  for (const log of weekPainLogs) {
    const score = Number(log.pain_score || 0);
    painScoreSum += score;
    if (score > peakPainScore) {
      peakPainScore = score;
      peakPainLocation = formatAnatomyLabel(log.side, log.body_region);
    }
    if (log.swelling_present) swellingLogsCount++;
    if (log.joint_instability) instabilityLogsCount++;
    if (log.pain_type) painTypesSet.add(log.pain_type);
  }

  const avgPainScore = weekPainLogs.length > 0
    ? Math.round((painScoreSum / weekPainLogs.length) * 10) / 10
    : 0;

  // 4. Respon Sesi Latihan (Post-Activity Checkins)
  const weekResponses = trainingResponses.filter((r) => {
    const respTime = new Date(r.checkin_completed_at || r.created_at).getTime();
    return respTime >= startMs && respTime <= endMs;
  });

  let rpeSum = 0;
  let painFreeSessions = 0;
  let mildPainSessions = 0;
  let sigPainSessions = 0;
  let swellingResponsesCount = 0;
  let instabilityResponsesCount = 0;
  const fatigueDistribution: Record<string, number> = {
    LOW: 0,
    NORMAL: 0,
    HIGH: 0,
    EXHAUSTED: 0,
  };

  for (const resp of weekResponses) {
    rpeSum += Number(resp.rpe_score || 0);
    const maxSessionPain = Math.max(
      Number(resp.pain_during_activity || 0),
      Number(resp.pain_after_activity || 0)
    );

    if (maxSessionPain === 0) {
      painFreeSessions++;
    } else if (maxSessionPain <= 3) {
      mildPainSessions++;
    } else {
      sigPainSessions++;
    }

    if (resp.swelling_observed) swellingResponsesCount++;
    if (resp.instability_observed) instabilityResponsesCount++;

    const fatigueKey = resp.fatigue_response || 'NORMAL';
    fatigueDistribution[fatigueKey] = (fatigueDistribution[fatigueKey] || 0) + 1;
  }

  const avgRpe = weekResponses.length > 0
    ? Math.round((rpeSum / weekResponses.length) * 10) / 10
    : 0;

  return {
    new_injuries_count: newInjuries.length,
    new_injuries: newInjuries,
    active_monitored_injuries: activeMonitoredInjuries,
    affected_anatomical_regions: Array.from(affectedRegionsSet),
    pain_telemetry: {
      total_logs_count: weekPainLogs.length,
      average_pain_score: avgPainScore,
      peak_pain_score: peakPainScore,
      peak_pain_location: peakPainLocation,
      swelling_observed_count: swellingLogsCount,
      joint_instability_count: instabilityLogsCount,
      dominant_pain_types: Array.from(painTypesSet),
    },
    training_responses_summary: {
      total_checkins: weekResponses.length,
      average_rpe: avgRpe,
      pain_free_sessions_count: painFreeSessions,
      mild_pain_sessions_count: mildPainSessions,
      significant_pain_sessions_count: sigPainSessions,
      swelling_occurrences: swellingResponsesCount,
      instability_occurrences: instabilityResponsesCount,
      fatigue_distribution: fatigueDistribution,
    },
  };
}

export function evaluateWeeklyClinicalCorrelation(
  act: WeeklyActivityRecap,
  inj: WeeklyInjuryRecap
): WeeklyClinicalVerdict {
  const hasNewInjuries = inj.new_injuries_count > 0;
  const hasSwelling = inj.pain_telemetry.swelling_observed_count > 0 ||
    inj.training_responses_summary.swelling_occurrences > 0;
  const hasInstability = inj.pain_telemetry.joint_instability_count > 0 ||
    inj.training_responses_summary.instability_occurrences > 0;
  const peakPain = Math.max(
    inj.pain_telemetry.peak_pain_score,
    inj.training_responses_summary.significant_pain_sessions_count > 0 ? 5 : 0
  );

  const runSport = act.sport_breakdown.find((s) => s.sport_type.toLowerCase().includes('run'));
  const rideSport = act.sport_breakdown.find((s) => s.sport_type.toLowerCase().includes('ride'));

  let status: 'OPTIMAL' | 'CAUTION' | 'RESTRICTED' | 'SUSPENDED' = 'OPTIMAL';
  let jointSafetyStatus = 'Proteksi Sendi: Normal & Tanpa Keluhan Akut';
  let loadCorrelation = '';
  let runningGuidance = 'Lari diizinkan sesuai zona periodisasi yang direncanakan.';
  let cyclingGuidance = 'Bersepeda diizinkan secara penuh.';
  const recommendations: string[] = [];

  if (hasSwelling || hasInstability || peakPain >= 6) {
    status = 'SUSPENDED';
    jointSafetyStatus = 'CIRCUIT BREAKER: Tanda Bahaya Akut Terdeteksi (Bengkak/Instabilitas/Nyeri Hebat)';
    loadCorrelation = `Terdeteksi lonjakan gejala akut (Nyeri Puncak: ${peakPain}/10${hasSwelling ? ', Terjadi Pembengkakan' : ''}${hasInstability ? ', Sendi Goyah' : ''}). Beban latihan melebihi ambang batas toleransi jaringan lunak.`;
    runningGuidance = 'LARI DILARANG KERAS (Suspended). Hentikan seluruh pembebanan impak tinggi segera.';
    cyclingGuidance = 'Bersepeda dihentikan sementara hingga evaluasi klinis meredakan tanda radang.';
    recommendations.push('Segera lakukan kompres dingin (RICE protocol) dan elevasi tungkai yang bengkak.');
    recommendations.push('Konsultasikan segera dengan fisioterapis atau dokter kedokteran olahraga.');
    recommendations.push('Kunci seluruh progresivitas beban hingga clearance medis resmi diberikan.');
  } else if (inj.active_monitored_injuries.length > 0 || hasNewInjuries || peakPain > 0) {
    status = 'CAUTION';
    const regionNames = inj.affected_anatomical_regions.join(' & ') || 'Sendi Ekstremitas Bawah';
    jointSafetyStatus = `Protokol Perlindungan Sendi Aktif: ${regionNames}`;

    if (runSport && runSport.total_distance_km > 0) {
      loadCorrelation = `Aktivitas lari (${runSport.total_distance_km} km) berisiko memicu mikrotrauma impak berulang (2.5-3x berat badan per langkah) pada area ${regionNames}.`;
      runningGuidance = 'Lari dianjurkan DITUNDA (On Hold) atau dibatasi sangat ketat pada permukaan lunak/treadmill.';
      recommendations.push(`Batasi impak vertikal pada ${regionNames} dan hindari tanjakan curam.`);
    } else {
      loadCorrelation = `Disiplin patuh: Tidak ada aktivitas lari berimpak tinggi yang membebani sendi dalam pemulihan (${regionNames}).`;
      runningGuidance = 'Status lari: Ditunda (On Hold sendi). Pertahankan kepatuhan fase rehabilitasi.';
    }

    if (rideSport && rideSport.total_distance_km > 0) {
      if (inj.training_responses_summary.significant_pain_sessions_count === 0) {
        loadCorrelation += ` Aktivitas bersepeda (${rideSport.total_distance_km} km) terbukti ditoleransi dengan sangat baik tanpa memicu reaksi inflamasi akut.`;
        cyclingGuidance = 'Bersepeda diizinkan berlanjut: Prioritaskan Zone 2 Aerobic pada rute datar dengan cadence 80-90 RPM.';
        recommendations.push('Gunakan sepeda sebagai sarana utama menjaga kebugaran kardiorespirasi tanpa beban impak.');
      } else {
        cyclingGuidance = 'Kurangi resistensi pedal (gear ratio ringan), hindari out-of-saddle climbing.';
        recommendations.push('Gunakan gear ratio ringan untuk meminimalkan beban kompresi pada tempurung lutut.');
      }
    }

    recommendations.push('Lakukan check-in nyeri secara disiplin setelah setiap sesi latihan selesai.');
  } else {
    status = 'OPTIMAL';
    jointSafetyStatus = 'Kapasitas Biomekanis Penuh: Tidak Ada Batasan Sendi';
    loadCorrelation = `Beban total ${act.total_distance_km} km dalam ${act.total_sessions} sesi diserap tubuh dengan adaptasi fisiologis yang prima tanpa gejala nyeri.`;
    recommendations.push('Lanjutkan program latihan mingguan sesuai rencana periodisasi.');
    recommendations.push('Pertahankan rutinitas pemanasan dinamis dan pendinginan pasca latihan.');
  }

  return {
    status,
    joint_safety_status: jointSafetyStatus,
    load_vs_injury_correlation: loadCorrelation,
    running_guidance: runningGuidance,
    cycling_guidance: cyclingGuidance,
    actionable_recommendations: recommendations,
  };
}

