import { GeneratedWorkoutDraft, resolveBaseTuesday } from './types';

// Milestone progression for Sunday elevation sessions (W1 to W12)
const SUNDAY_CLIMBING_MILESTONES = [
  { week: 1, km: 15.0, elevM: 150, durMin: 45, deload: false, desc: 'Fondasi Tanjakan: Gowes Datar Berbukit Ringan 15 km (+150m D+). Gunakan rasio gear ringan.' },
  { week: 2, km: 18.0, elevM: 200, durMin: 50, deload: false, desc: 'Adaptasi Torsi: Rolling Hills 18 km (+200m D+). Kayuhan duduk stabil, hindari berdiri agresif.' },
  { week: 3, km: 22.0, elevM: 250, durMin: 60, deload: false, desc: 'Puncak Fondasi: Rute Tanjakan Landai 22 km (+250m D+). Pernapasan ritmis Zone 2-3.' },
  { week: 4, km: 15.0, elevM: 100, durMin: 40, deload: true,  desc: 'Deload Pekan 4: Rute datar murni 15 km (+100m D+). Memulihkan tendon patella dari stres torsi.' },
  { week: 5, km: 25.0, elevM: 350, durMin: 70, deload: false, desc: 'Fase 2 Pengembangan: Tanjakan Berjenjang 25 km (+350m D+). Menjaga irama kayuhan 70–75 RPM.' },
  { week: 6, km: 28.0, elevM: 450, durMin: 80, deload: false, desc: 'Ambang Otot Tungkai: Rolling Hills 28 km (+450m D+). Konsistensi dorongan gluteus dan hamstring.' },
  { week: 7, km: 32.0, elevM: 550, durMin: 95, deload: false, desc: 'Simulasi Elevasi Menengah: Tanjakan Kontinu 32 km (+550m D+). Hidrasi berkala di setiap tanjakan.' },
  { week: 8, km: 20.0, elevM: 200, durMin: 55, deload: true,  desc: 'Deload Pekan 8: Pemulihan aktif otot paha 20 km (+200m D+). Putaran pedal halus 90 RPM.' },
  { week: 9, km: 35.0, elevM: 700, durMin: 110, deload: false, desc: 'Fase 3 Spesifikasi: Rute Tanjakan Berat 35 km (+700m D+). Daya tahan ambang laktat fungsional.' },
  { week: 10, km: 38.0, elevM: 850, durMin: 125, deload: false, desc: 'Tantangan Mendekati Puncak: Tanjakan Terstruktur 38 km (+850m D+). Postur punggung rileks.' },
  { week: 11, km: 42.0, elevM: 950, durMin: 140, deload: false, desc: 'Simulasi Elevasi 950m D+: Rute Pegunungan Landai 42 km (+950m D+). Menjaga ketahanan mental.' },
  { week: 12, km: 45.0, elevM: 1000, durMin: 160, deload: false, desc: 'PUNCAK ELEVASI 1.000m D+ DALAM 1x AKTIVITAS GOWES! Target tanjakan tuntas sempurna! 🏔️' },
];

export function generateClimbingWorkouts(
  userId: string,
  planId: string,
  startDate?: string | Date
): GeneratedWorkoutDraft[] {
  const workouts: GeneratedWorkoutDraft[] = [];
  const baseTuesdayDate = resolveBaseTuesday(startDate);

  for (let w = 1; w <= 12; w++) {
    const weekOffsetDays = (w - 1) * 7;
    const msInfo = SUNDAY_CLIMBING_MILESTONES[w - 1];

    // Tuesday: Cadence Pyramids / Easy Spin
    const tuesdayDate = new Date(baseTuesdayDate.getTime() + weekOffsetDays * 86400000)
      .toISOString()
      .split('T')[0];
    const tuesdayDurMin = msInfo.deload ? 25 : 30;

    workouts.push({
      user_id: userId,
      plan_id: planId,
      scheduled_date: tuesdayDate,
      workout_category: 'Cycling',
      target_distance_meters: 10000,
      target_duration_seconds: tuesdayDurMin * 60,
      target_pace_seconds_per_km: null,
      target_intensity: 'Spinning Cadence Pyramids • 85–100 RPM',
      description: `Gowes datar ${tuesdayDurMin} menit: Melatih kelancaran putaran pedal (pedaling smoothness) pasca puasa Senin. Tanpa tanjakan.`,
      status: 'PLANNED',
      is_key_session: false,
      milestone_target_km: null,
      week_number: w,
      is_deload: msInfo.deload,
    });

    // Friday: Seated Core & Gluteus Stability
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
      target_intensity: 'Glute Medius & Core Seated Climbing Stability • RPE 3/10',
      description: `Penguatan panggul dan pinggul (${fridayDurMin} menit) pasca puasa Kamis. Mencegah goyangan panggul (pelvic drop) saat menanjak.`,
      status: 'PLANNED',
      is_key_session: false,
      milestone_target_km: null,
      week_number: w,
      is_deload: msInfo.deload,
    });

    // Sunday: Key Climbing Milestone
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
      target_intensity: msInfo.deload ? 'Zone 2 Recovery • RPE 2–3/10' : 'Zone 3 Tempo Climbing • RPE 4–6/10',
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

