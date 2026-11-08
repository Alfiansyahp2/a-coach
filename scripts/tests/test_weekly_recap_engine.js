/**
 * Automated Verification Suite for Weekly Activity & Injury Recap Engine
 * Tests pure domain logic, mathematical correctness, edge cases, and DB integration.
 */

const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Since the domain engine is in TypeScript, we compile or require via ts-node/register or inline test logic
// Or let's test via direct invocation of the TypeScript engine or compiled JS
const { computeWeeklyActivityAndInjuryRecap, getWeekBounds } = require('../../src/lib/domain/analytics/weeklyRecapEngine');

console.log('======================================================================');
console.log('🧪 RUNNING WEEKLY ACTIVITY & INJURY RECAP ENGINE TEST SUITE');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${description}`);
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// 1. WEEK BOUNDARIES CALCULATION
// -----------------------------------------------------------------------------
console.log('--- 1. Timeframe & ISO Week Bounds (Monday - Sunday) ---');

it('Calculates Monday-to-Sunday window correctly for a mid-week date', () => {
  // 2026-11-04 is Wednesday
  const { start, end } = getWeekBounds('2026-11-04T12:00:00Z');
  
  assert.strictEqual(start.getDay(), 1, 'Start day must be Monday (1)');
  assert.strictEqual(start.getDate(), 2, 'Monday date must be Nov 2');
  assert.strictEqual(start.getMonth(), 10, 'Month must be Nov (10)');
  assert.strictEqual(start.getFullYear(), 2026);
  assert.strictEqual(start.getHours(), 0);
  assert.strictEqual(start.getMinutes(), 0);

  assert.strictEqual(end.getDay(), 0, 'End day must be Sunday (0)');
  assert.strictEqual(end.getDate(), 8, 'Sunday date must be Nov 8');
  assert.strictEqual(end.getHours(), 23);
  assert.strictEqual(end.getMinutes(), 59);
});

it('Calculates Monday-to-Sunday window correctly when reference date is Sunday', () => {
  // 2026-11-08 is Sunday
  const { start, end } = getWeekBounds('2026-11-08');
  assert.strictEqual(start.getDate(), 2, 'Start must be Monday Nov 2');
  assert.strictEqual(end.getDate(), 8, 'End must be Sunday Nov 8');
});

it('Calculates Monday-to-Sunday window correctly when reference date is Monday', () => {
  // 2026-11-02 is Monday
  const { start, end } = getWeekBounds('2026-11-02');
  assert.strictEqual(start.getDate(), 2, 'Start must be Monday Nov 2');
  assert.strictEqual(end.getDate(), 8, 'End must be Sunday Nov 8');
});

// -----------------------------------------------------------------------------
// 2. EMPTY / BASELINE ACTIVITIES RECAP
// -----------------------------------------------------------------------------
console.log('\n--- 2. Activity Volume & Discipline Aggregation ---');

it('Handles empty activities gracefully', () => {
  const recap = computeWeeklyActivityAndInjuryRecap({
    activities: [],
    injuries: [],
    painLogs: [],
    trainingResponses: [],
    referenceDate: '2026-11-05T00:00:00Z',
  });

  assert.strictEqual(recap.activity_summary.total_sessions, 0);
  assert.strictEqual(recap.activity_summary.total_distance_km, 0);
  assert.strictEqual(recap.activity_summary.active_days_count, 0);
  assert.strictEqual(recap.activity_summary.rest_days_count, 7);
  assert.strictEqual(recap.activity_summary.daily_breakdown.length, 7);
  assert.strictEqual(recap.activity_summary.sport_breakdown.length, 0);
});

it('Aggregates multi-sport sessions, paces, and daily breakdowns accurately', () => {
  const mockActivities = [
    {
      id: 'act-1',
      user_id: 'user-1',
      name: 'Tuesday Morning Zone 2 Ride',
      sport_type: 'Ride',
      start_date: '2026-11-03T07:00:00Z', // Tuesday
      distance_meters: 25000,
      moving_time_seconds: 3600, // 1 hr = 25 km/h
      elapsed_time_seconds: 3700,
      elevation_gain_meters: 150,
      average_speed_mps: 6.944,
      calories: 600,
      created_at: '2026-11-03T08:00:00Z',
      updated_at: '2026-11-03T08:00:00Z',
    },
    {
      id: 'act-2',
      user_id: 'user-1',
      name: 'Thursday Endurance Century Prep Ride',
      sport_type: 'Ride',
      start_date: '2026-11-05T06:30:00Z', // Thursday
      distance_meters: 35000,
      moving_time_seconds: 5400, // 1.5 hr = 23.3 km/h
      elapsed_time_seconds: 5600,
      elevation_gain_meters: 250,
      average_speed_mps: 6.481,
      calories: 900,
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
    },
    {
      id: 'act-3',
      user_id: 'user-1',
      name: 'Outside Window Activity',
      sport_type: 'Ride',
      start_date: '2026-10-25T07:00:00Z', // Previous week
      distance_meters: 50000,
      moving_time_seconds: 7200,
      elapsed_time_seconds: 7400,
      elevation_gain_meters: 300,
      average_speed_mps: 6.944,
      calories: 1200,
      created_at: '2026-10-25T08:00:00Z',
      updated_at: '2026-10-25T08:00:00Z',
    },
  ];

  const recap = computeWeeklyActivityAndInjuryRecap({
    activities: mockActivities,
    injuries: [],
    referenceDate: '2026-11-04T00:00:00Z',
  });

  assert.strictEqual(recap.activity_summary.total_sessions, 2, 'Must include only 2 sessions inside the week');
  assert.strictEqual(recap.activity_summary.total_distance_km, 60, 'Total distance must be 60.0 km');
  assert.strictEqual(recap.activity_summary.total_duration_seconds, 9000, 'Total duration must be 9000s');
  assert.strictEqual(recap.activity_summary.formatted_duration, '2:30:00', 'Formatted duration must be 2:30:00');
  assert.strictEqual(recap.activity_summary.total_elevation_gain_meters, 400, 'Total elevation must be 400m');
  assert.strictEqual(recap.activity_summary.total_calories, 1500, 'Total calories must be 1500 kcal');
  assert.strictEqual(recap.activity_summary.active_days_count, 2, '2 active days');
  assert.strictEqual(recap.activity_summary.rest_days_count, 5, '5 rest days');

  // Verify Sport Breakdown
  assert.strictEqual(recap.activity_summary.sport_breakdown.length, 1);
  const rideStats = recap.activity_summary.sport_breakdown[0];
  assert.strictEqual(rideStats.sport_type, 'Ride');
  assert.strictEqual(rideStats.session_count, 2);
  assert.strictEqual(rideStats.total_distance_km, 60);
  assert.strictEqual(rideStats.percentage_of_volume, 100);
});

// -----------------------------------------------------------------------------
// 3. INJURY, PAIN TELEMETRY, & CLINICAL VERDICT
// -----------------------------------------------------------------------------
console.log('\n--- 3. Injury Recapitulation, Pain Telemetry, & Clinical Verdict ---');

it('Identifies newly acquired/reported injuries in the weekly window', () => {
  const mockInjuries = [
    {
      id: 'inj-new',
      user_id: 'user-1',
      body_region: 'KNEE',
      side: 'RIGHT',
      injury_mechanism: 'Sudden hyperextension during stepping',
      timeframe_description: '3 days ago',
      estimated_injury_date: '2026-11-03', // Within week Nov 2 - Nov 8
      initial_severity: 'MODERATE',
      previous_swelling: true,
      medical_evaluation_status: 'PENDING_CLINICAL_ASSESSMENT',
      current_status: 'ACTIVE_SYMPTOMATIC',
      created_at: '2026-11-04T10:00:00Z',
      updated_at: '2026-11-04T10:00:00Z',
    },
    {
      id: 'inj-old',
      user_id: 'user-1',
      body_region: 'ANKLE',
      side: 'RIGHT',
      injury_mechanism: 'Lateral sprain inversion',
      timeframe_description: '4 weeks ago',
      estimated_injury_date: '2026-10-05', // Outside week
      initial_severity: 'MODERATE',
      previous_swelling: true,
      medical_evaluation_status: 'PENDING_CLINICAL_ASSESSMENT',
      current_status: 'ACTIVE_SYMPTOMATIC',
      created_at: '2026-10-05T10:00:00Z',
      updated_at: '2026-10-05T10:00:00Z',
    },
    {
      id: 'inj-resolved',
      user_id: 'user-1',
      body_region: 'WRIST',
      side: 'LEFT',
      injury_mechanism: 'Minor strain',
      timeframe_description: '2 months ago',
      estimated_injury_date: '2026-08-01',
      initial_severity: 'MILD',
      previous_swelling: false,
      medical_evaluation_status: 'DISCHARGED_CLEARED',
      current_status: 'RESOLVED',
      created_at: '2026-08-01T10:00:00Z',
      updated_at: '2026-08-01T10:00:00Z',
    },
  ];

  const recap = computeWeeklyActivityAndInjuryRecap({
    activities: [],
    injuries: mockInjuries,
    painLogs: [],
    trainingResponses: [],
    referenceDate: '2026-11-05T00:00:00Z',
  });

  assert.strictEqual(recap.injury_summary.new_injuries_count, 1, 'Only 1 injury acquired this week');
  assert.strictEqual(recap.injury_summary.new_injuries[0].id, 'inj-new');
  assert.strictEqual(recap.injury_summary.active_monitored_injuries.length, 2, '2 active ongoing injuries');
  assert.ok(recap.injury_summary.affected_anatomical_regions.includes('RIGHT KNEE'));
  assert.ok(recap.injury_summary.affected_anatomical_regions.includes('RIGHT ANKLE'));
  assert.ok(!recap.injury_summary.affected_anatomical_regions.includes('LEFT WRIST'), 'Resolved injury excluded');
});

it('Aggregates weekly pain logs and post-activity checkin responses', () => {
  const mockPainLogs = [
    {
      id: 'pain-1',
      user_id: 'user-1',
      body_region: 'ANKLE',
      side: 'RIGHT',
      pain_score: 3,
      pain_type: 'ACHING',
      swelling_present: false,
      joint_instability: false,
      logged_at: '2026-11-03T18:00:00Z',
      created_at: '2026-11-03T18:00:00Z',
    },
    {
      id: 'pain-2',
      user_id: 'user-1',
      body_region: 'ANKLE',
      side: 'RIGHT',
      pain_score: 4,
      pain_type: 'STIFFNESS',
      swelling_present: false,
      joint_instability: false,
      logged_at: '2026-11-06T09:00:00Z',
      created_at: '2026-11-06T09:00:00Z',
    },
  ];

  const mockResponses = [
    {
      id: 'resp-1',
      user_id: 'user-1',
      sport_type: 'Ride',
      distance_km: 25,
      duration_seconds: 3600,
      rpe_score: 5,
      pain_during_activity: 0,
      pain_after_activity: 0,
      swelling_observed: false,
      instability_observed: false,
      fatigue_response: 'NORMAL',
      checkin_completed_at: '2026-11-03T09:00:00Z',
      created_at: '2026-11-03T09:00:00Z',
    },
  ];

  const recap = computeWeeklyActivityAndInjuryRecap({
    activities: [],
    injuries: [],
    painLogs: mockPainLogs,
    trainingResponses: mockResponses,
    referenceDate: '2026-11-05T00:00:00Z',
  });

  const pTel = recap.injury_summary.pain_telemetry;
  assert.strictEqual(pTel.total_logs_count, 2);
  assert.strictEqual(pTel.average_pain_score, 3.5);
  assert.strictEqual(pTel.peak_pain_score, 4);
  assert.strictEqual(pTel.peak_pain_location, 'RIGHT ANKLE');
  assert.strictEqual(pTel.swelling_observed_count, 0);

  const tResp = recap.injury_summary.training_responses_summary;
  assert.strictEqual(tResp.total_checkins, 1);
  assert.strictEqual(tResp.average_rpe, 5);
  assert.strictEqual(tResp.pain_free_sessions_count, 1);
});

it('Triggers SUSPENDED circuit breaker when acute swelling or peak pain >= 6 occurs', () => {
  const severePainLog = [
    {
      id: 'pain-severe',
      user_id: 'user-1',
      body_region: 'KNEE',
      side: 'BILATERAL',
      pain_score: 7,
      pain_type: 'SHARP',
      swelling_present: true,
      joint_instability: true,
      logged_at: '2026-11-04T12:00:00Z',
      created_at: '2026-11-04T12:00:00Z',
    },
  ];

  const recap = computeWeeklyActivityAndInjuryRecap({
    activities: [],
    injuries: [],
    painLogs: severePainLog,
    trainingResponses: [],
    referenceDate: '2026-11-05T00:00:00Z',
  });

  assert.strictEqual(recap.clinical_verdict.status, 'SUSPENDED');
  assert.ok(recap.clinical_verdict.joint_safety_status.includes('CIRCUIT BREAKER'));
  assert.ok(recap.clinical_verdict.running_guidance.includes('LARI DILARANG KERAS'));
  assert.ok(recap.clinical_verdict.actionable_recommendations.some(r => r.includes('RICE protocol')));
});

it('Triggers CAUTION with running ON-HOLD and cycling permitted when active injuries exist without acute red flags', () => {
  const activeInjuries = [
    {
      id: 'inj-ankle',
      user_id: 'user-1',
      body_region: 'ANKLE',
      side: 'RIGHT',
      injury_mechanism: 'Sprain',
      timeframe_description: 'Ongoing',
      initial_severity: 'MODERATE',
      previous_swelling: true,
      medical_evaluation_status: 'PENDING_CLINICAL_ASSESSMENT',
      current_status: 'ACTIVE_SYMPTOMATIC',
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    },
  ];

  const rideActivities = [
    {
      id: 'act-ride',
      user_id: 'user-1',
      name: 'Safe Zone 2 Ride',
      sport_type: 'Ride',
      start_date: '2026-11-04T07:00:00Z',
      distance_meters: 25000,
      moving_time_seconds: 3600,
      elapsed_time_seconds: 3700,
      elevation_gain_meters: 80,
      average_speed_mps: 6.944,
      calories: 550,
      created_at: '2026-11-04T08:00:00Z',
      updated_at: '2026-11-04T08:00:00Z',
    },
  ];

  const recap = computeWeeklyActivityAndInjuryRecap({
    activities: rideActivities,
    injuries: activeInjuries,
    painLogs: [],
    trainingResponses: [],
    referenceDate: '2026-11-05T00:00:00Z',
  });

  assert.strictEqual(recap.clinical_verdict.status, 'CAUTION');
  assert.ok(recap.clinical_verdict.joint_safety_status.includes('Protokol Perlindungan Sendi'));
  assert.ok(recap.clinical_verdict.running_guidance.includes('Ditunda (On Hold sendi)'));
  assert.ok(recap.clinical_verdict.cycling_guidance.includes('Bersepeda diizinkan berlanjut'));
});

// -----------------------------------------------------------------------------
// 4. REAL DATABASE GROUNDED TEST
// -----------------------------------------------------------------------------
console.log('\n--- 4. Real PostgreSQL Database Grounded Test ---');

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/sport_training',
});

async function runDbTest() {
  try {
    const userId = '00000000-0000-0000-0000-000000000001';
    const [actRes, injRes, painRes, respRes] = await Promise.all([
      pool.query('SELECT * FROM activities WHERE user_id = $1 ORDER BY start_date DESC', [userId]),
      pool.query('SELECT * FROM athlete_injuries WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM athlete_pain_logs WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM athlete_training_responses WHERE user_id = $1', [userId]),
    ]);

    it('Computes grounded weekly recap from real PostgreSQL athlete dataset', () => {
      assert.ok(actRes.rows.length > 0, 'Database has activities');
      assert.ok(injRes.rows.length > 0, 'Database has injuries');

      const recap = computeWeeklyActivityAndInjuryRecap({
        activities: actRes.rows,
        injuries: injRes.rows,
        painLogs: painRes.rows,
        trainingResponses: respRes.rows,
      });

      assert.ok(recap.timeframe.label, 'Has timeframe label');
      assert.strictEqual(recap.activity_summary.daily_breakdown.length, 7, 'Has 7 daily entries');
      assert.ok(recap.injury_summary.active_monitored_injuries.length >= 2, 'Tracks at least 2 active clinical injuries');
      assert.ok(recap.clinical_verdict.joint_safety_status, 'Generates joint safety status');
      assert.ok(recap.clinical_verdict.actionable_recommendations.length > 0, 'Generates clinical recommendations');
    });
  } catch (err) {
    console.warn('PostgreSQL DB connection skipped or failed:', err.message);
  } finally {
    await pool.end();

    // -----------------------------------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------------------------------
    console.log('\n======================================================================');
    console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${totalTests - passedTests} FAILED out of ${totalTests} tests`);
    console.log('======================================================================');

    if (totalTests !== passedTests) {
      process.exit(1);
    }
  }
}

runDbTest();

