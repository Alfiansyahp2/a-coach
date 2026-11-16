const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function syncAll() {
  console.log('--- 1. SYNCING ATHLETE EQUIPMENT ACCUMULATED DISTANCES ---');
  // For each equipment, compute distance from activities of that sport
  const equipRes = await pool.query('SELECT * FROM athlete_equipment');
  for (const eq of equipRes.rows) {
    let sportFilter = "sport_type = $1";
    let params = [eq.sport_type];
    if (eq.sport_type === 'Ride') {
      sportFilter = "(sport_type ILIKE '%ride%' OR sport_type ILIKE '%cycl%')";
      params = [];
    } else if (eq.sport_type === 'Run') {
      sportFilter = "sport_type ILIKE '%run%'";
      params = [];
    }

    const distRes = await pool.query(
      `SELECT COALESCE(SUM(distance_meters), 0) as total_meters FROM activities WHERE ${sportFilter}`,
      params
    );
    const realMeters = Number(distRes.rows[0].total_meters);
    console.log(`Equipment: ${eq.name} (${eq.sport_type}) -> Old: ${(Number(eq.accumulated_distance_meters)/1000).toFixed(1)} km, New: ${(realMeters/1000).toFixed(1)} km`);

    await pool.query(
      'UPDATE athlete_equipment SET accumulated_distance_meters = $1, updated_at = NOW() WHERE id = $2',
      [realMeters, eq.id]
    );
  }

  console.log('\n--- 2. SYNCING FITNESS GOALS CURRENT VALUES ---');
  const goalsRes = await pool.query('SELECT * FROM fitness_goals');
  for (const g of goalsRes.rows) {
    let newCurrent = Number(g.current_value);
    if (g.title.toLowerCase().includes('100') || g.title.toLowerCase().includes('century')) {
      const maxRide = await pool.query("SELECT MAX(distance_meters) as meters FROM activities WHERE sport_type ILIKE '%ride%' OR sport_type ILIKE '%cycl%'");
      newCurrent = Math.round((Number(maxRide.rows[0].meters || 0) / 1000) * 10) / 10;
    } else if (g.title.toLowerCase().includes('marathon')) {
      const maxRun = await pool.query("SELECT MAX(distance_meters) as meters FROM activities WHERE sport_type ILIKE '%run%'");
      newCurrent = Math.round((Number(maxRun.rows[0].meters || 0) / 1000) * 10) / 10;
    } else if (g.title.toLowerCase().includes('akumulasi') || g.goal_type === 'DISTANCE_MONTHLY') {
      const sumDist = await pool.query("SELECT SUM(distance_meters) as meters FROM activities WHERE start_date >= $1", [g.start_date]);
      newCurrent = Math.round((Number(sumDist.rows[0].meters || 0) / 1000) * 10) / 10;
    }

    console.log(`Goal: ${g.title} -> Old: ${g.current_value}, New: ${newCurrent}`);
    await pool.query(
      'UPDATE fitness_goals SET current_value = $1, updated_at = NOW() WHERE id = $2',
      [newCurrent, g.id]
    );
  }

  console.log('\n--- 3. SYNCING PERSONAL RECORDS FROM ACTIVITIES ---');
  // 3A. Longest Ride
  const maxRide = await pool.query(
    "SELECT id, name, distance_meters, start_date FROM activities WHERE sport_type ILIKE '%ride%' OR sport_type ILIKE '%cycl%' ORDER BY distance_meters DESC LIMIT 1"
  );
  if (maxRide.rows.length > 0) {
    const row = maxRide.rows[0];
    const km = (Number(row.distance_meters) / 1000).toFixed(2);
    await pool.query(
      `UPDATE personal_records
       SET activity_id = $1, record_value = $2, record_display = $3, achieved_date = $4, updated_at = NOW()
       WHERE category = 'Longest Ride'`,
      [row.id, Number(row.distance_meters), `${km} km`, row.start_date]
    );
    console.log(`Updated Longest Ride to ${km} km (${row.name})`);

    // Also update 40K+ Endurance Ride to the top endurance activity
    await pool.query(
      `UPDATE personal_records
       SET activity_id = $1, record_value = $2, record_display = $3, achieved_date = $4, updated_at = NOW()
       WHERE category = '40K+ Endurance Ride'`,
      [row.id, Number(km), `${km} km`, row.start_date]
    );
    console.log(`Updated 40K+ Endurance Ride to ${km} km (${row.name})`);
  }

  const prRes = await pool.query("SELECT category, record_display, achieved_date FROM personal_records");
  console.log('All PRs in DB:', prRes.rows);

  await pool.end();
}

syncAll();
