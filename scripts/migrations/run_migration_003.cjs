const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/sport_training',
});

async function run() {
  console.log('=== Running Migration 003: Dedicated Target Utama / Primary Goal Logic ===');
  
  // 1. Verify safe connection & count authentic activities before
  const beforeCountRes = await pool.query('SELECT count(*) FROM activities');
  const countBefore = parseInt(beforeCountRes.rows[0].count, 10);
  console.log(`Pre-flight check: Authentic activities in DB = ${countBefore}`);
  if (countBefore !== 34) {
    console.warn(`WARNING: Expected 34 activities, found ${countBefore}. Proceed with caution.`);
  }

  // 2. Read migration SQL
  const sqlPath = path.join(__dirname, '003_primary_goal_logic.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // 3. Execute
  await pool.query(sql);
  console.log('Migration 003 SQL executed successfully.');

  // 4. Verify columns in fitness_goals
  const fgCols = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'fitness_goals' AND column_name = 'is_primary'"
  );
  console.log(`Verified fitness_goals.is_primary column: ${fgCols.rows.length === 1 ? 'OK' : 'MISSING'}`);

  // 5. Inspect primary goal in DB
  const primaryRes = await pool.query("SELECT id, title, is_primary, priority FROM fitness_goals WHERE is_primary = TRUE");
  console.log(`Current Target Utama in DB:`, primaryRes.rows);

  // 6. Post-flight check
  const afterCountRes = await pool.query('SELECT count(*) FROM activities');
  const countAfter = parseInt(afterCountRes.rows[0].count, 10);
  console.log(`Post-flight check: Authentic activities in DB = ${countAfter} (Preserved: ${countBefore === countAfter})`);

  await pool.end();
  console.log('=== Migration 003 Finished ===');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

