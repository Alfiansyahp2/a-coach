// Comprehensive verification suite for Athlete Health Profile & Readiness Intelligence System
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

const client = new Client({ connectionString: dbUrl });
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 RUNNING ATHLETE HEALTH & INJURY-AWARE READINESS VERIFICATION SUITE');
  console.log('======================================================================\n');

  await client.connect();

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${detail ? '(' + detail + ')' : ''}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? '(' + detail + ')' : ''}`);
      failed++;
    }
  }

  // 1. Profile Verification
  console.log('--- 1. Athlete Physical Baseline & Physiological Unknowns ---');
  const profRes = await client.query('SELECT * FROM athlete_profiles WHERE user_id = $1', [DEFAULT_USER_ID]);
  assert(profRes.rows.length === 1, 'Profile exists in PostgreSQL');
  const p = profRes.rows[0];
  assert(Number(p.age) === 22, 'Athlete age is 22', `Actual: ${p.age}`);
  assert(Number(p.height_cm) === 170.0, 'Athlete height is 170.0 cm', `Actual: ${p.height_cm}`);
  assert(Number(p.weight_kg) === 65.0, 'Athlete weight is 65.0 kg', `Actual: ${p.weight_kg}`);
  assert(Number(p.bmi) === 22.5, 'BMI is calculated as 22.5', `Actual: ${p.bmi}`);
  assert(Number(p.resting_heart_rate) === 68, 'Resting heart rate is 68 bpm', `Actual: ${p.resting_heart_rate}`);
  assert(p.training_days_per_week === 3, 'Training availability is 3 days/wk (2-3 days)', `Actual: ${p.training_days_per_week}`);

  const phys = typeof p.physiological_measurements === 'string' ? JSON.parse(p.physiological_measurements) : p.physiological_measurements;
  assert(phys.hr_max === null, 'HRmax is strictly UNKNOWN (not fabricated)');
  assert(phys.lthr === null, 'LTHR is strictly UNKNOWN (not fabricated)');
  assert(phys.ftp_watts === null, 'FTP is strictly UNKNOWN (not fabricated)');
  assert(phys.vo2_max === null, 'VO2max is strictly UNKNOWN (not fabricated)');

  // 2. Injury History & Clinical Distinction Verification
  console.log('\n--- 2. Injury History & Diagnostic Boundaries ---');
  const injRes = await client.query('SELECT * FROM athlete_injuries WHERE user_id = $1 ORDER BY body_region', [DEFAULT_USER_ID]);
  assert(injRes.rows.length === 2, 'Exactly 2 distinct injury dossiers tracked', `Found: ${injRes.rows.length}`);

  const kneeInj = injRes.rows.find(i => i.body_region.toLowerCase().includes('knee'));
  const ankleInj = injRes.rows.find(i => i.body_region.toLowerCase().includes('ankle'));

  assert(ankleInj !== undefined, 'Right Ankle injury record exists');
  assert(ankleInj.side === 'RIGHT', 'Ankle side is RIGHT');
  assert(ankleInj.previous_swelling === true, 'Ankle previous swelling is TRUE (2 months)');
  assert(ankleInj.medical_evaluation_status === 'PENDING_CLINICAL_ASSESSMENT', 'Ankle status is PENDING_CLINICAL_ASSESSMENT');

  assert(kneeInj !== undefined, 'Bilateral Anterior Knees record exists');
  assert(kneeInj.side === 'BILATERAL', 'Knee side is BILATERAL');
  assert(kneeInj.medical_evaluation_status === 'PENDING_CLINICAL_ASSESSMENT', 'Knees status is PENDING_CLINICAL_ASSESSMENT');
  assert(!kneeInj.recovery_notes.includes('Diagnosed PFPS'), 'AI did NOT diagnose patellofemoral pain syndrome');

  // 3. Sport-Specific Readiness State Machine
  console.log('\n--- 3. Sport-Specific Training Readiness Engine ---');
  const readRes = await client.query('SELECT * FROM athlete_training_readiness WHERE user_id = $1 ORDER BY evaluated_at DESC LIMIT 1', [DEFAULT_USER_ID]);
  assert(readRes.rows.length === 1, 'Latest training readiness record exists');
  const r = readRes.rows[0];

  assert(r.athlete_status === 'ACTIVE_WITH_UNRESOLVED_SYMPTOMS', 'Athlete status is ACTIVE_WITH_UNRESOLVED_SYMPTOMS');
  assert(r.running_readiness === 'ON_HOLD', 'Running readiness is strictly ON_HOLD (impact contraindicated)');
  assert(r.cycling_readiness === 'CONDITIONAL', 'Cycling readiness is CONDITIONAL (asymmetric non-impact tolerance)');
  assert(r.medical_clearance === false, 'Medical clearance is FALSE');
  assert(r.automatic_progression_allowed === false, 'Automatic progressive overload is LOCKED');

  // 4. Empirical Cycling Response Check
  console.log('\n--- 4. Empirical Activity Response Telemetry ---');
  const respRes = await client.query('SELECT * FROM athlete_training_responses WHERE user_id = $1', [DEFAULT_USER_ID]);
  assert(respRes.rows.length >= 1, 'At least 1 post-activity check-in recorded');
  const rideResp = respRes.rows.find(res => res.sport_type === 'Ride');
  assert(rideResp !== undefined, '56.10 km ride response exists');
  assert(Number(rideResp.pain_during_activity) === 0, 'Pain during ride was 0');
  assert(Number(rideResp.pain_after_activity) === 0, 'Pain after ride was 0');
  assert(rideResp.swelling_observed === false, 'No swelling observed from 56.10 km ride');

  // 5. Audit Trail
  console.log('\n--- 5. Health Data Audit Trail ---');
  const auditRes = await client.query('SELECT * FROM health_audit_trail WHERE user_id = $1', [DEFAULT_USER_ID]);
  assert(auditRes.rows.length >= 1, 'Health modifications recorded in health_audit_trail');

  console.log('\n======================================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  await client.end();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

