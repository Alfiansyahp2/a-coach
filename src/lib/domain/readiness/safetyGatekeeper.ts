import {
  AthleteTrainingReadiness,
  SafetyValidationResult,
  ScheduledWorkout,
} from '@/types';

/**
 * Gatekeeper function: Validates whether a proposed workout or coaching recommendation
 * is safe against the athlete's current authoritative readiness and clinician restrictions.
 */
export function validateWorkoutSafety(
  workout: Partial<ScheduledWorkout>,
  readiness: AthleteTrainingReadiness,
  clinicianRestrictions: string[]
): SafetyValidationResult {
  const category = (workout.workout_category || '').toLowerCase();
  const isRun = category.includes('run') || category.includes('fartlek') || category.includes('interval');
  const isRide = category.includes('cycl') || category.includes('ride') || category.includes('bike');

  // 1. Check Clinician Restrictions (Absolute precedence)
  for (const restriction of clinicianRestrictions) {
    const resLower = restriction.toLowerCase();
    if (resLower.includes('no run') && isRun) {
      return {
        isApproved: false,
        blockedReason: `Blocked by Clinician Restriction: "${restriction}"`,
        alternativeRecommendation: 'Rest Day or Low-Impact Mobility Exercise',
        triggeredRestrictions: [restriction],
      };
    }
    if (resLower.includes('no impact') && isRun) {
      return {
        isApproved: false,
        blockedReason: `Blocked by Clinician Restriction: "${restriction}" (repetitive impact contraindicated)`,
        alternativeRecommendation: 'Non-impact cross-training (Indoor Spin or Swimming)',
        triggeredRestrictions: [restriction],
      };
    }
  }

  // 2. Check Running Readiness State
  if (isRun) {
    if (readiness.running_readiness === 'ON_HOLD') {
      return {
        isApproved: false,
        blockedReason: `Running readiness is ON_HOLD: ${readiness.running_restrictions || 'Lower-limb symptoms under assessment.'}`,
        alternativeRecommendation: 'Low-impact cross-training (Flat Zone 1-2 cycling or restorative yoga) pending clinical evaluation.',
        warningNotice: 'Impact running contraindicated due to unresolved ankle/knee symptoms.',
      };
    }
    if (readiness.running_readiness === 'REQUIRES_CLINICAL_REVIEW') {
      return {
        isApproved: false,
        blockedReason: 'Running blocked: Clinical medical examination required prior to resumption.',
        alternativeRecommendation: 'Schedule an appointment with a sports physician or physiotherapist.',
      };
    }
    if (readiness.running_readiness === 'CONDITIONAL') {
      // Allow only short recovery runs (< 5km, low intensity)
      const dist = (workout.target_distance_meters || 0) / 1000;
      if (dist > 5.0 || category.includes('tempo') || category.includes('interval') || category.includes('long')) {
        return {
          isApproved: false,
          blockedReason: `Conditional running permission allows maximum 5.0 km easy recovery jog. Prescribed ${dist.toFixed(1)} km or high intensity is restricted.`,
          alternativeRecommendation: '3-4 km Zone 2 Easy Stride with immediate pain monitoring.',
        };
      }
    }
  }

  // 3. Check Cycling Readiness State
  if (isRide) {
    if (readiness.cycling_readiness === 'ON_HOLD') {
      return {
        isApproved: false,
        blockedReason: `Cycling readiness is ON_HOLD: ${readiness.cycling_restrictions}`,
        alternativeRecommendation: 'Complete rest day or upper-body mobility.',
      };
    }
    if (readiness.cycling_readiness === 'CONDITIONAL') {
      const dist = (workout.target_distance_meters || 0) / 1000;
      const intensity = (workout.target_intensity || '').toLowerCase();
      if (dist > 35 || intensity.includes('threshold') || intensity.includes('interval') || intensity.includes('vo2')) {
        return {
          isApproved: false,
          blockedReason: 'Conditional cycling permits flat aerobic endurance (distance <= 30 km). High-torque intervals or extreme distance are restricted.',
          alternativeRecommendation: '20-25 km flat Zone 1-2 cadence spin (RPE <= 5/10).',
        };
      }
    }
  }

  // 4. Block Automatic Overload Progression
  if (!readiness.automatic_progression_allowed && workout.description?.toLowerCase().includes('progressive overload')) {
    return {
      isApproved: false,
      blockedReason: 'Progressive overload volume progression is locked while athlete has active/unresolved symptoms.',
      alternativeRecommendation: 'Maintain constant maintenance load; prioritize tissue recovery.',
    };
  }

  return { isApproved: true };
}

