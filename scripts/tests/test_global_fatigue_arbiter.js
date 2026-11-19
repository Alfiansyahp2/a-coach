// Verification Suite for Phase 7: Global Systemic Fatigue Arbiter & Hybrid Multi-Sport Athlete Integration
// Grounded in Hickson (1980) Concurrent Training Interference, Baar (2014) AMPK vs mTORC1 Signaling,
// Millet et al. (2011) Central Nervous System Depletion, and Meeusen et al. (2013) ECSS/ACSM Overtraining Consensus.

const path = require('path');
const { pathToFileURL } = require('url');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
    failedTests++;
  }
}

async function runGlobalFatigueArbiterTests() {
  console.log('======================================================================');
  console.log('🧪 RUNNING PHASE 7 GLOBAL SYSTEMIC FATIGUE ARBITER TEST SUITE');
  console.log('======================================================================\n');

  const rootDir = path.resolve(__dirname, '../../');
  const coachIndexPath = pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/index.ts')).href;

  const rawCoachMod = await import(coachIndexPath);
  const coachDomain = rawCoachMod.default || rawCoachMod;

  const {
    evaluateAmpkMtorInterference,
    evaluateCentralNervousSystemFatigue,
    evaluateAnatomicalOverlapStrain,
    globalSystemicFatigueArbiter,
    sportCoordinatorRouter,
  } = coachDomain;

  // --- SECTION 1: Pure Concurrent Training Interference Kernel ---
  console.log('--- 1. Pure Concurrent Training Interference Kernel (AMPK vs mTORC1) ---');

  // A. Severe Molecular Interference: Heavy Strength immediately followed by High Endurance
  const criticalInterference = evaluateAmpkMtorInterference('STRENGTH_POWER', 9, 'CYCLIC_ENDURANCE', 4);
  assert(criticalInterference.hasMolecularInterference, 'Detects molecular pathway interference between heavy strength & endurance');
  assert(criticalInterference.severity === 'CRITICAL', 'Flags CRITICAL severity when spaced < 8 hours apart');
  assert(
    criticalInterference.pathwayConflict === 'AMPK_PHOSPHORYLATION_SUPPRESSING_MTORC1',
    'Identifies AMPK phosphorylation suppression of mTORC1'
  );
  assert(criticalInterference.recommendedSpacingHours === 24, 'Recommends 24h separation window');
  assert(criticalInterference.directive.includes('INTERFERENSI MOLEKULER TINGGI'), 'Directive includes molecular interference alert');

  // B. Moderate / Compatible Spacing
  const moderateInterference = evaluateAmpkMtorInterference('STRENGTH_POWER', 8, 'CYCLIC_ENDURANCE', 16);
  assert(moderateInterference.hasMolecularInterference, 'Identifies moderate interference with 16h spacing');
  assert(moderateInterference.severity === 'MODERATE', 'Assigns MODERATE severity for 16h separation');

  // C. Incompatible Clusters with zero conflict
  const zeroConflict = evaluateAmpkMtorInterference('RACQUET_PRECISION', 5, 'RACQUET_PRECISION', 2);
  assert(!zeroConflict.hasMolecularInterference, 'Zero molecular interference between precision racquet sports');
  assert(zeroConflict.severity === 'NONE', 'Assigns NONE severity');

  // --- SECTION 2: Central Nervous System (CNS) Neuromuscular Depletion ---
  console.log('\n--- 2. Central Nervous System (CNS) Neuromuscular Depletion Kernel ---');

  // A. Low CNS session load
  const lowCns = evaluateCentralNervousSystemFatigue(['SPORT_DISTANCE_RUNNING', 'SPORT_SWIMMING'], [6, 5]);
  assert(!lowCns.isCnsDepleted, 'No CNS depletion under standard aerobic load');
  assert(lowCns.severity === 'LOW', 'Assigns LOW severity');

  // B. Elevated CNS fatigue (2 high-load neuromuscular sessions)
  const elevatedCns = evaluateCentralNervousSystemFatigue(
    ['SPORT_POWERLIFTING', 'SPORT_WEIGHTLIFTING'],
    [8, 8]
  );
  assert(elevatedCns.isCnsDepleted, 'Detects CNS depletion for 2 heavy axial neuromuscular sessions');
  assert(elevatedCns.severity === 'ELEVATED', 'Flags ELEVATED severity');
  assert(elevatedCns.contraindicatedModalities.includes('Maximal 1RM attempts'), 'Contraindicates maximal 1RM attempts');

  // C. Critical CNS exhaustion (3+ high neuromuscular sessions in 48h)
  const criticalCns = evaluateCentralNervousSystemFatigue(
    ['SPORT_POWERLIFTING', 'SPORT_MMA', 'SPORT_STRONGMAN'],
    [9, 8, 9]
  );
  assert(criticalCns.isCnsDepleted, 'Detects critical CNS motor unit depletion for 3 heavy sessions');
  assert(criticalCns.severity === 'CRITICAL_EXHAUSTION', 'Flags CRITICAL_EXHAUSTION severity');
  assert(criticalCns.directive.includes('DEPLESI SISTEM SARAF PUSAT'), 'Directive contains CNS warning');

  // --- SECTION 3: Anatomical Overlap Joint Collisions ---
  console.log('\n--- 3. Anatomical Overlap Matrix & Clinical Injury Interlocking ---');

  // A. Multi-sport cumulative joint stress on Ankle/Achilles (Running + Basketball + Badminton)
  const ankleCollision = evaluateAnatomicalOverlapStrain([
    'SPORT_DISTANCE_RUNNING',
    'SPORT_BASKETBALL',
    'SPORT_BADMINTON',
  ]);
  assert(ankleCollision.hasHighOverlapRisk, 'Detects high overlap risk for triple ankle-loading sports');
  assert(ankleCollision.criticalRegions.includes('ANKLE_ACHILLES'), 'Identifies ANKLE_ACHILLES as critical region');
  assert(ankleCollision.directive.includes('ANATOMICAL OVERLAP CIRCUIT BREAKER'), 'Trips Anatomical Overlap Circuit Breaker');

  // B. Interlocking with Active Clinical Injury Dossier
  const injuredOverlap = evaluateAnatomicalOverlapStrain(
    ['SPORT_DISTANCE_RUNNING'],
    ['Right Ankle ATFL Sprain (Pending Clinical Assessment)']
  );
  assert(injuredOverlap.hasHighOverlapRisk, 'Immediately trips overlap breaker when sport stresses clinically injured joint');
  assert(injuredOverlap.criticalRegions.includes('ANKLE_ACHILLES'), 'Flags ANKLE_ACHILLES matched against ATFL dossier');

  // C. Balanced joint distribution (Swimming + Cycling + Table Tennis)
  const balancedSports = evaluateAnatomicalOverlapStrain([
    'SPORT_SWIMMING',
    'SPORT_ROAD_CYCLING',
    'SPORT_TABLE_TENNIS',
  ]);
  assert(!balancedSports.hasHighOverlapRisk, 'No overlap risk when joint stress is distributed across shoulder, knee, and wrist');

  // --- SECTION 4: Global Systemic Fatigue Arbiter End-to-End ---
  console.log('\n--- 4. Global Systemic Fatigue Arbiter End-to-End ---');

  // A. Harmonious Hybrid Athlete Schedule
  const harmoniousSchedule = [
    {
      sessionId: 'sess-1',
      sportCode: 'SPORT_DISTANCE_RUNNING',
      cluster: 'CYCLIC_ENDURANCE',
      durationMinutes: 45,
      sessionRpe: 5,
      timestamp: '2026-11-15T07:00:00Z',
    },
    {
      sessionId: 'sess-2',
      sportCode: 'SPORT_SWIMMING',
      cluster: 'CYCLIC_ENDURANCE',
      durationMinutes: 40,
      sessionRpe: 6,
      timestamp: '2026-11-16T07:00:00Z',
    },
    {
      sessionId: 'sess-3',
      sportCode: 'SPORT_POWERLIFTING',
      cluster: 'STRENGTH_POWER',
      durationMinutes: 60,
      sessionRpe: 7,
      timestamp: '2026-11-17T17:00:00Z',
    },
  ];

  const harmoniousResult = globalSystemicFatigueArbiter.arbitrateHybridSchedule(harmoniousSchedule);
  assert(harmoniousResult.isApproved, 'Harmonious hybrid schedule approved');
  assert(harmoniousResult.otsRiskTier === 'OPTIMAL', 'OTS risk tier is OPTIMAL');
  assert(harmoniousResult.nutritionalPrescription.proteinTargetGKg === 1.8, 'Prescribes baseline 1.8 g/kg protein');

  // B. Maladaptive Over-Training Burnout (OTS) Detection (Extreme strain & elevated RHR)
  const extremeSessions = [];
  for (let d = 12; d <= 18; d++) {
    extremeSessions.push({
      sessionId: `heavy-${d}`,
      sportCode: 'SPORT_FUNCTIONAL_FITNESS',
      cluster: 'FUNCTIONAL_EXTREME',
      durationMinutes: 90,
      sessionRpe: 9, // 810 AU per day * 7 = 5670 AU
      timestamp: `2026-11-${d}T08:00:00Z`,
    });
  }

  const burnoutResult = globalSystemicFatigueArbiter.arbitrateHybridSchedule(
    extremeSessions,
    undefined,
    { restingHeartRateBaselineBpm: 60, currentRestingHeartRateBpm: 69 }
  );
  assert(!burnoutResult.isApproved, 'Blocks schedule under extreme systemic burnout');
  assert(burnoutResult.otsRiskTier === 'MALADAPTIVE_OVERTRAINING_BURNOUT', 'Flags MALADAPTIVE_OVERTRAINING_BURNOUT tier');
  assert(burnoutResult.rhrElevationBpm === 9, 'Tracks +9 bpm autonomic RHR elevation');
  assert(burnoutResult.scheduleModifications[0].includes('KUNCI TOTAL JADWAL'), 'Issues mandatory 48-72h total rest directive');
  assert(burnoutResult.nutritionalPrescription.proteinTargetGKg === 2.2, 'Increases protein target to 2.2 g/kg under systemic breakdown');

  // C. Proposed Session with Molecular Interference Override
  const proposedEndurance = {
    sessionId: 'prop-1',
    sportCode: 'SPORT_DISTANCE_RUNNING',
    cluster: 'CYCLIC_ENDURANCE',
    durationMinutes: 60,
    sessionRpe: 8,
    timestamp: '2026-11-19T06:00:00Z',
  };

  const priorHeavyStrength = [
    {
      sessionId: 'prior-squat',
      sportCode: 'SPORT_POWERLIFTING',
      cluster: 'STRENGTH_POWER',
      durationMinutes: 75,
      sessionRpe: 9,
      timestamp: '2026-11-18T20:00:00Z',
    },
  ];

  const interferedResult = globalSystemicFatigueArbiter.arbitrateHybridSchedule(
    priorHeavyStrength,
    proposedEndurance
  );
  assert(!interferedResult.isApproved, 'Rejects proposed high-intensity run scheduled immediately after heavy squat session');
  assert(interferedResult.scheduleModifications[0].includes('RESOLUSI INTERFERENSI'), 'Issues AMPK-mTOR interference spacing modification');

  // --- SECTION 5: SportCoordinatorRouter Multi-Sport Arbitration Dispatch ---
  console.log('\n--- 5. SportCoordinatorRouter Multi-Sport Arbitration Dispatch ---');

  const routerArbitration = await sportCoordinatorRouter.arbitrateAndDispatch(
    {
      sessionId: 'router-arb-1',
      sportCode: 'SPORT_DISTANCE_RUNNING',
      durationMinutes: 60,
      sessionRpe: 8,
    },
    priorHeavyStrength,
    { activeInjuryLocations: ['Right Ankle ATFL Sprain'] }
  );

  assert(Boolean(routerArbitration.localPrescription), 'Returns local distance running prescription');
  assert(Boolean(routerArbitration.arbitration), 'Returns global arbitration report');
  assert(
    !routerArbitration.localPrescription.safety_circuit_breakers.is_progressive_overload_allowed,
    'Interlocks local prescription: progressive overload disallowed due to cross-sport arbitration'
  );
  assert(
    routerArbitration.localPrescription.safety_circuit_breakers.halt_directives.length > 0,
    'Local halt directives include systemic arbiter modifications'
  );

  console.log('\n======================================================================');
  console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runGlobalFatigueArbiterTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
