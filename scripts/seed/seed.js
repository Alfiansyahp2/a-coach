// Master General Synthetic Seed Script (LEAN MASTER DATA ONLY - NO OVERSHARING)
// Minimalist, synthetic, essential boilerplate dataset for public/demo use.
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/sport_training';
const client = new Client({ connectionString: dbUrl });
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

async function seed() {
  console.log('======================================================================');
  console.log('🌱 EXECUTING LEAN MASTER GENERAL SEED (MINIMAL DEMO BASELINE)');
  console.log('======================================================================');
  console.log('Database URL:', dbUrl);

  await client.connect();

  try {
    await client.query('BEGIN');

    console.log('1. Cleaning previous records for default user...');
    await client.query('DELETE FROM workout_activity_matches WHERE workout_id IN (SELECT id FROM scheduled_workouts WHERE user_id = $1)', [DEFAULT_USER_ID]);
    await client.query('DELETE FROM scheduled_workouts WHERE user_id = $1', [DEFAULT_USER_ID]);
    await client.query('DELETE FROM training_plans WHERE user_id = $1', [DEFAULT_USER_ID]);
    await client.query('DELETE FROM athlete_training_responses WHERE user_id = $1', [DEFAULT_USER_ID]);
    await client.query('DELETE FROM athlete_injuries WHERE user_id = $1', [DEFAULT_USER_ID]);
    await client.query('DELETE FROM athlete_training_readiness WHERE user_id = $1', [DEFAULT_USER_ID]);
    await client.query('DELETE FROM athlete_profiles WHERE user_id = $1', [DEFAULT_USER_ID]);
    await client.query('DELETE FROM activities WHERE user_id = $1', [DEFAULT_USER_ID]);
    await client.query('DELETE FROM fitness_goals WHERE user_id = $1', [DEFAULT_USER_ID]);
    await client.query('DELETE FROM personal_records WHERE user_id = $1', [DEFAULT_USER_ID]);
    await client.query('DELETE FROM health_audit_trail WHERE user_id = $1', [DEFAULT_USER_ID]);

    // 1. Synthetic User
    console.log('2. Seeding master users table...');
    await client.query(`
      INSERT INTO users (id, email, name, avatar_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email;
    `, [
      DEFAULT_USER_ID,
      'demo.athlete@a-coach.internal',
      'Demo Athlete',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    ]);

    // 2. Synthetic Athlete Profile
    console.log('3. Seeding master athlete_profiles table...');
    await client.query(`
      INSERT INTO athlete_profiles (
        user_id, age, height_cm, weight_kg, resting_heart_rate,
        training_days_per_week, preferred_sports, training_experience,
        performance_objectives, physiological_measurements, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW());
    `, [
      DEFAULT_USER_ID,
      28,
      178.0,
      72.0,
      60,
      4,
      ['Cycling', 'Running', 'Swimming'],
      'INTERMEDIATE',
      'Aerobic Base Building & Multi-Sport Conditioning (50km Cycling Milestone)',
      JSON.stringify({
        hr_max: null,
        lthr: null,
        ftp_watts: null,
        vo2_max: null,
      }),
    ]);

    // 3. Generic Clinical Injury Dossiers (2 Master Baseline Records)
    console.log('4. Seeding master athlete_injuries table...');
    await client.query(`
      INSERT INTO athlete_injuries (
        user_id, body_region, side, injury_mechanism, timeframe_description,
        previous_symptoms, initial_severity, previous_swelling,
        previous_swelling_duration, medical_evaluation_status, current_status,
        clinician_restrictions, functional_limitations, recovery_notes
      ) VALUES (
        $1, 'Left Knee', 'LEFT',
        'Repetitive eccentric quad loading on steep downhill trail hike',
        'Approximately 2 months ago',
        'Mild discomfort over anterior patella following long descent',
        'MILD',
        false,
        null,
        'PENDING_CLINICAL_ASSESSMENT',
        'ACTIVE_SYMPTOMATIC',
        null,
        'Comfortable on flat terrain and low-resistance cycling, slight sensitivity when squatting deep',
        'Differential open pending clinical assessment. Keep loading within symptom-free limits.'
      );
    `, [DEFAULT_USER_ID]);

    await client.query(`
      INSERT INTO athlete_injuries (
        user_id, body_region, side, injury_mechanism, timeframe_description,
        previous_symptoms, initial_severity, previous_swelling,
        previous_swelling_duration, medical_evaluation_status, current_status,
        clinician_restrictions, functional_limitations, recovery_notes
      ) VALUES (
        $1, 'Right Shoulder', 'RIGHT',
        'Fatigue during high-volume bodyweight pull-ups',
        'Approximately 1 month ago',
        'Mild tenderness at end-range overhead flexion',
        'MILD',
        false,
        null,
        'PENDING_CLINICAL_ASSESSMENT',
        'ACTIVE_SYMPTOMATIC',
        null,
        'Full range of motion preserved, slight tenderness at end-range overhead flexion',
        'No rotator cuff tear diagnosed. Focus on scapular stabilization and light swimming drills.'
      );
    `, [DEFAULT_USER_ID]);

    // 4. Clinical Training Readiness State Machine
    console.log('5. Seeding master athlete_training_readiness table...');
    await client.query(`
      INSERT INTO athlete_training_readiness (
        user_id, evaluated_at, athlete_status, running_readiness,
        cycling_readiness, general_readiness, running_restrictions,
        cycling_restrictions, rationale, trigger_symptoms,
        source_telemetry_refs, medical_clearance, automatic_progression_allowed
      ) VALUES (
        $1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      );
    `, [
      DEFAULT_USER_ID,
      'ACTIVE_WITH_UNRESOLVED_SYMPTOMS',
      'CONDITIONAL',
      'READY',
      'CONDITIONAL',
      'Controlled running permitted: Flat even surfaces, duration <= 30 mins.',
      'Full cycling permitted: Aerobic endurance on flat terrain, high cadence (85-95 rpm).',
      'Symptomatic left knee shows positive tolerance on non-impact closed-chain cycling with zero reported pain.',
      JSON.stringify([
        { region: 'Left Knee', description: 'Mild anterior patellar ache noticed after downhill trail hike.', severity: 'MILD' },
        { region: 'Right Shoulder', description: 'Mild overhead end-range tenderness.', severity: 'MILD' },
      ]),
      JSON.stringify(['00000000-0000-0000-0000-000000000102']),
      false,
      false,
    ]);

    // 5. Active Training Plan (Master 12-Week General Program)
    console.log('6. Seeding master training_plans table...');
    const planRes = await client.query(`
      INSERT INTO training_plans (
        id, user_id, title, description, start_date, end_date, is_active, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000020',
        $1,
        '12-Week General Aerobic & Base Conditioning Program (50km Cycling & 10km Running)',
        'Balanced 12-week aerobic foundation program focusing on Zone 2 endurance base building, non-impact recovery spins, and safe progressive running.',
        '2026-11-02', '2027-01-24', true, NOW()
      ) RETURNING id;
    `, [DEFAULT_USER_ID]);
    const planId = planRes.rows[0].id;

    // 6. Master Scheduled Workouts (4 Concise Key Sessions)
    console.log('7. Seeding master scheduled_workouts table...');
    const workouts = [
      { id: '00000000-0000-0000-0000-000000000021', date: '2026-10-26', cat: 'Cycling', dist: 30000, dur: 4500, int: 'Zone 2 Foundation', desc: 'Zone 2 Long Aerobic Foundation Ride (30 km)', status: 'COMPLETED' },
      { id: '00000000-0000-0000-0000-000000000022', date: '2026-11-03', cat: 'Cycling', dist: 20000, dur: 3000, int: 'Zone 2 Recovery', desc: 'Zone 2 Recovery Spin • RPE 2-3/10', status: 'PLANNED' },
      { id: '00000000-0000-0000-0000-000000000023', date: '2026-11-06', cat: 'Cross Training', dist: null, dur: 1800, int: 'Mobility Prescribed', desc: 'Upper-Body Strength & Mobility • RPE 3/10', status: 'PLANNED' },
      { id: '00000000-0000-0000-0000-000000000024', date: '2026-11-13', cat: 'Recovery Run', dist: 3000, dur: 1200, int: 'Recovery', desc: 'Easy Recovery Run on Flat Track/Grass (3 km)', status: 'PLANNED' },
    ];

    for (const w of workouts) {
      await client.query(`
        INSERT INTO scheduled_workouts (
          id, user_id, plan_id, scheduled_date, workout_category, target_distance_meters,
          target_duration_seconds, target_intensity, description, status, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (id) DO NOTHING;
      `, [
        w.id, DEFAULT_USER_ID, planId, w.date, w.cat, w.dist,
        w.dur, w.int, w.desc, w.status
      ]);
    }

    // 7. Master Activities (Exactly 8 Sessions: 1 Session/Week across 8 Consecutive Weeks)
    // Demonstrates consistent weekly cadence and flame retention cleanly without bloating data
    console.log('8. Seeding master activities table (8 weekly baseline sessions)...');
    const activities = [
      // Week 45 (Current Week - Nov 02, 2026) -> Flame burning!
      { id: '00000000-0000-0000-0000-000000000101', strava_id: 30000001, name: '1500m Aerobic Swim Conditioning', sport: 'Swim', date: '2026-11-02T08:30:00Z', dist: 1500, mov: 2100, elap: 2200, elev: 0, spd: 0.71, max_spd: 1.1, hr: 130, max_hr: 145, cad: null, cal: 380, desc: 'Technique drills and aerobic freestyle endurance' },

      // Week 44 (Oct 26 - Nov 01, 2026)
      { id: '00000000-0000-0000-0000-000000000102', strava_id: 30000002, name: 'Zone 2 Long Aerobic Foundation Ride', sport: 'Ride', date: '2026-10-26T07:15:00Z', dist: 30000, mov: 4500, elap: 4600, elev: 80, spd: 6.67, max_spd: 10.5, hr: 135, max_hr: 150, cad: 84, cal: 650, desc: 'Steady Zone 2 aerobic cycling on flat terrain' },

      // Week 43 (Oct 19 - 25, 2026)
      { id: '00000000-0000-0000-0000-000000000103', strava_id: 30000003, name: 'Weekend Base Endurance Ride', sport: 'Ride', date: '2026-10-19T06:30:00Z', dist: 30000, mov: 4500, elap: 4600, elev: 85, spd: 6.67, max_spd: 10.8, hr: 136, max_hr: 152, cad: 82, cal: 660, desc: 'Aerobic base spin with steady cadence' },

      // Week 42 (Oct 12 - 18, 2026)
      { id: '00000000-0000-0000-0000-000000000104', strava_id: 30000004, name: 'Aerobic Foundation Spin', sport: 'Ride', date: '2026-10-12T07:00:00Z', dist: 25000, mov: 3800, elap: 3900, elev: 60, spd: 6.58, max_spd: 10.2, hr: 134, max_hr: 148, cad: 82, cal: 530, desc: 'Sub-threshold progressive power blocks' },

      // Week 41 (Oct 05 - 11, 2026)
      { id: '00000000-0000-0000-0000-000000000105', strava_id: 30000005, name: 'Smooth Endurance Spin', sport: 'Ride', date: '2026-10-05T07:30:00Z', dist: 25000, mov: 3800, elap: 3900, elev: 55, spd: 6.58, max_spd: 10.0, hr: 132, max_hr: 146, cad: 80, cal: 520, desc: 'Continuous aerobic circuit' },

      // Week 40 (Sep 28 - Oct 04, 2026)
      { id: '00000000-0000-0000-0000-000000000106', strava_id: 30000006, name: 'Morning Cadence Spin', sport: 'Ride', date: '2026-09-28T06:45:00Z', dist: 20000, mov: 3100, elap: 3200, elev: 45, spd: 6.45, max_spd: 9.8, hr: 130, max_hr: 144, cad: 85, cal: 420, desc: 'High-cadence aerobic spin' },

      // Week 39 (Sep 21 - 27, 2026)
      { id: '00000000-0000-0000-0000-000000000107', strava_id: 30000007, name: 'Midweek Aerobic Ride', sport: 'Ride', date: '2026-09-21T07:00:00Z', dist: 20000, mov: 3100, elap: 3200, elev: 40, spd: 6.45, max_spd: 9.6, hr: 131, max_hr: 145, cad: 80, cal: 420, desc: 'Aerobic base spin' },

      // Week 38 (Sep 14 - 20, 2026)
      { id: '00000000-0000-0000-0000-000000000108', strava_id: 30000008, name: 'Base Builder Spin', sport: 'Ride', date: '2026-09-14T06:30:00Z', dist: 20000, mov: 3100, elap: 3200, elev: 40, spd: 6.45, max_spd: 9.5, hr: 129, max_hr: 142, cad: 80, cal: 410, desc: 'Initial baseline spin' },
    ];

    for (const a of activities) {
      await client.query(`
        INSERT INTO activities (
          id, user_id, strava_activity_id, name, sport_type, start_date,
          distance_meters, moving_time_seconds, elapsed_time_seconds, elevation_gain_meters,
          average_speed_mps, max_speed_mps, average_heartrate, max_heartrate,
          average_cadence, average_watts, calories, raw_summary_polyline, description, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
        ON CONFLICT (strava_activity_id) DO NOTHING;
      `, [
        a.id, DEFAULT_USER_ID, a.strava_id, a.name, a.sport, a.date,
        a.dist, a.mov, a.elap, a.elev, a.spd, a.max_spd, a.hr, a.max_hr,
        a.cad, null, a.cal, null, a.desc
      ]);
    }

    // 8. Workout Activity Matches (1 Master Correlation)
    console.log('9. Seeding master workout_activity_matches table...');
    await client.query(`
      INSERT INTO workout_activity_matches (
        workout_id, activity_id, is_manual_match, completion_percentage,
        distance_delta_meters, duration_delta_seconds, pace_delta_seconds_per_km, matched_at
      ) VALUES
        ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000102', FALSE, 100, 0, 0, 0, NOW())
      ON CONFLICT DO NOTHING;
    `);

    // 9. Fitness Goals (2 Master Goals)
    console.log('10. Seeding master fitness_goals table...');
    const goals = [
      { id: '00000000-0000-0000-0000-000000000031', title: '50 km Cycling Endurance Tour', type: 'CUSTOM', target: 50, current: 30.0, start: '2026-09-01', end: '2027-03-31', unit: 'km' },
      { id: '00000000-0000-0000-0000-000000000032', title: 'Weekly Consistency (4 Sessions / Week)', type: 'FREQUENCY_WEEKLY', target: 4, current: 4, start: '2026-11-02', end: '2027-01-24', unit: 'sessions' },
    ];

    for (const g of goals) {
      await client.query(`
        INSERT INTO fitness_goals (
          id, user_id, title, goal_type, target_value, current_value, start_date, target_date, is_achieved, unit
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9)
        ON CONFLICT (id) DO NOTHING;
      `, [g.id, DEFAULT_USER_ID, g.title, g.type, g.target, g.current, g.start, g.end, g.unit]);
    }

    // 10. Personal Records (2 Master Records)
    console.log('11. Seeding master personal_records table...');
    const prs = [
      { id: '00000000-0000-0000-0000-000000000041', cat: '5K', val: 1200, disp: '20:00', date: '2026-10-15' },
      { id: '00000000-0000-0000-0000-000000000042', cat: '30km Cycling', val: 4500, disp: '1:15:00', date: '2026-10-25' },
    ];

    for (const p of prs) {
      await client.query(`
        INSERT INTO personal_records (
          id, user_id, category, record_value, record_display, achieved_date
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, category) DO NOTHING;
      `, [p.id, DEFAULT_USER_ID, p.cat, p.val, p.disp, p.date]);
    }

    // 11. Empirical Activity Response Telemetry (1 Master Check-in for 30km Ride)
    console.log('12. Seeding master athlete_training_responses table...');
    await client.query(`
      INSERT INTO athlete_training_responses (
        user_id, activity_id, strava_activity_id, sport_type, distance_km,
        duration_seconds, rpe_score, pain_during_activity, pain_after_activity,
        pain_next_day, swelling_observed, instability_observed,
        fatigue_response, athlete_comments, checkin_completed_at
      ) VALUES (
        $1, $2, 30000002, 'Ride', 30.00,
        4500, 4.0, 0, 0,
        0, false, false,
        'NORMAL',
        'Smooth aerobic foundation ride. Joint stability excellent, zero post-session pain.',
        NOW() - INTERVAL '7 days'
      ) ON CONFLICT (user_id, activity_id) DO NOTHING;
    `, [DEFAULT_USER_ID, '00000000-0000-0000-0000-000000000102']);

    // 12. Health Audit Trail
    console.log('13. Seeding master health_audit_trail table...');
    await client.query(`
      INSERT INTO health_audit_trail (
        user_id, entity_type, entity_id, action, state_after, modified_by
      ) VALUES (
        $1, 'athlete_profiles', $1, 'CREATE',
        '{"status": "INITIAL_CALIBRATION_COMPLETED", "age": 28, "height_cm": 178.0, "weight_kg": 72.0, "resting_heart_rate": 60}'::JSONB,
        'DEMO_SEED_INITIALIZER'
      );
    `, [DEFAULT_USER_ID]);

    await client.query('COMMIT');
    console.log('\n======================================================================');
    console.log('✅ LEAN MASTER GENERAL SEED COMPLETED SUCCESSFULLY!');
    console.log('======================================================================');
    console.log('• User: Demo Athlete (demo.athlete@a-coach.internal)');
    console.log('• Profile: Age 28 • 178 cm • 72 kg • BMI 22.7 • RHR 60 bpm • 4 days/wk');
    console.log(`• Activities: ${activities.length} sessions (lean: 1 session/week across 8 weeks)`);
    console.log(`• Workouts: ${workouts.length} scheduled master sessions`);
    console.log('• Injuries: 2 generic clinical dossiers (Left Knee & Right Shoulder)');
    console.log('• Zero personal data, no oversharing, clean boilerplate demo.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed transaction failed, rolled back:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed().catch(err => {
  console.error('Seed execution error:', err);
  process.exit(1);
});
