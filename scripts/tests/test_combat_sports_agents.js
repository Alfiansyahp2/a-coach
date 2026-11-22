// Verification Suite for Phase 5 Decoupled Combat & Martial Arts Agents
// Grounded in SCAT6 Concussion Consensus, ACSM Fluid & Weight Management, and ISSN Nutrition

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

async function runCombatAgentsTests() {
  console.log('======================================================================');
  console.log('🧪 RUNNING PHASE 5 DECOUPLED COMBAT & MARTIAL ARTS AGENTS SUITE');
  console.log('======================================================================\n');

  const rootDir = path.resolve(__dirname, '../../');
  const kernelPath = pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/kernels/combatSportsKernel.ts')).href;
  const agentsPath = pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/sports/index.ts')).href;

  const rawKernel = await import(kernelPath);
  const combatKernel = rawKernel.default || rawKernel;
  const rawAgentsMod = await import(agentsPath);
  const rawAgents = rawAgentsMod.default || rawAgentsMod;

  const {
    BoxingCoachAgent,
    MmaCoachAgent,
    BjjCoachAgent,
    PencakSilatCoachAgent,
    JudoCoachAgent,
    MuayThaiCoachAgent,
    sportCoordinatorRouter,
  } = rawAgents;

  // --- SECTION 1: Shared Combat Sports Kernel ---
  console.log('--- 1. Shared Combat Sports Kernel (SCAT6, Round Density, Weight Cut) ---');

  // A. SCAT6 Concussion Gate
  const clearConcussion = combatKernel.evaluateScat6ConcussionGate(false, 0, 0, false);
  assert(!clearConcussion.isLocked, 'SCAT6 clears asymptomatic athlete with zero head trauma');
  assert(clearConcussion.grtpStage === 6, 'GRTP stage is 6 for uninjured athlete');

  const lockedConcussion = combatKernel.evaluateScat6ConcussionGate(true, 3, 2, false);
  assert(lockedConcussion.isLocked, 'SCAT6 strictly locks athlete with symptomatic head trauma');
  assert(lockedConcussion.remainingLockoutDays === 12, 'Accurately computes 12 remaining stand-down days from 14-day rule');
  assert(lockedConcussion.grtpStage === 1, 'Assigns Stage 1 for early symptomatic recovery');
  assert(lockedConcussion.requiresMedicalClearance === true, 'Mandates formal clinical medical clearance');

  const completedConcussion = combatKernel.evaluateScat6ConcussionGate(true, 0, 14, false);
  assert(!completedConcussion.isLocked, 'Releases lock after 14 elapsed days without active symptoms');
  assert(completedConcussion.grtpStage === 5, 'Progresses to Stage 5 (Controlled contact practice)');

  // B. Combat Round Density
  const roundDensity = combatKernel.calculateCombatRoundDensity(3, 180, 60, 8);
  assert(roundDensity.totalWorkSeconds === 540, 'Work seconds computed accurately (3 x 180s = 540s)');
  assert(roundDensity.workRestRatio === 3, 'Work-rest ratio is 3.0 for standard boxing');
  assert(roundDensity.glycolyticLactateTier === 'HIGH_LACTATE_ACCUMULATION', 'High RPE triggers high lactate accumulation tier');

  // C. Weight Cut Safety
  const safeWeightCut = combatKernel.evaluateWeightCutSafety(65, 64, 7);
  assert(safeWeightCut.weightCutTier === 'SAFE_GRADUAL', 'Identifies gradual weight cut (1.5% deficit)');
  assert(!safeWeightCut.isEmergencyAlert, 'No emergency alert for safe weight cut');

  const dangerousWeightCut = combatKernel.evaluateWeightCutSafety(70, 65, 2);
  assert(dangerousWeightCut.weightCutTier === 'CRITICAL_HAZARD', 'Flags severe rapid dehydration (>7% in 2 days)');
  assert(dangerousWeightCut.isEmergencyAlert, 'Emergency alert triggered to prevent renal and intracranial fluid collapse');

  // D. Grappling Joint & Neck Safety
  const grapplingRisk = combatKernel.evaluateGrapplingJointAndCervicalRisk(5, true, 4);
  assert(!grapplingRisk.isSafeForHardSparring, 'Flags unsafe for sparring due to neck pain and hyperextension');
  assert(grapplingRisk.hasCervicalAlert, 'Cervical spine alert triggered for neck pain >= 4/10');
  assert(grapplingRisk.hasJointLockAlert, 'Joint lock alert triggered for joint hyperextension');

  // --- SECTION 2: Boxing Coach Agent ---
  console.log('\n--- 2. Boxing Coach Agent (Rounds, Punches & Boxer Fracture) ---');
  const boxingAgent = new BoxingCoachAgent();
  assert(boxingAgent.canHandle('SPORT_BOXING'), 'canHandle matches SPORT_BOXING');
  assert(boxingAgent.canHandle('tinju'), 'canHandle matches Indonesian alias tinju');

  const boxingPayload = {
    sessionId: 'box-001',
    athleteId: 'ath-001',
    sportCode: 'SPORT_BOXING',
    timestamp: new Date().toISOString(),
    durationMinutes: 45,
    sessionRpe: 7,
    sportSpecificMetrics: {
      roundsCount: 8,
      roundMinutes: 3,
      restMinutes: 1,
      punchCount: 650,
      sparringRounds: 4,
    },
  };
  const boxingWorkload = boxingAgent.computeWorkload(boxingPayload);
  assert(boxingWorkload.externalLoad === 8, 'Tracks 8 rounds');
  assert(boxingWorkload.externalUnit === 'Rounds', 'Unit is Rounds');
  assert(boxingWorkload.internalStrain === 315, 'Internal strain is 315 AU');

  const boxingPrescription = await boxingAgent.generatePrescription(boxingPayload);
  assert(boxingPrescription.safety_circuit_breakers.is_progressive_overload_allowed, 'Allows progression on uninjured boxing session');

  const injuredBoxingPayload = {
    ...boxingPayload,
    sportSpecificMetrics: {
      ...boxingPayload.sportSpecificMetrics,
      handWristPainScoreScale10: 6,
    },
  };
  const injuredBoxingSafety = boxingAgent.evaluateSafety(injuredBoxingPayload);
  assert(!injuredBoxingSafety.isSafe, 'Metacarpal fracture circuit breaker halts progression on hand pain 6/10');

  // --- SECTION 3: MMA Coach Agent ---
  console.log('\n--- 3. Mixed Martial Arts (MMA) Coach Agent (Striking vs Grappling) ---');
  const mmaAgent = new MmaCoachAgent();
  assert(mmaAgent.canHandle('SPORT_MMA'), 'canHandle matches SPORT_MMA');
  assert(mmaAgent.canHandle('UFC'), 'canHandle matches UFC alias');

  const mmaPayload = {
    sessionId: 'mma-001',
    athleteId: 'ath-002',
    sportCode: 'SPORT_MMA',
    timestamp: new Date().toISOString(),
    durationMinutes: 60,
    sessionRpe: 8,
    sportSpecificMetrics: {
      roundsCount: 5,
      roundMinutes: 5,
      restMinutes: 1,
      strikingTimeSeconds: 900,
      grapplingTimeSeconds: 600,
      takedownAttempts: 8,
      sparringRounds: 3,
    },
  };
  const mmaWorkload = mmaAgent.computeWorkload(mmaPayload);
  assert(mmaWorkload.externalLoad === 5, 'Tracks 5 rounds');
  assert(mmaWorkload.internalStrain === 480, 'Internal strain is 480 AU');

  const injuredMmaPayload = {
    ...mmaPayload,
    sportSpecificMetrics: {
      ...mmaPayload.sportSpecificMetrics,
      shoulderAcJointPainScoreScale10: 5,
    },
  };
  const injuredMmaSafety = mmaAgent.evaluateSafety(injuredMmaPayload);
  assert(!injuredMmaSafety.isSafe, 'AC joint breaker halts takedowns on shoulder pain 5/10');

  // --- SECTION 4: Brazilian Jiu-Jitsu (BJJ) Coach Agent ---
  console.log('\n--- 4. BJJ & Grappling Coach Agent (Mat Time, Neck & Knee Collateral) ---');
  const bjjAgent = new BjjCoachAgent();
  assert(bjjAgent.canHandle('SPORT_BJJ'), 'canHandle matches SPORT_BJJ');
  assert(bjjAgent.canHandle('NO_GI'), 'canHandle matches NO_GI alias');

  const bjjPayload = {
    sessionId: 'bjj-001',
    athleteId: 'ath-003',
    sportCode: 'SPORT_BJJ',
    timestamp: new Date().toISOString(),
    durationMinutes: 75,
    sessionRpe: 7,
    sportSpecificMetrics: {
      matTimeMinutes: 75,
      sparringRounds: 5,
      drillingMinutes: 35,
      submissionsAttempted: 4,
      gripStrainScoreScale10: 6,
    },
  };
  const bjjWorkload = bjjAgent.computeWorkload(bjjPayload);
  assert(bjjWorkload.externalLoad === 75, 'Tracks 75 minutes mat time');
  assert(bjjWorkload.externalUnit === 'Minutes', 'Unit is Minutes');

  const cervicalBjjPayload = {
    ...bjjPayload,
    sportSpecificMetrics: {
      ...bjjPayload.sportSpecificMetrics,
      neckPainScoreScale10: 5,
    },
  };
  const cervicalBjjSafety = bjjAgent.evaluateSafety(cervicalBjjPayload);
  assert(!cervicalBjjSafety.isSafe, 'Cervical spine breaker locks inverted guard on neck pain 5/10');

  const kneeBjjPayload = {
    ...bjjPayload,
    sportSpecificMetrics: {
      ...bjjPayload.sportSpecificMetrics,
      kneeCollateralPainScale10: 4,
    },
  };
  const kneeBjjSafety = bjjAgent.evaluateSafety(kneeBjjPayload);
  assert(!kneeBjjSafety.isSafe, 'Collateral ligament breaker locks rotational heel hooks on knee pain 4/10');

  // --- SECTION 5: Pencak Silat Coach Agent ---
  console.log('\n--- 5. Pencak Silat Coach Agent (Meniscus Shear & Tibial Contusion) ---');
  const silatAgent = new PencakSilatCoachAgent();
  assert(silatAgent.canHandle('SPORT_PENCAK_SILAT'), 'canHandle matches SPORT_PENCAK_SILAT');
  assert(silatAgent.canHandle('silat_tanding'), 'canHandle matches silat_tanding alias');

  const silatPayload = {
    sessionId: 'silat-001',
    athleteId: 'ath-004',
    sportCode: 'SPORT_PENCAK_SILAT',
    timestamp: new Date().toISOString(),
    durationMinutes: 40,
    sessionRpe: 7,
    sportSpecificMetrics: {
      kategori: 'TANDING',
      babakCount: 3,
      sapuanBantinganCount: 6,
      tendanganLurusSabitCount: 42,
    },
  };
  const silatWorkload = silatAgent.computeWorkload(silatPayload);
  assert(silatWorkload.externalLoad === 3, 'Tracks 3 babak');
  assert(silatWorkload.externalUnit === 'Babak', 'Unit is Babak');

  const injuredSilatPayload = {
    ...silatPayload,
    sportSpecificMetrics: {
      ...silatPayload.sportSpecificMetrics,
      meniscusRotationalStrainScale10: 5,
    },
  };
  const injuredSilatSafety = silatAgent.evaluateSafety(injuredSilatPayload);
  assert(!injuredSilatSafety.isSafe, 'Meniscus shear breaker halts guntingan/sapuan on pain 5/10');

  // --- SECTION 6: Judo Coach Agent ---
  console.log('\n--- 6. Judo & Sambo Coach Agent (Uchikomi, Throws & Shoulder Safety) ---');
  const judoAgent = new JudoCoachAgent();
  assert(judoAgent.canHandle('SPORT_JUDO'), 'canHandle matches SPORT_JUDO');
  assert(judoAgent.canHandle('SAMBO'), 'canHandle matches SAMBO alias');

  const judoPayload = {
    sessionId: 'judo-001',
    athleteId: 'ath-005',
    sportCode: 'SPORT_JUDO',
    timestamp: new Date().toISOString(),
    durationMinutes: 60,
    sessionRpe: 7,
    sportSpecificMetrics: {
      uchikomiCount: 150,
      nageWazaThrowsCount: 30,
      randoriMinutes: 20,
    },
  };
  const judoWorkload = judoAgent.computeWorkload(judoPayload);
  assert(judoWorkload.externalLoad === 30, 'Tracks 30 projection throws');
  assert(judoWorkload.externalUnit === 'Throws', 'Unit is Throws');

  const injuredJudoPayload = {
    ...judoPayload,
    sportSpecificMetrics: {
      ...judoPayload.sportSpecificMetrics,
      shoulderSubluxationPainScale10: 5,
    },
  };
  const injuredJudoSafety = judoAgent.evaluateSafety(injuredJudoPayload);
  assert(!injuredJudoSafety.isSafe, 'Shoulder subluxation breaker halts Seoi Nage throws on pain 5/10');

  // --- SECTION 7: Muay Thai Coach Agent ---
  console.log('\n--- 7. Muay Thai & Kickboxing Coach Agent (Shin Contusion & Plum Clinch) ---');
  const muayThaiAgent = new MuayThaiCoachAgent();
  assert(muayThaiAgent.canHandle('SPORT_MUAY_THAI'), 'canHandle matches SPORT_MUAY_THAI');
  assert(muayThaiAgent.canHandle('KICKBOXING'), 'canHandle matches KICKBOXING alias');

  const muayThaiPayload = {
    sessionId: 'mt-001',
    athleteId: 'ath-006',
    sportCode: 'SPORT_MUAY_THAI',
    timestamp: new Date().toISOString(),
    durationMinutes: 50,
    sessionRpe: 7,
    sportSpecificMetrics: {
      roundsCount: 5,
      teepAndRoundhouseKicksCount: 180,
      clinchDurationMinutes: 12,
    },
  };
  const muayThaiWorkload = muayThaiAgent.computeWorkload(muayThaiPayload);
  assert(muayThaiWorkload.externalLoad === 5, 'Tracks 5 rounds');
  assert(muayThaiWorkload.externalUnit === 'Rounds', 'Unit is Rounds');

  const injuredMuayThaiPayload = {
    ...muayThaiPayload,
    sportSpecificMetrics: {
      ...muayThaiPayload.sportSpecificMetrics,
      shinBruisePainScoreScale10: 6,
    },
  };
  const injuredMuayThaiSafety = muayThaiAgent.evaluateSafety(injuredMuayThaiPayload);
  assert(!injuredMuayThaiSafety.isSafe, 'Tibial contusion breaker halts heavy bag kicks on pain 6/10');

  // --- SECTION 8: SportCoordinatorRouter End-to-End Dynamic Dispatch ---
  console.log('\n--- 8. SportCoordinatorRouter End-to-End Dynamic Dispatch (All 6 Combat Sports) ---');
  assert(sportCoordinatorRouter.hasAgent('SPORT_BOXING'), 'Router has BoxingCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_MMA'), 'Router has MmaCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_BJJ'), 'Router has BjjCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_PENCAK_SILAT'), 'Router has PencakSilatCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_JUDO'), 'Router has JudoCoachAgent');
  assert(sportCoordinatorRouter.hasAgent('SPORT_MUAY_THAI'), 'Router has MuayThaiCoachAgent');

  const dispatchBoxing = await sportCoordinatorRouter.dispatchTelemetry(boxingPayload);
  assert(dispatchBoxing.coach_identity.includes('Boxing'), 'Dispatches to BoxingCoachAgent');

  const dispatchBjj = await sportCoordinatorRouter.dispatchTelemetry(bjjPayload);
  assert(dispatchBjj.coach_identity.includes('BJJ'), 'Dispatches to BjjCoachAgent');

  const dispatchSilat = await sportCoordinatorRouter.dispatchTelemetry(silatPayload);
  assert(dispatchSilat.coach_identity.includes('Silat'), 'Dispatches to PencakSilatCoachAgent');

  console.log('\n======================================================================');
  console.log(`🏁 PHASE 5 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runCombatAgentsTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
