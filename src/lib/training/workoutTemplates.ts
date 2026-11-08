import { Activity, ScheduledWorkout } from '@/types';
import { generateCentury100kWorkouts } from './generators/century100kGenerator';

/**
 * Returns the authoritative planned workouts for the 12-Week Zone 2 Endurance Program.
 * Clean Architecture delegation: Generates workouts dynamically from the domain generator.
 */
export function getPrescribed12WeekWorkouts(
  userId: string,
  planId: string
): Omit<ScheduledWorkout, 'id' | 'created_at' | 'updated_at'>[] {
  return generateCentury100kWorkouts(userId, planId);
}

/**
 * Returns historical benchmark workouts matched to real Strava activities
 */
export function getHistoricalBenchmarkWorkouts(
  userId: string,
  planId: string,
  activities: Activity[]
): {
  workout: Omit<ScheduledWorkout, 'id' | 'created_at' | 'updated_at'>;
  matchActivityId: string;
}[] {
  const historicalMatchedWorkouts: {
    workout: Omit<ScheduledWorkout, 'id' | 'created_at' | 'updated_at'>;
    matchActivityId: string;
  }[] = [];

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  // Match recent cycling session 1 (Oct 27, 2026 - 23.36 km)
  const recentRide1 =
    sortedActivities.find(
      (a) => a.sport_type.toLowerCase().includes('ride') && a.id === '603e110d-8c31-4306-9a1f-86a49eb3204a'
    ) || sortedActivities.find((a) => a.sport_type.toLowerCase().includes('ride'));

  if (recentRide1) {
    const actDate = recentRide1.start_date.split('T')[0];
    historicalMatchedWorkouts.push({
      workout: {
        user_id: userId,
        plan_id: planId,
        scheduled_date: actDate,
        workout_category: 'Cycling',
        target_distance_meters: 23360,
        target_duration_seconds: 3480,
        target_pace_seconds_per_km: null,
        target_intensity: 'Zone 2 Aerobic Sustained',
        description: 'Sesi sepeda aerobik terencana yang telah diselesaikan atlet dengan pace prima 24.2 km/h.',
        status: 'COMPLETED',
      },
      matchActivityId: recentRide1.id,
    });
  }

  // Match recent cycling session 2 (Oct 25, 2026 - 51.37 km)
  const recentRide2 = sortedActivities.find(
    (a) => a.sport_type.toLowerCase().includes('ride') && a.id === '762fe4f5-66c6-4c6c-9dc5-f8fecb2bedda'
  );

  if (recentRide2) {
    const actDate = '2026-10-25';
    historicalMatchedWorkouts.push({
      workout: {
        user_id: userId,
        plan_id: planId,
        scheduled_date: actDate,
        workout_category: 'Cycling',
        target_distance_meters: 51370,
        target_duration_seconds: 7800,
        target_pace_seconds_per_km: null,
        target_intensity: 'Zone 2 Long Aerobic Foundation',
        description: 'Sesi ketahanan 50K+ terencana. Sukses diselesaikan atlet tanpa keluhan nyeri sendi.',
        status: 'COMPLETED',
      },
      matchActivityId: recentRide2.id,
    });
  }

  return historicalMatchedWorkouts;
}
