// Migration script: apply athlete health & readiness schema to PostgreSQL
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read database URL from .env.local
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

if (!dbUrl) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl });

async function runMigration() {
  await client.connect();
  console.log('Connected to PostgreSQL:', dbUrl.replace(/:[^:@]+@/, ':****@'));

  const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');

  // Execute entire schema.sql
  await client.query(schemaSql);
  console.log('✅ schema.sql executed successfully!');

  // Verify created health tables
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN (
        'athlete_profiles',
        'athlete_injuries',
        'athlete_pain_logs',
        'athlete_training_responses',
        'athlete_medical_assessments',
        'athlete_training_readiness',
        'health_audit_trail'
      )
    ORDER BY table_name;
  `);

  console.log('Verified Health Tables in PostgreSQL:');
  console.table(res.rows);

  await client.end();
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

