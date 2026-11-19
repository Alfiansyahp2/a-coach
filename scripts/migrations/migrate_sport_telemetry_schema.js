// Migration script: apply sport_activity_telemetry table to PostgreSQL
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

if (!dbUrl) {
  console.log('No DATABASE_URL found, skipping PostgreSQL migration.');
  process.exit(0);
}

const client = new Client({ connectionString: dbUrl });

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL for Multi-Sport Telemetry Schema Migration...');

    const ddl = `
      CREATE TABLE IF NOT EXISTS sport_activity_telemetry (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sport_code VARCHAR(50) NOT NULL,
        session_timestamp TIMESTAMPTZ NOT NULL,
        duration_minutes INTEGER NOT NULL,
        session_rpe NUMERIC(3, 1) NOT NULL,
        telemetry_data JSONB NOT NULL DEFAULT '{}'::jsonb,
        agent_prescription JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sport_telemetry_user_code ON sport_activity_telemetry(user_id, sport_code, session_timestamp DESC);
    `;

    await client.query(ddl);
    console.log('✅ sport_activity_telemetry table successfully created or already exists in PostgreSQL!');

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'sport_activity_telemetry';
    `);
    console.log('Verified Tables:', res.rows.map((r) => r.table_name));
    await client.end();
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

runMigration();
