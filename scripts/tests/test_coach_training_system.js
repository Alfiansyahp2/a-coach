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
    assert.ok(planRes.rows[0].title.includes('12-Week'), 'Must be a 12-week structured training plan');
  });

  // 2. Verify Scheduled Workouts Generation & Multi-Sport Structure
  const workoutRes = await pool.query('SELECT * FROM scheduled_workouts WHERE user_id = $1 ORDER BY scheduled_date ASC', [userId]);
  test('Scheduled workouts exist and include planned and completed sessions', () => {
    assert.ok(workoutRes.rows.length >= 4, 'Must have at least 4 master scheduled workouts');
    const hasCompleted = workoutRes.rows.some(w => w.status === 'COMPLETED');
    const hasPlanned = workoutRes.rows.some(w => w.status === 'PLANNED');
    assert.ok(hasCompleted, 'Must have completed sessions');
    assert.ok(hasPlanned, 'Must have planned sessions');
  });

  test('Workouts follow goal-driven structure with sport-specific progression and safe rehab slots', () => {
    const plannedCategories = new Set(workoutRes.rows.filter(w => w.status === 'PLANNED').map(w => w.workout_category));
    const hasActiveSport = plannedCategories.has('Cycling') || plannedCategories.has('Easy Run') || plannedCategories.has('Long Run');
    assert.ok(hasActiveSport, 'Must have planned endurance progression workouts for active goal');
    assert.ok(plannedCategories.has('Cross Training') || plannedCategories.has('Strength Training'), 'Must have planned rehab/mobility workouts');
  });

  // 3. Verify Workout Activity Matching
  const matchRes = await pool.query(`
    SELECT m.*, w.workout_category, a.name as act_name, a.distance_meters as act_dist
    FROM workout_activity_matches m
    JOIN scheduled_workouts w ON m.workout_id = w.id
    JOIN activities a ON m.activity_id = a.id
    WHERE w.user_id = $1
  `, [userId]);
  test('Workout activity matching correlates real/synthetic sessions with prescribed workouts', () => {
    assert.ok(matchRes.rows.length >= 1);
    assert.ok(matchRes.rows.some(m => m.workout_category === 'Cycling'), 'Must have matched cycling workout');
    const match = matchRes.rows[0];
    assert.ok(Number(match.completion_percentage) >= 80);
  });

  // 4. Verify Macro Goals Grounding
  const goalsRes = await pool.query('SELECT * FROM fitness_goals WHERE user_id = $1', [userId]);
  test('Fitness goals grounded in real/synthetic distance milestones', () => {
    assert.ok(goalsRes.rows.length >= 2, 'Must have at least 2 macro goals');
    const cyclingGoal = goalsRes.rows.find(g => g.title.toLowerCase().includes('cycling') || g.title.includes('100 km') || g.title.includes('50 km'));
    assert.ok(cyclingGoal, 'Must have cycling endurance goal');
    assert.ok(Number(cyclingGoal.target_value) >= 50, 'Target distance must be >= 50 km');
    assert.ok(Number(cyclingGoal.current_value) > 0, 'Current progress must be positive');
  });

  console.log(`\nTest Summary: ${passed} passed, ${failed} failed`);
  await pool.end();

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
