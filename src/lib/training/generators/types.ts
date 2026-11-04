import { FitnessGoal, ScheduledWorkout } from '@/types';

export type GoalArchetype =
  | 'CENTURY_100K'
  | 'MARATHON_REHAB'
  | 'CLIMBING_ELEVATION'
  | 'WEEKLY_CONSISTENCY';

export interface GeneratedWorkoutDraft extends Omit<ScheduledWorkout, 'id' | 'created_at' | 'updated_at'> {
  week_number: number;
  is_deload?: boolean;
}

/**
 * Detects the physiological training archetype from a FitnessGoal entity.
 * Uses explicit sport_type, target_event_name, unit, and title indicators.
 */
export function detectGoalArchetype(goal?: FitnessGoal | null): GoalArchetype {
  if (!goal) return 'CENTURY_100K';

  const title = (goal.title || '').toLowerCase();
  const event = (goal.target_event_name || '').toLowerCase();
  const unit = (goal.unit || '').toLowerCase();
  const sport = (goal.sport_type || '').toLowerCase();

  // 1. Climbing / Elevation goal
  if (
    unit.includes('d+') ||
    unit.includes('m') && title.includes('elevasi') ||
    title.includes('climb') ||
    title.includes('tanjakan') ||
    event.includes('climb')
  ) {
    return 'CLIMBING_ELEVATION';
  }

  // 2. Running / Marathon / Return to Run goal
  if (
    sport.includes('run') ||
    title.includes('marathon') ||
    title.includes('maraton') ||
    title.includes('return-to-run') ||
    title.includes('lari') ||
    event.includes('run') ||
    event.includes('marathon')
  ) {
    return 'MARATHON_REHAB';
  }

  // 3. Weekly Frequency / General Consistency
  if (
    goal.goal_type === 'FREQUENCY_WEEKLY' ||
    title.includes('konsistensi') ||
    title.includes('frequency') ||
    unit.includes('session')
  ) {
    return 'WEEKLY_CONSISTENCY';
  }

  // 4. Default: Cycling Endurance / Century 100K
  return 'CENTURY_100K';
}

