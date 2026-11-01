import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  StravaConnection,
  StravaToken,
  Activity,
  ScheduledWorkout,
  WorkoutActivityMatch,
  FitnessGoal,
  PersonalRecord,
  SyncLog,
} from '@/types';

// Detect whether PostgreSQL is enabled
const databaseUrl = process.env.DATABASE_URL;
let pgPool: Pool | null = null;

if (databaseUrl && databaseUrl.trim().length > 0) {
  try {
    pgPool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  } catch (err) {
    console.warn('Failed to initialize PostgreSQL pool, falling back to local store:', err);
    pgPool = null;
  }
}

// Local File Store for fallback / instant development
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', '.data') : path.join(process.cwd(), '.data');
let memoryStore: LocalStoreSchema | null = null;
const DATA_FILE = path.join(DATA_DIR, 'store.json');

interface LocalStoreSchema {
  users: User[];
  strava_connections: StravaConnection[];
  strava_tokens: StravaToken[];
  activities: Activity[];
  scheduled_workouts: ScheduledWorkout[];
  workout_activity_matches: WorkoutActivityMatch[];
  fitness_goals: FitnessGoal[];
  personal_records: PersonalRecord[];
  sync_logs: SyncLog[];
}

function ensureLocalStore(): LocalStoreSchema {
  if (memoryStore) return memoryStore;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    // Generate initial athlete data for immediate usability
    const defaultUserId = '00000000-0000-0000-0000-000000000001';
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Helper to get relative date
    const getRelDate = (offsetDays: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    const initialStore: LocalStoreSchema = {
      users: [
        {
          id: defaultUserId,
          email: 'athlete@protraining.internal',
          name: 'Apex Athlete',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          weight_kg: 65.0,
          height_cm: 170.0,
          resting_heart_rate: 68,
          max_heart_rate: 188,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      strava_connections: [],
      strava_tokens: [],
      activities: (() => {
        try {
          const importedPath = path.join(process.cwd(), 'data', 'imported_activities.json');
          if (fs.existsSync(importedPath)) {
            const raw = JSON.parse(fs.readFileSync(importedPath, 'utf8'));
            return raw.map((a: any, idx: number) => ({
              ...a,
              id: a.id || `act-imported-${idx + 1}`,
              user_id: defaultUserId,
            }));
          }
        } catch {}
        return [];
      })(),
      scheduled_workouts: [
        {
          id: 'wo-001',
          user_id: defaultUserId,
          plan_id: null,
          scheduled_date: getRelDate(-1),
          workout_category: 'Tempo Run',
          target_distance_meters: 10000,
          target_duration_seconds: 3000, // 50 mins -> 5:00 min/km
          target_pace_seconds_per_km: 300,
          target_intensity: 'Threshold / Zone 4',
          description: '2km warmup, 6km at 4:55-5:00, 2km cooldown',
          status: 'COMPLETED',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'wo-002',
          user_id: defaultUserId,
          plan_id: null,
          scheduled_date: getRelDate(0),
          workout_category: 'Easy Run',
          target_distance_meters: 7000,
          target_duration_seconds: 2310, // 38m30s -> 5:30 min/km
          target_pace_seconds_per_km: 330,
          target_intensity: 'Zone 2 Aerobic',
          description: 'Comfortable conversation pace. Focus on high cadence.',
          status: 'PLANNED',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'wo-003',
          user_id: defaultUserId,
          plan_id: null,
          scheduled_date: getRelDate(2),
          workout_category: 'Interval Training',
          target_distance_meters: 8000,
          target_duration_seconds: 2400,
          target_pace_seconds_per_km: 270, // 4:30 min/km intervals
          target_intensity: 'VO2 Max / Zone 5',
          description: '5 x 1000m repeats with 90s jog recovery',
          status: 'PLANNED',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'wo-004',
          user_id: defaultUserId,
          plan_id: null,
          scheduled_date: getRelDate(3),
          workout_category: 'Rest Day',
          target_distance_meters: 0,
          target_duration_seconds: 0,
          target_pace_seconds_per_km: null,
          target_intensity: 'Active Recovery',
          description: 'Foam rolling, mobility work, and complete muscle rest.',
          status: 'PLANNED',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'wo-005',
          user_id: defaultUserId,
          plan_id: null,
          scheduled_date: getRelDate(5),
          workout_category: 'Long Run',
          target_distance_meters: 21097,
          target_duration_seconds: 6600, // 1h 50m
          target_pace_seconds_per_km: 312, // 5:12 min/km
          target_intensity: 'Aerobic Base',
          description: 'Half marathon simulation run. Test nutrition at 7k and 14k.',
          status: 'PLANNED',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      workout_activity_matches: [],
      fitness_goals: [
        {
          id: 'goal-001',
          user_id: defaultUserId,
          title: 'Monthly Mileage Target (150 KM)',
          goal_type: 'DISTANCE_MONTHLY',
          target_value: 150000,
          current_value: 84200,
          start_date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
          target_date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-28`,
          is_achieved: false,
          unit: 'km',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'goal-002',
          user_id: defaultUserId,
          title: 'Consistency: 4 Sessions / Week',
          goal_type: 'FREQUENCY_WEEKLY',
          target_value: 4,
          current_value: 3,
          start_date: todayStr,
          target_date: getRelDate(7),
          is_achieved: false,
          unit: 'sessions',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      personal_records: [
        {
          id: 'pr-001',
          user_id: defaultUserId,
          activity_id: 'act-001',
          category: '5K',
          record_value: 1260, // 21:00
          record_display: '21:00',
          achieved_date: `${getRelDate(-15)}T08:00:00Z`,
          created_at: new Date().toISOString(),
        },
        {
          id: 'pr-002',
          user_id: defaultUserId,
          activity_id: 'act-001',
          category: '10K',
          record_value: 2685, // 44:45
          record_display: '44:45',
          achieved_date: `${getRelDate(-30)}T07:30:00Z`,
          created_at: new Date().toISOString(),
        },
        {
          id: 'pr-003',
          user_id: defaultUserId,
          activity_id: 'act-003',
          category: 'Longest Distance',
          record_value: 21100, // 21.1 km
          record_display: '21.10 km',
          achieved_date: `${getRelDate(-45)}T06:00:00Z`,
          created_at: new Date().toISOString(),
        },
      ],
      sync_logs: [],
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(initialStore, null, 2), 'utf8');
    return initialStore;
  }

  const content = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading local store:', err);
    return {
      users: [],
      strava_connections: [],
      strava_tokens: [],
      activities: [],
      scheduled_workouts: [],
      workout_activity_matches: [],
      fitness_goals: [],
      personal_records: [],
      sync_logs: [],
    };
  }
}

function saveLocalStore(data: LocalStoreSchema) {
  memoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    // In serverless environments, in-memory store retains state
  }
}

// =====================================================================
// UNIFIED DATA LAYER API
// =====================================================================

export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function getUser(userId: string = DEFAULT_USER_ID): Promise<User | null> {
  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (!res.rows[0]) return null;
    const row = res.rows[0];
    return {
      ...row,
      weight_kg: row.weight_kg !== null && row.weight_kg !== undefined ? Number(row.weight_kg) : 65.0,
      height_cm: row.height_cm !== null && row.height_cm !== undefined ? Number(row.height_cm) : 170.0,
      resting_heart_rate: row.resting_heart_rate !== null && row.resting_heart_rate !== undefined ? Number(row.resting_heart_rate) : 68,
      max_heart_rate: row.max_heart_rate !== null && row.max_heart_rate !== undefined ? Number(row.max_heart_rate) : 188,
    };
  }
  const store = ensureLocalStore();
  const user = store.users.find((u) => u.id === userId) || store.users[0] || null;
  if (!user) return null;
  return {
    ...user,
    weight_kg: user.weight_kg !== undefined ? Number(user.weight_kg) : 65.0,
    height_cm: user.height_cm !== undefined ? Number(user.height_cm) : 170.0,
    resting_heart_rate: user.resting_heart_rate !== undefined ? Number(user.resting_heart_rate) : 68,
    max_heart_rate: user.max_heart_rate !== undefined ? Number(user.max_heart_rate) : 188,
  };
}

export async function getStravaConnection(userId: string = DEFAULT_USER_ID): Promise<StravaConnection | null> {
  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM strava_connections WHERE user_id = $1 AND is_active = true', [userId]);
    return res.rows[0] || null;
  }
  const store = ensureLocalStore();
  return store.strava_connections.find((c) => c.user_id === userId && c.is_active) || null;
}

export async function saveStravaConnection(
  userId: string,
  athlete: { id: number; firstname?: string; lastname?: string; username?: string; profile?: string },
  scopes: string[]
): Promise<StravaConnection> {
  const athleteName = [athlete.firstname, athlete.lastname].filter(Boolean).join(' ') || athlete.username || 'Strava Athlete';
  const now = new Date().toISOString();

  if (pgPool) {
    const query = `
      INSERT INTO strava_connections (user_id, strava_athlete_id, athlete_name, athlete_username, avatar_url, scopes, is_active, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        strava_athlete_id = EXCLUDED.strava_athlete_id,
        athlete_name = EXCLUDED.athlete_name,
        athlete_username = EXCLUDED.athlete_username,
        avatar_url = EXCLUDED.avatar_url,
        scopes = EXCLUDED.scopes,
        is_active = true,
        updated_at = NOW()
      RETURNING *;
    `;
    const res = await pgPool.query(query, [userId, athlete.id, athleteName, athlete.username || null, athlete.profile || null, scopes]);
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const existingIdx = store.strava_connections.findIndex((c) => c.user_id === userId);
  const conn: StravaConnection = {
    id: existingIdx >= 0 ? store.strava_connections[existingIdx].id : crypto.randomUUID(),
    user_id: userId,
    strava_athlete_id: athlete.id,
    athlete_name: athleteName,
    athlete_username: athlete.username,
    avatar_url: athlete.profile,
    scopes,
    is_active: true,
    created_at: existingIdx >= 0 ? store.strava_connections[existingIdx].created_at : now,
    updated_at: now,
  };

  if (existingIdx >= 0) {
    store.strava_connections[existingIdx] = conn;
  } else {
    store.strava_connections.push(conn);
  }
  saveLocalStore(store);
  return conn;
}

export async function disconnectStrava(userId: string = DEFAULT_USER_ID): Promise<void> {
  if (pgPool) {
    await pgPool.query('UPDATE strava_connections SET is_active = false WHERE user_id = $1', [userId]);
    return;
  }
  const store = ensureLocalStore();
  const conn = store.strava_connections.find((c) => c.user_id === userId);
  if (conn) {
    conn.is_active = false;
    conn.updated_at = new Date().toISOString();
    saveLocalStore(store);
  }
}

export async function saveStravaTokens(
  connectionId: string,
  accessTokenEncrypted: string,
  refreshTokenEncrypted: string,
  expiresAt: string
): Promise<StravaToken> {
  const now = new Date().toISOString();
  if (pgPool) {
    const query = `
      INSERT INTO strava_tokens (connection_id, access_token_encrypted, refresh_token_encrypted, expires_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (connection_id) DO UPDATE SET
        access_token_encrypted = EXCLUDED.access_token_encrypted,
        refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
      RETURNING *;
    `;
    const res = await pgPool.query(query, [connectionId, accessTokenEncrypted, refreshTokenEncrypted, expiresAt]);
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const existingIdx = store.strava_tokens.findIndex((t) => t.connection_id === connectionId);
  const token: StravaToken = {
    id: existingIdx >= 0 ? store.strava_tokens[existingIdx].id : crypto.randomUUID(),
    connection_id: connectionId,
    access_token_encrypted: accessTokenEncrypted,
    refresh_token_encrypted: refreshTokenEncrypted,
    expires_at: expiresAt,
    created_at: existingIdx >= 0 ? store.strava_tokens[existingIdx].created_at : now,
    updated_at: now,
  };

  if (existingIdx >= 0) {
    store.strava_tokens[existingIdx] = token;
  } else {
    store.strava_tokens.push(token);
  }
  saveLocalStore(store);
  return token;
}

export async function getStravaToken(connectionId: string): Promise<StravaToken | null> {
  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM strava_tokens WHERE connection_id = $1', [connectionId]);
    return res.rows[0] || null;
  }
  const store = ensureLocalStore();
  return store.strava_tokens.find((t) => t.connection_id === connectionId) || null;
}

export function normalizeActivityRow(row: any): Activity {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    strava_activity_id: Number(row.strava_activity_id),
    name: String(row.name || ''),
    sport_type: String(row.sport_type || 'Run'),
    start_date:
      row.start_date instanceof Date
        ? row.start_date.toISOString()
        : typeof row.start_date === 'string'
          ? row.start_date
          : String(row.start_date || ''),
    distance_meters: Number(row.distance_meters || 0),
    moving_time_seconds: Number(row.moving_time_seconds || 0),
    elapsed_time_seconds: Number(row.elapsed_time_seconds || 0),
    elevation_gain_meters: Number(row.elevation_gain_meters || 0),
    average_speed_mps: Number(row.average_speed_mps || 0),
    max_speed_mps: row.max_speed_mps != null ? Number(row.max_speed_mps) : undefined,
    average_heartrate: row.average_heartrate != null ? Number(row.average_heartrate) : null,
    max_heartrate: row.max_heartrate != null ? Number(row.max_heartrate) : null,
    average_cadence: row.average_cadence != null ? Number(row.average_cadence) : null,
    average_watts: row.average_watts != null ? Number(row.average_watts) : null,
    calories: row.calories != null ? Number(row.calories) : null,
    raw_summary_polyline: row.raw_summary_polyline || null,
    description: row.description || null,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : typeof row.created_at === 'string'
          ? row.created_at
          : String(row.created_at || ''),
    updated_at:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : typeof row.updated_at === 'string'
          ? row.updated_at
          : String(row.updated_at || ''),
  };
}


export async function getActivityById(
  id: string,
  userId: string = DEFAULT_USER_ID
): Promise<Activity | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM activities WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!res.rows[0]) return null;
    return normalizeActivityRow(res.rows[0]);
  }

  const store = ensureLocalStore();
  const act = store.activities.find((a) => a.id === id && a.user_id === userId);
  return act ? normalizeActivityRow(act) : null;
}


export async function getAdjacentActivities(
  currentId: string,
  userId: string = DEFAULT_USER_ID
): Promise<{ prev: Activity | null; next: Activity | null }> {
  const all = await getActivities(userId);
  const idx = all.findIndex((a) => a.id === currentId);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export async function getActivities(
  userId: string = DEFAULT_USER_ID,
  filters?: { sportType?: string; limit?: number; afterDate?: string }
): Promise<Activity[]> {
  if (pgPool) {
    let query = 'SELECT * FROM activities WHERE user_id = $1';
    const params: any[] = [userId];

    if (filters?.sportType && filters.sportType !== 'All') {
      params.push(filters.sportType);
      query += ` AND sport_type = $${params.length}`;
    }
    if (filters?.afterDate) {
      params.push(filters.afterDate);
      query += ` AND start_date >= $${params.length}`;
    }
    query += ' ORDER BY start_date DESC';
    if (filters?.limit) {
      params.push(filters.limit);
      query += ` LIMIT $${params.length}`;
    }
    const res = await pgPool.query(query, params);
    return res.rows.map(normalizeActivityRow);
  }

  const store = ensureLocalStore();
  let acts = store.activities.filter((a) => a.user_id === userId);
  if (filters?.sportType && filters.sportType !== 'All') {
    acts = acts.filter((a) => a.sport_type.toLowerCase() === filters.sportType?.toLowerCase());
  }
  if (filters?.afterDate) {
    const target = new Date(filters.afterDate).getTime();
    acts = acts.filter((a) => new Date(a.start_date).getTime() >= target);
  }
  acts.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  if (filters?.limit) {
    acts = acts.slice(0, filters.limit);
  }
  return acts.map(normalizeActivityRow);
}

export interface UpsertActivityResult {
  activity: Activity;
  isCreated: boolean;
}

export async function upsertActivity(
  activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>
): Promise<UpsertActivityResult> {
  const now = new Date().toISOString();
  if (pgPool) {
    const query = `
      INSERT INTO activities (
        user_id, strava_activity_id, name, sport_type, start_date, distance_meters,
        moving_time_seconds, elapsed_time_seconds, elevation_gain_meters, average_speed_mps,
        max_speed_mps, average_heartrate, max_heartrate, average_cadence, average_watts,
        calories, raw_summary_polyline, description, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
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
        description = EXCLUDED.description,
        updated_at = NOW()
      RETURNING *, (xmax = 0) AS is_created;
    `;
    const res = await pgPool.query(query, [
      activity.user_id,
      activity.strava_activity_id,
      activity.name,
      activity.sport_type,
      activity.start_date,
      activity.distance_meters,
      activity.moving_time_seconds,
      activity.elapsed_time_seconds,
      activity.elevation_gain_meters,
      activity.average_speed_mps,
      activity.max_speed_mps || null,
      activity.average_heartrate || null,
      activity.max_heartrate || null,
      activity.average_cadence || null,
      activity.average_watts || null,
      activity.calories || null,
      activity.raw_summary_polyline || null,
      activity.description || null,
    ]);
    const row = res.rows[0];
    return {
      activity: normalizeActivityRow(row),
      isCreated: Boolean(row.is_created),
    };
  }

  const store = ensureLocalStore();
  const existingIdx = store.activities.findIndex((a) => a.strava_activity_id === activity.strava_activity_id);
  const isCreated = existingIdx < 0;
  const act: Activity = {
    ...activity,
    id: existingIdx >= 0 ? store.activities[existingIdx].id : crypto.randomUUID(),
    created_at: existingIdx >= 0 ? store.activities[existingIdx].created_at : now,
    updated_at: now,
  };

  if (existingIdx >= 0) {
    store.activities[existingIdx] = act;
  } else {
    store.activities.push(act);
  }
  saveLocalStore(store);
  return {
    activity: normalizeActivityRow(act),
    isCreated,
  };
}

export async function getLatestActivityDate(userId: string = DEFAULT_USER_ID): Promise<string | null> {
  if (pgPool) {
    const res = await pgPool.query('SELECT MAX(start_date) as max_date FROM activities WHERE user_id = $1', [userId]);
    const maxDate = res.rows[0]?.max_date;
    if (!maxDate) return null;
    return maxDate instanceof Date ? maxDate.toISOString() : String(maxDate);
  }

  const store = ensureLocalStore();
  const acts = store.activities.filter((a) => a.user_id === userId);
  if (acts.length === 0) return null;
  const sorted = [...acts].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  return sorted[0].start_date;
}

export async function getLastSyncLog(userId: string = DEFAULT_USER_ID): Promise<SyncLog | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM sync_logs WHERE user_id = $1 ORDER BY started_at DESC LIMIT 1',
      [userId]
    );
    if (!res.rows[0]) return null;
    const row = res.rows[0];
    return {
      ...row,
      activities_fetched: Number(row.activities_fetched || 0),
      activities_created: Number(row.activities_created || 0),
      activities_updated: Number(row.activities_updated || 0),
      started_at: row.started_at instanceof Date ? row.started_at.toISOString() : String(row.started_at),
      completed_at: row.completed_at instanceof Date ? row.completed_at.toISOString() : String(row.completed_at),
    };
  }

  const store = ensureLocalStore();
  const logs = store.sync_logs.filter((l) => l.user_id === userId);
  return logs[0] || null;
}

export async function getScheduledWorkouts(
  userId: string = DEFAULT_USER_ID,
  startDate?: string,
  endDate?: string
): Promise<ScheduledWorkout[]> {
  if (pgPool) {
    let query = 'SELECT * FROM scheduled_workouts WHERE user_id = $1';
    const params: any[] = [userId];

    if (startDate) {
      params.push(startDate);
      query += ` AND scheduled_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND scheduled_date <= $${params.length}`;
    }
    query += ' ORDER BY scheduled_date ASC';
    const res = await pgPool.query(query, params);
    return res.rows.map((row) => ({
      ...row,
      scheduled_date:
        row.scheduled_date instanceof Date
          ? row.scheduled_date.toISOString().split('T')[0]
          : typeof row.scheduled_date === 'string'
            ? row.scheduled_date.split('T')[0]
            : String(row.scheduled_date || ''),
    }));
  }

  const store = ensureLocalStore();
  let workouts = store.scheduled_workouts.filter((w) => w.user_id === userId);
  if (startDate) {
    workouts = workouts.filter((w) => w.scheduled_date >= startDate);
  }
  if (endDate) {
    workouts = workouts.filter((w) => w.scheduled_date <= endDate);
  }
  workouts.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
  return workouts;
}

export async function createScheduledWorkout(
  workout: Omit<ScheduledWorkout, 'id' | 'created_at' | 'updated_at'>
): Promise<ScheduledWorkout> {
  const now = new Date().toISOString();
  if (pgPool) {
    const query = `
      INSERT INTO scheduled_workouts (
        user_id, plan_id, scheduled_date, workout_category, target_distance_meters,
        target_duration_seconds, target_pace_seconds_per_km, target_intensity, description, status, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      workout.user_id,
      workout.plan_id || null,
      workout.scheduled_date,
      workout.workout_category,
      workout.target_distance_meters || null,
      workout.target_duration_seconds || null,
      workout.target_pace_seconds_per_km || null,
      workout.target_intensity || null,
      workout.description || null,
      workout.status || 'PLANNED',
    ]);
    const row = res.rows[0];
    return {
      ...row,
      scheduled_date:
        row.scheduled_date instanceof Date
          ? row.scheduled_date.toISOString().split('T')[0]
          : typeof row.scheduled_date === 'string'
            ? row.scheduled_date.split('T')[0]
            : String(row.scheduled_date || ''),
    };
  }

  const store = ensureLocalStore();
  const created: ScheduledWorkout = {
    ...workout,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  store.scheduled_workouts.push(created);
  saveLocalStore(store);
  return created;
}

export async function updateScheduledWorkout(
  id: string,
  updates: Partial<ScheduledWorkout>
): Promise<ScheduledWorkout | null> {
  const now = new Date().toISOString();
  if (pgPool) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (['id', 'created_at', 'user_id'].includes(key)) continue;
      fields.push(`${key} = $${idx++}`);
      values.push(val);
    }
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE scheduled_workouts SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await pgPool.query(query, values);
    return res.rows[0] || null;
  }

  const store = ensureLocalStore();
  const idx = store.scheduled_workouts.findIndex((w) => w.id === id);
  if (idx < 0) return null;

  store.scheduled_workouts[idx] = {
    ...store.scheduled_workouts[idx],
    ...updates,
    updated_at: now,
  };
  saveLocalStore(store);
  return store.scheduled_workouts[idx];
}

export async function deleteScheduledWorkout(id: string): Promise<boolean> {
  if (pgPool) {
    const res = await pgPool.query('DELETE FROM scheduled_workouts WHERE id = $1', [id]);
    return (res.rowCount || 0) > 0;
  }

  const store = ensureLocalStore();
  const initialLen = store.scheduled_workouts.length;
  store.scheduled_workouts = store.scheduled_workouts.filter((w) => w.id !== id);
  store.workout_activity_matches = store.workout_activity_matches.filter((m) => m.workout_id !== id);
  saveLocalStore(store);
  return store.scheduled_workouts.length < initialLen;
}

export async function getWorkoutActivityMatches(userId: string = DEFAULT_USER_ID): Promise<WorkoutActivityMatch[]> {
  if (pgPool) {
    const query = `
      SELECT m.*, 
        row_to_json(w.*) as workout,
        row_to_json(a.*) as activity
      FROM workout_activity_matches m
      JOIN scheduled_workouts w ON m.workout_id = w.id
      JOIN activities a ON m.activity_id = a.id
      WHERE w.user_id = $1
      ORDER BY m.matched_at DESC;
    `;
    const res = await pgPool.query(query, [userId]);
    return res.rows.map((row) => ({
      ...row,
      completion_percentage: Number(row.completion_percentage || 0),
      distance_delta_meters: Number(row.distance_delta_meters || 0),
      duration_delta_seconds: Number(row.duration_delta_seconds || 0),
      pace_delta_seconds_per_km: Number(row.pace_delta_seconds_per_km || 0),
      matched_at:
        row.matched_at instanceof Date
          ? row.matched_at.toISOString()
          : typeof row.matched_at === 'string'
            ? row.matched_at
            : String(row.matched_at || ''),
      workout: row.workout
        ? {
          ...row.workout,
          scheduled_date:
            typeof row.workout.scheduled_date === 'string'
              ? row.workout.scheduled_date.split('T')[0]
              : String(row.workout.scheduled_date || ''),
        }
        : undefined,
      activity: row.activity ? normalizeActivityRow(row.activity) : undefined,
    }));
  }

  const store = ensureLocalStore();
  return store.workout_activity_matches
    .map((m) => ({
      ...m,
      workout: store.scheduled_workouts.find((w) => w.id === m.workout_id),
      activity: store.activities.find((a) => a.id === m.activity_id),
    }))
    .filter((m) => m.workout && m.workout.user_id === userId);
}

export async function saveWorkoutActivityMatch(
  match: Omit<WorkoutActivityMatch, 'id' | 'matched_at'>
): Promise<WorkoutActivityMatch> {
  const now = new Date().toISOString();
  if (pgPool) {
    const query = `
      INSERT INTO workout_activity_matches (
        workout_id, activity_id, is_manual_match, completion_percentage,
        distance_delta_meters, duration_delta_seconds, pace_delta_seconds_per_km, matched_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (workout_id) DO UPDATE SET
        activity_id = EXCLUDED.activity_id,
        is_manual_match = EXCLUDED.is_manual_match,
        completion_percentage = EXCLUDED.completion_percentage,
        distance_delta_meters = EXCLUDED.distance_delta_meters,
        duration_delta_seconds = EXCLUDED.duration_delta_seconds,
        pace_delta_seconds_per_km = EXCLUDED.pace_delta_seconds_per_km,
        matched_at = NOW()
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      match.workout_id,
      match.activity_id,
      match.is_manual_match,
      match.completion_percentage,
      match.distance_delta_meters,
      match.duration_delta_seconds,
      match.pace_delta_seconds_per_km,
    ]);
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const existingIdx = store.workout_activity_matches.findIndex((m) => m.workout_id === match.workout_id);
  const record: WorkoutActivityMatch = {
    ...match,
    id: existingIdx >= 0 ? store.workout_activity_matches[existingIdx].id : crypto.randomUUID(),
    matched_at: now,
  };

  if (existingIdx >= 0) {
    store.workout_activity_matches[existingIdx] = record;
  } else {
    store.workout_activity_matches.push(record);
  }
  saveLocalStore(store);
  return record;
}

export async function getFitnessGoals(userId: string = DEFAULT_USER_ID): Promise<FitnessGoal[]> {
  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM fitness_goals WHERE user_id = $1 ORDER BY target_date ASC', [userId]);
    return res.rows.map((row) => ({
      ...row,
      start_date:
        row.start_date instanceof Date
          ? row.start_date.toISOString().split('T')[0]
          : typeof row.start_date === 'string'
            ? row.start_date.split('T')[0]
            : String(row.start_date || ''),
      target_date:
        row.target_date instanceof Date
          ? row.target_date.toISOString().split('T')[0]
          : typeof row.target_date === 'string'
            ? row.target_date.split('T')[0]
            : String(row.target_date || ''),
    }));
  }
  const store = ensureLocalStore();
  return store.fitness_goals.filter((g) => g.user_id === userId);
}

export async function createFitnessGoal(goal: Omit<FitnessGoal, 'id' | 'created_at' | 'updated_at'>): Promise<FitnessGoal> {
  const now = new Date().toISOString();
  if (pgPool) {
    const query = `
      INSERT INTO fitness_goals (user_id, title, goal_type, target_value, current_value, start_date, target_date, is_achieved, unit, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      goal.user_id,
      goal.title,
      goal.goal_type,
      goal.target_value,
      goal.current_value,
      goal.start_date,
      goal.target_date,
      goal.is_achieved,
      goal.unit,
    ]);
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const created: FitnessGoal = {
    ...goal,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  store.fitness_goals.push(created);
  saveLocalStore(store);
  return created;
}

export async function getPersonalRecords(userId: string = DEFAULT_USER_ID): Promise<PersonalRecord[]> {
  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM personal_records WHERE user_id = $1 ORDER BY achieved_date DESC', [userId]);
    return res.rows;
  }
  const store = ensureLocalStore();
  return store.personal_records.filter((p) => p.user_id === userId);
}

export async function createSyncLog(log: Omit<SyncLog, 'id'>): Promise<SyncLog> {
  if (pgPool) {
    const query = `
      INSERT INTO sync_logs (user_id, status, activities_fetched, activities_created, activities_updated, error_message, started_at, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      log.user_id,
      log.status,
      log.activities_fetched,
      log.activities_created,
      log.activities_updated,
      log.error_message || null,
      log.started_at,
      log.completed_at,
    ]);
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const record: SyncLog = {
    ...log,
    id: crypto.randomUUID(),
  };
  store.sync_logs.unshift(record);
  saveLocalStore(store);
  return record;
}

export async function getDatabaseStatus(): Promise<{ type: 'PostgreSQL' | 'Local Store'; connected: boolean; info: string }> {
  if (pgPool) {
    try {
      const res = await pgPool.query('SELECT NOW() as current_time');
      return {
        type: 'PostgreSQL',
        connected: true,
        info: `Connected to PostgreSQL (${res.rows[0].current_time})`,
      };
    } catch (err: any) {
      return {
        type: 'PostgreSQL',
        connected: false,
        info: `Connection error: ${err.message}`,
      };
    }
  }
  return {
    type: 'Local Store',
    connected: true,
    info: 'Using file-backed atomic store (.data/store.json). Set DATABASE_URL to connect to PostgreSQL.',
  };
}
