// Verification test suite for Athlete Health & Readiness system
// Supports both General Synthetic Seed and Private Personal User Seed
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envCandidates = [
  path.resolve(process.cwd(), '.env.local'),
  path.join(__dirname, '..', '.env.local'),
  path.join(__dirname, '..', '..', '.env.local'),
];
const envLocalPath = envCandidates.find((p) => fs.existsSync(p)) || envCandidates[0];
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
  assert(Number(p.age) >= 20 && Number(p.age) <= 50, 'Athlete age is calibrated', `Actual: ${p.age}`);
  assert(Number(p.height_cm) >= 150.0 && Number(p.height_cm) <= 200.0, 'Athlete height is valid', `Actual: ${p.height_cm}`);
  assert(Number(p.weight_kg) >= 50.0 && Number(p.weight_kg) <= 100.0, 'Athlete weight is valid', `Actual: ${p.weight_kg}`);
  assert(Number(p.bmi) >= 18.0 && Number(p.bmi) <= 30.0, 'BMI is calculated and valid', `Actual: ${p.bmi}`);
  assert(Number(p.resting_heart_rate) >= 40 && Number(p.resting_heart_rate) <= 90, 'Resting heart rate is recorded', `Actual: ${p.resting_heart_rate}`);
  assert(p.training_days_per_week >= 3 && p.training_days_per_week <= 6, 'Training availability is configured', `Actual: ${p.training_days_per_week}`);

  const phys = typeof p.physiological_measurements === 'string' ? JSON.parse(p.physiological_measurements) : p.physiological_measurements;
  assert(phys.hr_max === null, 'HRmax is strictly UNKNOWN (not fabricated)');
  assert(phys.lthr === null, 'LTHR is strictly UNKNOWN (not fabricated)');
  assert(phys.ftp_watts === null, 'FTP is strictly UNKNOWN (not fabricated)');
  assert(phys.vo2_max === null, 'VO2max is strictly UNKNOWN (not fabricated)');

  // 2. Injury History & Clinical Distinction Verification
  console.log('\n--- 2. Injury History & Diagnostic Boundaries ---');
  const injRes = await client.query('SELECT * FROM athlete_injuries WHERE user_id = $1 ORDER BY body_region', [DEFAULT_USER_ID]);
  assert(injRes.rows.length >= 2, 'At least 2 distinct injury dossiers tracked', `Found: ${injRes.rows.length}`);

  const inj1 = injRes.rows[0];
  const inj2 = injRes.rows[1];

  assert(inj1 !== undefined, 'First clinical injury record exists');
  assert(['LEFT', 'RIGHT', 'BILATERAL', 'AXIAL'].includes(inj1.side), 'First injury side is clinically documented', `Side: ${inj1.side}`);
  assert(inj1.medical_evaluation_status === 'PENDING_CLINICAL_ASSESSMENT', 'First injury status is PENDING_CLINICAL_ASSESSMENT');

  assert(inj2 !== undefined, 'Second clinical injury record exists');
  assert(['LEFT', 'RIGHT', 'BILATERAL', 'AXIAL'].includes(inj2.side), 'Second injury side is clinically documented', `Side: ${inj2.side}`);
  assert(inj2.medical_evaluation_status === 'PENDING_CLINICAL_ASSESSMENT', 'Second injury status is PENDING_CLINICAL_ASSESSMENT');
  assert(!injRes.rows.some(i => (i.recovery_notes || '').includes('Diagnosed PFPS')), 'AI did NOT diagnose patellofemoral pain syndrome');

  // 3. Sport-Specific Readiness State Machine
  console.log('\n--- 3. Sport-Specific Training Readiness Engine ---');
  const readRes = await client.query('SELECT * FROM athlete_training_readiness WHERE user_id = $1 ORDER BY evaluated_at DESC LIMIT 1', [DEFAULT_USER_ID]);
  assert(readRes.rows.length === 1, 'Latest training readiness record exists');
  const r = readRes.rows[0];

  assert(r.athlete_status === 'ACTIVE_WITH_UNRESOLVED_SYMPTOMS', 'Athlete status is ACTIVE_WITH_UNRESOLVED_SYMPTOMS');
  assert(['ON_HOLD', 'CONDITIONAL'].includes(r.running_readiness), 'Running readiness is safeguarded (ON_HOLD or CONDITIONAL)');
  assert(['CONDITIONAL', 'READY'].includes(r.cycling_readiness), 'Cycling readiness permits monitored training');
  assert(r.medical_clearance === false, 'Medical clearance is FALSE');
  assert(r.automatic_progression_allowed === false, 'Automatic progressive overload is LOCKED');

  // 4. Empirical Cycling Response Check
  console.log('\n--- 4. Empirical Activity Response Telemetry ---');
  const respRes = await client.query('SELECT * FROM athlete_training_responses WHERE user_id = $1', [DEFAULT_USER_ID]);
  assert(respRes.rows.length >= 1, 'At least 1 post-activity check-in recorded');
  const rideResp = respRes.rows.find(res => res.sport_type === 'Ride');
  assert(rideResp !== undefined, 'Aerobic ride check-in response exists');
  assert(Number(rideResp.pain_during_activity) === 0, 'Pain during ride was 0');
  assert(Number(rideResp.pain_after_activity) === 0, 'Pain after ride was 0');
  assert(rideResp.swelling_observed === false, 'No swelling observed from foundation ride');

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
