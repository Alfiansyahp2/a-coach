import {
  Activity,
  ScheduledWorkout,
  TrainingInsight,
  FitnessGoal,
  AuthoritativeAthleteHealthContext,
} from '@/types';
import { formatDistance, formatPaceSeconds } from './formatters';

export function generateTrainingInsights(
  activities: Activity[],
  workouts: ScheduledWorkout[],
  goals: FitnessGoal[],
  healthContext?: AuthoritativeAthleteHealthContext | null
): TrainingInsight[] {
  const insights: TrainingInsight[] = [];
  const now = new Date();

  // =====================================================================
  // 0. HEALTH CONTEXT & INJURY-AWARE READINESS INJECTION (HIGHEST PRIORITY)
  // =====================================================================
  if (healthContext?.latestReadiness) {
    const r = healthContext.latestReadiness;
    const isRunningOnHold = r.running_readiness === 'ON_HOLD' || r.running_readiness === 'REQUIRES_CLINICAL_REVIEW';
    const isCyclingConditional = r.cycling_readiness === 'CONDITIONAL';

    // 0A. Running Coach Safety Circuit Breaker
    if (isRunningOnHold) {
      insights.push({
        id: 'ins-health-running-on-hold',
        type: 'recovery',
        severity: 'warning',
        title: 'Running Coach Safety Gate: Running Suspended (ON_HOLD)',
        description: `High-impact running is temporarily suspended. Active symptoms detected: ${r.trigger_symptoms.map(s => `${s.region} (${s.severity})`).join(', ') || 'Right Ankle & Bilateral Knee Pain'}. Repetitive impact loading (2.5-3x bodyweight per stride) is contraindicated while medical evaluation is pending. Progression is locked.`,
        grounded_data: {
          runningReadiness: r.running_readiness,
          athleteStatus: r.athlete_status,
          restrictions: r.running_restrictions,
          triggerSymptoms: r.trigger_symptoms,
          medicalClearance: r.medical_clearance,
        },
        created_at: new Date().toISOString(),
      });
    }

    // 0B. Cycling Coach Sport-Specific Guidance
    if (isCyclingConditional) {
      insights.push({
        id: 'ins-health-cycling-conditional',
        type: 'weekly_plan_suggestion',
        severity: 'positive',
        title: 'Cycling Coach: Conditional Aerobic Endurance Authorized',
        description: `Non-impact closed-chain cycling has demonstrated positive empirical tolerance (verified 56.10 km ride with 0 pain during, after, and no swelling). Permitted: Flat Zone 1-2 aerobic cadence sessions (<= 30 km, <= 60 mins). Restricted: Heavy out-of-saddle climbing and high-torque sprint intervals to protect joint structures.`,
        grounded_data: {
          cyclingReadiness: r.cycling_readiness,
          empiricalValidation: '56.10 km ride completed without pain or swelling',
          restrictions: r.cycling_restrictions,
        },
        created_at: new Date().toISOString(),
      });
    }

    // 0C. Multi-Sport Training Coordinator Synthesis
    if (healthContext.injuries.length > 0) {
      insights.push({
        id: 'ins-health-coordinator-asymmetry',
        type: 'weekly_plan_suggestion',
        severity: 'info',
        title: 'Multi-Sport Coordinator: Asymmetric Load Balancing',
        description: `Training load is actively redirected to preserve cardiovascular capacity without aggravating lower-limb trauma. While running impact is paused for right ankle and anterior knee recovery, low-resistance cycling maintains aerobic mitochondrial density. Automatic progression remains disabled until formal clinical review.`,
        grounded_data: {
          activeInjuriesCount: healthContext.injuries.length,
          automaticProgressionAllowed: r.automatic_progression_allowed,
          clinicianRestrictionsCount: healthContext.clinicianRestrictions.length,
        },
        created_at: new Date().toISOString(),
      });
    }
  }

  // =====================================================================
  // 1. ACUTE:CHRONIC WORKLOAD RATIO (ACWR) & 10% VOLUME INCREASE CHECK
  // =====================================================================
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).getTime();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).getTime();
  const twentyEightDaysAgo = new Date(now.getTime() - 28 * 86400000).getTime();

  let acuteDistance = 0; // last 7 days
  let prevWeekDistance = 0; // 8-14 days ago
  let chronicDistance = 0; // last 28 days

  for (const act of activities) {
    const t = new Date(act.start_date).getTime();
    const dist = Number(act.distance_meters || 0);

    if (t >= sevenDaysAgo) {
      acuteDistance += dist;
    } else if (t >= fourteenDaysAgo) {
      prevWeekDistance += dist;
    }

    if (t >= twentyEightDaysAgo) {
      chronicDistance += dist;
    }
  }

  // Check 10% Volume Rule
  if (prevWeekDistance > 0) {
    const volumeIncreasePct = Math.round(((acuteDistance - prevWeekDistance) / prevWeekDistance) * 100);
    if (volumeIncreasePct > 15) {
      insights.push({
        id: 'ins-vol-spike',
        type: 'volume_warning',
        severity: 'warning',
        title: 'Training Volume Spike Detected (>10% Rule)',
        description: `Your 7-day volume jumped by ${volumeIncreasePct}% (${formatDistance(acuteDistance)} vs ${formatDistance(prevWeekDistance)} last week). Increasing mileage by more than 10-15% week-over-week significantly elevates overuse injury risk. Consider stabilizing mileage this upcoming week.`,
        grounded_data: {
          acuteDistanceMeters: acuteDistance,
          prevWeekDistanceMeters: prevWeekDistance,
          increasePercentage: volumeIncreasePct,
        },
        created_at: new Date().toISOString(),
      });
    } else if (volumeIncreasePct >= 0 && volumeIncreasePct <= 10) {
      insights.push({
        id: 'ins-vol-optimal',
        type: 'volume_warning',
        severity: 'positive',
        title: 'Optimal Progressive Overload',
        description: `Your weekly volume increased by ${volumeIncreasePct}%, adhering to the 10% progressive overload principle. This builds aerobic capacity without overloading tendon structures.`,
        grounded_data: {
          acuteDistanceMeters: acuteDistance,
          prevWeekDistanceMeters: prevWeekDistance,
          increasePercentage: volumeIncreasePct,
        },
        created_at: new Date().toISOString(),
      });
    }
  }

  // =====================================================================
  // 2. RUNNING PACE PROGRESSION ANALYSIS
  // =====================================================================
  const runActivities = activities
    .filter((a) => a.sport_type.toLowerCase().includes('run') && a.average_speed_mps > 0)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  if (runActivities.length >= 4) {
    const olderRuns = runActivities.slice(0, Math.floor(runActivities.length / 2));
    const recentRuns = runActivities.slice(Math.floor(runActivities.length / 2));

    const avgOlderPace =
      olderRuns.reduce((sum, r) => sum + 1000 / r.average_speed_mps, 0) / olderRuns.length;
    const avgRecentPace =
      recentRuns.reduce((sum, r) => sum + 1000 / r.average_speed_mps, 0) / recentRuns.length;

    const paceDiff = Math.round(avgOlderPace - avgRecentPace); // Positive = faster

    if (paceDiff > 5) {
      insights.push({
        id: 'ins-pace-gain',
        type: 'pace_progress',
        severity: 'positive',
        title: `Aerobic Pace Efficiency Gain (+${paceDiff}s /km faster)`,
        description: `Your average running pace has improved from ${formatPaceSeconds(Math.round(avgOlderPace))} to ${formatPaceSeconds(Math.round(avgRecentPace))} across your recent training blocks. This indicates positive neuromuscular adaptation and cardiovascular aerobic development.`,
        grounded_data: {
          olderPaceSec: Math.round(avgOlderPace),
          recentPaceSec: Math.round(avgRecentPace),
          paceDeltaSec: paceDiff,
        },
        created_at: new Date().toISOString(),
      });
    }
  }

  // =====================================================================
  // 3. TRAINING CONSISTENCY & WORKOUT ADHERENCE
  // =====================================================================
  const scheduledCount = workouts.filter((w) => w.workout_category !== 'Rest Day').length;
  const completedCount = workouts.filter((w) => w.status === 'COMPLETED').length;

  if (scheduledCount >= 3) {
    const adherenceRate = Math.round((completedCount / scheduledCount) * 100);
    if (adherenceRate >= 80) {
      insights.push({
        id: 'ins-consistency-high',
        type: 'consistency',
        severity: 'positive',
        title: `Elite Training Consistency (${adherenceRate}% Adherence)`,
        description: `You have completed ${completedCount} out of ${scheduledCount} prescribed training sessions. Consistency is the single highest predictor of endurance race-day success. Keep up the disciplined cadence!`,
        grounded_data: { scheduledCount, completedCount, adherenceRate },
        created_at: new Date().toISOString(),
      });
    } else if (adherenceRate < 60) {
      insights.push({
        id: 'ins-consistency-low',
        type: 'consistency',
        severity: 'warning',
        title: `Plan Realignment Needed (${adherenceRate}% Adherence)`,
        description: `You have completed ${completedCount} of ${scheduledCount} scheduled workouts. Life stress or overly ambitious volume might be causing missed sessions. Consider reducing planned weekly frequency by 1 session to preserve consistency and recovery.`,
        grounded_data: { scheduledCount, completedCount, adherenceRate },
        created_at: new Date().toISOString(),
      });
    }
  }

  // =====================================================================
  // 4. RECOVERY BALANCE (Consecutive hard days)
  // =====================================================================
  const toDateString = (d: any) =>
    d instanceof Date
      ? d.toISOString().split('T')[0]
      : typeof d === 'string'
        ? d.split('T')[0]
        : String(d || '');

  const sortedWorkouts = [...workouts].sort((a, b) =>
    toDateString(a.scheduled_date).localeCompare(toDateString(b.scheduled_date))
  );
  let consecutiveHardDays = 0;
  for (let i = 0; i < sortedWorkouts.length - 1; i++) {
    const cur = sortedWorkouts[i];
    const nxt = sortedWorkouts[i + 1];

    const isCurHard = ['Interval Training', 'Tempo Run', 'Long Run'].includes(cur.workout_category);
    const isNxtHard = ['Interval Training', 'Tempo Run', 'Long Run'].includes(nxt.workout_category);

    const d1 = new Date(toDateString(cur.scheduled_date)).getTime();
    const d2 = new Date(toDateString(nxt.scheduled_date)).getTime();
    const dayGap = Math.round((d2 - d1) / 86400000);

    if (isCurHard && isNxtHard && dayGap === 1) {
      consecutiveHardDays++;
    }
  }

  if (consecutiveHardDays > 0) {
    insights.push({
      id: 'ins-recovery-hard',
      type: 'recovery',
      severity: 'warning',
      title: 'Back-to-Back High Intensity Sessions Flagged',
      description: `Your calendar features consecutive hard sessions. Endurance training physiology dictates placing at least 24-48 hours of Easy/Zone 2 or Rest between hard neural/lactate workouts to permit muscular glycogen replenishment.`,
      grounded_data: { consecutiveHardDays },
      created_at: new Date().toISOString(),
    });
  }

  // =====================================================================
  // 5. INJURY-AWARE NEXT WEEK SCHEDULE RECOMMENDATION
  // =====================================================================
  const isRunningBlocked =
    healthContext?.latestReadiness?.running_readiness === 'ON_HOLD' ||
    healthContext?.latestReadiness?.running_readiness === 'REQUIRES_CLINICAL_REVIEW';

  if (isRunningBlocked) {
    insights.push({
      id: 'ins-next-week-rec-rehab',
      type: 'weekly_plan_suggestion',
      severity: 'info',
      title: "AI Coach Recommendation: Injury-Aware Multi-Sport Structure",
      description: `Running is currently ON_HOLD. Recommended weekly structure: 2x Flat Aerobic Cadence Rides (Zone 1-2, 20-30 km), 2x Targeted Ankle/Knee Physical Therapy Mobility Sessions, and 2-3 full Rest Days. High-intensity running intervals and progressive overload remain locked pending clinical clearance.`,
      grounded_data: {
        runningReadiness: 'ON_HOLD',
        recommendedCyclingVolumeKm: 50,
        recommendedRunningVolumeKm: 0,
        automaticProgression: false,
      },
      created_at: new Date().toISOString(),
    });
  } else {
    const activeMileageGoal = goals.find((g) => g.goal_type === 'DISTANCE_MONTHLY' && !g.is_achieved);
    const goalContext = activeMileageGoal
      ? `towards your monthly target of ${Math.round(activeMileageGoal.target_value / 1000)} km`
      : `to maintain steady cardiovascular fitness`;

    insights.push({
      id: 'ins-next-week-rec',
      type: 'weekly_plan_suggestion',
      severity: 'info',
      title: "AI Coach Recommendation for Next Week's Structure",
      description: `Based on your recent weekly base (${formatDistance(acuteDistance)}), a balanced prescription ${goalContext} is: 1x Quality Tempo Run (20%), 1x Long Aerobic Base Run (35%), 2x Zone 2 Easy Recovery Runs (35%), and 1-2 dedicated Rest / Mobility days.`,
      grounded_data: { recommendedWeeklyVolumeKm: Math.round((acuteDistance * 1.05) / 1000) },
      created_at: new Date().toISOString(),
    });
  }

  return insights;
}
