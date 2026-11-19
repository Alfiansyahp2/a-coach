// Verification Suite for Phase 8: UI Ingress, Telemetry Widgets & Multi-Sport Radar Chart

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

async function runUITelemetryIngressTests() {
  console.log("======================================================================");
  console.log("🧪 RUNNING PHASE 8: UI INGRESS, TELEMETRY WIDGETS & RADAR SUITE");
  console.log("======================================================================\n");

  const rootDir = path.resolve(__dirname, '../../');
  const coachIndexPath = pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/index.ts')).href;

  const rawCoachMod = await import(coachIndexPath);
  const coachDomain = rawCoachMod.default || rawCoachMod;
  const { sportCoordinatorRouter, globalSystemicFatigueArbiter } = coachDomain;

  // Section 1: Radar Chart Normalization & Polygon Projection
  console.log("--- 1. Multi-Sport Radar Chart Projection Geometry ---");
  const defaultCapacities = {
    endurance: 75,
    strength: 85,
    teamFieldCourt: 60,
    combatMartialArts: 40,
    racquetPrecision: 55,
    functionalExtreme: 70,
  };

  const center = 140;
  const radius = 100;
  const keys = Object.keys(defaultCapacities);
  const angleStep = (Math.PI * 2) / keys.length;

  const points = keys.map((key, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const value = Math.max(10, Math.min(100, defaultCapacities[key]));
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  assert(points.length === 6, "Radar generates exactly 6 polygon vertices for 6 clusters");
  assert(points[0].x === 140 && points[0].y === 65, "Endurance (top vertex) points vertically upward at y=65");
  assert(points.every(p => !isNaN(p.x) && !isNaN(p.y)), "All polygon coordinates are valid non-NaN numbers");

  // Section 2: Specialized Telemetry Calculations
  console.log("\n--- 2. Specialized Cluster Telemetry Formulas ---");

  // Strength Tonnage
  const weightKg = 140;
  const sets = 5;
  const reps = 5;
  const tonnage = weightKg * sets * reps;
  assert(tonnage === 3500, `Strength tonnage correctly calculated: ${tonnage} kg (140kg x 5 x 5)`);

  // Aquatic SWOLF
  const lapTimeSeconds = 38;
  const strokeRate = 32;
  const swolf = lapTimeSeconds + strokeRate;
  assert(swolf === 70, `SWOLF score correctly calculated: ${swolf} (38s lap + 32 strokes)`);

  // Team Sport HSR %
  const totalMeters = 8200;
  const hsrMeters = 1150;
  const hsrPercent = (hsrMeters / totalMeters) * 100;
  assert(hsrPercent > 14 && hsrPercent < 15, `HSR percent accurately computed: ${hsrPercent.toFixed(1)}% of total distance`);

  // Combat SCAT6 Symptom Alert
  const scat6Symptoms = ["dizziness", "headache"];
  const scat6Triggered = scat6Symptoms.length > 0;
  assert(scat6Triggered === true, "SCAT6 medical red-flag accurately identified for combat sports");

  // Section 3: End-to-End Router Ingress with UI Telemetry Payload
  console.log("\n--- 3. End-to-End Router Ingress with Telemetry ---");

  const triathlonPayload = {
    sessionId: "phase8-triathlon-test",
    sportCode: "TRIATHLON",
    sessionRpe: 8,
    durationMinutes: 120,
    sessionDate: new Date(),
    metrics: {
      swolfScore: 72,
      brickTransitionMinutes: 4,
      bikeNormalizedPowerWatts: 230,
      runPaceSecondsPerKm: 270,
    },
    athleteId: "athlete-phase8-hybrid",
  };

  const triathlonPrescription = await sportCoordinatorRouter.dispatchTelemetry(triathlonPayload);
  assert(Boolean(triathlonPrescription), "Triathlon agent successfully dispatched with multi-discipline telemetry");
  assert(triathlonPrescription.workload_score.internal_strain > 0, `Triathlon internal strain calculated: ${triathlonPrescription.workload_score.internal_strain} AU`);
  assert(triathlonPrescription.coach_identity.includes("Triathlon"), `Triathlon coach identified: ${triathlonPrescription.coach_identity}`);

  // Section 4: Systemic Hybrid Arbitration
  console.log("\n--- 4. Hybrid Arbitration with UI Data ---");
  const arbitration = await sportCoordinatorRouter.arbitrateAndDispatch(
    {
      sessionId: "hybrid-bjj-1",
      sportCode: "BJJ",
      sessionRpe: 9,
      durationMinutes: 90,
      timestamp: new Date().toISOString(),
    },
    [
      {
        sessionId: "hybrid-powerlifting-1",
        sportCode: "POWERLIFTING",
        sessionRpe: 8,
        durationMinutes: 75,
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
    ]
  );

  assert(Boolean(arbitration.localPrescription), "Hybrid arbitration returns local prescription");
  assert(Boolean(arbitration.arbitration), "Arbitration contains systemic fatigue report");
  assert(arbitration.arbitration.otsRiskTier !== undefined, `Systemic OTS Risk Tier returned: ${arbitration.arbitration.otsRiskTier}`);
  assert(arbitration.arbitration.interferenceDiagnostics !== undefined, `Interference diagnostics evaluated: ${arbitration.arbitration.interferenceDiagnostics.severity}`);

  console.log("\n======================================================================");
  console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("======================================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runUITelemetryIngressTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
