const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/sport_training',
});

async function run() {
  try {
    console.log('[1/4] Deleting 3 dummy activities (11002001, 11002002, 11002003)...');
    const delRes = await pool.query(
      'DELETE FROM activities WHERE strava_activity_id IN (11002001, 11002002, 11002003)'
    );
    console.log(`Successfully deleted ${delRes.rowCount} dummy activities.`);

    console.log('[2/4] Ensuring athlete biometric columns exist on users table...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5, 2) DEFAULT 65.0');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5, 1) DEFAULT 170.0');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS resting_heart_rate INTEGER DEFAULT 68');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS max_heart_rate INTEGER DEFAULT 188');

    console.log('[3/4] Updating user profile with provided biometrics (68 bpm, 170 cm, 65 kg)...');
    await pool.query(`
      UPDATE users 
      SET weight_kg = 65.0, 
          height_cm = 170.0, 
          resting_heart_rate = 68, 
          max_heart_rate = 188, 
          updated_at = NOW() 
      WHERE id = '00000000-0000-0000-0000-000000000001'
    `);

    console.log('[4/4] Calibrating scheduled workouts with Karvonen HR zones...');
    await pool.query(`
      UPDATE scheduled_workouts 
      SET target_intensity = 'Zone 2 (140-152 bpm)',
          description = 'Aerobic Base builder calibrated to 68 bpm resting HR (60-70% HRR). Comfortable conversational pace.'
      WHERE workout_category = 'Easy Run'
    `);

    await pool.query(`
      UPDATE scheduled_workouts 
      SET target_intensity = 'Zone 4 Threshold (164-176 bpm)',
          description = 'Lactate Threshold workout calibrated to Karvonen HRR. 2km warmup, 6km at 4:55-5:00/km (168 bpm), 2km cooldown.'
      WHERE workout_category = 'Tempo Run'
    `);

    await pool.query(`
      UPDATE scheduled_workouts 
      SET target_intensity = 'Zone 5 VO2max (176-188 bpm)',
          description = 'Neuromuscular VO2 repeats. 6 x 800m at peak HR capacity with 200m recovery jog.'
      WHERE workout_category = 'Interval Training'
    `);

    await pool.query(`
      UPDATE scheduled_workouts 
      SET target_intensity = 'Zone 2-3 (140-160 bpm)',
          description = 'Aerobic endurance long run calibrated to 65 kg bodyweight. Focus on steady fat-oxidation metabolism.'
      WHERE workout_category = 'Long Run'
    `);

    // Verify
    const countRes = await pool.query('SELECT COUNT(*) FROM activities');
    console.log('Total activities remaining in PostgreSQL:', countRes.rows[0].count);

    const userRes = await pool.query('SELECT id, name, weight_kg, height_cm, resting_heart_rate, max_heart_rate FROM users');
    console.log('User row in DB:', userRes.rows[0]);

    const acts = await pool.query('SELECT sport_type, COUNT(*) FROM activities GROUP BY sport_type');
    console.log('Breakdown by sport type:', acts.rows);

    console.log('Migration & cleanup completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();

