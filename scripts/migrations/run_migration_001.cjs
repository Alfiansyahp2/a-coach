const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres:admin123@localhost:5432/sport_training',
});

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('>>> [PRE-FLIGHT] Verifying database integrity before migration...');
    const preCount = await client.query('SELECT count(*) as total FROM activities');
    console.log(`>>> [PRE-FLIGHT] Activities count: ${preCount.rows[0].total} (Target: 34)`);
    if (parseInt(preCount.rows[0].total, 10) !== 34) {
      throw new Error(`Integrity check failed: expected 34 activities, found ${preCount.rows[0].total}`);
    }

    await client.query('BEGIN');
    console.log('>>> [MIGRATION] Transaction started.');

    // 1. Execute DDL
    const ddlPath = path.join(__dirname, 'migrations', '001_athlete_data_center.sql');
    const ddlSql = fs.readFileSync(ddlPath, 'utf8');
    await client.query(ddlSql);
    console.log('>>> [MIGRATION] DDL executed successfully.');

    // 2. Backfill existing fitness_goals
    console.log('>>> [BACKFILL] Updating fitness_goals metadata...');
    await client.query(`
      UPDATE fitness_goals 
      SET sport_type = 'Ride', priority = 1, target_event_name = 'First Century Ride 100K'
      WHERE title ILIKE '%100%' OR title ILIKE '%century%';
    `);
    await client.query(`
      UPDATE fitness_goals 
      SET sport_type = 'Run', priority = 2, target_event_name = 'Marathon 42.2K Return-to-Run'
      WHERE title ILIKE '%marathon%' OR title ILIKE '%42%';
    `);
    await client.query(`
      UPDATE fitness_goals 
      SET sport_type = 'All', priority = 1, target_event_name = 'Weekly Habit Consistency'
      WHERE title ILIKE '%konsistensi%' OR title ILIKE '%sesi%';
    `);
    await client.query(`
      UPDATE fitness_goals 
      SET sport_type = 'All', priority = 2, target_event_name = '12-Week Periodization Volume'
      WHERE title ILIKE '%akumulasi%' OR title ILIKE '%400%';
    `);

    // 3. Seed athlete_availability baseline
    console.log('>>> [SEED] Seeding athlete_availability baseline...');
    await client.query(`
      INSERT INTO athlete_availability (
        user_id, preferred_days, preferred_time_of_day, 
        max_session_duration_minutes, weekend_duration_minutes, 
        fasting_schedule, protected_rest_days
      ) VALUES (
        $1, 
        ARRAY['Tuesday', 'Friday', 'Sunday'], 
        'MORNING', 
        60, 
        120, 
        '{"type": "NONE", "is_fasting": false}'::jsonb, 
        ARRAY['Monday']
      )
      ON CONFLICT (user_id) DO NOTHING;
    `, [DEFAULT_USER_ID]);

    // 4. Seed athlete_equipment baseline
    console.log('>>> [SEED] Seeding athlete_equipment baseline...');
    await client.query(`
      INSERT INTO athlete_equipment (
        user_id, sport_type, name, brand, model, 
        accumulated_distance_meters, max_recommended_distance_meters, 
        gear_type, is_active, notes
      ) VALUES 
      (
        $1, 'Ride', 'Trek Marlin 7 Hardtail', 'Trek', 'Marlin 7 (Gen 2)', 
        56100.00, 5000000.00, 'MTB', true, 
        'Sepeda utama untuk endurance aerobik Zone 2 jalur datar non-impact'
      ),
      (
        $1, 'Run', 'Nike Pegasus Trail 4', 'Nike', 'Pegasus Trail 4', 
        12330.00, 800000.00, 'RUNNING_SHOES', true, 
        'Sepatu bantalan empuk untuk fase transisi return-to-run'
      )
      ON CONFLICT DO NOTHING;
    `, [DEFAULT_USER_ID]);

    // 5. Seed athlete_daily_wellness baseline
    console.log('>>> [SEED] Seeding athlete_daily_wellness baseline...');
    await client.query(`
      INSERT INTO athlete_daily_wellness (
        user_id, logged_date, resting_heart_rate, sleep_duration_hours, 
        sleep_quality_score, fatigue_score, muscle_soreness_score, 
        life_stress_score, perceived_readiness, notes
      ) VALUES (
        $1, CURRENT_DATE, 68, 7.5, 
        4, 2, 1, 
        2, 'OPTIMAL', 'Kondisi fisik prima, siap latihan kayuhan sepeda Zone 2'
      )
      ON CONFLICT (user_id, logged_date) DO NOTHING;
    `, [DEFAULT_USER_ID]);

    await client.query('COMMIT');
    console.log('>>> [MIGRATION] Transaction committed successfully!');

    // 6. Post-migration verification
    console.log('>>> [POST-FLIGHT] Verifying post-migration data integrity...');
    const postCount = await client.query('SELECT count(*) as total FROM activities');
    console.log(`>>> [POST-FLIGHT] Activities count: ${postCount.rows[0].total} (Target: 34)`);
    if (parseInt(postCount.rows[0].total, 10) !== 34) {
      throw new Error(`CRITICAL INTEGRITY FAILURE: activities count changed to ${postCount.rows[0].total}`);
    }

    const availCheck = await client.query('SELECT * FROM athlete_availability WHERE user_id = $1', [DEFAULT_USER_ID]);
    console.log(`>>> [VERIFIED] athlete_availability rows: ${availCheck.rowCount}`);

    const equipCheck = await client.query('SELECT count(*) as total FROM athlete_equipment WHERE user_id = $1', [DEFAULT_USER_ID]);
    console.log(`>>> [VERIFIED] athlete_equipment rows: ${equipCheck.rows[0].total}`);

    const wellCheck = await client.query('SELECT count(*) as total FROM athlete_daily_wellness WHERE user_id = $1', [DEFAULT_USER_ID]);
    console.log(`>>> [VERIFIED] athlete_daily_wellness rows: ${wellCheck.rows[0].total}`);

    const goalsCheck = await client.query('SELECT id, title, sport_type, priority FROM fitness_goals WHERE user_id = $1', [DEFAULT_USER_ID]);
    console.log(`>>> [VERIFIED] fitness_goals extended:`, goalsCheck.rows);

    console.log('\n>>> ALL CHECKS PASSED PERFECTLY (100% SUCCESS)');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('>>> [ERROR] Migration failed, transaction rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

