require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to PostgreSQL:', process.env.DATABASE_URL);

  const userId = '00000000-0000-0000-0000-000000000001';

  // 1. Default Athlete User
  await client.query(`
    INSERT INTO users (id, email, name, avatar_url)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  `, [
    userId,
    'athlete@protraining.internal',
    'Apex Athlete',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  ]);

  // 2. Sample Scheduled Workouts
  await client.query(`
    INSERT INTO scheduled_workouts (
      id, user_id, scheduled_date, workout_category, target_distance_meters,
      target_duration_seconds, target_pace_seconds_per_km, target_intensity, description, status
    ) VALUES 
      (
        '00000000-0000-0000-0000-000000000021', $1, CURRENT_DATE - 1, 'Tempo Run',
        10000, 3000, 300, 'Threshold / Zone 4', '2km warmup, 6km threshold @ 5:00/km, 2km cooldown', 'COMPLETED'
      ),
      (
        '00000000-0000-0000-0000-000000000022', $1, CURRENT_DATE, 'Easy Run',
        8000, 2700, 337, 'Zone 2', 'Continuous conversational aerobic pace', 'PLANNED'
      ),
      (
        '00000000-0000-0000-0000-000000000023', $1, CURRENT_DATE + 2, 'Interval Training',
        8000, 2400, 280, 'VO2max / Zone 5', '6 x 800m repeats with 200m jog recovery', 'PLANNED'
      ),
      (
        '00000000-0000-0000-0000-000000000024', $1, CURRENT_DATE + 4, 'Long Run',
        18000, 6000, 333, 'Zone 2-3', 'Progressive aerobic endurance long run', 'PLANNED'
      )
    ON CONFLICT (id) DO NOTHING;
  `, [userId]);

  // 3. Sample Fitness Goals
  await client.query(`
    INSERT INTO fitness_goals (
      id, user_id, title, goal_type, target_value, current_value, start_date, target_date, is_achieved, unit
    ) VALUES 
      ('00000000-0000-0000-0000-000000000031', $1, 'Monthly Mileage Target', 'DISTANCE_MONTHLY', 120000, 48200, CURRENT_DATE - 15, CURRENT_DATE + 15, false, 'km'),
      ('00000000-0000-0000-0000-000000000032', $1, 'Weekly Consistency', 'FREQUENCY_WEEKLY', 4, 3, CURRENT_DATE - 3, CURRENT_DATE + 4, false, 'sessions')
    ON CONFLICT (id) DO NOTHING;
  `, [userId]);

  // 4. Sample Activities
  await client.query(`
    INSERT INTO activities (
      id, user_id, strava_activity_id, name, sport_type, start_date,
      distance_meters, moving_time_seconds, elapsed_time_seconds,
      elevation_gain_meters, average_speed_mps, max_speed_mps,
      average_heartrate, max_heartrate, average_cadence, calories
    ) VALUES 
      (
        '00000000-0000-0000-0000-000000000041', $1, 11002001, 'Morning Aerobic Threshold Run', 'Run',
        NOW() - INTERVAL '1 day', 10420, 3120, 3200, 115, 3.34, 4.5, 154, 172, 176, 780
      ),
      (
        '00000000-0000-0000-0000-000000000042', $1, 11002002, 'Zone 2 Aerobic Base Builder', 'Run',
        NOW() - INTERVAL '3 days', 8200, 2680, 2750, 65, 3.06, 3.8, 142, 156, 172, 590
      ),
      (
        '00000000-0000-0000-0000-000000000043', $1, 11002003, 'Recovery Spin & Mobility', 'Ride',
        NOW() - INTERVAL '4 days', 22400, 3600, 3800, 95, 6.22, 9.1, 126, 144, 82, 420
      )
    ON CONFLICT (strava_activity_id) DO NOTHING;
  `, [userId]);

  // 5. Sample Personal Records
  await client.query(`
    INSERT INTO personal_records (
      id, user_id, category, record_value, record_display, achieved_date
    ) VALUES
      ('00000000-0000-0000-0000-000000000051', $1, '5K', 1230, '20:30', NOW() - INTERVAL '14 days'),
      ('00000000-0000-0000-0000-000000000052', $1, '10K', 2550, '42:30', NOW() - INTERVAL '30 days'),
      ('00000000-0000-0000-0000-000000000053', $1, 'Half Marathon', 5760, '1:36:00', NOW() - INTERVAL '60 days')
    ON CONFLICT (user_id, category) DO NOTHING;
  `, [userId]);

  console.log('✅ Seed completed successfully!');
  const userCheck = await client.query('SELECT name, email FROM users WHERE id = $1', [userId]);
  const activityCount = await client.query('SELECT count(*) FROM activities WHERE user_id = $1', [userId]);
  const workoutCount = await client.query('SELECT count(*) FROM scheduled_workouts WHERE user_id = $1', [userId]);

  console.log('Athlete:', userCheck.rows[0]);
  console.log('Activities count:', activityCount.rows[0].count);
  console.log('Workouts count:', workoutCount.rows[0].count);

  await client.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

