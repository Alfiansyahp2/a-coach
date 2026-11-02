require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function formatDuration(seconds) {
  const s = Math.round(seconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const remainingSeconds = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }
  return `${minutes}:${pad(remainingSeconds)}`;
}

function computePRs(activities, userId) {
  const runs = activities.filter((a) => (a.sport_type || '').toLowerCase().includes('run'));
  const rides = activities.filter(
    (a) =>
      (a.sport_type || '').toLowerCase().includes('ride') ||
      (a.sport_type || '').toLowerCase().includes('cycl')
  );

  const prs = [];

  // 1. RUNNING
  // 1A. Fastest 5K
  const runs5k = runs.filter((r) => Number(r.distance_meters || 0) >= 4900);
  if (runs5k.length > 0) {
    const best5k = runs5k.reduce((best, cur) => {
      const bestPace = Number(best.moving_time_seconds) / (Number(best.distance_meters) / 1000);
      const curPace = Number(cur.moving_time_seconds) / (Number(cur.distance_meters) / 1000);
      return curPace < bestPace ? cur : best;
    });
    const distKm = Number(best5k.distance_meters) / 1000;
    const paceSec = Math.round(Number(best5k.moving_time_seconds) / distKm);
    const est5kSec = Math.round(paceSec * 5);
    prs.push({
      user_id: userId,
      activity_id: best5k.id,
      sport_type: 'Run',
      category: '5K Benchmark',
      record_value: est5kSec,
      record_display: formatDuration(est5kSec),
      achieved_date: best5k.start_date,
    });
  }

  // 1B. Fastest 10K
  const runs10k = runs.filter((r) => Number(r.distance_meters || 0) >= 9800);
  if (runs10k.length > 0) {
    const best10k = runs10k.reduce((best, cur) => {
      const bestPace = Number(best.moving_time_seconds) / (Number(best.distance_meters) / 1000);
      const curPace = Number(cur.moving_time_seconds) / (Number(cur.distance_meters) / 1000);
      return curPace < bestPace ? cur : best;
    });
    const distKm = Number(best10k.distance_meters) / 1000;
    const paceSec = Math.round(Number(best10k.moving_time_seconds) / distKm);
    const est10kSec = Math.round(paceSec * 10);
    prs.push({
      user_id: userId,
      activity_id: best10k.id,
      sport_type: 'Run',
      category: '10K Benchmark',
      record_value: est10kSec,
      record_display: formatDuration(est10kSec),
      achieved_date: best10k.start_date,
    });
  }

  // 1C. Longest Run
  if (runs.length > 0) {
    const longestRun = runs.reduce((best, cur) =>
      Number(cur.distance_meters || 0) > Number(best.distance_meters || 0) ? cur : best
    );
    const km = Number(longestRun.distance_meters || 0) / 1000;
    prs.push({
      user_id: userId,
      activity_id: longestRun.id,
      sport_type: 'Run',
      category: 'Longest Run',
      record_value: Number(longestRun.distance_meters),
      record_display: `${km.toFixed(2)} km`,
      achieved_date: longestRun.start_date,
    });
  }

  // 1D. Best Aerobic Pace
  if (runs5k.length > 0) {
    const bestPaceRun = runs5k.reduce((best, cur) => {
      const bestPace = Number(best.moving_time_seconds) / (Number(best.distance_meters) / 1000);
      const curPace = Number(cur.moving_time_seconds) / (Number(cur.distance_meters) / 1000);
      return curPace < bestPace ? cur : best;
    });
    const paceSec = Math.round(
      Number(bestPaceRun.moving_time_seconds) / (Number(bestPaceRun.distance_meters) / 1000)
    );
    const min = Math.floor(paceSec / 60);
    const sec = paceSec % 60;
    prs.push({
      user_id: userId,
      activity_id: bestPaceRun.id,
      sport_type: 'Run',
      category: 'Best Aerobic Pace',
      record_value: paceSec,
      record_display: `${min}:${sec < 10 ? '0' : ''}${sec} /km`,
      achieved_date: bestPaceRun.start_date,
    });
  }

  // 2. CYCLING / RIDE
  // 2A. Longest Ride
  if (rides.length > 0) {
    const longestRide = rides.reduce((best, cur) =>
      Number(cur.distance_meters || 0) > Number(best.distance_meters || 0) ? cur : best
    );
    const km = Number(longestRide.distance_meters || 0) / 1000;
    prs.push({
      user_id: userId,
      activity_id: longestRide.id,
      sport_type: 'Ride',
      category: 'Longest Ride',
      record_value: Number(longestRide.distance_meters),
      record_display: `${km.toFixed(2)} km`,
      achieved_date: longestRide.start_date,
    });
  }

  // 2B. Fastest Speed (>= 20K)
  const rides20k = rides.filter((r) => Number(r.distance_meters || 0) >= 20000);
  if (rides20k.length > 0) {
    const fastestRide = rides20k.reduce((best, cur) => {
      const bestKmh =
        Number(best.distance_meters) / 1000 / (Number(best.moving_time_seconds) / 3600);
      const curKmh =
        Number(cur.distance_meters) / 1000 / (Number(cur.moving_time_seconds) / 3600);
      return curKmh > bestKmh ? cur : best;
    });
    const speedKmh =
      Number(fastestRide.distance_meters) /
      1000 /
      (Number(fastestRide.moving_time_seconds) / 3600);
    prs.push({
      user_id: userId,
      activity_id: fastestRide.id,
      sport_type: 'Ride',
      category: 'Fastest Speed (≥20K)',
      record_value: Math.round(speedKmh * 10) / 10,
      record_display: `${(Math.round(speedKmh * 10) / 10).toFixed(1)} km/h`,
      achieved_date: fastestRide.start_date,
    });
  }

  // 2C. Max Elevation Climb
  if (rides.length > 0) {
    const maxElevRide = rides.reduce((best, cur) =>
      Number(cur.elevation_gain_meters || 0) > Number(best.elevation_gain_meters || 0)
        ? cur
        : best
    );
    const elev = Math.round(Number(maxElevRide.elevation_gain_meters || 0));
    prs.push({
      user_id: userId,
      activity_id: maxElevRide.id,
      sport_type: 'Ride',
      category: 'Max Elevation Climb',
      record_value: elev,
      record_display: `▲ ${elev} m`,
      achieved_date: maxElevRide.start_date,
    });
  }

  // 2D. 40K+ Endurance Ride
  const rides40k = rides.filter((r) => Number(r.distance_meters || 0) >= 40000);
  if (rides40k.length > 0) {
    const best40k = rides40k.reduce((best, cur) => {
      const bestKmh =
        Number(best.distance_meters) / 1000 / (Number(best.moving_time_seconds) / 3600);
      const curKmh =
        Number(cur.distance_meters) / 1000 / (Number(cur.moving_time_seconds) / 3600);
      return curKmh > bestKmh ? cur : best;
    });
    const distKm = Number(best40k.distance_meters) / 1000;
    const durSec = Number(best40k.moving_time_seconds);
    const kmh = distKm / (durSec / 3600);
    prs.push({
      user_id: userId,
      activity_id: best40k.id,
      sport_type: 'Ride',
      category: '40K+ Endurance Ride',
      record_value: Math.round(distKm * 10) / 10,
      record_display: `${distKm.toFixed(1)} km @ ${kmh.toFixed(1)} km/h`,
      achieved_date: best40k.start_date,
    });
  }

  return prs;
}

