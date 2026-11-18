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

/**
 * Resolves the initial Tuesday for periodized 12-week schedule generation.
 * If no startDate is provided, defaults safely to '2026-11-03' (Tuesday).
 */
export function resolveBaseTuesday(startDateInput?: string | Date): Date {
  if (!startDateInput) return new Date('2026-11-03T00:00:00Z');
  const d = typeof startDateInput === 'string'
    ? new Date(startDateInput.includes('T') ? startDateInput : `${startDateInput}T00:00:00Z`)
    : new Date(startDateInput.getTime());
  const day = d.getUTCDay(); // 0 is Sunday, 1 is Monday, 2 is Tuesday
  if (day === 1) {
    // Input is Monday -> base Tuesday is next day (+1)
    return new Date(d.getTime() + 86400000);
  } else if (day === 2) {
    // Input is Tuesday
    return d;
  }
  // If another day, find the Tuesday of that week
  const diff = (day === 0 ? 2 : 2 - day);
  return new Date(d.getTime() + diff * 86400000);
}


