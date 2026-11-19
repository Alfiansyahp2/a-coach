// Verification Suite for Phase 6 Decoupled Sports Agents
// Covers: Aquatic, Racquet, Precision & Functional Extreme Sports (13 Sports)
// Grounded in SWOLF Swimming Efficiency, World Archery Tonnage, ACSM Rhabdomyolysis Prevention,
// Schweizer Finger Pulley Biomechanics, and FIG Gymnastics Spine Safety

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

async function runPhase6AgentsTests() {
  console.log('======================================================================');
  console.log('🧪 RUNNING PHASE 6 RACQUET, AQUATIC & FUNCTIONAL SPORTS AGENTS SUITE');
  console.log('======================================================================\n');

  const rootDir = path.resolve(__dirname, '../../');
  const kernelPath = pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/kernels/racketAndPrecisionKernel.ts')).href;
  const agentsPath = pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/agents/index.ts')).href;

  const rawKernel = await import(kernelPath);
  const kernel = rawKernel.default || rawKernel;
  const rawAgentsMod = await import(agentsPath);
  const rawAgents = rawAgentsMod.default || rawAgentsMod;

  const {
    SwimmingCoachAgent,
    RowingCoachAgent,
    TriathlonCoachAgent,
    BadmintonCoachAgent,
    TennisCoachAgent,
    TableTennisCoachAgent,
    ArcheryCoachAgent,
    ShootingCoachAgent,
    FunctionalFitnessCoachAgent,
    SportClimbingCoachAgent,
    GymnasticsCoachAgent,
    SurfingCoachAgent,
    SkateboardingCoachAgent,
    sportCoordinatorRouter,
  } = rawAgents;

  // --- SECTION 1: Shared Kernel Verification ---
  console.log('--- 1. Shared Racquet, Precision & Extreme Kernel Verification ---');

  // A. SWOLF Swimming Efficiency
  const eliteSwolf = kernel.calculateSwolfScore(20, 14, 25);
  assert(eliteSwolf.swolfScore === 34, 'SWOLF score calculation (20s + 14 strokes = 34)');
  assert(eliteSwolf.efficiencyTier === 'ELITE_EFFICIENCY', 'SWOLF <= 35 rated ELITE_EFFICIENCY');

  const poorSwolf = kernel.calculateSwolfScore(45, 25, 25);
  assert(poorSwolf.swolfScore === 70, 'SWOLF score calculation (45s + 25 strokes = 70)');
  assert(poorSwolf.efficiencyTier === 'POOR_STROKE_MECHANICS', 'High SWOLF rated POOR_STROKE_MECHANICS');

  // B. Archery Volume Tonnage
  const archeryTonnage = kernel.calculateArcheryVolumeTonnage(100, 40);
  assert(archeryTonnage.arrowCount === 100, 'Arrow count tracked accurately');
  assert(archeryTonnage.drawWeightLbs === 40, 'Draw weight tracked accurately');
  assert(archeryTonnage.volumeTonnageKg === 1814.4, 'Volume tonnage accurately calculated (100 * 40 * 0.453592)');

  // C. Rhabdomyolysis Risk Evaluation
  const safeRhabdo = kernel.evaluateRhabdomyolysisRisk(30, 7, false, false);
  assert(!safeRhabdo.isEmergencyAlert && safeRhabdo.riskTier === 'LOW', 'Low risk for standard session');

  const moderateRhabdo = kernel.evaluateRhabdomyolysisRisk(45, 9, true, false);
  assert(moderateRhabdo.riskTier === 'MODERATE', 'Moderate risk flagged for high-volume eccentric AMRAP at RPE 9');

  const criticalRhabdo = kernel.evaluateRhabdomyolysisRisk(60, 10, true, true);
  assert(criticalRhabdo.isEmergencyAlert && criticalRhabdo.riskTier === 'CRITICAL_HAZARD', 'Emergency medical alert for dark urine/swelling');
  assert(criticalRhabdo.directive.includes('ALARM DARURAT MEDIS'), 'Emergency alert directive contains immediate hospital emergency instruction');

  // D. Climbing Finger Pulley Evaluation
  const healthyPulley = kernel.evaluateClimbingFingerPulleyRisk(0, false, false);
  assert(healthyPulley.isSafeForHardCrimp && !healthyPulley.isPulleyStrainDetected, 'Finger pulley healthy under normal loading');

  const strainedPulley = kernel.evaluateClimbingFingerPulleyRisk(4, false, true);
  assert(!strainedPulley.isSafeForHardCrimp && strainedPulley.isPulleyStrainDetected, 'Prohibits hard crimp when pain >= 3');

  const rupturedPulley = kernel.evaluateClimbingFingerPulleyRisk(7, true, true);
  assert(!rupturedPulley.isSafeForHardCrimp, 'Audible pop triggers immediate rupture warning');
  assert(rupturedPulley.directive.includes('PULLEY RUPTURE WARNING'), 'Rupture directive instructs ultrasound/MRI check');

  // --- SECTION 2: Aquatic & Racquet Agents ---
  console.log('\n--- 2. Aquatic & Racquet Sport Coach Agents ---');

  // A. Swimming Coach Agent
  const swimAgent = new SwimmingCoachAgent();
  assert(swimAgent.canHandle('SPORT_SWIMMING') && swimAgent.canHandle('RENANG'), 'Swimming agent handles SWIMMING and RENANG aliases');
  const swimLoad = swimAgent.computeWorkload({
    sessionId: 'swim-1',
    sportCode: 'SPORT_SWIMMING',
    durationMinutes: 60,
    sessionRpe: 7,
    sportSpecificMetrics: { distanceMeters: 2500, averageLapTimeSeconds: 28 },
  });
  assert(swimLoad.externalLoad === 2.5 && swimLoad.externalUnit === 'Kilometers', 'Swimming load in kilometers (2.5 km)');

  const swimHalt = swimAgent.evaluateSafety({
    sessionId: 'swim-2',
    sportCode: 'SPORT_SWIMMING',
    durationMinutes: 45,
    sessionRpe: 8,
    sportSpecificMetrics: { shoulderImpingementScoreScale10: 6 },
  });
  assert(!swimHalt.isSafe && swimHalt.contraindicatedMovements.length > 0, 'Swimmer shoulder impingement triggers circuit breaker');

  // B. Rowing Coach Agent
  const rowAgent = new RowingCoachAgent();
  assert(rowAgent.canHandle('SPORT_ROWING') && rowAgent.canHandle('DAYUNG'), 'Rowing agent handles DAYUNG alias');
  const rowSafe = rowAgent.evaluateSafety({
    sessionId: 'row-1',
    sportCode: 'SPORT_ROWING',
    durationMinutes: 40,
    sessionRpe: 8,
    sportSpecificMetrics: { ribStressPainScoreScale10: 5 },
  });
  assert(!rowSafe.isSafe && rowSafe.haltDirectives[0].includes('Rib Stress Fracture'), 'Rib stress fracture triggers rowing halt');

  // C. Triathlon Coach Agent
  const triAgent = new TriathlonCoachAgent();
  assert(triAgent.canHandle('SPORT_TRIATHLON') && triAgent.canHandle('BRICK_WORKOUT'), 'Triathlon agent handles BRICK_WORKOUT');
  const triSafe = triAgent.evaluateSafety({
    sessionId: 'tri-1',
    sportCode: 'SPORT_TRIATHLON',
    durationMinutes: 90,
    sessionRpe: 8,
    sportSpecificMetrics: { plantarFasciitisScoreScale10: 6 },
  });
  assert(!triSafe.isSafe && triSafe.contraindicatedMovements.includes('Brick run with high ground impact'), 'Plantar fasciitis halts running phase');

  // D. Badminton Coach Agent
  const badmAgent = new BadmintonCoachAgent();
  assert(badmAgent.canHandle('SPORT_BADMINTON') && badmAgent.canHandle('BULU_TANGKIS'), 'Badminton agent handles BULU_TANGKIS');
  const badmSafe = badmAgent.evaluateSafety({
    sessionId: 'badm-1',
    sportCode: 'SPORT_BADMINTON',
    durationMinutes: 60,
    sessionRpe: 8,
    sportSpecificMetrics: { achillesTendonPainScale10: 5 },
  });
  assert(!badmSafe.isSafe && badmSafe.haltDirectives[0].includes('Achilles'), 'Achilles strain halts jump smashes and lunges');

  // E. Tennis Coach Agent
  const tennisAgent = new TennisCoachAgent();
  assert(tennisAgent.canHandle('SPORT_TENNIS') && tennisAgent.canHandle('TENIS'), 'Tennis agent handles TENIS');
  const tennisSafe = tennisAgent.evaluateSafety({
    sessionId: 'tennis-1',
    sportCode: 'SPORT_TENNIS',
    durationMinutes: 90,
    sessionRpe: 8,
    sportSpecificMetrics: { lateralEpicondylitisPainScale10: 5 },
  });
  assert(!tennisSafe.isSafe && tennisSafe.haltDirectives[0].includes('Tennis Elbow'), 'Lateral epicondylitis halts heavy topspin');

  // F. Table Tennis Coach Agent
  const ttAgent = new TableTennisCoachAgent();
  assert(ttAgent.canHandle('SPORT_TABLE_TENNIS') && ttAgent.canHandle('PINGPONG'), 'Table tennis agent handles PINGPONG');
  const ttSafe = ttAgent.evaluateSafety({
    sessionId: 'tt-1',
    sportCode: 'SPORT_TABLE_TENNIS',
    durationMinutes: 60,
    sessionRpe: 7,
    sportSpecificMetrics: { wristTfccStrainScale10: 6 },
  });
  assert(!ttSafe.isSafe && ttSafe.haltDirectives[0].includes('TFCC'), 'TFCC wrist ulnar strain halts flick and loop');

  // G. Archery Coach Agent
  const archAgent = new ArcheryCoachAgent();
  assert(archAgent.canHandle('SPORT_ARCHERY') && archAgent.canHandle('PANAHAN'), 'Archery agent handles PANAHAN');
  const archLoad = archAgent.computeWorkload({
    sessionId: 'arch-1',
    sportCode: 'SPORT_ARCHERY',
    durationMinutes: 90,
    sessionRpe: 6,
    sportSpecificMetrics: { arrowCount: 120, drawWeightLbs: 42 },
  });
  assert(archLoad.externalLoad === 2286.1 && archLoad.externalUnit === 'Kilograms Tonnage', 'Archery tonnage load computed (2286.1 Kg)');

  // H. Shooting Coach Agent
  const shootAgent = new ShootingCoachAgent();
  assert(shootAgent.canHandle('SPORT_SHOOTING') && shootAgent.canHandle('MENEMBAK'), 'Shooting agent handles MENEMBAK');
  const shootPresc = await shootAgent.generatePrescription({
    sessionId: 'shoot-1',
    sportCode: 'SPORT_SHOOTING',
    durationMinutes: 60,
    sessionRpe: 5,
    sportSpecificMetrics: { shotsCount: 60, posturalTremorIndexScale10: 2 },
  });
  assert(shootPresc.workload_score.external_load === 60, 'Shooting external load matches shot count');
  assert(shootPresc.safety_circuit_breakers.is_progressive_overload_allowed === true, 'Shooting safe session approves progression');

  // --- SECTION 3: Functional & Extreme Agents ---
  console.log('\n--- 3. Functional & Extreme Sport Coach Agents ---');

  // A. Functional Fitness Coach Agent
  const ffAgent = new FunctionalFitnessCoachAgent();
  assert(ffAgent.canHandle('SPORT_FUNCTIONAL_FITNESS') && ffAgent.canHandle('CROSSFIT') && ffAgent.canHandle('HYROX'), 'Functional fitness agent handles CROSSFIT and HYROX');
  const ffRhabdoHalt = ffAgent.evaluateSafety({
    sessionId: 'ff-1',
    sportCode: 'SPORT_FUNCTIONAL_FITNESS',
    durationMinutes: 45,
    sessionRpe: 10,
    sportSpecificMetrics: { isHighVolumeEccentric: true, hasDarkUrineOrExtremeSwelling: true },
  });
  assert(!ffRhabdoHalt.isSafe && ffRhabdoHalt.haltDirectives[0].includes('RHABDOMYOLYSIS'), 'CrossFit dark urine triggers emergency rhabdo halt');

  // B. Sport Climbing Coach Agent
  const climbAgent = new SportClimbingCoachAgent();
  assert(climbAgent.canHandle('SPORT_CLIMBING') && climbAgent.canHandle('BOULDERING'), 'Climbing agent handles BOULDERING');
  const climbPopHalt = climbAgent.evaluateSafety({
    sessionId: 'climb-1',
    sportCode: 'SPORT_CLIMBING',
    durationMinutes: 90,
    sessionRpe: 8,
    sportSpecificMetrics: { audibleBowstringPopReported: true, fingerPainScale10: 7, gripStyle: 'FULL_CRIMP' },
  });
  assert(!climbPopHalt.isSafe && climbPopHalt.contraindicatedMovements.includes('Closed full-crimp grip'), 'Finger pulley pop strictly locks full crimp');

  // C. Gymnastics Coach Agent
  const gymAgent = new GymnasticsCoachAgent();
  assert(gymAgent.canHandle('SPORT_GYMNASTICS') && gymAgent.canHandle('SENAM_ARTISTIK'), 'Gymnastics agent handles SENAM_ARTISTIK');
  const gymSafe = gymAgent.evaluateSafety({
    sessionId: 'gym-1',
    sportCode: 'SPORT_GYMNASTICS',
    durationMinutes: 120,
    sessionRpe: 8,
    sportSpecificMetrics: { lumbarHyperextensionPainScale10: 5, apparatus: 'VAULT' },
  });
  assert(!gymSafe.isSafe && gymSafe.haltDirectives[0].includes('spondylolysis'), 'Lumbar pain halts gymnastics back handsprings & vault landings');

  // D. Surfing Coach Agent
  const surfAgent = new SurfingCoachAgent();
  assert(surfAgent.canHandle('SPORT_SURFING') && surfAgent.canHandle('SELANCAR'), 'Surfing agent handles SELANCAR');
  const surfLoad = surfAgent.computeWorkload({
    sessionId: 'surf-1',
    sportCode: 'SPORT_SURFING',
    durationMinutes: 120,
    sessionRpe: 7,
    sportSpecificMetrics: { paddleDistanceMeters: 3200, waveCount: 12 },
  });
  assert(surfLoad.externalLoad === 3.2 && surfLoad.externalUnit === 'Kilometers Paddled', 'Surfing load computed in paddled km');

  // E. Skateboarding Coach Agent
  const skateAgent = new SkateboardingCoachAgent();
  assert(skateAgent.canHandle('SPORT_SKATEBOARDING') && skateAgent.canHandle('SKATE'), 'Skateboarding agent handles SKATE');
  const skateConcussionHalt = skateAgent.evaluateSafety({
    sessionId: 'skate-1',
    sportCode: 'SPORT_SKATEBOARDING',
    durationMinutes: 60,
    sessionRpe: 7,
    sportSpecificMetrics: { headImpactReported: true },
  });
  assert(!skateConcussionHalt.isSafe && skateConcussionHalt.haltDirectives[0].includes('KONKUSI SKATEBOARD'), 'Head impact locks skateboard session with concussion protocol');

  // --- SECTION 4: Router Integration & 33 Sports Census ---
  console.log('\n--- 4. SportCoordinatorRouter Multi-Sport Census (33 Sports) ---');
  const allAgents = sportCoordinatorRouter.listAgents();
  assert(allAgents.length === 33, `Router has all 33 registered sports agents (Actual: ${allAgents.length})`);

  // Verify dispatch to each of the 13 Phase 6 sports through router
  const phase6Codes = [
    { code: 'SPORT_SWIMMING', name: 'Swimming' },
    { code: 'SPORT_ROWING', name: 'Rowing' },
    { code: 'SPORT_TRIATHLON', name: 'Triathlon' },
    { code: 'SPORT_BADMINTON', name: 'Badminton' },
    { code: 'SPORT_TENNIS', name: 'Tennis' },
    { code: 'SPORT_TABLE_TENNIS', name: 'Table Tennis' },
    { code: 'SPORT_ARCHERY', name: 'Archery' },
    { code: 'SPORT_SHOOTING', name: 'Shooting' },
    { code: 'SPORT_FUNCTIONAL_FITNESS', name: 'Functional Fitness' },
    { code: 'SPORT_CLIMBING', name: 'Climbing' },
    { code: 'SPORT_GYMNASTICS', name: 'Gymnastics' },
    { code: 'SPORT_SURFING', name: 'Surfing' },
    { code: 'SPORT_SKATEBOARDING', name: 'Skateboarding' },
  ];

  for (const { code, name } of phase6Codes) {
    const presc = await sportCoordinatorRouter.dispatchTelemetry({
      sessionId: `census-${code}`,
      sportCode: code,
      durationMinutes: 45,
      sessionRpe: 6,
    });
    assert(
      Boolean(presc && presc.coach_identity && presc.safety_circuit_breakers),
      `Router successfully dispatches and generates prescription for ${name} (${code})`
    );
  }

  console.log('\n======================================================================');
  console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase6AgentsTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
