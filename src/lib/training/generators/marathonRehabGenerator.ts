import { GeneratedWorkoutDraft } from './types';

// Milestone progression for Sunday key running sessions (W1 to W12)
const SUNDAY_RUNNING_MILESTONES = [
  { week: 1, km: 1.5, durMin: 15, deload: false, paceSec: 480, desc: 'Toleransi Sendi: Galloway Walk-Run 15 min (Rasio 3 min jalan : 1 min lari santai). Batas nyeri ≤ 2/10.' },
  { week: 2, km: 2.0, durMin: 20, deload: false, paceSec: 480, desc: 'Toleransi Sendi: Galloway Walk-Run 20 min (Rasio 2 min jalan : 1 min lari santai). Jalur tanah/rumput rata.' },
  { week: 3, km: 2.5, durMin: 25, deload: false, paceSec: 460, desc: 'Puncak Fondasi: Galloway Walk-Run 25 min (Rasio 1 min jalan : 1 min lari). Pantau stabilitas engkel kanan.' },
  { week: 4, km: 1.5, durMin: 15, deload: true,  paceSec: 510, desc: 'Deload Pekan 4: Remobilisasi ligamen engkel dan tendon patella. Full jalan cepat tanpa benturan keras.' },
  { week: 5, km: 3.5, durMin: 28, deload: false, paceSec: 450, desc: 'Fase 2 Progresi: Lari Kontinu Santai 3.5 km Zone 2. Kadens langkah stabil ≥ 165 SPM.' },
  { week: 6, km: 5.0, durMin: 38, deload: false, paceSec: 440, desc: 'Milestone 5K Bebas Nyeri! Lari Kontinu Santai 5.0 km Zone 2. Evaluasi reaksi pergelangan kaki.' },
  { week: 7, km: 6.5, durMin: 48, deload: false, paceSec: 435, desc: 'Ekspansi Daya Tahan: Lari Kontinu 6.5 km Zone 2. Pernapasan stabil, rileks, hindari turunan terjal.' },
  { week: 8, km: 4.0, durMin: 32, deload: true,  paceSec: 470, desc: 'Deload Pekan 8: Pemulihan tendon Achilles. Lari santai 4 km + kompres dingin dan peregangan plantar.' },
  { week: 9, km: 8.0, durMin: 58, deload: false, paceSec: 430, desc: 'Fase 3 Spesifikasi: Lari Jarak Menengah 8.0 km. Membiasakan ketahanan pegas tendon tungkai bawah.' },
  { week: 10, km: 10.0, durMin: 72, deload: false, paceSec: 425, desc: 'Milestone 10K Bebas Nyeri! 1x Sesi Lari Tunggal 10.0 km. Pencapaian jarak dua digit pertama! 🏃' },
  { week: 11, km: 12.5, durMin: 88, deload: false, paceSec: 420, desc: 'Melewati Rekor Lari Historis (12.33 km): Lari Kontinu 12.5 km Zone 2 stabil tanpa keluhan sendi.' },
  { week: 12, km: 15.0, durMin: 105, deload: false, paceSec: 415, desc: 'Puncak Fondasi Jarak Jauh Maraton: 15.0 km Kontinu Bebas Nyeri! Siap melangkah ke Half-Marathon! 🏆' },
];

export function generateMarathonRehabWorkouts(userId: string, planId: string): GeneratedWorkoutDraft[] {
  const workouts: GeneratedWorkoutDraft[] = [];
  const baseTuesdayDate = new Date('2026-11-03T00:00:00Z');

  for (let w = 1; w <= 12; w++) {
    const weekOffsetDays = (w - 1) * 7;
    const msInfo = SUNDAY_RUNNING_MILESTONES[w - 1];

    // Tuesday: Session 1 (Low-Impact Cross Training / Joint Protection Spin)
    const tuesdayDate = new Date(baseTuesdayDate.getTime() + weekOffsetDays * 86400000)
      .toISOString()
      .split('T')[0];
    const tuesdayDurMin = msInfo.deload ? 20 : 25 + Math.min(10, w);

    workouts.push({
      user_id: userId,
      plan_id: planId,
      scheduled_date: tuesdayDate,
      workout_category: 'Cycling',
      target_distance_meters: 8000,
      target_duration_seconds: tuesdayDurMin * 60,
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 1–2 Low-Impact Recovery • RPE 2–3/10',
      description: `Cross-Training Sepeda Santai ${tuesdayDurMin} menit: Melancarkan peredaran darah tungkai tanpa stres benturan (ground reaction force 0G) pasca puasa Senin.`,
      status: 'PLANNED',
      is_key_session: false,
      milestone_target_km: null,
      week_number: w,
      is_deload: msInfo.deload,
    });

    // Friday: Session 2 (Foot Inversion & Achilles Strengthening Rehab)
    const fridayDate = new Date(baseTuesdayDate.getTime() + (weekOffsetDays + 3) * 86400000)
      .toISOString()
      .split('T')[0];
    const fridayDurMin = msInfo.deload ? 20 : 25;

    workouts.push({
      user_id: userId,
      plan_id: planId,
      scheduled_date: fridayDate,
      workout_category: 'Strength Training',
      target_distance_meters: null,
      target_duration_seconds: fridayDurMin * 60,
      target_pace_seconds_per_km: null,
      target_intensity: 'Ankle Stability & Kinetic Chain Rehab • RPE 3/10',
      description: `Rehabilitasi Sendi & Otot Tungkai (${fridayDurMin} menit): Latihan eksentrik betis (calf raises), keseimbangan satu kaki (proprioception), dan mobilitas pergelangan kaki kanan pasca puasa Kamis.`,
      status: 'PLANNED',
      is_key_session: false,
      milestone_target_km: null,
      week_number: w,
      is_deload: msInfo.deload,
    });

    // Sunday: Session 3 (Running Long Session Weekly Milestone)
    const sundayDate = new Date(baseTuesdayDate.getTime() + (weekOffsetDays + 5) * 86400000)
      .toISOString()
      .split('T')[0];

    workouts.push({
      user_id: userId,
      plan_id: planId,
      scheduled_date: sundayDate,
      workout_category: w >= 9 ? 'Long Run' : 'Easy Run',
      target_distance_meters: msInfo.km * 1000,
      target_duration_seconds: msInfo.durMin * 60,
      target_pace_seconds_per_km: msInfo.paceSec,
      target_intensity: msInfo.deload ? 'Zone 1 Walk-Only Recovery' : 'Zone 2 Aerobic Run • RPE 3–4/10',
      description: msInfo.desc,
      status: 'PLANNED',
      is_key_session: true,
      milestone_target_km: msInfo.km,
      week_number: w,
      is_deload: msInfo.deload,
    });
  }

  return workouts;
}
