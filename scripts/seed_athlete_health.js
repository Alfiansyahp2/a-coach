// Seeding script: Ingest initial real athlete health profile, injury history, and readiness state
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read database URL from .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
let dbUrl = process.env.DATABASE_URL;

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      dbUrl = trimmed.substring('DATABASE_URL='.length).trim();
      break;
    }
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl });
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

async function seedHealth() {
  await client.connect();
  console.log('Connected to PostgreSQL for Health Baseline Seeding...');

  // 1. Athlete Profile (Real Baseline Data)
  console.log('Seeding athlete_profiles...');
  await client.query(`
    INSERT INTO athlete_profiles (
      user_id, age, height_cm, weight_kg, resting_heart_rate,
      training_days_per_week, preferred_sports, training_experience,
      performance_objectives, physiological_measurements, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      age = EXCLUDED.age,
      height_cm = EXCLUDED.height_cm,
      weight_kg = EXCLUDED.weight_kg,
      resting_heart_rate = EXCLUDED.resting_heart_rate,
      training_days_per_week = EXCLUDED.training_days_per_week,
      preferred_sports = EXCLUDED.preferred_sports,
      training_experience = EXCLUDED.training_experience,
      performance_objectives = EXCLUDED.performance_objectives,
      physiological_measurements = EXCLUDED.physiological_measurements,
      updated_at = NOW();
  `, [
    DEFAULT_USER_ID,
    22,
    170.0,
    65.0,
    68,
    3,
    ['Running', 'Cycling'],
    'INTERMEDIATE',
    'Aerobic endurance maintenance with safe multi-sport progression',
    JSON.stringify({
      hr_max: null,
      lthr: null,
      ftp_watts: null,
      vo2_max: null,
      running_threshold_pace_sec: null,
      cycling_power_zones: null,
      baseline_consistency_weeks: null,
      sleep_recovery_baseline: null,
    }),
  ]);

  // 2. Clear old injury records for clean seed
  await client.query('DELETE FROM athlete_injuries WHERE user_id = $1', [DEFAULT_USER_ID]);

  // 2A. Right Ankle Injury
  console.log('Seeding Right Ankle Injury...');
  const ankleRes = await client.query(`
    INSERT INTO athlete_injuries (
      user_id, body_region, side, injury_mechanism, timeframe_description,
      previous_symptoms, initial_severity, previous_swelling,
      previous_swelling_duration, medical_evaluation_status, current_status,
      clinician_restrictions, functional_limitations, recovery_notes
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
    ) RETURNING id;
  `, [
    DEFAULT_USER_ID,
    'Right Ankle',
    'RIGHT',
    'Incorrect landing while playing basketball',
    'Approximately 3-6 months ago',
    'Previous swelling for approximately two months following acute inversion trauma',
    'MODERATE',
    true,
    'Approximately 2 months',
    'PENDING_CLINICAL_ASSESSMENT',
    'ACTIVE_SYMPTOMATIC',
    null,
    'Occasional ankle pain; walking normal; stair climbing normal; high cycling tolerance (56.10 km ride without pain)',
    'Actual injury structure and ligamentous integrity unconfirmed. Needs clinical assessment. Do not classify as fully healed sprain.',
  ]);
  const ankleInjuryId = ankleRes.rows[0].id;

  // 2B. Bilateral Anterior Knee Pain
  console.log('Seeding Bilateral Anterior Knee Pain...');
  const kneeRes = await client.query(`
    INSERT INTO athlete_injuries (
      user_id, body_region, side, injury_mechanism, timeframe_description,
      previous_symptoms, initial_severity, previous_swelling,
      previous_swelling_duration, medical_evaluation_status, current_status,
      clinician_restrictions, functional_limitations, recovery_notes
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
    ) RETURNING id;
  `, [
    DEFAULT_USER_ID,
    'Anterior Knees',
    'BILATERAL',
    'Repetitive impact loading during distance running',
    'Recent running sessions',
    'Mild discomfort around the front of both knees and kneecap margins appearing after distance running accumulation',
    'MILD',
    false,
    null,
    'PENDING_CLINICAL_ASSESSMENT',
    'ACTIVE_SYMPTOMATIC',
    null,
    'Mild pain appears after long-distance running; no symptoms during cycling or daily walking',
    'Patellofemoral pain may be one differential consideration, but AI must NOT diagnose patellofemoral pain syndrome. Differential open pending clinical assessment.',
  ]);
  const kneeInjuryId = kneeRes.rows[0].id;

  // 3. Seed Pain Logs (Historical observations)
  console.log('Seeding athlete_pain_logs...');
  await client.query('DELETE FROM athlete_pain_logs WHERE user_id = $1', [DEFAULT_USER_ID]);

  await client.query(`
    INSERT INTO athlete_pain_logs (
      user_id, injury_id, body_region, side, pain_score, pain_type,
      associated_activity, pain_during_activity, pain_immediately_after,
      pain_24h_after, swelling_present, joint_instability, functional_limitations, logged_at
    ) VALUES 
    ($1, $2, 'Right Ankle', 'RIGHT', 2, 'STIFFNESS', 'RUNNING', 2, 2, 1, false, false, 'Occasional sharp twinge upon uneven ground landing', NOW() - INTERVAL '6 days'),
    ($1, $3, 'Anterior Knees', 'BILATERAL', 3, 'ACHING', 'RUNNING', 2, 3, 2, false, false, 'Aching sensation around patellae after running 6.31 km', NOW() - INTERVAL '5 days');
  `, [DEFAULT_USER_ID, ankleInjuryId, kneeInjuryId]);

  // 4. Seed Training Response for the 56.10 km Ride
  console.log('Seeding athlete_training_responses for 56.10 km Ride...');
  // Find the activity id of the 56.10km ride
  const actRes = await client.query(`
    SELECT id, strava_activity_id 
    FROM activities 
    WHERE user_id = $1 AND distance_meters >= 50000 
    ORDER BY distance_meters DESC 
    LIMIT 1;
  `, [DEFAULT_USER_ID]);

  const rideAct = actRes.rows[0] || null;

  await client.query(`
    INSERT INTO athlete_training_responses (
      user_id, activity_id, strava_activity_id, sport_type, distance_km,
      duration_seconds, rpe_score, pain_during_activity, pain_after_activity,
      pain_next_day, swelling_observed, instability_observed,
      fatigue_response, athlete_comments, checkin_completed_at
    ) VALUES (
      $1, $2, $3, 'Ride', 56.10, 9436, 6.0, 0, 0, 0, false, false,
      'NORMAL',
      'Completed 56.10 km ride: no pain during, no pain immediately after, and no next-day swelling. Indicates positive session tolerance without establishing full ankle recovery.',
      NOW() - INTERVAL '34 days'
    )
    ON CONFLICT (user_id, activity_id) DO NOTHING;
  `, [DEFAULT_USER_ID, rideAct ? rideAct.id : null, rideAct ? rideAct.strava_activity_id : null]);

  // 5. Seed Initial Readiness State
  console.log('Seeding athlete_training_readiness...');
  await client.query('DELETE FROM athlete_training_readiness WHERE user_id = $1', [DEFAULT_USER_ID]);

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
    'ON_HOLD',
    'CONDITIONAL',
    'CONDITIONAL',
    'Running suspended: Unresolved right ankle pain and post-run bilateral anterior knee pain pending clinical assessment.',
    'Conditional cycling allowed: Zone 1-2 aerobic flat terrain, duration <= 60 mins (distance <= 30 km). Avoid heavy out-of-saddle hill climbing or sprint intervals.',
    'Asymmetric loading tolerance demonstrated: Repetitive impact running is contraindicated due to symptomatic right ankle and bilateral knee ache. Non-impact closed-chain cycling showed positive empirical tolerance on 56.10 km ride (0 pain during, after, next-day), permitting conditional endurance rides.',
    JSON.stringify([
      {
        region: 'Right Ankle',
        description: 'Occasional pain post-basketball inversion injury (3-6 mo ago, 2 mo swelling). Pending clinical exam.',
        severity: 'MODERATE',
      },
      {
        region: 'Anterior Knees',
        description: 'Bilateral mild discomfort around patellae following distance running. Pending clinical exam.',
        severity: 'MILD',
      },
    ]),
    JSON.stringify([
      {
        source: 'Strava Activity (Ride 56.10 km)',
        details: 'Verified pain-free response (pain 0/10 during, after, next-day; zero swelling).',
      },
      {
        source: 'Running Telemetry (Recent 6.31 km)',
        details: 'Triggered post-run bilateral anterior knee discomfort.',
      },
    ]),
    false,
    false,
  ]);

  // 6. Seed Initial Health Audit Trail
  console.log('Logging health_audit_trail...');
  await client.query(`
    INSERT INTO health_audit_trail (
      user_id, entity_type, entity_id, action, state_after, modified_by
    ) VALUES (
      $1, 'athlete_profiles', $1, 'CREATE',
      '{"status": "INITIAL_CALIBRATION_COMPLETED"}'::JSONB,
      'SYSTEM_INITIALIZER'
    );
  `, [DEFAULT_USER_ID]);

  console.log('✅ Successfully seeded comprehensive Athlete Health Profile, Injuries, and Initial Readiness into PostgreSQL!');
  await client.end();
  process.exit(0);
}

seedHealth().catch((err) => {
  console.error('Failed to seed athlete health:', err);
  process.exit(1);
});

