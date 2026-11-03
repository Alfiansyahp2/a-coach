import {
  DEFAULT_USER_ID,
  getActivities,
  getAuthoritativeHealthContext,
  createTrainingPlan,
  createScheduledWorkout,
  saveWorkoutActivityMatch,
  deleteTrainingPlansByUserId,
  deleteScheduledWorkoutsByUserId,
  upsertFitnessGoal,
} from './db';
import {
  Activity,
  TrainingPlan,
  ScheduledWorkout,
  FitnessGoal,
} from '@/types';
import {
  getPrescribed12WeekWorkouts,
  getHistoricalBenchmarkWorkouts,
} from './training/workoutTemplates';

export interface GeneratedCoachTrainingResult {
  plan: TrainingPlan;
  workouts: ScheduledWorkout[];
  goals: FitnessGoal[];
  matchedCount: number;
  summary: {
    cyclingTargetKm: number;
    runningStatus: string;
    weeklyFrequency: number;
    roadTo100kProgressPct: number;
    marathonRehabProgressPct: number;
  };
}

/**
 * Generates an end-to-end 12-Week Zone 2 Endurance Program (3 Months)
 * calibrated from the athlete's real database records & clinical consultation parameters:
 * - Equipment: Mountain Bike (MTB) with wide tires; pace secondary to Zone 2 duration
 * - Intensity Method: RPE 3–4 / 10 & Talk Test (full continuous sentences without breathlessness)
 * - Available session duration: 30–60 minutes
 * - Fasting schedule: Senin & Kamis strictly Puasa Sunnah (full rest & glycogen replenishment)
 * - Active training slots: Selasa/Rabu (Session 1), Jumat (Session 2), Minggu (Session 3)
 * - Saturday: Rest / Optional Buffer slot for weekly minimum volume
 * - Injury considerations: Right ankle sprain history & bilateral knee soreness
 * - Periodization: 3 Phases (Phase 1 Foundation W1–4, Phase 2 Development W5–8, Phase 3 Specificity W9–12) with Deload on W8 and W12
 */
