// Verification Suite for Dynamic Sport Coach UI Generator
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

async function runDynamicCoachUITests() {
  console.log("======================================================================");
  console.log("🧪 RUNNING DYNAMIC SPORT COACH UI GENERATOR TEST SUITE");
  console.log("======================================================================\n");

  const rootDir = path.resolve(__dirname, '../../');
  const coachIndexPath = pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/index.ts')).href;

  const rawCoachMod = await import(coachIndexPath);
  const coachDomain = rawCoachMod.default || rawCoachMod;
  const { createDynamicSportCoachSchema, CLUSTER_DEFAULTS } = coachDomain;

  // --- 1. Schema Generation for All 6 Physiological Clusters ---
  console.log("--- 1. Schema Generation across Clusters ---");
  const clusters = Object.keys(CLUSTER_DEFAULTS);
  assert(clusters.length === 6, "All 6 physiological clusters have default schema definitions");

  clusters.forEach((cluster) => {
    const schema = createDynamicSportCoachSchema(`TEST_${cluster}`, `Test ${cluster}`, cluster);
    assert(schema.fields.length >= 3, `Cluster ${cluster} generates at least 3 dynamic fields (Actual: ${schema.fields.length})`);
    assert(schema.cluster === cluster, `Schema cluster matches ${cluster}`);
  });

  // --- 2. Dynamic UI Generation for Custom Cabor (e.g. Padel) ---
  console.log("\n--- 2. Instant UI Schema Generation for New Cabor Coach (Padel) ---");
  const padelCoach = createDynamicSportCoachSchema(
    "SPORT_PADEL",
    "Padel Tennis",
    "RACQUET_PRECISION",
    "World Padel Tour / FIP Guidelines"
  );

  assert(padelCoach.sportCode === "SPORT_PADEL", "Correct normalized sport code generated");
  assert(padelCoach.sportName === "Padel Tennis", "Sport name preserved");
  assert(padelCoach.governingStandard === "World Padel Tour / FIP Guidelines", "Custom governing standard bound");
  assert(padelCoach.fields.some(f => f.key === "activeMinutes"), "Includes activeMinutes workload field");
  assert(padelCoach.fields.some(f => f.key === "primaryScore"), "Includes primaryScore technique field");
  assert(padelCoach.fields.some(f => f.key === "upperLimbStrain"), "Includes upperLimbStrain safety field");

  // --- 3. Instant Summary Metric Calculations ---
  console.log("\n--- 3. Instant Summary Metric Calculations ---");
  const strengthCoach = createDynamicSportCoachSchema("SPORT_STRONGMAN", "Strongman", "STRENGTH_POWER");
  const summary = strengthCoach.calculateSummary({ weightKg: 150, setsCount: 4, repsPerSet: 5 });

  assert(summary.length === 1, "Generated instant summary metrics");
  assert(summary[0].value === "3000 kg", `Correct instant tonnage computed: 3000 kg (150kg x 4 x 5)`);
  assert(summary[0].badge === "Kekuatan", "Badge correctly tagged as Kekuatan");

  console.log("\n======================================================================");
  console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("======================================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runDynamicCoachUITests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
