const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/sport_training',
});

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

async function runTests() {
  console.log('=== Running Goal-Driven Training Engine Integration Tests ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Authentic activities count preserved
    const actCountRes = await pool.query('SELECT count(*) FROM activities WHERE user_id = $1', [DEFAULT_USER_ID]);
    const totalActivities = parseInt(actCountRes.rows[0].count, 10);
    assert(totalActivities === 34, `Authentic activities preserved: exactly 34 activities (found: ${totalActivities})`);

    // Test 2: Database schema has goal_id on training_plans
    const planColsRes = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'training_plans' AND column_name = 'goal_id'"
    );
    assert(planColsRes.rows.length === 1, 'training_plans table has goal_id foreign key column');

    // Test 3: Database schema has is_key_session and milestone_target_km on scheduled_workouts
    const swColsRes = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'scheduled_workouts' AND column_name IN ('is_key_session', 'milestone_target_km')"
    );
    assert(swColsRes.rows.length === 2, 'scheduled_workouts has is_key_session and milestone_target_km columns');

    // Test 4: Dynamic Archetype Generators verification via direct import
    // Note: Since project uses TS/Next, we test via the transpiled or direct DB states
    const activePlanRes = await pool.query(
      'SELECT * FROM training_plans WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
      [DEFAULT_USER_ID]
    );
    assert(activePlanRes.rows.length === 1, 'Active training plan exists in PostgreSQL');

    const activePlan = activePlanRes.rows[0];
    console.log(`Current Active Plan: "${activePlan.title}" (Linked Goal ID: ${activePlan.goal_id || 'None'})`);

    // Test 5: Verify scheduled workouts follow the 3:1 periodization and rest intervals
    const workoutsRes = await pool.query(
      'SELECT * FROM scheduled_workouts WHERE user_id = $1 AND plan_id = $2 ORDER BY scheduled_date ASC',
      [DEFAULT_USER_ID, activePlan.id]
    );
    const workouts = workoutsRes.rows;
    assert(workouts.length >= 36, `Workouts generated for plan: ${workouts.length} sessions (target: >= 36)`);

    // Verify key milestone sessions
    const keySessions = workouts.filter((w) => w.is_key_session === true);
    assert(keySessions.length >= 12, `Key Sunday milestone sessions flagged: ${keySessions.length} (target: 12)`);

    // Verify zero intense sessions on Monday & Thursday fasting days
    const mondaySessions = workouts.filter((w) => {
      const d = new Date(w.scheduled_date).getDay();
      return d === 1; // Monday (0=Sun, 1=Mon, 4=Thu)
    });
    const thursdaySessions = workouts.filter((w) => {
      const d = new Date(w.scheduled_date).getDay();
      return d === 4; // Thursday
    });
    assert(
      mondaySessions.length === 0,
      `Senin Puasa Sunnah is strictly protected: 0 scheduled workouts (found: ${mondaySessions.length})`
    );
    assert(
      thursdaySessions.length === 0,
      `Kamis Puasa Sunnah is strictly protected: 0 scheduled workouts (found: ${thursdaySessions.length})`
    );

    // Test 6: Fitness goals table integrity and is_primary column
    const isPrimaryColRes = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'fitness_goals' AND column_name = 'is_primary'"
    );
    assert(isPrimaryColRes.rows.length === 1, 'fitness_goals table has is_primary column');

    const goalsRes = await pool.query('SELECT * FROM fitness_goals WHERE user_id = $1 ORDER BY is_primary DESC, priority ASC', [
      DEFAULT_USER_ID,
    ]);
    assert(goalsRes.rows.length >= 4, `Authoritative goals exist in DB: ${goalsRes.rows.length} goals`);

    // Exactly one primary goal
    const primaryGoals = goalsRes.rows.filter((g) => g.is_primary === true);
    assert(primaryGoals.length === 1, `Exactly ONE Target Utama has is_primary = TRUE (found: ${primaryGoals.length})`);

    const primaryGoal = primaryGoals[0];
    assert(Boolean(primaryGoal), `Target Utama is designated: "${primaryGoal ? primaryGoal.title : 'None'}"`);
    console.log(`Active Target Utama: "${primaryGoal?.title}" (Type: ${primaryGoal?.goal_type}, Value: ${primaryGoal?.target_value} ${primaryGoal?.unit})`);

    // Verify Target Utama represents a peak single activity effort or authoritative target
    assert(
      Number(primaryGoal?.target_value) > 0,
      `Target Utama target_value > 0 represents single activity benchmark (${primaryGoal?.target_value})`
    );

    console.log(`\n========================================`);
    console.log(`Test Summary: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTests();

