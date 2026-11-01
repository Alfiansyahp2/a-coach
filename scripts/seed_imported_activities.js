require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function seedImportedActivities() {
  const activitiesPath = path.join(__dirname, '..', 'data', 'imported_activities.json');
  if (!fs.existsSync(activitiesPath)) {
    console.error('Error: data/imported_activities.json not found! Run python script first.');
    process.exit(1);
  }

  const activities = JSON.parse(fs.readFileSync(activitiesPath, 'utf8'));
  console.log(`Loaded ${activities.length} activities from data/imported_activities.json`);

  const userId = '00000000-0000-0000-0000-000000000001';

  // 1. Insert into PostgreSQL (if configured)
  if (process.env.DATABASE_URL) {
    try {
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      console.log('Connected to PostgreSQL:', process.env.DATABASE_URL);

      // Ensure user exists
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

      let insertedCount = 0;
      for (const act of activities) {
        const query = `
          INSERT INTO activities (
            id, user_id, strava_activity_id, name, sport_type, start_date,
            distance_meters, moving_time_seconds, elapsed_time_seconds, elevation_gain_meters,
            average_speed_mps, max_speed_mps, average_heartrate, max_heartrate,
            average_cadence, average_watts, calories, raw_summary_polyline, description, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
          ON CONFLICT (strava_activity_id) DO UPDATE SET
            name = EXCLUDED.name,
            sport_type = EXCLUDED.sport_type,
            start_date = EXCLUDED.start_date,
            distance_meters = EXCLUDED.distance_meters,
            moving_time_seconds = EXCLUDED.moving_time_seconds,
            elapsed_time_seconds = EXCLUDED.elapsed_time_seconds,
            elevation_gain_meters = EXCLUDED.elevation_gain_meters,
            average_speed_mps = EXCLUDED.average_speed_mps,
            max_speed_mps = EXCLUDED.max_speed_mps,
            average_heartrate = EXCLUDED.average_heartrate,
            max_heartrate = EXCLUDED.max_heartrate,
            average_cadence = EXCLUDED.average_cadence,
            average_watts = EXCLUDED.average_watts,
            calories = EXCLUDED.calories,
            raw_summary_polyline = EXCLUDED.raw_summary_polyline,
            description = EXCLUDED.description,
            updated_at = NOW();
        `;

        await client.query(query, [
          act.id,
          userId,
          act.strava_activity_id,
          act.name,
          act.sport_type,
          act.start_date,
          act.distance_meters,
          act.moving_time_seconds,
          act.elapsed_time_seconds,
          act.elevation_gain_meters,
          act.average_speed_mps,
          act.max_speed_mps || null,
          act.average_heartrate || null,
          act.max_heartrate || null,
          act.average_cadence || null,
          act.average_watts || null,
          act.calories || null,
          act.raw_summary_polyline || null,
          act.description || null,
        ]);
        insertedCount++;
      }

      // Record Sync Log entry in sync_logs
      await client.query(`
        INSERT INTO sync_logs (
          user_id, status, activities_fetched, activities_created, activities_updated, started_at, completed_at
        ) VALUES ($1, 'SUCCESS', $2, $2, 0, NOW() - INTERVAL '1 minute', NOW());
      `, [userId, insertedCount]);

      const totalDb = await client.query('SELECT COUNT(*) FROM activities WHERE user_id = $1', [userId]);
      console.log(`✅ Successfully seeded ${insertedCount} activities into PostgreSQL! (Total in DB: ${totalDb.rows[0].count})`);
      await client.end();
    } catch (dbErr) {
      console.warn('PostgreSQL insertion warning:', dbErr.message);
    }
  }

  // 2. Also update local store (.data/store.json)
  const dataDir = path.join(__dirname, '..', '.data');
  const storePath = path.join(dataDir, 'store.json');
  if (fs.existsSync(storePath)) {
    try {
      const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      store.activities = activities;
      store.sync_logs = store.sync_logs || [];
      store.sync_logs.unshift({
        id: 'sync-imported-' + Date.now(),
        user_id: userId,
        status: 'SUCCESS',
        activities_fetched: activities.length,
        activities_created: activities.length,
        activities_updated: 0,
        started_at: new Date(Date.now() - 60000).toISOString(),
        completed_at: new Date().toISOString(),
      });
      fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
      console.log(`✅ Also updated local store (.data/store.json) with ${activities.length} activities.`);
    } catch (fileErr) {
      console.warn('Could not update .data/store.json:', fileErr.message);
    }
  }

  console.log('🎉 Ingestion of Strava training materials completed successfully!');
}

seedImportedActivities();

