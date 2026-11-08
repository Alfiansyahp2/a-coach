const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/sport_training',
});

async function run() {
  console.log('=== Running Migration 002: Goal-Driven Training Engine ===');
  
  // 1. Verify safe connection & count authentic activities before
  const beforeCountRes = await pool.query('SELECT count(*) FROM activities');
  const countBefore = parseInt(beforeCountRes.rows[0].count, 10);
  console.log(`Pre-flight check: Authentic activities in DB = ${countBefore}`);
  if (countBefore !== 34) {
    console.warn(`WARNING: Expected 34 activities, found ${countBefore}. Proceed with caution.`);
  }

  // 2. Read migration SQL
  const sqlPath = path.join(__dirname, '002_goal_driven_training.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // 3. Execute
  await pool.query(sql);
  console.log('Migration 002 SQL executed successfully.');

  // 4. Verify columns in training_plans and scheduled_workouts
  const tpCols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'training_plans' AND column_name = 'goal_id'"
  );
  console.log(`Verified training_plans.goal_id column: ${tpCols.rows.length === 1 ? 'OK' : 'MISSING'}`);

  const swCols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'scheduled_workouts' AND column_name IN ('is_key_session', 'milestone_target_km')"
  );
  console.log(`Verified scheduled_workouts new columns: ${swCols.rows.length === 2 ? 'OK' : 'PARTIAL'}`);

  // 5. Post-flight check
  const afterCountRes = await pool.query('SELECT count(*) FROM activities');
  const countAfter = parseInt(afterCountRes.rows[0].count, 10);
  console.log(`Post-flight check: Authentic activities in DB = ${countAfter} (Preserved: ${countBefore === countAfter})`);

  await pool.end();
  console.log('=== Migration 002 Finished ===');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
