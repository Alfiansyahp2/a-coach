import { GeneratedWorkoutDraft, resolveBaseTuesday } from './types';

export function generateConsistencyWorkouts(
  userId: string,
  planId: string,
  startDate?: string | Date
): GeneratedWorkoutDraft[] {
  const workouts: GeneratedWorkoutDraft[] = [];
  const baseTuesdayDate = resolveBaseTuesday(startDate);

  for (let w = 1; w <= 12; w++) {
    const weekOffsetDays = (w - 1) * 7;
    const isDeload = w === 4 || w === 8 || w === 12;

    // Tuesday: Session 1 (Cardio Easy Spin)
    const tuesdayDate = new Date(baseTuesdayDate.getTime() + weekOffsetDays * 86400000)
      .toISOString()
      .split('T')[0];

    workouts.push({
      user_id: userId,
      plan_id: planId,
      scheduled_date: tuesdayDate,
      workout_category: 'Cycling',
      target_distance_meters: 10000,
      target_duration_seconds: 1500, // 25 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Easy Spin • RPE 2–3/10',
      description: `Sesi Konsistensi 1: Easy Spin 25 menit pasca puasa Senin. Menjaga ritme denyut jantung aerobik stabil.`,
      status: 'PLANNED',
      is_key_session: false,
      milestone_target_km: null,
      week_number: w,
      is_deload: isDeload,
    });

    // Friday: Session 2 (Mobility & Core Maintenance)
    const fridayDate = new Date(baseTuesdayDate.getTime() + (weekOffsetDays + 3) * 86400000)
      .toISOString()
      .split('T')[0];

    workouts.push({
      user_id: userId,
      plan_id: planId,
      scheduled_date: fridayDate,
      workout_category: 'Cross Training',
      target_distance_meters: null,
      target_duration_seconds: 1500, // 25 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Active Recovery & Core • RPE 3/10',
      description: `Sesi Konsistensi 2: Penguatan mobilitas inti (glute bridge, bird-dog, plank) 25 menit pasca puasa Kamis.`,
      status: 'PLANNED',
      is_key_session: false,
      milestone_target_km: null,
      week_number: w,
      is_deload: isDeload,
    });

    // Sunday: Session 3 (Long Aerobic Fitness Maintenance)
    const sundayDate = new Date(baseTuesdayDate.getTime() + (weekOffsetDays + 5) * 86400000)
      .toISOString()
      .split('T')[0];
    const sundayDistKm = isDeload ? 12.0 : 15.0 + Math.min(10, (w - 1) * 1.5);

    workouts.push({
      user_id: userId,
      plan_id: planId,
      scheduled_date: sundayDate,
      workout_category: 'Cycling',
      target_distance_meters: Math.round(sundayDistKm * 10) * 100,
      target_duration_seconds: 2400, // 40 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 General Aerobic • RPE 3/10',
      description: `Sesi Konsistensi 3 (Puncak Pekan ${w}): Gowes Santai Terbuka ${Math.round(sundayDistKm)} km. Menyempurnakan target konsistensi 3/3 sesi minggu ini!`,
      status: 'PLANNED',
      is_key_session: true,
      milestone_target_km: Math.round(sundayDistKm * 10) / 10,
      week_number: w,
      is_deload: isDeload,
    });
  }

  return workouts;
}

