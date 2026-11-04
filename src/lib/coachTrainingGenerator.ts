import {
  DEFAULT_USER_ID,
  getActivities,
  getAuthoritativeHealthContext,
  createTrainingPlan,
  createScheduledWorkout,
  saveWorkoutActivityMatch,
  deleteTrainingPlansByUserId,
  deleteScheduledWorkoutsByUserId,
  getFitnessGoals,
  upsertFitnessGoal,
  setPrimaryFitnessGoal,
} from './db';
import {
  Activity,
  TrainingPlan,
  ScheduledWorkout,
  FitnessGoal,
} from '@/types';
import {
  getHistoricalBenchmarkWorkouts,
} from './training/workoutTemplates';
import {
  getGoalMetadata,
  generateWorkoutsForGoal,
  GoalArchetype,
} from './training/generators';

export interface GeneratedCoachTrainingResult {
  plan: TrainingPlan;
  workouts: ScheduledWorkout[];
  goals: FitnessGoal[];
  matchedCount: number;
  archetype: GoalArchetype;
  summary: {
    primaryGoalTitle: string;
    targetValue: number;
    targetUnit: string;
    runningStatus: string;
    weeklyFrequency: number;
    roadTo100kProgressPct: number;
    marathonRehabProgressPct: number;
  };
}

/**
 * Generates an end-to-end 12-Week Adaptive Endurance Program
 * dynamically calibrated from the athlete's selected primary goal:
 * - Goal-Driven Architecture: Workout categories, volumes, and progressions differ per goal
 * - Supercompensation Intervals: Strict rest & glycogen replenishment on Senin & Kamis (Puasa Sunnah)
 * - Safe Periodization: Tuesday Easy/Opening, Friday Mobility/Rehab, Sunday Key Milestone
 * - 3:1 Loading to Deload Cycles (Weeks 4, 8, 12)
 * - Proactive health protection based on athlete ankle & knee clinical state
 */
