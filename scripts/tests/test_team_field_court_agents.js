// Automated Test Suite: Phase 4 Decoupled Team Field & Court Sports Agents
// Tests: Football, Basketball, Volleyball, Futsal, Rugby, Field Hockey & Intermittent Sports Kernel

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
  console.log('🧪 RUNNING PHASE 4 DECOUPLED TEAM FIELD & COURT AGENTS SUITE');
  console.log('======================================================================\n');

  const rootDir = process.cwd();

  // Load modules
  const rawAgents = await import(pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/agents/index.ts')).href);
  const agents = rawAgents.default || rawAgents;
  const {
    FootballCoachAgent,
    BasketballCoachAgent,
    VolleyballCoachAgent,
    FutsalCoachAgent,
    RugbyCoachAgent,
    FieldHockeyCoachAgent,
    sportCoordinatorRouter,
  } = agents;

  const rawKernel = await import(pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/kernels/intermittentSportsKernel.ts')).href);
  const kernel = rawKernel.default || rawKernel;
  const {
    calculateHsrSegmentation,
    calculatePlayerLoadAu,
    evaluateHamstringAndKneeRisk,
    getTeamSportRecoveryTimeline,
  } = kernel;

  // =====================================================================
  // 1. Intermittent Sports Kernel Tests
  // =====================================================================
  console.log('--- 1. Shared Intermittent Sports Kernel (HSR, PlayerLoad, FIFA 11+) ---');

  const hsr = calculateHsrSegmentation(10000, 1200, 300);
  assert(
    hsr.highIntensityDistanceMeters === 1500 && hsr.highIntensityPct === 15,
    'HSR segmentation computes 1,500m (15%) high intensity distance'
  );

  const playerLoad = calculatePlayerLoadAu(90, 8, 40, 0);
  assert(
    playerLoad.playerLoadAu === 564 && playerLoad.mechanicalLoadTier === 'MODERATE',
    'PlayerLoad AU computed accurately (564 AU, MODERATE tier)'
  );

  const riskSpike = evaluateHamstringAndKneeRisk(900, 1.6, true);
  assert(
    riskSpike.isSpikeDetected === true &&
    riskSpike.preventativeDirectives.some((d) => d.includes('Nordic Hamstring Curl')),
    'Hamstring/Knee risk evaluator flags spike and mandates Nordic curls'
  );

  const recovery = getTeamSportRecoveryTimeline(90, 8, 20);
  assert(
    recovery.recommendedRestHours === 48 && recovery.glycogenRestorationGramsPerKg === 7.0,
    'Post-match recovery window allocates 48 hours and 7.0 g/kg carbs'
  );

  // =====================================================================
  // 2. FootballCoachAgent Tests
  // =====================================================================
  console.log('\n--- 2. Football / Soccer Coach Agent (HSR & FIFA 11+) ---');
  const footAgent = new FootballCoachAgent();

  assert(
    footAgent.canHandle('SPORT_FOOTBALL') &&
    footAgent.canHandle('football') &&
    footAgent.canHandle('soccer') &&
    footAgent.canHandle('sepak_bola'),
    'canHandle matches Football codes and aliases'
  );

  const normalMatchPayload = {
    sessionId: 'fb-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_FOOTBALL',
    timestamp: new Date().toISOString(),
    durationMinutes: 90,
    sessionRpe: 8,
    sportSpecificMetrics: {
      totalDistanceMeters: 10500,
      hsrDistanceMeters: 1100,
      sprintDistanceMeters: 350,
      accelerationsCount: 28,
      decelerationsCount: 25,
      acuteChronicRatio: 1.1,
    },
  };

  const fbWorkload = footAgent.computeWorkload(normalMatchPayload);
  assert(fbWorkload.externalLoad === 10.5, 'Computes match distance (10.5 km)');

  const fbPrescription = await footAgent.generatePrescription(normalMatchPayload);
  assert(
    fbPrescription.periodization_directive.next_session_prescription.includes('FIFA 11+') &&
    fbPrescription.safety_circuit_breakers.is_progressive_overload_allowed === true,
    'Allows match progression and prescribes FIFA 11+ warm-up'
  );

  // Hamstring tightness circuit breaker
  const hamstringPayload = {
    ...normalMatchPayload,
    subjectiveSymptoms: {
      painLocations: ['Right Hamstring (Biceps Femoris)'],
      painScoreScale10: 4,
      jointInstabilityReported: false,
      swellingObserved: false,
    },
  };
  const hamstringSafety = footAgent.evaluateSafety(hamstringPayload);
  assert(
    hamstringSafety.isSafe === false &&
    hamstringSafety.contraindicatedMovements.some((m) => m.includes('Maximal velocity sprinting')),
    'Hamstring safety breaker halts sprinting to prevent grade 2 muscle strain'
  );

  // =====================================================================
  // 3. BasketballCoachAgent Tests
  // =====================================================================
  console.log('\n--- 3. Basketball Coach Agent (Jump Count & Patellar Tendon) ---');
  const bballAgent = new BasketballCoachAgent();

  assert(
    bballAgent.canHandle('SPORT_BASKETBALL') &&
    bballAgent.canHandle('basketball') &&
    bballAgent.canHandle('bola_basket'),
    'canHandle matches Basketball codes and aliases'
  );

  const normalBballPayload = {
    sessionId: 'bb-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_BASKETBALL',
    timestamp: new Date().toISOString(),
    durationMinutes: 60,
    sessionRpe: 7,
    sportSpecificMetrics: {
      jumpsCount: 45,
      averageJumpHeightCm: 52,
      lateralDecelerationsCount: 35,
    },
  };

  const bballWorkload = bballAgent.computeWorkload(normalBballPayload);
  assert(bballWorkload.externalLoad === 45, 'Computes total jumps accurately (45 jumps)');

  // Patellar tendinopathy (Jumper's Knee) circuit breaker
  const jumpersKneePayload = {
    ...normalBballPayload,
    subjectiveSymptoms: {
      painLocations: ['Right Patellar Tendon'],
      painScoreScale10: 4,
      jointInstabilityReported: false,
      swellingObserved: false,
    },
  };
  const jumpersKneeSafety = bballAgent.evaluateSafety(jumpersKneePayload);
  assert(
    jumpersKneeSafety.isSafe === false &&
    jumpersKneeSafety.rehabilitationAlternative.includes('Spanish Squats'),
    'Jumper\'s Knee circuit breaker halts maximal leaps and suggests Spanish Squats'
  );

  // =====================================================================
  // 4. VolleyballCoachAgent Tests
  // =====================================================================
  console.log('\n--- 4. Volleyball Coach Agent (Spikes, Blocks & Shoulder Health) ---');
  const vballAgent = new VolleyballCoachAgent();

  assert(
    vballAgent.canHandle('SPORT_VOLLEYBALL') &&
    vballAgent.canHandle('volleyball') &&
    vballAgent.canHandle('bola_voli') &&
    vballAgent.canHandle('beach_volleyball'),
    'canHandle matches Volleyball codes and aliases'
  );

  const normalVballPayload = {
    sessionId: 'vb-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_VOLLEYBALL',
    timestamp: new Date().toISOString(),
    durationMinutes: 75,
    sessionRpe: 7,
    sportSpecificMetrics: {
      spikeJumpCount: 30,
      blockJumpCount: 20,
      surfaceType: 'INDOOR_HARDWOOD',
    },
  };

  const vballWorkload = vballAgent.computeWorkload(normalVballPayload);
  assert(vballWorkload.externalLoad === 50, 'Computes total jumps (50 jumps = 30 spikes + 20 blocks)');

  // Rotator cuff impingement circuit breaker
  const shoulderPainPayload = {
    ...normalVballPayload,
    subjectiveSymptoms: {
      painLocations: ['Right Shoulder / Supraspinatus'],
      painScoreScale10: 4,
      jointInstabilityReported: false,
      swellingObserved: false,
    },
  };
  const shoulderSafety = vballAgent.evaluateSafety(shoulderPainPayload);
  assert(
    shoulderSafety.isSafe === false &&
    shoulderSafety.contraindicatedMovements.some((m) => m.includes('High-velocity overhead spike smash')),
    'Shoulder impingement circuit breaker halts overhead spike smashes'
  );

  // =====================================================================
  // 5. FutsalCoachAgent Tests
  // =====================================================================
  console.log('\n--- 5. Futsal Coach Agent (Hard Court Meniscus & Groin Safety) ---');
  const futsalAgent = new FutsalCoachAgent();

  assert(
    futsalAgent.canHandle('SPORT_FUTSAL') &&
    futsalAgent.canHandle('futsal') &&
    futsalAgent.canHandle('indoor_soccer'),
    'canHandle matches Futsal codes and aliases'
  );

  const normalFutsalPayload = {
    sessionId: 'fut-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_FUTSAL',
    timestamp: new Date().toISOString(),
    durationMinutes: 50,
    sessionRpe: 8,
    sportSpecificMetrics: {
      totalDistanceMeters: 4800,
      rapidDirectionCutsCount: 42,
      highIntensityIntervalCount: 16,
    },
  };

  const futsalPrescription = await futsalAgent.generatePrescription(normalFutsalPayload);
  assert(
    futsalPrescription.periodization_directive.next_session_prescription.includes('42 manuver potong arah tajam'),
    'Prescribes post-futsal recovery tracking 42 direction cuts'
  );

  // Hard court meniscus torsional pain circuit breaker
  const meniscusPainPayload = {
    ...normalFutsalPayload,
    subjectiveSymptoms: {
      painLocations: ['Medial Meniscus Knee'],
      painScoreScale10: 4,
      jointInstabilityReported: false,
      swellingObserved: false,
    },
  };
  const meniscusSafety = futsalAgent.evaluateSafety(meniscusPainPayload);
  assert(
    meniscusSafety.isSafe === false &&
    meniscusSafety.contraindicatedMovements.some((m) => m.includes('Rapid 180-degree change of direction cuts')),
    'Meniscus safety breaker halts 180-degree cuts on high friction court'
  );

  // =====================================================================
  // 6. RugbyCoachAgent Tests
  // =====================================================================
  console.log('\n--- 6. Rugby Union / Sevens Coach Agent (Collisions & SCAT6 Concussion) ---');
  const rugbyAgent = new RugbyCoachAgent();

  assert(
    rugbyAgent.canHandle('SPORT_RUGBY') &&
    rugbyAgent.canHandle('rugby') &&
    rugbyAgent.canHandle('rugby_union') &&
    rugbyAgent.canHandle('rugby_sevens'),
    'canHandle matches Rugby codes and aliases'
  );

  const normalRugbyPayload = {
    sessionId: 'rug-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_RUGBY',
    timestamp: new Date().toISOString(),
    durationMinutes: 80,
    sessionRpe: 9,
    sportSpecificMetrics: {
      collisionCount: 22,
      tackleCount: 14,
      scrumCount: 8,
    },
  };

  const rugbyWorkload = rugbyAgent.computeWorkload(normalRugbyPayload);
  assert(rugbyWorkload.externalLoad === 44, 'Computes total physical contacts (44 contacts = 22 collisions + 14 tackles + 8 scrums)');

  // MANDATORY SCAT6 CONCUSSION SAFETY CIRCUIT BREAKER (14-Day Lockout)
  const concussionPayload = {
    ...normalRugbyPayload,
    subjectiveSymptoms: {
      painLocations: ['Head / Temporal'],
      painScoreScale10: 6,
      jointInstabilityReported: false,
      swellingObserved: false,
      notes: 'Terkena benturan kepala saat tackle keras, pusing dan pandangan kabur sesaat (concussion).',
    },
  };
  const concussionSafety = rugbyAgent.evaluateSafety(concussionPayload);
  assert(
    concussionSafety.isSafe === false &&
    concussionSafety.haltDirectives.some((d) => d.includes('minimal 14 hari melalui protokol Graduated Return-to-Play')),
    'MANDATORY: Concussion SCAT6 circuit breaker locks contact for at least 14 days'
  );

  // =====================================================================
  // 7. FieldHockeyCoachAgent Tests
  // =====================================================================
  console.log('\n--- 7. Field Hockey Coach Agent (Semi-Squat Posture & Lumbar Safety) ---');
  const hockeyAgent = new FieldHockeyCoachAgent();

  assert(
    hockeyAgent.canHandle('SPORT_FIELD_HOCKEY') &&
    hockeyAgent.canHandle('field_hockey') &&
    hockeyAgent.canHandle('hockey') &&
    hockeyAgent.canHandle('hoki'),
    'canHandle matches Field Hockey codes and aliases'
  );

  const normalHockeyPayload = {
    sessionId: 'hk-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_FIELD_HOCKEY',
    timestamp: new Date().toISOString(),
    durationMinutes: 70,
    sessionRpe: 7,
    sportSpecificMetrics: {
      totalDistanceMeters: 6200,
      semiSquatStanceMinutes: 38,
      sprintCount: 24,
    },
  };

  const hockeyPrescription = await hockeyAgent.generatePrescription(normalHockeyPayload);
  assert(
    hockeyPrescription.periodization_directive.next_session_prescription.includes('38 menit dalam postur semi-squat') &&
    hockeyPrescription.safety_circuit_breakers.is_progressive_overload_allowed === true,
    'Tracks 38 minutes of crouched semi-squat running time'
  );

  // Lumbar spine spasm from forward crouched posture circuit breaker
  const lumbarSpasmPayload = {
    ...normalHockeyPayload,
    subjectiveSymptoms: {
      painLocations: ['Lumbar Spine / Erector Spinae'],
      painScoreScale10: 5,
      jointInstabilityReported: false,
      swellingObserved: false,
    },
  };
  const lumbarSafety = hockeyAgent.evaluateSafety(lumbarSpasmPayload);
  assert(
    lumbarSafety.isSafe === false &&
    lumbarSafety.rehabilitationAlternative.includes('McKenzie press-up'),
    'Lumbar spasm circuit breaker halts crouched dribbling and suggests McKenzie press-ups'
  );

  // =====================================================================
  // 8. SportCoordinatorRouter End-to-End Dynamic Dispatch
  // =====================================================================
  console.log('\n--- 8. SportCoordinatorRouter End-to-End Dynamic Dispatch (All 6 Team Sports) ---');

  assert(sportCoordinatorRouter.hasAgent('SPORT_FOOTBALL'), 'Router has FootballCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_BASKETBALL'), 'Router has BasketballCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_VOLLEYBALL'), 'Router has VolleyballCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_FUTSAL'), 'Router has FutsalCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_RUGBY'), 'Router has RugbyCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_FIELD_HOCKEY'), 'Router has FieldHockeyCoachAgent');

  // Dispatch Football via alias 'soccer'
  const dispSoccer = await sportCoordinatorRouter.dispatchTelemetry({
    sessionId: 'd-soc',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'soccer',
    timestamp: new Date().toISOString(),
    durationMinutes: 90,
    sessionRpe: 8,
    sportSpecificMetrics: { totalDistanceMeters: 10000 },
  });
  assert(dispSoccer.coach_identity === 'Decoupled Football / Soccer AI Coach', 'Dispatches to FootballCoachAgent');

  // Dispatch Rugby via alias 'rugby'
  const dispRugby = await sportCoordinatorRouter.dispatchTelemetry({
    sessionId: 'd-rug',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'rugby',
    timestamp: new Date().toISOString(),
    durationMinutes: 80,
    sessionRpe: 8,
    sportSpecificMetrics: { collisionCount: 15 },
  });
  assert(dispRugby.coach_identity === 'Decoupled Rugby Union / Sevens AI Coach', 'Dispatches to RugbyCoachAgent');

  // Dispatch Field Hockey via alias 'hoki'
  const dispHoki = await sportCoordinatorRouter.dispatchTelemetry({
    sessionId: 'd-hok',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'hoki',
    timestamp: new Date().toISOString(),
    durationMinutes: 60,
    sessionRpe: 7,
    sportSpecificMetrics: {},
  });
  assert(dispHoki.coach_identity === 'Decoupled Field Hockey AI Coach', 'Dispatches to FieldHockeyCoachAgent');

  // =====================================================================
  // Summary
  // =====================================================================
  console.log('\n======================================================================');
  console.log(`🏁 PHASE 4 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
