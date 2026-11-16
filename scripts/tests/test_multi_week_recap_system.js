const assert = require('assert');
const {
  shouldDefaultToCompletedWeek,
  discoverAvailableRecapWeeks,
  computeMultiWeekRollup,
} = require('../../src/lib/domain/analytics/multiWeekRecapEngine');
const {
  computeWeeklyActivityAndInjuryRecap,
  getWeekBounds,
} = require('../../src/lib/domain/analytics/weeklyRecapEngine');

console.log('======================================================================');
console.log('🧪 RUNNING MULTI-WEEK RECAP & MONDAY 00:00 AUTOMATION TEST SUITE');
console.log('======================================================================');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Monday 00:00 Automatic Completed-Week Transition Rule
console.log('\n--- 1. Monday 00:00 Automatic Completed-Week Transition ---');

test('Monday at 00:00 automatically defaults to completed week', () => {
  // Monday 2026-11-16 00:00:00
  const mondayMidnight = new Date('2026-11-16T00:00:00');
  assert.strictEqual(shouldDefaultToCompletedWeek(mondayMidnight, 0), true);
  assert.strictEqual(shouldDefaultToCompletedWeek(mondayMidnight, 1), true); // Still true on Monday
});

test('Mid-week with 0 sessions defaults to completed week', () => {
  const wednesday = new Date('2026-11-18T14:00:00');
  assert.strictEqual(shouldDefaultToCompletedWeek(wednesday, 0), true);
});

test('Mid-week with recorded sessions stays on current week', () => {
  const wednesday = new Date('2026-11-18T14:00:00');
  assert.strictEqual(shouldDefaultToCompletedWeek(wednesday, 2), false);
});

// 2. Multi-Week Discovery & Historical Week Bucketing
console.log('\n--- 2. Multi-Week Discovery & Historical Week Bucketing ---');

const mockActivities = [
  // Current Week (Nov 9 - 15)
  { id: '1', start_date: '2026-11-14T10:00:00Z', distance_meters: 62400, moving_time_seconds: 7200, average_heartrate: 135 },
  { id: '2', start_date: '2026-11-11T09:00:00Z', distance_meters: 33000, moving_time_seconds: 3600, average_heartrate: 132 },
  // Last Week (Nov 2 - 8)
  { id: '3', start_date: '2026-11-06T10:00:00Z', distance_meters: 31400, moving_time_seconds: 3600, average_heartrate: 130 },
  { id: '4', start_date: '2026-11-03T10:00:00Z', distance_meters: 26900, moving_time_seconds: 3600, average_heartrate: 128 },
  // 2 Weeks Ago (Oct 26 - Nov 1)
  { id: '5', start_date: '2026-10-29T10:00:00Z', distance_meters: 10000, moving_time_seconds: 2400, average_heartrate: 140 },
  // 3 Weeks Ago (Oct 19 - 25)
  { id: '6', start_date: '2026-10-24T10:00:00Z', distance_meters: 40000, moving_time_seconds: 5400, average_heartrate: 135 },
];

test('discoverAvailableRecapWeeks buckets activities across historical weeks', () => {
  const weeks = discoverAvailableRecapWeeks(mockActivities, new Date('2026-11-15T12:00:00'));
  assert.strictEqual(weeks.length, 12);
  assert.strictEqual(weeks[0].isCurrentWeek, true);
  assert.strictEqual(weeks[0].sessionCount, 2);
  assert.strictEqual(weeks[0].totalDistanceKm, 95.4);
  assert.strictEqual(weeks[1].isCompletedWeek, true);
  assert.strictEqual(weeks[1].sessionCount, 2);
  assert.strictEqual(weeks[1].totalDistanceKm, 58.3);
  assert.strictEqual(weeks[2].sessionCount, 1);
  assert.strictEqual(weeks[3].sessionCount, 1);
});

// 3. 2-Week Block & 4-Week Monthly Mesocycle Rollup
console.log('\n--- 3. 2-Week Block & 4-Week Monthly Mesocycle Rollup ---');

test('computeMultiWeekRollup calculates 2-week block aggregation and trend', () => {
  const rollup2W = computeMultiWeekRollup(mockActivities, new Date('2026-11-15T12:00:00'), '2_WEEKS');
  assert.strictEqual(rollup2W.scope, '2_WEEKS');
  assert.strictEqual(rollup2W.totalSessions, 4);
  assert.strictEqual(rollup2W.weeksBreakdown.length, 2);
  assert.strictEqual(rollup2W.totalDistanceKm, 153.7);
  assert.strictEqual(rollup2W.consistencyScorePct, 100);
  assert(rollup2W.volumeTrendPct > 0, 'Volume trend should be positive');
});

test('computeMultiWeekRollup calculates 4-week monthly mesocycle rollup', () => {
  const rollup4W = computeMultiWeekRollup(mockActivities, new Date('2026-11-15T12:00:00'), '4_WEEKS');
  assert.strictEqual(rollup4W.scope, '4_WEEKS');
  assert.strictEqual(rollup4W.totalSessions, 6);
  assert.strictEqual(rollup4W.weeksBreakdown.length, 4);
  assert.strictEqual(rollup4W.consistencyScorePct, 100);
  assert(rollup4W.averageWeeklyDistanceKm > 0, 'Average weekly distance should be calculated');
  assert(typeof rollup4W.coachSynthesis === 'string', 'Coach synthesis must be generated');
});

