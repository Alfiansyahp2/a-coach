import {
  Activity,
  TrainingInsight,
  FitnessGoal,
  AuthoritativeAthleteHealthContext,
} from '@/types';
import { formatDistance } from '@/lib/formatters';

export function generateCoachGoalAndStructureInsights(
  activities: Activity[],
  goals: FitnessGoal[],
  healthContext: AuthoritativeAthleteHealthContext | null | undefined,
  acuteDistance: number
): TrainingInsight[] {
  const insights: TrainingInsight[] = [];

  const isRunningBlocked =
    healthContext?.latestReadiness?.running_readiness === 'ON_HOLD' ||
    healthContext?.latestReadiness?.running_readiness === 'REQUIRES_CLINICAL_REVIEW';

  // 1. Road to First 100 km Century Ride (Active Primary Engine)
  const maxRideMeters = Math.max(
    0,
    ...activities
      .filter((a) => a.sport_type.toLowerCase().includes('ride'))
      .map((r) => Number(r.distance_meters || 0))
  );
  const maxRideKm = Math.round((maxRideMeters / 1000) * 10) / 10;
  const centuryProgressPct = maxRideKm > 0 ? Math.min(100, Math.round((maxRideKm / 100) * 100)) : 0;

  insights.push({
    id: 'ins-goal-100k-century',
    type: 'weekly_plan_suggestion',
    severity: 'positive',
    title: `Cycling Coach: Road to 100 km First Century Ride (${centuryProgressPct}% Baseline Reached)`,
    description:
      maxRideKm > 0
        ? `Dengan rekor jarak ${maxRideKm.toFixed(1)} km yang terbukti bebas nyeri, fondasi aerobik Anda telah mencapai ${centuryProgressPct}% dari target 100 km Century Ride. Rekomendasi pelatih: Tingkatkan jarak akhir pekan secara bertahap. Pertahankan kadens putaran lancar >= 85 RPM pada medan datar dan prioritaskan asupan karbohidrat 40-60g/jam pada sesi > 90 menit.`
        : `Fondasi aerobik siap dimulai menuju target 100 km Century Ride. Rekomendasi pelatih: Mulai dari jarak pendek Zone 2 dan tingkatkan secara bertahap bebas nyeri.`,
    grounded_data: {
      currentBestDistanceKm: maxRideKm > 0 ? maxRideKm : 0,
      targetCenturyDistanceKm: 100,
      completionPercentage: centuryProgressPct,
      recommendedZone: 'Zone 1-2 Flat Aerobic',
      cadenceTargetRpm: '>= 85 RPM',
    },
    created_at: new Date().toISOString(),
  });

  // 2. Marathon Return-to-Run Pathway (Rehab & Phased Milestones)
  const maxRunMeters = Math.max(
    0,
    ...activities
      .filter((a) => a.sport_type.toLowerCase().includes('run'))
      .map((r) => Number(r.distance_meters || 0))
  );
  const maxRunKm = Math.round((maxRunMeters / 1000) * 10) / 10;
  const marathonProgressPct = Math.min(100, Math.round(((maxRunKm > 0 ? maxRunKm : 12.33) / 42.195) * 100));

  insights.push({
    id: 'ins-goal-marathon-pathway',
    type: 'recovery',
    severity: isRunningBlocked ? 'warning' : 'info',
    title: `Running Coach: Jalur Menuju Maraton 42.2K (Fase 1: Rehabilitasi & Evaluasi Medis)`,
    description: `Target maraton (42.195 km) ditangguhkan pada jarak dasar 12.33 km (${marathonProgressPct}% jarak maraton) demi melindungi persendian engkel kanan dan lutut anterior bilateral. Rute bertahap menuju maraton: 1) Kebugaran kardiovaskular dijaga penuh via sepeda 100K; 2) Penguatan sendi mandiri & pemeriksaan fisioterapi; 3) Tes uji coba lari 5K bebas nyeri; 4) Blok setengah maraton (21.1 km); 5) Persiapan penuh maraton. Dilarang memaksakan progresi volume lari saat ini.`,
    grounded_data: {
      marathonDistanceKm: 42.195,
      longestRecordedRunKm: maxRunKm > 0 ? maxRunKm : 12.33,
      currentPhase: 'Fase 1 (Rehabilitasi Sendi & Evaluasi Medis)',
      readinessStatus: 'ON_HOLD',
      progressionLocked: true,
    },
    created_at: new Date().toISOString(),
  });

  // 3. Structure Recommendation
  if (isRunningBlocked) {
    insights.push({
      id: 'ins-next-week-rec-rehab',
      type: 'weekly_plan_suggestion',
      severity: 'info',
      title: 'AI Coach Recommendation: Struktur Latihan Multi-Sport Mingguan',
      description: `Sesuai ketersediaan 2–3 hari latihan per minggu: 2x Sesi Sepeda Aerobik Putaran Rendah Benturan (Zone 1-2, 22-35 km), 1x Latihan Penguatan Neuromuskular & Mobilitas Sendi (40 menit), dan 4 hari istirahat/pemulihan aktif. Progresi volume lari otomatis tetap terkunci demi keselamatan jangka panjang.`,
      grounded_data: {
        runningReadiness: 'ON_HOLD',
        recommendedCyclingVolumeKm: 55,
        recommendedRunningVolumeKm: 0,
        automaticProgression: false,
      },
      created_at: new Date().toISOString(),
    });
  } else {
    const activeMileageGoal = goals.find((g) => g.goal_type === 'DISTANCE_MONTHLY' && !g.is_achieved);
    const goalContext = activeMileageGoal
      ? `towards your monthly target of ${Math.round(activeMileageGoal.target_value / 1000)} km`
      : `to maintain steady cardiovascular fitness`;

    insights.push({
      id: 'ins-next-week-rec',
      type: 'weekly_plan_suggestion',
      severity: 'info',
      title: "AI Coach Recommendation for Next Week's Structure",
      description: `Based on your recent weekly base (${formatDistance(acuteDistance)}), a balanced prescription ${goalContext} is: 1x Quality Tempo Run (20%), 1x Long Aerobic Base Run (35%), 2x Zone 2 Easy Recovery Runs (35%), and 1-2 dedicated Rest / Mobility days.`,
      grounded_data: { recommendedWeeklyVolumeKm: Math.round((acuteDistance * 1.05) / 1000) },
      created_at: new Date().toISOString(),
    });
  }

  return insights;
}

