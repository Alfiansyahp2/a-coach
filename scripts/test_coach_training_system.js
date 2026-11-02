const { Pool } = require('pg');
const assert = require('assert');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/sport_training',
});

async function runTests() {
  console.log('=== Running Coach Training & Grounded Indicator System Tests ===\n');
  let passed = 0;
  let failed = 0;

  function test(desc, fn) {
    try {
      fn();
      console.log(`[PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${desc}:`, err.message);
      failed++;
    }
  }

  const userId = '00000000-0000-0000-0000-000000000001';

  // 1. Verify Active Training Plan in Database
  const planRes = await pool.query('SELECT * FROM training_plans WHERE user_id = $1 AND is_active = TRUE', [userId]);
  test('Active Training Plan exists in DB', () => {
    assert.strictEqual(planRes.rows.length, 1);
    assert.ok(planRes.rows[0].title.includes('100km'));
    assert.ok(planRes.rows[0].title.includes('Marathon'));
  });

  // 2. Verify Scheduled Workouts Generation & Respect of 2-3 Days/Wk
  const workoutRes = await pool.query('SELECT * FROM scheduled_workouts WHERE user_id = $1 ORDER BY scheduled_date ASC', [userId]);
  test('Scheduled workouts exist and include planned and completed sessions', () => {
    assert.ok(workoutRes.rows.length >= 10);
    const hasCompleted = workoutRes.rows.some(w => w.status === 'COMPLETED');
    const hasPlanned = workoutRes.rows.some(w => w.status === 'PLANNED');
    assert.ok(hasCompleted, 'Must have completed sessions');
    assert.ok(hasPlanned, 'Must have planned sessions');
  });

  test('Workouts include safe running return-to-run progression alongside cycling and rehab', () => {
    // Running sessions are planned as gradual micro-doses (Recovery Run / Easy Run)
    const runningWorkouts = workoutRes.rows.filter(w => 
      ['Recovery Run', 'Easy Run'].includes(w.workout_category) && w.status === 'PLANNED'
    );
    assert.ok(runningWorkouts.length >= 3, 'Must have planned return-to-run workouts');

    // Cycling and Cross Training are also present
    const plannedCategories = new Set(workoutRes.rows.filter(w => w.status === 'PLANNED').map(w => w.workout_category));
    assert.ok(plannedCategories.has('Cycling'), 'Must have planned cycling workouts');
    assert.ok(plannedCategories.has('Cross Training') || plannedCategories.has('Strength Training'), 'Must have planned rehab workouts');
  });

  // 3. Verify Workout Activity Matching
  const matchRes = await pool.query(`
    SELECT m.*, w.workout_category, a.name as act_name, a.distance_meters as act_dist
    FROM workout_activity_matches m
    JOIN scheduled_workouts w ON m.workout_id = w.id
    JOIN activities a ON m.activity_id = a.id
    WHERE w.user_id = $1
  `, [userId]);
  test('Workout activity matching correlates real Strava sessions with prescribed workouts', () => {
    assert.ok(matchRes.rows.length >= 1);
    assert.ok(matchRes.rows.some(m => m.workout_category === 'Cycling'), 'Must have matched cycling workout');
    const match = matchRes.rows[0];
    assert.ok(Number(match.completion_percentage) >= 80);
  });

  // 4. Verify Macro Goals Grounding (100km Century & Marathon Pathway)
  const goalsRes = await pool.query('SELECT * FROM fitness_goals WHERE user_id = $1', [userId]);
  test('Fitness goals grounded in real 100km Century & Marathon milestones', () => {
    const goal100k = goalsRes.rows.find(g => g.title.includes('100 km'));
    assert.ok(goal100k, 'Must have 100km Century Ride goal');
    assert.strictEqual(Number(goal100k.target_value), 100);
    assert.strictEqual(Number(goal100k.current_value), 56.1); // Validated 56.10 km ride in DB

    const goalMarathon = goalsRes.rows.find(g => g.title.includes('Marathon'));
    assert.ok(goalMarathon, 'Must have Marathon Pathway goal');
    assert.strictEqual(Number(goalMarathon.target_value), 42.2);
    assert.strictEqual(Number(goalMarathon.current_value), 12.33); // Longest run in DB
  });

  console.log(`\nTest Summary: ${passed} passed, ${failed} failed`);
  await pool.end();

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
