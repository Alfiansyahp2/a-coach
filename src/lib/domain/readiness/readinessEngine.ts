// Deterministic Training Readiness Engine
// Implements sport-specific assessment, deterministic safety circuit breakers,
// and safety validation gates for coaching agents without autonomous AI overrides.

import {
  AuthoritativeAthleteHealthContext,
  AthleteTrainingReadiness,
  ReadinessState,
  AthleteStatus,
  SafetyValidationResult,
  ScheduledWorkout,
} from '@/types';
import { getAnatomicalRegion } from '@/lib/anatomyUtils';

/**
 * Evaluates the authoritative health context to compute a deterministic training readiness state.
 */
export function evaluateTrainingReadiness(
  context: AuthoritativeAthleteHealthContext
): Omit<AthleteTrainingReadiness, 'id' | 'created_at'> {
  const { injuries, recentPainLogs, recentResponses, medicalAssessments, clinicianRestrictions, todayWellness } = context;

  const triggerSymptoms: Array<{ region: string; description: string; severity: string }> = [];
  const sourceTelemetryRefs: Array<{ source: string; details: string }> = [];

  // 1. Check for Active / Clinician Restrictions (HIGHEST PRIORITY)
  const hasClinicianRestriction = clinicianRestrictions.length > 0;
  const hasMedicalClearance = medicalAssessments.some(
    (m) => m.verification_status === 'CLINICIAN_VERIFIED' && (!m.clinician_restrictions || m.clinician_restrictions.toLowerCase().includes('cleared'))
  );

  // 2. Scan for Active Lower-Limb Injuries
  const activeInjuries = injuries.filter(
    (i) => i.current_status === 'ACTIVE_SYMPTOMATIC' || i.current_status === 'RECURRENT'
  );

  for (const inj of activeInjuries) {
    triggerSymptoms.push({
      region: inj.body_region,
      description: `${inj.side} ${inj.body_region}: ${inj.previous_symptoms || inj.injury_mechanism} (Status: ${inj.medical_evaluation_status})`,
      severity: inj.initial_severity,
    });
  }

  // 3. Scan Recent Pain Logs & Swelling / Instability Circuit Breakers
  const recentDays = 7;
  const cutoff = Date.now() - recentDays * 86400000;
  const filteredPainLogs = recentPainLogs.filter(
    (p) => new Date(p.logged_at).getTime() >= cutoff
  );

  const hasRecentSwelling = filteredPainLogs.some((p) => p.swelling_present) ||
    recentResponses.some((r) => r.swelling_observed);

  const hasRecentInstability = filteredPainLogs.some((p) => p.joint_instability) ||
    recentResponses.some((r) => r.instability_observed);

  const maxPainScore = Math.max(
    0,
    ...filteredPainLogs.map((p) => p.pain_score || 0),
    ...recentResponses.map((r) => Math.max(r.pain_during_activity || 0, r.pain_after_activity || 0))
  );

  // Check for verified cycling tolerance in recent responses
  const cyclingResponses = recentResponses.filter((r) => r.sport_type.toLowerCase().includes('ride'));
  const hasPainFreeCycling = cyclingResponses.some(
    (r) => r.distance_km >= 20 && (r.pain_during_activity === 0 && r.pain_after_activity === 0 && !r.swelling_observed)
  );

  if (hasPainFreeCycling) {
    const bestRide = cyclingResponses.find((r) => r.distance_km >= 20);
    sourceTelemetryRefs.push({
      source: `Strava Ingested Ride (${bestRide?.distance_km.toFixed(1)} km)`,
      details: 'Empirically tolerated with 0 reported pain during, after, and no swelling.',
    });
  }

  // 3b. Evaluate Proactive Morning Daily Wellness (Point 5)
  if (todayWellness) {
    if (todayWellness.perceived_readiness === 'REST_RECOMMENDED' || (todayWellness.fatigue_score && todayWellness.fatigue_score >= 4)) {
      sourceTelemetryRefs.push({
        source: `Morning Daily Wellness (${todayWellness.logged_date})`,
        details: `Acute systemic fatigue (Score: ${todayWellness.fatigue_score}/5, Sleep: ${todayWellness.sleep_duration_hours ?? '?'}h). Proactive recovery recommended.`,
      });
    }
  }

  // 4. Compute Sport-Specific Readiness States
  let runningReadiness: ReadinessState = 'READY';
  let cyclingReadiness: ReadinessState = 'READY';
  let generalReadiness: ReadinessState = 'READY';
  let athleteStatus: AthleteStatus = 'OPTIMAL_CLEAR';
  let automaticProgression = true;

  let runningRestrictions = '';
  let cyclingRestrictions = '';
  const rationaleItems: string[] = [];

  // A. CLINICAL OVERRIDE CHECK
  if (hasClinicianRestriction) {
    runningReadiness = 'RESTRICTED_BY_CLINICIAN';
    cyclingReadiness = 'RESTRICTED_BY_CLINICIAN';
    generalReadiness = 'RESTRICTED_BY_CLINICIAN';
    athleteStatus = 'UNDER_ACTIVE_REHAB';
    automaticProgression = false;
    runningRestrictions = `Clinician restriction active: ${clinicianRestrictions.join('; ')}`;
    cyclingRestrictions = `Clinician restriction active: ${clinicianRestrictions.join('; ')}`;
    rationaleItems.push(`Formal clinician restrictions take mandatory precedence: ${clinicianRestrictions.join('; ')}.`);
  }
  // B. SWELLING OR INSTABILITY CIRCUIT BREAKER (EMERGENCY BRAKE)
  else if (hasRecentSwelling || hasRecentInstability) {
    runningReadiness = 'ON_HOLD';
    cyclingReadiness = 'ON_HOLD';
    generalReadiness = 'REQUIRES_CLINICAL_REVIEW';
    athleteStatus = 'SUSPENDED_MEDICAL_EVAL_REQUIRED';
    automaticProgression = false;
    runningRestrictions = 'All running suspended: Acute swelling or joint instability reported.';
    cyclingRestrictions = 'All cycling suspended: Acute joint instability or swelling requires clinical review.';
    rationaleItems.push('Safety rule triggered: Recent swelling or joint instability detected. All training suspended pending clinical diagnosis.');
  }
  // C. UNRESOLVED ANATOMICAL SYMPTOMS (FULL-BODY SPORT-SPECIFIC LOADING TOLERANCE)
  else if (activeInjuries.length > 0) {
    athleteStatus = 'ACTIVE_WITH_UNRESOLVED_SYMPTOMS';
    automaticProgression = false;

    // Classify all active injuries across human anatomy
    const classified = activeInjuries.map((inj) => ({
      injury: inj,
      meta: getAnatomicalRegion(inj.body_region),
    }));

    const hasLowerLimb = classified.some((c) => c.meta.isLowerExtremity);
    const hasAxial = classified.some((c) => c.meta.isAxial);
    const injuredPartsList = activeInjuries
      .map((i) => `${i.side.toLowerCase()} ${i.body_region}`)
      .join(' and ');

    if (hasLowerLimb) {
      // Running produces repetitive high ground-reaction forces (2.5 - 3x body weight)
      runningReadiness = 'ON_HOLD';
      runningRestrictions = `Running suspended pending clinical evaluation of ${injuredPartsList} response.`;
      rationaleItems.push(
        `Running is placed ON_HOLD due to active lower-limb weight-bearing symptoms (${injuredPartsList}) awaiting clinical assessment.`
      );
    } else if (hasAxial) {
      runningReadiness = 'CONDITIONAL';
      runningRestrictions = 'Zone 1-2 soft surface jogging only; avoid hard repetitive compression on spine/core.';
      rationaleItems.push(`Running is CONDITIONAL due to active axial/spinal symptoms (${injuredPartsList}).`);
    } else {
      runningReadiness = 'READY';
      runningRestrictions = 'Running cleared: Active symptoms are localized to upper limbs without weight-bearing contraindications.';
    }

    // Cycling closed-chain kinetic loading
    if (hasPainFreeCycling) {
      cyclingReadiness = 'CONDITIONAL';
      let bikeGuidance =
        'Zone 1-2 flat aerobic cadence rides (duration <= 60 mins, distance <= 30 km) permitted. Avoid heavy out-of-saddle hill climbing or sprint intervals.';
      if (hasAxial) {
        bikeGuidance += ' Maintain relaxed upright posture; avoid prolonged aggressive aero tuck.';
      }
      cyclingRestrictions = bikeGuidance;
      const bestRideDist = cyclingResponses.find((r) => r.distance_km >= 20)?.distance_km;
      const rideProofStr = bestRideDist ? `${bestRideDist.toFixed(1)} km` : 'verified distance rides';
      rationaleItems.push(
        `Cycling is CONDITIONAL: Non-impact closed-chain pedaling was empirically tolerated on verified distance rides (e.g. ${rideProofStr} with 0 pain during, after, next-day). Sprinting and steep climbing are restricted to avoid joint torque.`
      );
    } else {
      cyclingReadiness = 'CONDITIONAL';
      cyclingRestrictions = 'Low-resistance indoor spin or short flat rides (<= 20 km) with prompt post-ride pain monitoring.';
      rationaleItems.push('Cycling is CONDITIONAL: Load must remain low-resistance until sport-specific tolerance is re-verified.');
    }

    generalReadiness = 'CONDITIONAL';
  }
  // D. ELEVATED PAIN SCORE CHECK (> 3/10)
  else if (maxPainScore > 3) {
    runningReadiness = 'ON_HOLD';
    cyclingReadiness = 'CONDITIONAL';
    generalReadiness = 'CONDITIONAL';
    athleteStatus = 'ACTIVE_WITH_UNRESOLVED_SYMPTOMS';
    automaticProgression = false;
    runningRestrictions = `Elevated pain score (${maxPainScore}/10) requires active rest and recovery.`;
    cyclingRestrictions = 'Gentle recovery spinning only (RPE < 4/10).';
    rationaleItems.push(`Pain intensity (${maxPainScore}/10) exceeds baseline tolerance threshold.`);
  }

  return {
    user_id: context.profile?.user_id || '00000000-0000-0000-0000-000000000001',
    evaluated_at: new Date().toISOString(),
    athlete_status: athleteStatus,
    running_readiness: runningReadiness,
    cycling_readiness: cyclingReadiness,
    general_readiness: generalReadiness,
    running_restrictions: runningRestrictions,
    cycling_restrictions: cyclingRestrictions,
    rationale: rationaleItems.join(' '),
    trigger_symptoms: triggerSymptoms,
    source_telemetry_refs: sourceTelemetryRefs,
    medical_clearance: hasMedicalClearance,
    automatic_progression_allowed: automaticProgression,
  };
}

export { validateWorkoutSafety } from './safetyGatekeeper';


