// Automated Test Suite: Phase 3 Decoupled Strength, Power & Hypertrophy Agents
// Tests: Powerlifting, Olympic Weightlifting, Calisthenics, Strongman, Bodybuilding & INOL/1RM Kernel

import { pathToFileURL } from 'url';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('🧪 RUNNING PHASE 3 DECOUPLED STRENGTH, POWER & HYPERTROPHY AGENTS SUITE');
  console.log('======================================================================\n');

  const rootDir = process.cwd();

  // Load modules
  const rawAgents = await import(pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/agents/index.ts')).href);
  const agents = rawAgents.default || rawAgents;
  const {
    PowerliftingCoachAgent,
    OlympicWeightliftingCoachAgent,
    CalisthenicsCoachAgent,
    StrongmanCoachAgent,
    BodybuildingCoachAgent,
    sportCoordinatorRouter,
  } = agents;

  const rawKernel = await import(pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/kernels/strengthCalculatorsKernel.ts')).href);
  const kernel = rawKernel.default || rawKernel;
  const {
    calculateBrzycki1RM,
    calculateVolumeLoadTonnage,
    calculateSessionInol,
  } = kernel;

  // =====================================================================
  // 1. Strength Calculators Kernel Tests
  // =====================================================================
  console.log('--- 1. Shared Strength Calculators Kernel (1RM, Tonnage, INOL) ---');

  const direct1rm = calculateBrzycki1RM(140, 1);
  assert(direct1rm.estimated1rmKg === 140 && direct1rm.formulaUsed === 'DIRECT_1RM', '1RM for 1 rep returns exact weight (140 kg)');

  const est1rm = calculateBrzycki1RM(100, 5);
  assert(est1rm.estimated1rmKg === 112.5 && est1rm.confidenceZone === 'HIGH_VALIDITY', 'Brzycki 1RM for 100kg x 5 reps is 112.5 kg (High Validity)');

  const tonnage = calculateVolumeLoadTonnage([
    { weightKg: 100, reps: 5 },
    { weightKg: 100, reps: 5 },
    { weightKg: 100, reps: 5 },
  ]);
  assert(tonnage.totalTonnageKg === 1500 && tonnage.totalReps === 15, 'Volume load tonnage is exactly 1,500 kg for 3x5 @ 100kg');

  const optimalInol = calculateSessionInol([
    { intensityPct1rm: 75, reps: 5 },
    { intensityPct1rm: 75, reps: 5 },
    { intensityPct1rm: 75, reps: 5 },
  ]);
  assert(optimalInol.totalInol === 0.6 && optimalInol.fatigueRating === 'OPTIMAL_WORK', 'INOL for 3x5 @ 75% is 0.60 (OPTIMAL_WORK)');

  const excessiveInol = calculateSessionInol([
    { intensityPct1rm: 85, reps: 10 },
    { intensityPct1rm: 85, reps: 10 },
    { intensityPct1rm: 85, reps: 10 },
    { intensityPct1rm: 85, reps: 10 },
  ]);
  assert(excessiveInol.totalInol > 2.0 && excessiveInol.fatigueRating === 'EXCESSIVE_CNS_STRAIN', 'INOL > 2.0 triggers EXCESSIVE_CNS_STRAIN alarm');

  // =====================================================================
  // 2. PowerliftingCoachAgent Tests
  // =====================================================================
  console.log('\n--- 2. Powerlifting Coach Agent (SBD, Brzycki 1RM, INOL) ---');
  const powerAgent = new PowerliftingCoachAgent();

  assert(
    powerAgent.canHandle('SPORT_POWERLIFTING') &&
    powerAgent.canHandle('SBD') &&
    powerAgent.canHandle('powerlifting') &&
    powerAgent.canHandle('weight_training'),
    'canHandle matches Powerlifting codes and aliases'
  );

  const normalSbdPayload = {
    sessionId: 'pl-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_POWERLIFTING',
    timestamp: new Date().toISOString(),
    durationMinutes: 60,
    sessionRpe: 8,
    sportSpecificMetrics: {
      primaryLift: 'SQUAT',
      workingSets: [
        { weightKg: 120, reps: 5, intensityPct1rm: 80 },
        { weightKg: 120, reps: 5, intensityPct1rm: 80 },
        { weightKg: 120, reps: 5, intensityPct1rm: 80 },
      ],
      bestSetWeightKg: 120,
      bestSetReps: 5,
    },
  };

  const plWorkload = powerAgent.computeWorkload(normalSbdPayload);
  assert(plWorkload.externalLoad === 1800, 'Calculates Squat tonnage accurately (1,800 kg)');

  const plPrescription = await powerAgent.generatePrescription(normalSbdPayload);
  assert(
    plPrescription.periodization_directive.next_session_prescription.includes('135 kg') &&
    plPrescription.safety_circuit_breakers.is_progressive_overload_allowed === true,
    'Projects 1RM (135 kg) and permits progressive overload on healthy spine'
  );

  // Lumbar spine pain circuit breaker
  const backPainPayload = {
    ...normalSbdPayload,
    subjectiveSymptoms: {
      painLocations: ['Lumbar Spine / L4-L5'],
      painScoreScale10: 4,
      jointInstabilityReported: false,
      swellingObserved: false,
    },
  };
  const backPainSafety = powerAgent.evaluateSafety(backPainPayload);
  assert(
    backPainSafety.isSafe === false &&
    backPainSafety.rehabilitationAlternative.includes('McGill Big 3'),
    'Spinal circuit breaker trips on lumbar pain and recommends McGill Big 3'
  );

  // =====================================================================
  // 3. OlympicWeightliftingCoachAgent Tests
  // =====================================================================
  console.log('\n--- 3. Olympic Weightlifting Coach Agent (Speed-Strength, Miss Rate) ---');
  const olyAgent = new OlympicWeightliftingCoachAgent();

  assert(
    olyAgent.canHandle('SPORT_WEIGHTLIFTING') &&
    olyAgent.canHandle('weightlifting') &&
    olyAgent.canHandle('Snatch') &&
    olyAgent.canHandle('Clean_and_Jerk'),
    'canHandle matches Olympic Weightlifting codes and aliases'
  );

  const normalOlyPayload = {
    sessionId: 'oly-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_WEIGHTLIFTING',
    timestamp: new Date().toISOString(),
    durationMinutes: 75,
    sessionRpe: 7,
    sportSpecificMetrics: {
      primaryDiscipline: 'SNATCH',
      barVelocityMps: 1.35,
      attempts: [
        { weightKg: 80, reps: 2, isSuccessful: true },
        { weightKg: 85, reps: 1, isSuccessful: true },
        { weightKg: 90, reps: 1, isSuccessful: true },
        { weightKg: 92.5, reps: 1, isSuccessful: false },
      ],
    },
  };

  const olyPrescription = await olyAgent.generatePrescription(normalOlyPayload);
  assert(
    olyPrescription.periodization_directive.next_session_prescription.includes('Daya ledak alaktat optimal') &&
    olyPrescription.workload_score.external_load === 335,
    'Recognizes prime bar velocity (1.35 m/s) and computes successful tonnage (335 kg)'
  );

  // High miss rate technical failure alert (>35%)
  const highMissPayload = {
    ...normalOlyPayload,
    sportSpecificMetrics: {
      ...normalOlyPayload.sportSpecificMetrics,
      attempts: [
        { weightKg: 90, reps: 1, isSuccessful: false },
        { weightKg: 90, reps: 1, isSuccessful: false },
        { weightKg: 90, reps: 1, isSuccessful: true },
        { weightKg: 90, reps: 1, isSuccessful: false },
      ], // 75% miss rate
    },
  };
  const highMissSafety = olyAgent.evaluateSafety(highMissPayload);
  assert(
    highMissSafety.haltDirectives.some((d) => d.includes('Tingkat kegagalan teknik tinggi')),
    'Alerts technical breakdown / CNS fatigue when miss rate exceeds 35%'
  );

  // Wrist hyperextension sprain circuit breaker
  const wristPainPayload = {
    ...normalOlyPayload,
    subjectiveSymptoms: {
      painLocations: ['Right Wrist'],
      painScoreScale10: 4,
      jointInstabilityReported: false,
      swellingObserved: false,
    },
  };
  const wristSafety = olyAgent.evaluateSafety(wristPainPayload);
  assert(
    wristSafety.isSafe === false &&
    wristSafety.rehabilitationAlternative.includes('Clean Pulls, Snatch Pulls'),
    'Wrist circuit breaker trips on catch pain and recommends pull alternatives'
  );

  // =====================================================================
  // 4. CalisthenicsCoachAgent Tests
  // =====================================================================
  console.log('\n--- 4. Calisthenics & Street Workout Coach Agent (TUT, Tendons) ---');
  const caliAgent = new CalisthenicsCoachAgent();

  assert(
    caliAgent.canHandle('SPORT_CALISTHENICS') &&
    caliAgent.canHandle('calisthenics') &&
    caliAgent.canHandle('street_workout') &&
    caliAgent.canHandle('bodyweight'),
    'canHandle matches Calisthenics codes and aliases'
  );

  const normalCaliPayload = {
    sessionId: 'cali-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_CALISTHENICS',
    timestamp: new Date().toISOString(),
    durationMinutes: 45,
    sessionRpe: 7,
    sportSpecificMetrics: {
      primarySkill: 'FRONT_LEVER',
      progressionLevel: 'ADVANCED_TUCK',
      totalTimeUnderTensionSec: 120,
      elbowTendonStrain10: 1,
    },
  };

  const caliPrescription = await caliAgent.generatePrescription(normalCaliPayload);
  assert(
    caliPrescription.workload_score.external_load === 120 &&
    caliPrescription.safety_circuit_breakers.is_progressive_overload_allowed === true,
    'Evaluates time under tension (120s TUT) and permits safe lever progression'
  );

  // Distal biceps / elbow tendonitis circuit breaker
  const elbowStrainPayload = {
    ...normalCaliPayload,
    sportSpecificMetrics: {
      ...normalCaliPayload.sportSpecificMetrics,
      elbowTendonStrain10: 6,
    },
    subjectiveSymptoms: {
      painLocations: ['Medial Elbow / Biceps Tendon'],
      painScoreScale10: 5,
      jointInstabilityReported: false,
      swellingObserved: false,
    },
  };
  const elbowSafety = caliAgent.evaluateSafety(elbowStrainPayload);
  assert(
    elbowSafety.isSafe === false &&
    elbowSafety.contraindicatedMovements.some((m) => m.includes('Full Planche holds')),
    'Elbow circuit breaker trips and locks straight-arm lever variations'
  );

  // =====================================================================
  // 5. StrongmanCoachAgent Tests
  // =====================================================================
  console.log('\n--- 5. Strongman & Heavy Carries Coach Agent (Axial Load & Biceps) ---');
  const strongAgent = new StrongmanCoachAgent();

  assert(
    strongAgent.canHandle('SPORT_STRONGMAN') &&
    strongAgent.canHandle('strongman') &&
    strongAgent.canHandle('farmers_walk') &&
    strongAgent.canHandle('yoke'),
    'canHandle matches Strongman codes and aliases'
  );

  const normalStrongPayload = {
    sessionId: 'strong-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_STRONGMAN',
    timestamp: new Date().toISOString(),
    durationMinutes: 50,
    sessionRpe: 8,
    sportSpecificMetrics: {
      primaryEvent: 'FARMERS_WALK',
      carriedLoadKg: 200,
      carryDistanceMeters: 40,
    },
  };

  const strongWorkload = strongAgent.computeWorkload(normalStrongPayload);
  assert(
    strongWorkload.externalLoad === 80, // (200 * 40) / 100 = 80
    'Computes work units (80 deca-tonnage-meters) for 200kg carry across 40m'
  );

  // Biceps tear risk circuit breaker
  const bicepsRiskPayload = {
    ...normalStrongPayload,
    subjectiveSymptoms: {
      painLocations: ['Distal Biceps Tendon'],
      painScoreScale10: 4,
      jointInstabilityReported: false,
      swellingObserved: false,
    },
  };
  const bicepsSafety = strongAgent.evaluateSafety(bicepsRiskPayload);
  assert(
    bicepsSafety.haltDirectives.some((d) => d.includes('Ketegangan tendon biseps distal akut')),
    'Biceps safety circuit breaker halts bent-arm heavy lifting to prevent rupture'
  );

  // =====================================================================
  // 6. BodybuildingCoachAgent Tests
  // =====================================================================
  console.log('\n--- 6. Bodybuilding & Hypertrophy Coach Agent (Hard Sets, Junk Volume) ---');
  const bbAgent = new BodybuildingCoachAgent();

  assert(
    bbAgent.canHandle('SPORT_BODYBUILDING') &&
    bbAgent.canHandle('bodybuilding') &&
    bbAgent.canHandle('hypertrophy') &&
    bbAgent.canHandle('muscle_building'),
    'canHandle matches Bodybuilding codes and aliases'
  );

  const normalBbPayload = {
    sessionId: 'bb-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_BODYBUILDING',
    timestamp: new Date().toISOString(),
    durationMinutes: 60,
    sessionRpe: 7,
    sportSpecificMetrics: {
      targetMuscleGroup: 'CHEST',
      hardSetsCount: 8,
      averageRir: 2,
    },
  };

  const bbPrescription = await bbAgent.generatePrescription(normalBbPayload);
  assert(
    bbPrescription.workload_score.external_load === 8 &&
    bbPrescription.safety_circuit_breakers.is_progressive_overload_allowed === true,
    'Prescribes optimal 8 hard sets at RIR 2 for chest hypertrophy'
  );

  // Junk volume warning (>10 hard sets in one session)
  const junkVolumePayload = {
    ...normalBbPayload,
    sportSpecificMetrics: {
      ...normalBbPayload.sportSpecificMetrics,
      hardSetsCount: 14,
    },
  };
  const junkSafety = bbAgent.evaluateSafety(junkVolumePayload);
  assert(
    junkSafety.haltDirectives.some((d) => d.includes('junk volume')),
    'Flags junk volume warning when hard sets exceed 10 in a single session'
  );

  // =====================================================================
  // 7. SportCoordinatorRouter End-to-End Dynamic Dispatch
  // =====================================================================
  console.log('\n--- 7. SportCoordinatorRouter End-to-End Dynamic Dispatch (All 5 Strength Sports) ---');

  assert(sportCoordinatorRouter.hasAgent('SPORT_POWERLIFTING'), 'Router has PowerliftingCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_WEIGHTLIFTING'), 'Router has OlympicWeightliftingCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_CALISTHENICS'), 'Router has CalisthenicsCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_STRONGMAN'), 'Router has StrongmanCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_BODYBUILDING'), 'Router has BodybuildingCoachAgent');

  // Dispatch Powerlifting via alias 'powerlifting'
  const dispPl = await sportCoordinatorRouter.dispatchTelemetry({
    sessionId: 'd-pl',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'powerlifting',
    timestamp: new Date().toISOString(),
    durationMinutes: 45,
    sessionRpe: 8,
    sportSpecificMetrics: { primaryLift: 'BENCH_PRESS' },
  });
  assert(dispPl.coach_identity === 'Decoupled Powerlifting (SBD) AI Coach', 'Dispatches to PowerliftingCoachAgent');

  // Dispatch Weightlifting via alias 'Snatch'
  const dispOly = await sportCoordinatorRouter.dispatchTelemetry({
    sessionId: 'd-oly',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'Snatch',
    timestamp: new Date().toISOString(),
    durationMinutes: 40,
    sessionRpe: 7,
    sportSpecificMetrics: {},
  });
  assert(dispOly.coach_identity === 'Decoupled Olympic Weightlifting AI Coach', 'Dispatches to OlympicWeightliftingCoachAgent');

  // Dispatch Bodybuilding via alias 'hypertrophy'
  const dispBb = await sportCoordinatorRouter.dispatchTelemetry({
    sessionId: 'd-bb',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'hypertrophy',
    timestamp: new Date().toISOString(),
    durationMinutes: 50,
    sessionRpe: 7,
    sportSpecificMetrics: { targetMuscleGroup: 'QUADS', hardSetsCount: 6 },
  });
  assert(dispBb.coach_identity === 'Decoupled Bodybuilding & Hypertrophy AI Coach', 'Dispatches to BodybuildingCoachAgent');

  // =====================================================================
  // Summary
  // =====================================================================
  console.log('\n======================================================================');
  console.log(`🏁 PHASE 3 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