// 4. End-to-End computeWeeklyActivityAndInjuryRecap Orchestrator
console.log('\n--- 4. End-to-End computeWeeklyActivityAndInjuryRecap Orchestrator ---');

test('Recap orchestrator returns available historical weeks and rollup', () => {
  const recap = computeWeeklyActivityAndInjuryRecap({
    activities: mockActivities,
    injuries: [],
    painLogs: [],
    trainingResponses: [],
    scheduledWorkouts: [],
    referenceDate: '2026-11-15',
    scope: '2_WEEKS',
  });

  assert(recap.timeframe, 'Timeframe must exist');
  assert(Array.isArray(recap.availableWeeks), 'availableWeeks must be returned');
  assert.strictEqual(recap.availableWeeks.length, 12);
  assert(recap.multiWeekRollup, 'multiWeekRollup must exist');
  assert.strictEqual(recap.multiWeekRollup.scope, '2_WEEKS');
  assert.strictEqual(recap.multiWeekRollup.totalSessions, 4);
});

// 5. Sports Science Prescriptive Bridge, Dual-Load & Deload Engine
console.log('\n--- 5. Sports Science Prescriptive Bridge, Dual-Load & Deload Engine ---');

test('Computes Tactical Bridge Prescription with Safe KM Quota and Mandatory Rest Days', () => {
  const recap = computeWeeklyActivityAndInjuryRecap({
    activities: mockActivities,
    injuries: [],
    painLogs: [],
    trainingResponses: [],
    scheduledWorkouts: [],
    referenceDate: '2026-11-15',
    scope: '1_WEEK',
  });

  const pro = recap.pro_metrics;
  assert(pro, 'pro_metrics must exist');
  assert(pro.tactical_bridge, 'tactical_bridge must be computed');
  assert(pro.tactical_bridge.safe_km_quota.total_max_km > 0, 'safe km quota must be positive');
  assert(pro.tactical_bridge.mandatory_rest_days.count >= 1, 'mandatory rest days must be >= 1');
  assert(pro.tactical_bridge.target_hr_zones.zone1_2_aerobic_min_pct >= 75, 'aerobic target >= 75%');
  assert(typeof pro.tactical_bridge.clinical_recovery_action === 'string', 'clinical recovery action must exist');
});

test('Computes Dual-Load Telemetry coupling External Load with Internal Metabolic Strain', () => {
  const recap = computeWeeklyActivityAndInjuryRecap({
    activities: mockActivities,
    injuries: [],
    painLogs: [],
    trainingResponses: [],
    scheduledWorkouts: [],
    referenceDate: '2026-11-15',
    scope: '1_WEEK',
  });

  const dual = recap.pro_metrics.dual_load;
  assert(dual, 'dual_load must exist');
  assert.strictEqual(dual.external_distance_km, 95.4);
  assert(dual.internal_srpe_load_au > 0, 'Foster sRPE must be positive');
  assert(dual.internal_tss > 0, 'TSS must be positive');
  assert(dual.internal_cost_ratio_au_per_km > 0, 'Cost ratio AU/km must be computed');
  assert(typeof dual.efficiency_verdict === 'string', 'efficiency verdict must exist');
});

test('Recognizes Deload Week as Planned Supercompensation (Not Laziness or Failure)', () => {
  // Deload activities: volume drops ~30% compared to previous week (58.3 km down to ~35 km)
  const deloadActivities = [
    { id: 'd1', start_date: '2026-11-14T10:00:00Z', distance_meters: 20000, moving_time_seconds: 2400, average_heartrate: 130 },
    { id: 'd2', start_date: '2026-11-11T09:00:00Z', distance_meters: 15000, moving_time_seconds: 1800, average_heartrate: 125 },
    // Previous week had 58.3 km
    { id: 'p1', start_date: '2026-11-06T10:00:00Z', distance_meters: 31400, moving_time_seconds: 3600, average_heartrate: 130 },
    { id: 'p2', start_date: '2026-11-03T10:00:00Z', distance_meters: 26900, moving_time_seconds: 3600, average_heartrate: 128 },
  ];

  const recap = computeWeeklyActivityAndInjuryRecap({
    activities: deloadActivities,
    injuries: [],
    painLogs: [],
    trainingResponses: [],
    referenceDate: '2026-11-15',
    scope: '1_WEEK',
  });

  const deload = recap.pro_metrics.deload_info;
  assert(deload, 'deload_info must exist');
  assert.strictEqual(deload.is_deload_week, true, 'Deload week must be detected');
  assert(deload.volume_reduction_pct >= 15, 'Volume reduction must be >= 15%');
  assert(deload.scientific_rationale.includes('BUKAN kemalasan'), 'Must celebrate deload positively');
});

console.log('\n======================================================================');
console.log(`🏁 TEST RESULTS: ${passed} PASSED, 0 FAILED`);
console.log('======================================================================\n');
