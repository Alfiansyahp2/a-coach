// Verification Suite for 33 System Sports Registry & Selector Alignment
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

async function runSystemSportsRegistryTests() {
  console.log("======================================================================");
  console.log("🧪 RUNNING 33 SYSTEM SPORTS REGISTRY VERIFICATION SUITE");
  console.log("======================================================================\n");

  const rootDir = path.resolve(__dirname, '../../');
  const regPath = pathToFileURL(path.join(rootDir, 'src/lib/domain/sports/systemSportsRegistry.ts')).href;
  const routerPath = pathToFileURL(path.join(rootDir, 'src/lib/domain/coach/index.ts')).href;

  const rawReg = await import(regPath);
  const rawRouter = await import(routerPath);

  const regDomain = rawReg.default || rawReg;
  const routerDomain = rawRouter.default || rawRouter;

  const { SYSTEM_SPORTS, SYSTEM_SPORT_CLUSTERS, findSystemSport } = regDomain;
  const { sportCoordinatorRouter } = routerDomain;

  // --- 1. Alignment with Registered Coach Agents ---
  console.log("--- 1. Alignment with 33 Registered Coach Agents in Router ---");
  const registeredAgents = sportCoordinatorRouter.listAgents();
  assert(registeredAgents.length === 33, `Router contains exactly 33 agents (Found: ${registeredAgents.length})`);
  assert(SYSTEM_SPORTS.length === 33, `System sports registry contains exactly 33 sports (Found: ${SYSTEM_SPORTS.length})`);

  // Verify each router agent is in SYSTEM_SPORTS
  registeredAgents.forEach((agent) => {
    const found = SYSTEM_SPORTS.find((s) => s.code === agent.sportCode);
    assert(Boolean(found), `Cabor ${agent.sportCode} (${agent.sportNameId}) mapped to UI selector`);
  });

  // --- 2. Cluster Distribution ---
  console.log("\n--- 2. Cluster Quota Verification ---");
  const clusterCounts = SYSTEM_SPORTS.reduce((acc, s) => {
    acc[s.cluster] = (acc[s.cluster] || 0) + 1;
    return acc;
  }, {});

  assert(clusterCounts['CYCLIC_ENDURANCE'] === 6, `Endurance cluster has 6 sports (Actual: ${clusterCounts['CYCLIC_ENDURANCE']})`);
  assert(clusterCounts['STRENGTH_POWER'] === 5, `Strength cluster has 5 sports (Actual: ${clusterCounts['STRENGTH_POWER']})`);
  assert(clusterCounts['COMBAT_MARTIAL_ARTS'] === 6, `Combat cluster has 6 sports (Actual: ${clusterCounts['COMBAT_MARTIAL_ARTS']})`);
  assert(clusterCounts['TEAM_FIELD_COURT'] === 6, `Team cluster has 6 sports (Actual: ${clusterCounts['TEAM_FIELD_COURT']})`);
  assert(clusterCounts['RACQUET_PRECISION'] === 5, `Racquet cluster has 5 sports (Actual: ${clusterCounts['RACQUET_PRECISION']})`);
  assert(clusterCounts['FUNCTIONAL_EXTREME'] === 5, `Extreme cluster has 5 sports (Actual: ${clusterCounts['FUNCTIONAL_EXTREME']})`);

  // --- 3. Lookup & Alias Robustness ---
  console.log("\n--- 3. Lookup & Alias Matching ---");
  const bjj = findSystemSport("bjj");
  assert(Boolean(bjj && bjj.code === "SPORT_BJJ"), "Finds BJJ via alias 'bjj'");

  const running = findSystemSport("Lari");
  assert(Boolean(running && running.code === "SPORT_DISTANCE_RUNNING"), "Finds Distance Running via shortLabel 'Lari'");

  const boxing = findSystemSport("Tinju (Boxing)");
  assert(Boolean(boxing && boxing.code === "SPORT_BOXING"), "Finds Boxing via full name");

  console.log("\n======================================================================");
  console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("======================================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSystemSportsRegistryTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