export async function generateCoachTrainingFromDatabase(
  userId: string = DEFAULT_USER_ID
): Promise<GeneratedCoachTrainingResult> {
  // 1. Fetch real grounded database assets
  const [activities, healthContext] = await Promise.all([
    getActivities(userId, { limit: 100 }),
    getAuthoritativeHealthContext(userId),
  ]);

  const rides = activities.filter((a) => a.sport_type.toLowerCase().includes('ride'));
  const runs = activities.filter((a) => a.sport_type.toLowerCase().includes('run'));

  // Max recorded metrics from activities
  const maxRideMeters = Math.max(0, ...rides.map((r) => Number(r.distance_meters || 0)));
  const maxRideKm = Math.round((maxRideMeters / 1000) * 10) / 10; // e.g. 56.1 km
  const maxRunMeters = Math.max(0, ...runs.map((r) => Number(r.distance_meters || 0)));
  const maxRunKm = Math.round((maxRunMeters / 1000) * 10) / 10; // e.g. 12.3 km

  const readiness = healthContext?.latestReadiness;
  const isRunningOnHold =
    readiness?.running_readiness === 'ON_HOLD' ||
    readiness?.running_readiness === 'REQUIRES_CLINICAL_REVIEW';

  const weeklyTrainingDays = 3;

  // 2. Refresh Fitness Goals directly connected to the athlete's 12-week roadmap
  // Goal A: First 100 km Century Ride (MTB Zone 2)
  const goal100k = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000031',
    user_id: userId,
    title: 'First 100 km Century Ride (MTB Zone 2)',
    goal_type: 'CUSTOM',
    sport_type: 'Ride',
    priority: 1,
    target_event_name: 'Century Ride 100K MTB',
    target_value: 100, // 100 km
    current_value: maxRideKm > 0 ? maxRideKm : 56.1, // 56.1 km validated baseline
    start_date: '2026-09-01',
    target_date: '2027-03-31',
    is_achieved: maxRideKm >= 100,
    unit: 'km',
  });

  // Goal B: Marathon Return-to-Run Pathway (42.2 km)
  const goalMarathon = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000032',
    user_id: userId,
    title: 'Marathon Pathway (42.2K) • Return-to-Run (Zone 2)',
    goal_type: 'CUSTOM',
    sport_type: 'Run',
    priority: 2,
    target_event_name: 'Marathon Return-to-Run (42.2K)',
    target_value: 42.2,
    current_value: maxRunKm > 0 ? maxRunKm : 12.3, // 12.3 km historical baseline
    start_date: '2026-09-01',
    target_date: '2027-04-30',
    is_achieved: false,
    unit: 'km',
  });

  // Goal C: Weekly Cadence Compliance (3 Sessions / Week)
  const goalFrequency = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000033',
    user_id: userId,
    title: 'Konsistensi 3 Sesi Mingguan (Non-Puasa)',
    goal_type: 'FREQUENCY_WEEKLY',
    sport_type: 'All',
    priority: 1,
    target_event_name: 'Weekly Cadence 3x',
    target_value: 3,
    current_value: 3,
    start_date: '2026-11-02',
    target_date: '2027-01-24',
    is_achieved: true,
    unit: 'sessions',
  });

  // Goal D: 12-Week Total Mileage Accumulation
  const goalMileage = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000034',
    user_id: userId,
    title: 'Akumulasi Siklus 12-Minggu (Sepeda + Lari)',
    goal_type: 'DISTANCE_MONTHLY',
    sport_type: 'All',
    priority: 2,
    target_event_name: '12-Week Endurance Accumulation',
    target_value: 400,
    current_value: 79.5,
    start_date: '2026-11-02',
    target_date: '2027-01-24',
    is_achieved: false,
    unit: 'km',
  });

  // 3. Clean existing plans and workouts for fresh authoritative generation
  await deleteScheduledWorkoutsByUserId(userId);
  await deleteTrainingPlansByUserId(userId);

  // 4. Create authoritative 12-Week Training Plan
  const planStartDate = '2026-11-02';
  const planEndDate = '2027-01-24';

  const plan = await createTrainingPlan({
    user_id: userId,
    title: '12-Week Zone 2 Endurance Program (Road to 100km Century & Marathon Pathway)',
    description:
      'Program periodisasi aerobik 12 minggu (3 bulan) berbasis Zone 2 (RPE 3–4 / Talk Test) untuk sepeda MTB dan lari bertahap. Dikalibrasi presisi dengan rutinitas puasa Senin & Kamis (wajib istirahat penuh), slot latihan aktif Selasa/Rabu, Jumat, dan Minggu, serta perlindungan ketat terhadap riwayat keluhan pergelangan kaki kanan dan kedua lutut.',
    start_date: planStartDate,
    end_date: planEndDate,
    is_active: true,
  });

  // 5. Generate 12-Week Workouts and historical benchmarks from templates
  const workoutsToCreate = getPrescribed12WeekWorkouts(userId, plan.id);
  const historicalMatchedWorkouts = getHistoricalBenchmarkWorkouts(userId, plan.id, activities);

  // Insert all workouts into DB
  const createdWorkouts: ScheduledWorkout[] = [];

  // Historical completed workouts with correlation
  for (const item of historicalMatchedWorkouts) {
    const created = await createScheduledWorkout(item.workout);
    createdWorkouts.push(created);

    const act = activities.find((a) => a.id === item.matchActivityId);
    if (act) {
      const targetDist = Number(item.workout.target_distance_meters || act.distance_meters);
      const actualDist = Number(act.distance_meters);
      const completionPct = Math.min(150, Math.round((actualDist / targetDist) * 100));

      await saveWorkoutActivityMatch({
        workout_id: created.id,
        activity_id: act.id,
        is_manual_match: false,
        completion_percentage: completionPct,
        distance_delta_meters: actualDist - targetDist,
        duration_delta_seconds: act.moving_time_seconds - (item.workout.target_duration_seconds || act.moving_time_seconds),
        pace_delta_seconds_per_km: 0,
      });
    }
  }

  // Future planned workouts
  for (const item of workoutsToCreate) {
    const created = await createScheduledWorkout(item);
    createdWorkouts.push(created);
  }

  const roadTo100kProgressPct = Math.min(100, Math.round(((maxRideKm > 0 ? maxRideKm : 56.1) / 100) * 100));
  const marathonRehabProgressPct = Math.min(100, Math.round(((maxRunKm > 0 ? maxRunKm : 12.3) / 42.195) * 100));

  return {
    plan,
    workouts: createdWorkouts,
    goals: [goal100k, goalMarathon, goalFrequency, goalMileage],
    matchedCount: historicalMatchedWorkouts.length,
    summary: {
      cyclingTargetKm: 100,
      runningStatus: isRunningOnHold
        ? 'Restricted / Return-to-Run Protocol (Pending Clearance)'
        : 'Active Progression',
      weeklyFrequency: weeklyTrainingDays,
      roadTo100kProgressPct,
      marathonRehabProgressPct,
    },
  };
}
