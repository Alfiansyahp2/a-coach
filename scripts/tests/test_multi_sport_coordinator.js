const assert = require('assert');
const path = require('path');
const { pathToFileURL } = require('url');
require('dotenv').config({ path: '.env.local' });

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 RUNNING MULTI-SPORT AI COORDINATOR & SHARED KERNELS SUITE');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function testPass(name, detail = '') {
    console.log(`  ✅ PASS: ${name} ${detail ? '(' + detail + ')' : ''}`);
    passed++;
  }

  function testFail(name, err) {
    console.error(`  ❌ FAIL: ${name}: ${err?.message || err}`);
    failed++;
  }

  try {
    // -----------------------------------------------------------------
    // 1. Foster Session-RPE Universal Training Load Kernel
    // -----------------------------------------------------------------
    console.log('--- 1. Carl Foster Session-RPE Universal Load Kernel ---');
    const fosterPath = path.resolve(__dirname, '../../src/lib/domain/coach/kernels/fosterSessionRpeKernel.ts');
    const fosterRaw = await import(pathToFileURL(fosterPath).href);
    const fosterModule = fosterRaw.default || fosterRaw;
    const { calculateSessionRpeLoad, computeWeeklyRpeAnalytics } = fosterModule;

    const singleLoad = calculateSessionRpeLoad(45, 7);
    assert.strictEqual(singleLoad, 315, '45 mins * RPE 7 should equal 315 AU');
    testPass('Single-session load calculated accurately', '45m @ RPE 7 = 315 AU');

    // Test weekly analytics with varying daily sessions
    const sessions = [
      { date: '2026-11-10', durationMinutes: 60, rpeScale10: 6 }, // 360
      { date: '2026-11-11', durationMinutes: 45, rpeScale10: 7 }, // 315
      { date: '2026-11-13', durationMinutes: 90, rpeScale10: 5 }, // 450
      { date: '2026-11-14', durationMinutes: 60, rpeScale10: 8 }, // 480
    ];
    const weeklyAnalytics = computeWeeklyRpeAnalytics(sessions);
    assert(weeklyAnalytics.totalWeeklyLoadAU === 1605, `Total weekly load should be 1605 AU, got ${weeklyAnalytics.totalWeeklyLoadAU}`);
    assert(weeklyAnalytics.dailyMeanLoadAU > 0, 'Daily mean load should be positive');
    assert(weeklyAnalytics.monotony > 0, 'Monotony should be computed');
    assert(weeklyAnalytics.strain > 0, 'Physiological strain should be computed');
    testPass('Weekly training load & monotony computed cleanly', `Total: ${weeklyAnalytics.totalWeeklyLoadAU} AU, Monotony: ${weeklyAnalytics.monotony}`);

    // Critical strain boundary check
    const heavyMonotonousSessions = Array(7).fill({ date: '2026-11-10', durationMinutes: 90, rpeScale10: 9 }); // 810 * 7 = 5670
    const highStrainResult = computeWeeklyRpeAnalytics(heavyMonotonousSessions);
    assert.strictEqual(highStrainResult.riskAssessment, 'CRITICAL_STRAIN', 'Excessive monotonous load should trigger CRITICAL_STRAIN');
    assert(highStrainResult.recommendations.length > 0, 'Recommendations should be provided for critical strain');
    testPass('Critical strain & high monotony boundary alarm triggered', 'Risk: CRITICAL_STRAIN');

    // -----------------------------------------------------------------
    // 2. Tim J. Gabbett Acute:Chronic Workload Ratio (ACWR) Kernel
    // -----------------------------------------------------------------
    console.log('\n--- 2. Tim J. Gabbett ACWR Injury Prevention Kernel ---');
    const gabbettPath = path.resolve(__dirname, '../../src/lib/domain/coach/kernels/gabbettAcwrKernel.ts');
    const gabbettRaw = await import(pathToFileURL(gabbettPath).href);
    const gabbettModule = gabbettRaw.default || gabbettRaw;
    const { calculateGabbettAcwr } = gabbettModule;

    // Sweet Spot scenario (Ratio: 1.0)
    const sweetSpot = calculateGabbettAcwr({ acuteWorkload7Days: 1000, chronicWorkload28DaysTotal: 4000 });
    assert.strictEqual(sweetSpot.acwrRatio, 1.0, 'Ratio should be 1.0');
    assert.strictEqual(sweetSpot.riskZone, 'SWEET_SPOT', 'Ratio 1.0 should be SWEET_SPOT');
    assert.strictEqual(sweetSpot.isSafeForOverload, true, 'Sweet spot should permit progressive overload');
    testPass('Sweet Spot verified (0.8 - 1.3)', `Ratio: ${sweetSpot.acwrRatio}, Zone: ${sweetSpot.riskZone}`);

    // Underload scenario (< 0.8)
    const underload = calculateGabbettAcwr({ acuteWorkload7Days: 500, chronicWorkload28DaysTotal: 4000 });
    assert(underload.acwrRatio < 0.8, 'Ratio should be < 0.8');
    assert.strictEqual(underload.riskZone, 'UNDERLOAD', 'Ratio 0.5 should be UNDERLOAD');
    testPass('Underload conditioning dip detected', `Ratio: ${underload.acwrRatio}, Zone: ${underload.riskZone}`);

    // Danger Zone scenario (>= 1.5)
    const dangerZone = calculateGabbettAcwr({ acuteWorkload7Days: 1800, chronicWorkload28DaysTotal: 4000 });
    assert(dangerZone.acwrRatio >= 1.5, 'Ratio should be >= 1.5');
    assert.strictEqual(dangerZone.riskZone, 'DANGER_ZONE', 'Ratio 1.8 should trigger DANGER_ZONE');
    assert.strictEqual(dangerZone.isSafeForOverload, false, 'Danger zone must lock progressive overload');
    testPass('Danger Zone spike (>1.5) halts progressive overload', `Ratio: ${dangerZone.acwrRatio}, Overload Allowed: ${dangerZone.isSafeForOverload}`);

    // -----------------------------------------------------------------
    // 3. Vladimir Issurin & Tudor Bompa Block Periodization Kernel
    // -----------------------------------------------------------------
    console.log('\n--- 3. Issurin & Bompa Block Periodization Kernel ---');
    const blockPath = path.resolve(__dirname, '../../src/lib/domain/coach/kernels/issurinBlockPeriodizationKernel.ts');
    const blockRaw = await import(pathToFileURL(blockPath).href);
    const blockModule = blockRaw.default || blockRaw;
    const { evaluateBlockPeriodization, BLOCK_PHASE_DEFINITIONS } = blockModule;

    assert(BLOCK_PHASE_DEFINITIONS.ACCUMULATION, 'Accumulation phase should be defined');
    assert(BLOCK_PHASE_DEFINITIONS.TRANSMUTATION, 'Transmutation phase should be defined');
    assert(BLOCK_PHASE_DEFINITIONS.REALIZATION, 'Realization phase should be defined');

    // In mid-phase (week 2 of accumulation)
    const midPhase = evaluateBlockPeriodization('ACCUMULATION', 2);
    assert.strictEqual(midPhase.isPhaseTransitionDue, false, 'Week 2 of accumulation should not trigger transition');
    testPass('Accumulation mid-block progression maintained', 'Week 2, Transition Due: false');

    // Phase transition due (week 6 of accumulation)
    const transitionDue = evaluateBlockPeriodization('ACCUMULATION', 6);
    assert.strictEqual(transitionDue.isPhaseTransitionDue, true, 'Week 6 of accumulation should trigger transition');
    assert.strictEqual(transitionDue.recommendedNextPhase, 'TRANSMUTATION', 'Accumulation should transition to Transmutation');
    testPass('Block periodization transition successfully signaled', 'Accumulation -> Transmutation');

    // -----------------------------------------------------------------
    // 4. Decoupled Sport Coordinator Router & Ingress Dispatcher
    // -----------------------------------------------------------------
    console.log('\n--- 4. SportCoordinatorRouter & Agent Registry Engine ---');
    const routerPath = path.resolve(__dirname, '../../src/lib/domain/coach/core/SportCoordinatorRouter.ts');
    const routerRaw = await import(pathToFileURL(routerPath).href);
    const routerModule = routerRaw.default || routerRaw;
    const { sportCoordinatorRouter } = routerModule;

    sportCoordinatorRouter.clearRegistry();
    assert.strictEqual(sportCoordinatorRouter.listAgents().length, 0, 'Registry should be empty after clear');

    // Scenario A: Dispatch to unregistered sport -> Falls back to Universal Grounded Safe Ingress
    const uncalibratedPayload = {
      sessionId: 'sess-test-001',
      athleteId: '00000000-0000-0000-0000-000000000001',
      sportCode: 'SPORT_ARCHERY',
      timestamp: new Date().toISOString(),
      durationMinutes: 45,
      sessionRpe: 4,
      sportSpecificMetrics: { arrowsShot: 60, drawWeightLbs: 38 },
    };
    const fallbackPrescription = await sportCoordinatorRouter.dispatchTelemetry(uncalibratedPayload);
    assert(fallbackPrescription.coach_identity.includes('Universal Grounded Safe Ingress'), 'Should use Universal Grounded Ingress');
    assert.strictEqual(fallbackPrescription.workload_score.internal_strain, 180, '45m @ RPE 4 = 180 AU');
    assert.strictEqual(fallbackPrescription.safety_circuit_breakers.is_progressive_overload_allowed, true, 'Overload allowed when asymptomatic');
    testPass('Fallback Grounded Ingress executes for uncalibrated sports', 'Internal Strain: 180 AU');

    // Scenario B: Fallback with reported joint symptoms -> Circuit Breaker halts overload
    const symptomaticPayload = {
      ...uncalibratedPayload,
      sessionId: 'sess-test-002',
      sessionRpe: 8,
      subjectiveSymptoms: {
        painLocations: ['Right Shoulder (Rotator Cuff)'],
        painScoreScale10: 6,
        jointInstabilityReported: false,
        swellingObserved: true,
      },
    };
    const symptomaticPrescription = await sportCoordinatorRouter.dispatchTelemetry(symptomaticPayload);
    assert.strictEqual(symptomaticPrescription.safety_circuit_breakers.is_progressive_overload_allowed, false, 'Circuit breaker must lock overload');
    assert(symptomaticPrescription.safety_circuit_breakers.halt_directives.length > 0, 'Halt directives must be generated');
    testPass('Universal Safety Circuit Breaker trips on joint pain/swelling', 'Overload Allowed: false');

    // Scenario C: Custom Decoupled Agent Registration & Dispatch
    const mockPowerliftingAgent = {
      metadata: {
        sportCode: 'SPORT_POWERLIFTING',
        sportNameId: 'Powerlifting (Squat, Bench, Deadlift)',
        sportNameEn: 'Powerlifting',
        cluster: 'STRENGTH_POWER',
        primaryEnergySystem: 'PHOSPHAGEN_ATP_PC',
        governingStandard: 'IPF & NSCA Strength Guidelines',
        version: '1.0.0',
      },
      validateTelemetry: (payload) => ({ isValid: true }),
      computeWorkload: (payload) => ({
        externalLoad: 12500, // Tonase kg
        externalUnit: 'kg Tonnage',
        internalStrain: 450,
        internalMethod: 'NEUROMUSCULAR_TONNAGE',
      }),
      evaluateSafety: (payload) => ({
        isSafe: true,
        haltDirectives: [],
        contraindicatedMovements: [],
      }),
      generatePrescription: async (payload) => ({
        sessionId: payload.sessionId,
        generatedAt: new Date().toISOString(),
        coach_identity: 'Powerlifting Specialized SBD AI Coach',
        governing_standard: 'IPF & NSCA Guidelines',
        workload_score: {
          external_load: 12500,
          external_unit: 'kg Tonnage',
          internal_strain: 450,
          internalMethod: 'NEUROMUSCULAR_TONNAGE',
        },
        safety_circuit_breakers: {
          is_progressive_overload_allowed: true,
          halt_directives: [],
          contraindicated_movements: [],
        },
        periodization_directive: {
          mesocycle_phase: 'TRANSMUTATION',
          target_intensity_zone: '80-85% 1RM (RIR 2-3)',
          recommended_rest_hours: 48,
          next_session_prescription: 'Deadlift Heavy Volume: 4 sets x 4 reps @ 82.5% 1RM.',
        },
        nutritional_prescription: {
          carbohydrate_target_g_kg: 4.5,
          protein_target_g_kg: 2.0,
          hydration_electrolyte_protocol: 'Hydrate 3-4L daily + 5g Creatine Monohydrate.',
          supplementation_evidence_tier_a: ['Creatine Monohydrate', 'Whey Isolate', 'Caffeine'],
        },
      }),
    };

    sportCoordinatorRouter.registerAgent(mockPowerliftingAgent);
    assert.strictEqual(sportCoordinatorRouter.hasAgent('SPORT_POWERLIFTING'), true, 'Agent should be registered');
    assert.strictEqual(sportCoordinatorRouter.listAgents().length, 1, 'Registry length should be 1');

    const powerliftingPayload = {
      sessionId: 'sess-pl-001',
      athleteId: '00000000-0000-0000-0000-000000000001',
      sportCode: 'SPORT_POWERLIFTING',
      timestamp: new Date().toISOString(),
      durationMinutes: 75,
      sessionRpe: 8,
      sportSpecificMetrics: { totalTonnageKg: 12500, topSetRir: 2 },
    };
    const plPrescription = await sportCoordinatorRouter.dispatchTelemetry(powerliftingPayload);
    assert.strictEqual(plPrescription.coach_identity, 'Powerlifting Specialized SBD AI Coach');
    assert.strictEqual(plPrescription.workload_score.external_load, 12500);
    assert.strictEqual(plPrescription.workload_score.external_unit, 'kg Tonnage');
    testPass('Decoupled Powerlifting Agent registered & dispatched successfully', 'Identity: Powerlifting Specialized SBD AI Coach');

    // -----------------------------------------------------------------
    // 5. Sport Activity Telemetry Repository (Persistence Layer)
    // -----------------------------------------------------------------
    console.log('\n--- 5. Sport Activity Telemetry Repository ---');
    const repoPath = path.resolve(__dirname, '../../src/lib/db/sportTelemetryRepo.ts');
    const repoRaw = await import(pathToFileURL(repoPath).href);
    const repoModule = repoRaw.default || repoRaw;
    const { saveSportActivityTelemetry, getSportActivityTelemetry } = repoModule;

    const savedRecord = await saveSportActivityTelemetry({
      userId: '00000000-0000-0000-0000-000000000001',
      sportCode: 'SPORT_POWERLIFTING',
      durationMinutes: 75,
      sessionRpe: 8,
      telemetryData: { totalTonnageKg: 12500, topSetRir: 2 },
      agentPrescription: plPrescription,
    });

    assert(savedRecord.id, 'Record should have generated ID');
    assert.strictEqual(savedRecord.sport_code, 'SPORT_POWERLIFTING');
    assert.strictEqual(savedRecord.duration_minutes, 75);
    testPass('Sport telemetry record saved successfully', `ID: ${savedRecord.id}`);

    const fetchedRecords = await getSportActivityTelemetry('00000000-0000-0000-0000-000000000001', {
      sportCode: 'SPORT_POWERLIFTING',
      limit: 10,
    });
    assert(fetchedRecords.length >= 1, 'Should fetch at least 1 record');
    assert.strictEqual(fetchedRecords[0].sport_code, 'SPORT_POWERLIFTING');
    testPass('Sport telemetry retrieved & filtered by sportCode', `Found: ${fetchedRecords.length} records`);

    console.log('\n======================================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Test Exception:', err);
    process.exit(1);
  }
}

runTests();
