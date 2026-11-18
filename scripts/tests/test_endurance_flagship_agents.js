// Automated Test Suite: Phase 2 Decoupled Endurance Flagship Agents
// Tests: DistanceRunningCoachAgent, RoadCyclingCoachAgent, MtbXcCoachAgent & Router Dispatch

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
  console.log('🧪 RUNNING PHASE 2 DECOUPLED ENDURANCE FLAGSHIP AGENTS SUITE');
  console.log('======================================================================\n');

  const rootDir = process.cwd();

  // Load modules
  const rawAgents = await import(pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/agents/index.ts')).href);
  const agents = rawAgents.default || rawAgents;
  const {
    DistanceRunningCoachAgent,
    RoadCyclingCoachAgent,
    MtbXcCoachAgent,
    sportCoordinatorRouter,
  } = agents;

  const runningAgent = new DistanceRunningCoachAgent();
  const cyclingAgent = new RoadCyclingCoachAgent();
  const mtbAgent = new MtbXcCoachAgent();

  // =====================================================================
  // 1. DistanceRunningCoachAgent Tests
  // =====================================================================
  console.log('--- 1. Distance Running Coach Agent (Jack Daniels & RTR 4-Phase) ---');

  assert(
    runningAgent.canHandle('SPORT_DISTANCE_RUNNING') &&
    runningAgent.canHandle('Run') &&
    runningAgent.canHandle('running') &&
    runningAgent.canHandle('TRAIL_RUN'),
    'canHandle matches Running codes and common Strava aliases'
  );

  // Normal safe run workload
  const normalRunPayload = {
    sessionId: 'run-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_DISTANCE_RUNNING',
    timestamp: new Date().toISOString(),
    durationMinutes: 40,
    sessionRpe: 6,
    sportSpecificMetrics: {
      distanceMeters: 6000,
      cadenceSpm: 174,
      weeklyMileageKm: 18,
      prevWeeklyMileageKm: 17,
      rtrPhase: 4,
    },
  };

  const runWorkload = runningAgent.computeWorkload(normalRunPayload);
  assert(
    runWorkload.externalLoad === 6 && runWorkload.internalStrain === 240,
    `Calculates run external (6 km) and internal strain (240 AU) accurately`
  );

  const runPrescription = await runningAgent.generatePrescription(normalRunPayload);
  assert(
    runPrescription.safety_circuit_breakers.is_progressive_overload_allowed === true,
    'Allows progressive overload when athlete is symptom-free'
  );

  // Biological Circuit Breaker: Right Ankle ATFL pain
  const injuredRunPayload = {
    ...normalRunPayload,
    subjectiveSymptoms: {
      painLocations: ['Right Ankle (ATFL)'],
      painScoreScale10: 3,
      jointInstabilityReported: false,
      swellingObserved: false,
    },
  };

  const injuredSafety = runningAgent.evaluateSafety(injuredRunPayload);
  assert(
    injuredSafety.isSafe === false &&
    injuredSafety.rehabilitationAlternative.includes('cross-training low-impact: Sepeda'),
    'Safety breaker trips on ankle pain and directs to cycling cross-training'
  );

  // Cadence warning (< 160 SPM)
  const lowCadencePayload = {
    ...normalRunPayload,
    sportSpecificMetrics: {
      ...normalRunPayload.sportSpecificMetrics,
      cadenceSpm: 154,
    },
  };
  const lowCadenceSafety = runningAgent.evaluateSafety(lowCadencePayload);
  assert(
    lowCadenceSafety.haltDirectives.some((d) => d.includes('Kadens langkah rendah')),
    'Flags low cadence (<160 SPM) to prevent knee braking impact stress'
  );

  // Volume 10% Spike Warning
  const volumeSpikePayload = {
    ...normalRunPayload,
    sportSpecificMetrics: {
      ...normalRunPayload.sportSpecificMetrics,
      weeklyMileageKm: 30,
      prevWeeklyMileageKm: 20, // +50% jump
    },
  };
  const volumePrescription = await runningAgent.generatePrescription(volumeSpikePayload);
  assert(
    volumePrescription.periodization_directive.next_session_prescription.includes('Kenaikan jarak mingguan mencapai +50%'),
    'Detects >10% volume spike and mandates mileage stabilization'
  );

  // =====================================================================
  // 2. RoadCyclingCoachAgent Tests
  // =====================================================================
  console.log('\n--- 2. Road Cycling Coach Agent (Coggan Power & Closed-Chain) ---');

  assert(
    cyclingAgent.canHandle('SPORT_ROAD_CYCLING') &&
    cyclingAgent.canHandle('Ride') &&
    cyclingAgent.canHandle('cycling') &&
    cyclingAgent.canHandle('VirtualRide'),
    'canHandle matches Cycling codes and Strava aliases'
  );

  const normalRidePayload = {
    sessionId: 'ride-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_ROAD_CYCLING',
    timestamp: new Date().toISOString(),
    durationMinutes: 90,
    sessionRpe: 5,
    sportSpecificMetrics: {
      distanceMeters: 35000,
      averageWatts: 165,
      athleteWeightKg: 65,
      ftpWatts: 180,
      cadenceRpm: 88,
    },
  };

  const rideWorkload = cyclingAgent.computeWorkload(normalRidePayload);
  assert(
    rideWorkload.externalLoad === 35 && rideWorkload.internalStrain === 450,
    `Calculates ride external (35 km) and internal strain (450 AU) accurately`
  );

  const ridePrescription = await cyclingAgent.generatePrescription(normalRidePayload);
  assert(
    ridePrescription.periodization_directive.next_session_prescription.includes('2.54 W/kg') &&
    ridePrescription.periodization_directive.next_session_prescription.includes('92% dari FTP'),
    'Computes W/kg (2.54) and FTP intensity percentage (~92%) correctly'
  );

  // Low Cadence Grinding (<75 RPM) Warning
  const lowCadenceRidePayload = {
    ...normalRidePayload,
    sportSpecificMetrics: {
      ...normalRidePayload.sportSpecificMetrics,
      cadenceRpm: 68,
    },
  };
  const rideCadenceSafety = cyclingAgent.evaluateSafety(lowCadenceRidePayload);
  assert(
    rideCadenceSafety.haltDirectives.some((d) => d.includes('patelofemoral lutut')),
    'Warns against low-cadence gear mashing to protect patellar tendon'
  );

  // Glycogen Fueling for long rides (>2.5h)
  const longRidePayload = {
    ...normalRidePayload,
    durationMinutes: 180,
  };
  const longRidePrescription = await cyclingAgent.generatePrescription(longRidePayload);
  assert(
    longRidePrescription.nutritional_prescription.hydration_electrolyte_protocol.includes('75g karbohidrat per jam'),
    'Prescribes Jeukendrup carbohydrate intake (75g/hr) for long endurance ride'
  );

  // =====================================================================
  // 3. MtbXcCoachAgent Tests
  // =====================================================================
  console.log('\n--- 3. Mountain Bike XC Coach Agent (Torque & VAM Climbing) ---');

  assert(
    mtbAgent.canHandle('SPORT_MTB_XC') &&
    mtbAgent.canHandle('MountainBikeRide') &&
    mtbAgent.canHandle('MTB') &&
    mtbAgent.canHandle('GravelRide'),
    'canHandle matches MTB XC codes and aliases'
  );

  const normalMtbPayload = {
    sessionId: 'mtb-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'SPORT_MTB_XC',
    timestamp: new Date().toISOString(),
    durationMinutes: 60,
    sessionRpe: 7,
    sportSpecificMetrics: {
      distanceMeters: 18000,
      elevationGainMeters: 450,
      ascentTimeMinutes: 45,
      averageCadenceRpm: 75,
      trailVibrationRpe: 5,
    },
  };

  const mtbPrescription = await mtbAgent.generatePrescription(normalMtbPayload);
  assert(
    mtbPrescription.periodization_directive.next_session_prescription.includes('600 VAM'),
    'Computes Vertical Ascent Rate (VAM: 600 m/hr) accurately'
  );

  // Steep climb knee pain circuit breaker
  const kneePainMtbPayload = {
    ...normalMtbPayload,
    sportSpecificMetrics: {
      ...normalMtbPayload.sportSpecificMetrics,
      averageCadenceRpm: 60, // slow grinding
    },
    subjectiveSymptoms: {
      painLocations: ['Anterior Knee'],
      painScoreScale10: 4,
      jointInstabilityReported: false,
      swellingObserved: false,
    },
  };
  const mtbKneeSafety = mtbAgent.evaluateSafety(kneePainMtbPayload);
  assert(
    mtbKneeSafety.isSafe === false &&
    mtbKneeSafety.contraindicatedMovements.some((m) => m.includes('Steep gradient technical climbs')),
    'Halts steep technical climb progression when knee symptoms are detected'
  );

  // Crash trauma emergency stop
  const crashMtbPayload = {
    ...normalMtbPayload,
    subjectiveSymptoms: {
      painLocations: ['Left Clavicle', 'Shoulder'],
      painScoreScale10: 7,
      jointInstabilityReported: true,
      swellingObserved: true,
      notes: 'Jatuh dari sepeda saat turunan berbatu (crash).',
    },
  };
  const crashSafety = mtbAgent.evaluateSafety(crashMtbPayload);
  assert(
    crashSafety.isSafe === false &&
    crashSafety.haltDirectives.some((d) => d.includes('Trauma benturan jatuh MTB terdeteksi')),
    'Emergency safety halt triggered on MTB fall trauma / clavicle risk'
  );

  // =====================================================================
  // 4. SportCoordinatorRouter End-to-End Dynamic Dispatch
  // =====================================================================
  console.log('\n--- 4. SportCoordinatorRouter End-to-End Dynamic Dispatch ---');

  // Ensure router has all agents
  assert(sportCoordinatorRouter.hasAgent('SPORT_DISTANCE_RUNNING'), 'Router has DistanceRunningCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_ROAD_CYCLING'), 'Router has RoadCyclingCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_MTB_XC'), 'Router has MtbXcCoachAgent');

  // Dispatch via alias 'Ride'
  const dispatchedRide = await sportCoordinatorRouter.dispatchTelemetry({
    sessionId: 'disp-01',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'Ride',
    timestamp: new Date().toISOString(),
    durationMinutes: 45,
    sessionRpe: 5,
    sportSpecificMetrics: { distanceMeters: 18000, cadenceRpm: 85 },
  });
  assert(
    dispatchedRide.coach_identity === 'Decoupled Road Cycling AI Coach',
    `Dispatches 'Ride' alias cleanly to Decoupled Road Cycling AI Coach`
  );

  // Dispatch via alias 'MountainBikeRide'
  const dispatchedMtb = await sportCoordinatorRouter.dispatchTelemetry({
    sessionId: 'disp-02',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'MountainBikeRide',
    timestamp: new Date().toISOString(),
    durationMinutes: 50,
    sessionRpe: 6,
    sportSpecificMetrics: { distanceMeters: 12000, elevationGainMeters: 200 },
  });
  assert(
    dispatchedMtb.coach_identity === 'Decoupled Mountain Bike XC AI Coach',
    `Dispatches 'MountainBikeRide' alias cleanly to Decoupled Mountain Bike XC AI Coach`
  );

  // Dispatch via alias 'Run'
  const dispatchedRun = await sportCoordinatorRouter.dispatchTelemetry({
    sessionId: 'disp-03',
    athleteId: '00000000-0000-0000-0000-000000000001',
    sportCode: 'Run',
    timestamp: new Date().toISOString(),
    durationMinutes: 30,
    sessionRpe: 5,
    sportSpecificMetrics: { distanceMeters: 5000, cadenceSpm: 172 },
  });
  assert(
    dispatchedRun.coach_identity === 'Decoupled Distance Running & Marathon AI Coach',
    `Dispatches 'Run' alias cleanly to Decoupled Distance Running & Marathon AI Coach`
  );

  // =====================================================================
  // Summary
  // =====================================================================
  console.log('\n======================================================================');
  console.log(`🏁 PHASE 2 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