export async function generateCoachTrainingFromDatabase(
  userId: string = DEFAULT_USER_ID,
  targetGoalId?: string
): Promise<GeneratedCoachTrainingResult> {
  // 1. Fetch real grounded database assets
  const [activities, healthContext, existingGoals] = await Promise.all([
    getActivities(userId, { limit: 100 }),
    getAuthoritativeHealthContext(userId),
    getFitnessGoals(userId),
  ]);

  const rides = activities.filter((a) => a.sport_type.toLowerCase().includes('ride'));
  const runs = activities.filter((a) => a.sport_type.toLowerCase().includes('run'));

  // Max recorded metrics from activities (Peak Single Session)
  const maxRideMeters = Math.max(0, ...rides.map((r) => Number(r.distance_meters || 0)));
  const maxRideKm = Math.round((maxRideMeters / 1000) * 10) / 10; // e.g. 56.1 km
  const maxRunMeters = Math.max(0, ...runs.map((r) => Number(r.distance_meters || 0)));
  const maxRunKm = Math.round((maxRunMeters / 1000) * 10) / 10; // e.g. 12.3 km

  const readiness = healthContext?.latestReadiness;
  const isRunningOnHold =
    readiness?.running_readiness === 'ON_HOLD' ||
    readiness?.running_readiness === 'REQUIRES_CLINICAL_REVIEW';

  const weeklyTrainingDays = 3;

  // 2. Ensure foundational core goals exist with safe defaults
  const goal100k = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000031',
    user_id: userId,
    title: 'First 100 km Century Ride (MTB Zone 2)',
    goal_type: 'CUSTOM',
    sport_type: 'Ride',
    priority: targetGoalId === '00000000-0000-0000-0000-000000000031' ? 1 : 1,
    target_event_name: 'Century Ride 100K MTB',
    target_value: 100, // 100 km single session
    current_value: maxRideKm > 0 ? maxRideKm : 56.1, // 56.1 km single session baseline
    start_date: '2026-09-01',
    target_date: '2027-03-31',
    is_achieved: maxRideKm >= 100,
    unit: 'km',
  });

  const goalMarathon = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000032',
    user_id: userId,
    title: 'Marathon Pathway (42.2K) • Return-to-Run (Zone 2)',
    goal_type: 'CUSTOM',
    sport_type: 'Run',
    priority: targetGoalId === '00000000-0000-0000-0000-000000000032' ? 1 : 2,
    target_event_name: 'Marathon Return-to-Run (42.2K)',
    target_value: 42.2, // 42.2 km single session
    current_value: maxRunKm > 0 ? maxRunKm : 12.3, // 12.3 km single session baseline
    start_date: '2026-09-01',
    target_date: '2027-04-30',
    is_achieved: maxRunKm >= 42.2,
    unit: 'km',
  });

  const goalFrequency = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000033',
    user_id: userId,
    title: 'Konsistensi 3 Sesi Mingguan (Non-Puasa)',
    goal_type: 'FREQUENCY_WEEKLY',
    sport_type: 'All',
    priority: targetGoalId === '00000000-0000-0000-0000-000000000033' ? 1 : 2,
    target_event_name: 'Weekly Cadence 3x',
    target_value: 3,
    current_value: 3,
    start_date: '2026-11-02',
    target_date: '2027-01-24',
    is_achieved: true,
    unit: 'sessions',
  });

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

  // 3. Determine the Active Primary Goal
  let allGoals = [goal100k, goalMarathon, goalFrequency, goalMileage];
  if (targetGoalId) {
    const updated = await setPrimaryFitnessGoal(userId, targetGoalId);
    if (updated) {
      allGoals = allGoals.map((g) => (g.id === targetGoalId ? updated : { ...g, priority: 2 }));
    }
  }

  // Refetch fresh goals from DB to include any user custom goals
  const freshGoals = await getFitnessGoals(userId);
  const activeGoal =
    (targetGoalId ? freshGoals.find((g) => g.id === targetGoalId) : null) ||
    freshGoals.find((g) => g.priority === 1) ||
    goal100k;

  const metadata = getGoalMetadata(activeGoal);

  // 4. Clean existing plans and workouts for fresh authoritative generation
  await deleteScheduledWorkoutsByUserId(userId);
  await deleteTrainingPlansByUserId(userId);

  // 5. Create authoritative 12-Week Training Plan linked to the chosen goal
  const planStartDate = '2026-11-02';
  const planEndDate = '2027-01-24';

  const plan = await createTrainingPlan({
    user_id: userId,
    goal_id: activeGoal.id,
    title: metadata.planTitle,
    description: metadata.planDescription,
    start_date: planStartDate,
    end_date: planEndDate,
    is_active: true,
  });

  // 6. Generate 12-Week Workouts customized to the active goal archetype
  const workoutsToCreate = generateWorkoutsForGoal(activeGoal, userId, plan.id);
  const historicalMatchedWorkouts = getHistoricalBenchmarkWorkouts(userId, plan.id, activities);

  // 7. Insert all workouts into DB
  const createdWorkouts: ScheduledWorkout[] = [];

  // Historical completed workouts with correlation
  for (const item of historicalMatchedWorkouts) {
    const created = await createScheduledWorkout({
      ...item.workout,
      is_key_session: false,
      milestone_target_km: null,
    });
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

  // Future planned workouts (36 periodized sessions with key milestone flags)
  for (const item of workoutsToCreate) {
    const created = await createScheduledWorkout(item);
    createdWorkouts.push(created);
  }

  const roadTo100kProgressPct = Math.min(100, Math.round(((maxRideKm > 0 ? maxRideKm : 56.1) / 100) * 100));
  const marathonRehabProgressPct = Math.min(100, Math.round(((maxRunKm > 0 ? maxRunKm : 12.3) / 42.195) * 100));

  return {
    plan,
    workouts: createdWorkouts,
    goals: freshGoals.length > 0 ? freshGoals : allGoals,
    matchedCount: historicalMatchedWorkouts.length,
    archetype: metadata.archetype,
    summary: {
      primaryGoalTitle: activeGoal.title,
      targetValue: activeGoal.target_value,
      targetUnit: activeGoal.unit,
      runningStatus: isRunningOnHold
        ? 'Restricted / Return-to-Run Protocol (Pending Clearance)'
        : 'Active Progression',
      weeklyFrequency: weeklyTrainingDays,
      roadTo100kProgressPct,
      marathonRehabProgressPct,
    },
  };
}