async function main() {
  const userId = '00000000-0000-0000-0000-000000000001';
  const activitiesPath = path.join(__dirname, '..', 'data', 'imported_activities.json');
  const activities = JSON.parse(fs.readFileSync(activitiesPath, 'utf8'));

  const prs = computePRs(activities, userId);
  console.log(`Computed ${prs.length} Ground-Truth Multi-Sport Personal Records:`);
  prs.forEach((pr) => {
    console.log(
      `  [${pr.sport_type}] ${pr.category.padEnd(24)}: ${pr.record_display.padEnd(14)} (${new Date(pr.achieved_date).toISOString().split('T')[0]}) -> Act: ${pr.activity_id}`
    );
  });

  if (process.env.DATABASE_URL) {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    // Ensure sport_type column exists
    await client.query(`
      ALTER TABLE personal_records ADD COLUMN IF NOT EXISTS sport_type VARCHAR(20) DEFAULT 'Run';
    `);

    // Clean up old unlinked dummy PRs
    await client.query(`DELETE FROM personal_records WHERE user_id = $1;`, [userId]);

    // Insert computed genuine PRs
    for (const pr of prs) {
      await client.query(
        `
        INSERT INTO personal_records (
          user_id, activity_id, sport_type, category, record_value, record_display, achieved_date, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (user_id, category) DO UPDATE SET
          activity_id = EXCLUDED.activity_id,
          sport_type = EXCLUDED.sport_type,
          record_value = EXCLUDED.record_value,
          record_display = EXCLUDED.record_display,
          achieved_date = EXCLUDED.achieved_date,
          updated_at = NOW();
      `,
        [
          userId,
          pr.activity_id,
          pr.sport_type,
          pr.category,
          pr.record_value,
          pr.record_display,
          pr.achieved_date,
        ]
      );
    }

    console.log(`✅ Successfully synced ${prs.length} multi-sport PRs to PostgreSQL database!`);
    await client.end();
  }

  // Also sync to .data/store.json if exists
  const storePath = path.join(__dirname, '..', '.data', 'store.json');
  if (fs.existsSync(storePath)) {
    try {
      const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      store.personal_records = prs.map((pr, i) => ({
        ...pr,
        id: `pr-ground-truth-${i + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
      console.log(`✅ Also updated .data/store.json with ${prs.length} PRs.`);
    } catch (e) {
      console.warn('Could not update .data/store.json:', e.message);
    }
  }
}

main().catch(console.error);

