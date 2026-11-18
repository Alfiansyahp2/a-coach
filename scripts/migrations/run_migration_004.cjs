const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/sport_training',
});

async function run() {
  console.log('=== Running Migration 004: Decouple strava_activity_id and introduce is_manual ===');

  // 1. Pre-flight check: count activities
  const beforeCountRes = await pool.query('SELECT count(*) FROM activities');
  const countBefore = parseInt(beforeCountRes.rows[0].count, 10);
  console.log(`Pre-flight check: Authentic activities in DB = ${countBefore}`);

  // 2. Read and execute migration SQL
  const sqlPath = path.join(__dirname, '004_decouple_strava_id_manual_activity.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  await pool.query(sql);
  console.log('Migration 004 SQL executed successfully.');

  // 3. Verify columns in activities table
  const colRes = await pool.query(`
    SELECT column_name, is_nullable, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'activities' AND column_name IN ('strava_activity_id', 'is_manual')
  `);
  console.log('Verified column definitions:', colRes.rows);

  // 4. Post-flight check: verify authentic activities preserved
  const afterCountRes = await pool.query('SELECT count(*) FROM activities');
  const countAfter = parseInt(afterCountRes.rows[0].count, 10);
  console.log(`Post-flight check: Authentic activities in DB = ${countAfter} (Preserved: ${countBefore === countAfter})`);

  await pool.end();
  console.log('=== Migration 004 Finished Successfully ===');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

