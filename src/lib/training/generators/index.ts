import { FitnessGoal } from '@/types';
import { GeneratedWorkoutDraft, GoalArchetype, detectGoalArchetype } from './types';
import { generateCentury100kWorkouts } from './century100kGenerator';
import { generateMarathonRehabWorkouts } from './marathonRehabGenerator';
import { generateClimbingWorkouts } from './climbingGenerator';
import { generateConsistencyWorkouts } from './consistencyGenerator';

export * from './types';
export * from './century100kGenerator';
export * from './marathonRehabGenerator';
export * from './climbingGenerator';
export * from './consistencyGenerator';

export interface GoalGenerationMetadata {
  archetype: GoalArchetype;
  planTitle: string;
  planDescription: string;
}

export function getGoalMetadata(goal?: FitnessGoal | null): GoalGenerationMetadata {
  const archetype = detectGoalArchetype(goal);

  switch (archetype) {
    case 'MARATHON_REHAB':
      return {
        archetype,
        planTitle: '12-Week Marathon Return-to-Run Pathway (Zone 2 Galloway Protocol)',
        planDescription:
          'Program rehabilitasi dan pembentukan fondasi lari maraton 12 minggu berbasis metode interval Galloway (jalan-lari bertahap). Dikalibrasi presisi dengan gerbang toleransi sendi (nyeri ≤ 2/10), perlindungan riwayat trauma pergelangan kaki kanan dan kedua lutut, serta istirahat penuh saat puasa Senin & Kamis.',
      };

    case 'CLIMBING_ELEVATION':
      return {
        archetype,
        planTitle: '12-Week Climbing & Muscular Endurance Program (Road to 1.000m D+)',
        planDescription:
          'Program periodisasi tanjakan 12 minggu berbasis kadens teratur dan torsi stabil di posisi duduk. Mengembangkan ambang daya tahan otot paha dan gluteus tanpa goncangan torsi mendadak, selaras dengan jadwal puasa Senin & Kamis.',
      };

    case 'WEEKLY_CONSISTENCY':
      return {
        archetype,
        planTitle: '12-Week Active Fitness & Habit Consistency Program (3x Weekly Cadence)',
        planDescription:
          'Program pemeliharaan kebugaran kardiorespirasi dan pembentukan rutinitas 12 minggu dengan 3 sesi teratur per minggu. Memastikan rasio beban ACWR berada di zona aman optimal (0.8–1.2) dengan perlindungan ketat terhadap hari puasa.',
      };

    case 'CENTURY_100K':
    default:
      return {
        archetype: 'CENTURY_100K',
        planTitle: '12-Week Zone 2 Endurance Program (Road to 100km Century Ride MTB)',
        planDescription:
          'Program periodisasi aerobik 12 minggu berbasis Zone 2 (RPE 3–4 / Talk Test) untuk sepeda MTB. Menempuh jalur bertahap dari 10 km hingga puncak 100 km dalam 1x sesi continuous, dikalibrasi presisi dengan puasa Senin & Kamis.',
      };
  }
}

/**
 * Generates 36 periodized workouts specifically tailored to the target goal's archetype.
 */
export function generateWorkoutsForGoal(
  goal: FitnessGoal | null | undefined,
  userId: string,
  planId: string
): GeneratedWorkoutDraft[] {
  const archetype = detectGoalArchetype(goal);

  switch (archetype) {
    case 'MARATHON_REHAB':
      return generateMarathonRehabWorkouts(userId, planId);
    case 'CLIMBING_ELEVATION':
      return generateClimbingWorkouts(userId, planId);
    case 'WEEKLY_CONSISTENCY':
      return generateConsistencyWorkouts(userId, planId);
    case 'CENTURY_100K':
    default:
      return generateCentury100kWorkouts(userId, planId);
  }
}

