import { GeneratedWorkoutDraft, resolveBaseTuesday } from './types';

// Milestone progression for Sunday key long rides (W1 to W12)
const SUNDAY_CENTURY_MILESTONES = [
  { week: 1, km: 10.0, durMin: 30, deload: false, desc: 'Fondasi Awal: Easy MTB 10 km datar. Jaga kayuhan ringan dan kadens 85–90 RPM.' },
  { week: 2, km: 12.5, durMin: 35, deload: false, desc: 'Progresi Kapiler: Easy MTB 12.5 km. Pernapasan aerobik stabil (talk test kalimat penuh).' },
  { week: 3, km: 15.0, durMin: 40, deload: false, desc: 'Puncak Fondasi: Long MTB 15 km. Membiasakan efisiensi beta-oksidasi lemak Zone 2.' },
  { week: 4, km: 10.0, durMin: 28, deload: true,  desc: 'Deload Pekan 4 (-40%): Pemulihan seluler, perbaikan jaringan sendi dan penyerapan beban.' },
  { week: 5, km: 20.0, durMin: 50, deload: false, desc: 'Fase 2 Pengembangan: Long MTB 20 km. Uji posisi sadel dan ketahanan otot tungkai.' },
  { week: 6, km: 25.0, durMin: 60, deload: false, desc: 'Ekspansi Jarak Menengah: Long MTB 25 km. Manajemen hidrasi setiap 20 menit berkala.' },
  { week: 7, km: 30.0, durMin: 75, deload: false, desc: 'Ambang Daya Tahan: Long MTB 30 km. Konsistensi ritme kayuhan tanpa lonjakan torsi.' },
  { week: 8, km: 20.0, durMin: 50, deload: true,  desc: 'Deload Pekan 8 (-35%): Konsolidasi sistem saraf pusat pasca blok 30 km, reset kelelahan.' },
  { week: 9, km: 40.0, durMin: 95, deload: false, desc: 'Fase 3 Spesifikasi: Long MTB 40 km. Uji postur duduk sadel durasi panjang bebas pegal.' },
  { week: 10, km: 55.0, durMin: 125, deload: false, desc: 'Melewati Rekor Historis: Long MTB 55 km. Menyamai rekor jarak terpanjang bebas cedera.' },
  { week: 11, km: 70.0, durMin: 155, deload: false, desc: 'Dress Rehearsal Puncak: Long MTB 70 km. Uji simulasi kesiapan rute dan nutrisi.' },
  { week: 12, km: 100.0, durMin: 220, deload: false, desc: 'PUNCAK CENTURY RIDE 100K MTB! Dituntaskan dalam 1x sesi continuous! 🏆' },
];

export function generateCentury100kWorkouts(
  userId: string,
  planId: string,
  startDate?: string | Date
): GeneratedWorkoutDraft[] {
  const workouts: GeneratedWorkoutDraft[] = [];
  const baseTuesdayDate = resolveBaseTuesday(startDate);

  for (let w = 1; w <= 12; w++) {
    const weekOffsetDays = (w - 1) * 7;
    const msInfo = SUNDAY_CENTURY_MILESTONES[w - 1];

    // Tuesday: Session 1 (Easy Spin / Opening)
    const tuesdayDate = new Date(baseTuesdayDate.getTime() + weekOffsetDays * 86400000)
      .toISOString()
      .split('T')[0];
    const tuesdayKm = msInfo.deload ? 6.0 : Math.round((msInfo.km * 0.4) * 10) / 10;
    const tuesdayDurMin = msInfo.deload ? 20 : 25 + Math.min(15, w);

    workouts.push({
      user_id: userId,
      plan_id: planId,
      scheduled_date: tuesdayDate,
      workout_category: 'Cycling',
      target_distance_meters: tuesdayKm * 1000,
      target_duration_seconds: tuesdayDurMin * 60,
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Perkiraan • RPE 2–3/10',
      description: `Easy MTB ${tuesdayDurMin} menit: Jalur datar dan stabil pasca puasa Senin. Melancarkan sirkulasi cairan sinovial sendi.`,
      status: 'PLANNED',
      is_key_session: false,
      milestone_target_km: null,
      week_number: w,
      is_deload: msInfo.deload,
    });

    // Friday: Session 2 (Mobility & Upper Body / Core)
    const fridayDate = new Date(baseTuesdayDate.getTime() + (weekOffsetDays + 3) * 86400000)
      .toISOString()
      .split('T')[0];
    const fridayDurMin = msInfo.deload ? 20 : 25;

    workouts.push({
      user_id: userId,
      plan_id: planId,
      scheduled_date: fridayDate,
      workout_category: 'Cross Training',
      target_distance_meters: null,
      target_duration_seconds: fridayDurMin * 60,
      target_pace_seconds_per_km: null,
      target_intensity: 'Upper-Body Mobility & Core • RPE 3/10',
      description: `Penguatan inti dan mobilitas tubuh atas (${fridayDurMin} menit) pasca puasa Kamis. Tanpa beban vertikal pada engkel dan lutut.`,
      status: 'PLANNED',
      is_key_session: false,
      milestone_target_km: null,
      week_number: w,
      is_deload: msInfo.deload,
    });

    // Sunday: Session 3 (Long Ride Weekly Milestone)
    const sundayDate = new Date(baseTuesdayDate.getTime() + (weekOffsetDays + 5) * 86400000)
      .toISOString()
      .split('T')[0];

    workouts.push({
      user_id: userId,
      plan_id: planId,
      scheduled_date: sundayDate,
      workout_category: 'Cycling',
      target_distance_meters: msInfo.km * 1000,
      target_duration_seconds: msInfo.durMin * 60,
      target_pace_seconds_per_km: null,
      target_intensity: msInfo.deload ? 'Zone 1–2 Recovery • RPE 2–3/10' : 'Zone 2 Endurance • RPE 3–4/10',
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

