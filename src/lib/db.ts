import { Pool, types } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Prevent node-postgres from converting DATE (OID 1082) into JS Date with local timezone shift
types.setTypeParser(1082, (val: string) => val);

export function formatDateOnly(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'string') return val.split('T')[0];
  return String(val);
}
import {
  User,
  StravaConnection,
  StravaToken,
  Activity,
  TrainingPlan,
  ScheduledWorkout,
  WorkoutActivityMatch,
  FitnessGoal,
  PersonalRecord,
  SyncLog,
  AthleteProfile,
  AthleteInjury,
  AthletePainLog,
  AthleteTrainingResponse,
  AthleteMedicalAssessment,
  AthleteTrainingReadiness,
  HealthAuditTrail,
  AuthoritativeAthleteHealthContext,
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
  training_plans?: TrainingPlan[];
  scheduled_workouts: ScheduledWorkout[];
  workout_activity_matches: WorkoutActivityMatch[];
  fitness_goals: FitnessGoal[];
  personal_records: PersonalRecord[];
  sync_logs: SyncLog[];
  athlete_profiles: AthleteProfile[];
  athlete_injuries: AthleteInjury[];
  athlete_pain_logs: AthletePainLog[];
  athlete_training_responses: AthleteTrainingResponse[];
  athlete_medical_assessments: AthleteMedicalAssessment[];
  athlete_training_readiness: AthleteTrainingReadiness[];
  health_audit_trail: HealthAuditTrail[];
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
      scheduled_workouts: [],
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
      athlete_profiles: [],
      athlete_injuries: [],
      athlete_pain_logs: [],
      athlete_training_responses: [],
      athlete_medical_assessments: [],
      athlete_training_readiness: [],
      health_audit_trail: [],
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
      athlete_profiles: [],
      athlete_injuries: [],
      athlete_pain_logs: [],
      athlete_training_responses: [],
      athlete_medical_assessments: [],
      athlete_training_readiness: [],
      health_audit_trail: [],
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


export async function updateActivity(
  id: string,
  userId: string = DEFAULT_USER_ID,
  updates: {
    name?: string;
    sport_type?: string;
    start_date?: string;
    description?: string;
    distance_meters?: number;
    moving_time_seconds?: number;
    elevation_gain_meters?: number;
  }
): Promise<Activity | null> {
  const current = await getActivityById(id, userId);
  if (!current) return null;

  const newDistance = updates.distance_meters !== undefined ? updates.distance_meters : current.distance_meters;
  const newMovingTime = updates.moving_time_seconds !== undefined ? updates.moving_time_seconds : current.moving_time_seconds;
  const newSpeedMps = newMovingTime > 0 ? Math.round((newDistance / newMovingTime) * 1000) / 1000 : current.average_speed_mps;

  if (pgPool) {
    const res = await pgPool.query(
      `UPDATE activities 
       SET 
         name = COALESCE($1, name),
         sport_type = COALESCE($2, sport_type),
         start_date = COALESCE($3, start_date),
         description = COALESCE($4, description),
         distance_meters = COALESCE($5, distance_meters),
         moving_time_seconds = COALESCE($6, moving_time_seconds),
         elevation_gain_meters = COALESCE($7, elevation_gain_meters),
         average_speed_mps = $8,
         updated_at = NOW()
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [
        updates.name !== undefined ? updates.name : null,
        updates.sport_type !== undefined ? updates.sport_type : null,
        updates.start_date !== undefined ? updates.start_date : null,
        updates.description !== undefined ? updates.description : null,
        updates.distance_meters !== undefined ? updates.distance_meters : null,
        updates.moving_time_seconds !== undefined ? updates.moving_time_seconds : null,
        updates.elevation_gain_meters !== undefined ? updates.elevation_gain_meters : null,
        newSpeedMps,
        id,
        userId,
      ]
    );
    if (!res.rows[0]) return null;
    return normalizeActivityRow(res.rows[0]);
  }

  const store = ensureLocalStore();
  const act = store.activities.find((a) => a.id === id && a.user_id === userId);
  if (!act) return null;

  if (updates.name !== undefined) act.name = updates.name;
  if (updates.sport_type !== undefined) act.sport_type = updates.sport_type;
  if (updates.start_date !== undefined) act.start_date = updates.start_date;
  if (updates.description !== undefined) act.description = updates.description;
  if (updates.distance_meters !== undefined) act.distance_meters = updates.distance_meters;
  if (updates.moving_time_seconds !== undefined) act.moving_time_seconds = updates.moving_time_seconds;
  if (updates.elevation_gain_meters !== undefined) act.elevation_gain_meters = updates.elevation_gain_meters;
  act.average_speed_mps = newSpeedMps;
  act.updated_at = new Date().toISOString();

  saveLocalStore(store);
  return normalizeActivityRow(act);
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

export interface CreateManualActivityParams {
  name: string;
  sport_type: string;
  start_date: string;
  distance_meters?: number;
  moving_time_seconds?: number;
  elapsed_time_seconds?: number;
  elevation_gain_meters?: number;
  average_speed_mps?: number;
  max_speed_mps?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  average_watts?: number;
  calories?: number;
  description?: string;
  workout_id?: string;
  // Clinical / Check-in responses
  rpe_score?: number | null;
  pain_during_activity?: number | null;
  pain_after_activity?: number | null;
  pain_next_day?: number | null;
  swelling_observed?: boolean | null;
  instability_observed?: boolean | null;
  athlete_comments?: string | null;
}

export async function createManualActivity(
  userId: string = DEFAULT_USER_ID,
  params: CreateManualActivityParams
): Promise<{
  activity: Activity;
  matchedWorkout: ScheduledWorkout | null;
  match: WorkoutActivityMatch | null;
  trainingResponse?: AthleteTrainingResponse | null;
}> {
  // Generate synthetic unique strava_activity_id for manual / parsed entries (bigint safe number)
  const syntheticStravaId = Date.now() * 1000 + Math.floor(Math.random() * 1000);
  
  const distance_meters = Number(params.distance_meters || 0);
  const moving_time_seconds = Number(params.moving_time_seconds || 0);
  const elapsed_time_seconds = Number(params.elapsed_time_seconds || moving_time_seconds);
  const elevation_gain_meters = Number(params.elevation_gain_meters || 0);
  
  let average_speed_mps = params.average_speed_mps;
  if (!average_speed_mps && moving_time_seconds > 0 && distance_meters > 0) {
    average_speed_mps = Number((distance_meters / moving_time_seconds).toFixed(2));
  }

  const { activity } = await upsertActivity({
    user_id: userId,
    strava_activity_id: syntheticStravaId,
    name: params.name || 'Manual Workout Activity',
    sport_type: (params.sport_type || 'Ride') as any,
    start_date: params.start_date || new Date().toISOString(),
    distance_meters,
    moving_time_seconds,
    elapsed_time_seconds,
    elevation_gain_meters,
    average_speed_mps: average_speed_mps || 0,
    max_speed_mps: params.max_speed_mps !== undefined && params.max_speed_mps !== null ? params.max_speed_mps : undefined,
    average_heartrate: params.average_heartrate || null,
    max_heartrate: params.max_heartrate || null,
    average_cadence: params.average_cadence || null,
    average_watts: params.average_watts || null,
    calories: params.calories || null,
    description: params.description || null,
  });

  // Attempt workout correlation
  let matchedWorkout: ScheduledWorkout | null = null;
  let match: WorkoutActivityMatch | null = null;

  try {
    const workouts = await getScheduledWorkouts(userId);
    const activityDate = formatDateOnly(params.start_date);

    if (params.workout_id) {
      matchedWorkout = workouts.find((w) => w.id === params.workout_id) || null;
    } else {
      // Find matching planned or missed workout on the same day
      const candidateWorkouts = workouts.filter((w) => {
        const wDate = formatDateOnly(w.scheduled_date);
        return wDate === activityDate && (w.status === 'PLANNED' || w.status === 'MISSED');
      });

      if (candidateWorkouts.length > 0) {
        // Match by sport type if possible
        const normSport = (params.sport_type || '').toLowerCase();
        const sameSport = candidateWorkouts.find((w) => {
          const wCategory = (w.workout_category || '').toLowerCase();
          return (
            (normSport.includes('ride') && (wCategory.includes('ride') || wCategory.includes('cycl'))) ||
            (normSport.includes('run') && (wCategory.includes('run') || wCategory.includes('lari'))) ||
            wCategory === normSport
          );
        });
        matchedWorkout = sameSport || candidateWorkouts[0];
      }
    }

    if (matchedWorkout) {
      let completionPercentage = 100;
      if (matchedWorkout.target_distance_meters && matchedWorkout.target_distance_meters > 0) {
        completionPercentage = Math.min(200, Math.round((distance_meters / matchedWorkout.target_distance_meters) * 100));
      } else if (matchedWorkout.target_duration_seconds && matchedWorkout.target_duration_seconds > 0) {
        completionPercentage = Math.min(200, Math.round((moving_time_seconds / matchedWorkout.target_duration_seconds) * 100));
      }

      const distDelta = distance_meters - (matchedWorkout.target_distance_meters || 0);
      const durDelta = moving_time_seconds - (matchedWorkout.target_duration_seconds || 0);

      match = await saveWorkoutActivityMatch({
        workout_id: matchedWorkout.id,
        activity_id: activity.id,
        is_manual_match: true,
        completion_percentage: completionPercentage,
        distance_delta_meters: distDelta,
        duration_delta_seconds: durDelta,
        pace_delta_seconds_per_km: 0,
      });

      await updateScheduledWorkout(matchedWorkout.id, {
        status: 'COMPLETED',
      });
      matchedWorkout.status = 'COMPLETED';
    }
  } catch (matchErr) {
    console.warn('Failed to correlate workout with manual activity:', matchErr);
  }

  // Record athlete training response if check-in metrics provided
  let trainingResponse: AthleteTrainingResponse | null = null;
  if (
    params.rpe_score != null ||
    params.pain_during_activity != null ||
    params.pain_after_activity != null ||
    params.swelling_observed != null ||
    params.athlete_comments != null
  ) {
    try {
      trainingResponse = await upsertAthleteTrainingResponse({
        user_id: userId,
        activity_id: activity.id,
        strava_activity_id: syntheticStravaId,
        sport_type: params.sport_type,
        distance_km: Number((distance_meters / 1000).toFixed(2)),
        duration_seconds: moving_time_seconds,
        rpe_score: params.rpe_score ?? null,
        pain_during_activity: params.pain_during_activity ?? 0,
        pain_after_activity: params.pain_after_activity ?? 0,
        pain_next_day: params.pain_next_day ?? null,
        swelling_observed: Boolean(params.swelling_observed),
        instability_observed: Boolean(params.instability_observed),
        fatigue_response: (params.rpe_score ?? 0) >= 8 ? 'HIGH' : (params.rpe_score ?? 0) >= 5 ? 'NORMAL' : 'LOW',
        athlete_comments: params.athlete_comments || params.description || null,
        checkin_completed_at: new Date().toISOString(),
      });
    } catch (respErr) {
      console.warn('Failed to save athlete training response:', respErr);
    }
  }

  return {
    activity,
    matchedWorkout,
    match,
    trainingResponse,
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

export async function getTrainingPlans(userId: string = DEFAULT_USER_ID): Promise<TrainingPlan[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM training_plans WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows.map((row) => ({
      ...row,
      start_date: formatDateOnly(row.start_date),
      end_date: formatDateOnly(row.end_date),
    }));
  }
  const store = ensureLocalStore();
  return (store.training_plans || []).filter((p) => p.user_id === userId);
}

export async function getActiveTrainingPlan(userId: string = DEFAULT_USER_ID): Promise<TrainingPlan | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM training_plans WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      start_date: formatDateOnly(row.start_date),
      end_date: formatDateOnly(row.end_date),
    };
  }
  const store = ensureLocalStore();
  return (store.training_plans || []).find((p) => p.user_id === userId && p.is_active) || null;
}

export async function createTrainingPlan(
  plan: Omit<TrainingPlan, 'id' | 'created_at' | 'updated_at'>
): Promise<TrainingPlan> {
  const now = new Date().toISOString();
  if (pgPool) {
    if (plan.is_active) {
      await pgPool.query('UPDATE training_plans SET is_active = FALSE WHERE user_id = $1', [plan.user_id]);
    }
    const query = `
      INSERT INTO training_plans (user_id, title, description, start_date, end_date, is_active, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      plan.user_id,
      plan.title,
      plan.description || null,
      plan.start_date,
      plan.end_date,
      plan.is_active ?? true,
    ]);
    const row = res.rows[0];
    return {
      ...row,
      start_date:
        row.start_date instanceof Date
          ? row.start_date.toISOString().split('T')[0]
          : String(row.start_date || '').split('T')[0],
      end_date:
        row.end_date instanceof Date
          ? row.end_date.toISOString().split('T')[0]
          : String(row.end_date || '').split('T')[0],
    };
  }
  const store = ensureLocalStore();
  if (!store.training_plans) store.training_plans = [];
  if (plan.is_active) {
    store.training_plans.forEach((p) => {
      if (p.user_id === plan.user_id) p.is_active = false;
    });
  }
  const created: TrainingPlan = {
    ...plan,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  store.training_plans.push(created);
  saveLocalStore(store);
  return created;
}

export async function deleteTrainingPlansByUserId(userId: string = DEFAULT_USER_ID): Promise<void> {
  if (pgPool) {
    await pgPool.query('DELETE FROM training_plans WHERE user_id = $1', [userId]);
    return;
  }
  const store = ensureLocalStore();
  store.training_plans = (store.training_plans || []).filter((p) => p.user_id !== userId);
  saveLocalStore(store);
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
      scheduled_date: formatDateOnly(row.scheduled_date),
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

export async function deleteScheduledWorkoutsByUserId(userId: string = DEFAULT_USER_ID): Promise<void> {
  if (pgPool) {
    await pgPool.query('DELETE FROM scheduled_workouts WHERE user_id = $1', [userId]);
    return;
  }
  const store = ensureLocalStore();
  const deletedIds = new Set(store.scheduled_workouts.filter((w) => w.user_id === userId).map((w) => w.id));
  store.scheduled_workouts = store.scheduled_workouts.filter((w) => w.user_id !== userId);
  store.workout_activity_matches = store.workout_activity_matches.filter((m) => !deletedIds.has(m.workout_id));
  saveLocalStore(store);
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
      start_date: formatDateOnly(row.start_date),
      target_date: formatDateOnly(row.target_date),
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

export async function upsertFitnessGoal(
  goal: Omit<FitnessGoal, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<FitnessGoal> {
  const now = new Date().toISOString();
  if (pgPool) {
    if (goal.id) {
      const query = `
        INSERT INTO fitness_goals (id, user_id, title, goal_type, target_value, current_value, start_date, target_date, is_achieved, unit, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          goal_type = EXCLUDED.goal_type,
          target_value = EXCLUDED.target_value,
          current_value = EXCLUDED.current_value,
          start_date = EXCLUDED.start_date,
          target_date = EXCLUDED.target_date,
          is_achieved = EXCLUDED.is_achieved,
          unit = EXCLUDED.unit,
          updated_at = NOW()
        RETURNING *;
      `;
      const res = await pgPool.query(query, [
        goal.id,
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
      const row = res.rows[0];
      return {
        ...row,
        start_date:
          row.start_date instanceof Date
            ? row.start_date.toISOString().split('T')[0]
            : String(row.start_date).split('T')[0],
        target_date:
          row.target_date instanceof Date
            ? row.target_date.toISOString().split('T')[0]
            : String(row.target_date).split('T')[0],
      };
    } else {
      return createFitnessGoal(goal);
    }
  }
  const store = ensureLocalStore();
  const existingIdx = goal.id ? store.fitness_goals.findIndex((g) => g.id === goal.id) : -1;
  const record: FitnessGoal = {
    ...goal,
    id: goal.id || crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  if (existingIdx >= 0) {
    store.fitness_goals[existingIdx] = record;
  } else {
    store.fitness_goals.push(record);
  }
  saveLocalStore(store);
  return record;
}

export async function getPersonalRecords(userId: string = DEFAULT_USER_ID): Promise<PersonalRecord[]> {
  if (pgPool) {
    const query = 'SELECT pr.*, a.name as activity_name, COALESCE(pr.sport_type, a.sport_type, \'Run\') as sport_type FROM personal_records pr LEFT JOIN activities a ON pr.activity_id = a.id WHERE pr.user_id = $1 ORDER BY pr.sport_type ASC, pr.achieved_date DESC';
    const res = await pgPool.query(query, [userId]);
    return res.rows;
  }
  const store = ensureLocalStore();
  const prs = store.personal_records.filter((p) => p.user_id === userId);
  return prs.map((pr) => {
    const act = store.activities.find((a) => a.id === pr.activity_id);
    return {
      ...pr,
      activity_name: act?.name,
      sport_type: pr.sport_type || act?.sport_type || 'Run',
    };
  });
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

// =====================================================================
// ATHLETE HEALTH, INJURY & READINESS DATA ACCESS LAYER
// =====================================================================

export async function getAthleteProfile(userId: string = DEFAULT_USER_ID): Promise<AthleteProfile | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_profiles WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      ...r,
      age: r.age ? Number(r.age) : null,
      height_cm: r.height_cm ? Number(r.height_cm) : null,
      weight_kg: r.weight_kg ? Number(r.weight_kg) : null,
      bmi: r.bmi ? Number(r.bmi) : null,
      resting_heart_rate: r.resting_heart_rate ? Number(r.resting_heart_rate) : null,
      training_days_per_week: Number(r.training_days_per_week || 3),
      physiological_measurements: r.physiological_measurements || {},
    };
  }

  const store = ensureLocalStore();
  return store.athlete_profiles.find((p) => p.user_id === userId) || null;
}

export async function upsertAthleteProfile(
  profile: Partial<AthleteProfile> & { user_id: string }
): Promise<AthleteProfile> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_profiles (
        user_id, age, height_cm, weight_kg, resting_heart_rate,
        training_days_per_week, preferred_sports, training_experience,
        performance_objectives, physiological_measurements, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        age = COALESCE(EXCLUDED.age, athlete_profiles.age),
        height_cm = COALESCE(EXCLUDED.height_cm, athlete_profiles.height_cm),
        weight_kg = COALESCE(EXCLUDED.weight_kg, athlete_profiles.weight_kg),
        resting_heart_rate = COALESCE(EXCLUDED.resting_heart_rate, athlete_profiles.resting_heart_rate),
        training_days_per_week = COALESCE(EXCLUDED.training_days_per_week, athlete_profiles.training_days_per_week),
        preferred_sports = COALESCE(EXCLUDED.preferred_sports, athlete_profiles.preferred_sports),
        training_experience = COALESCE(EXCLUDED.training_experience, athlete_profiles.training_experience),
        performance_objectives = COALESCE(EXCLUDED.performance_objectives, athlete_profiles.performance_objectives),
        physiological_measurements = COALESCE(EXCLUDED.physiological_measurements, athlete_profiles.physiological_measurements),
        updated_at = NOW()
      RETURNING *`,
      [
        profile.user_id,
        profile.age ?? null,
        profile.height_cm ?? null,
        profile.weight_kg ?? null,
        profile.resting_heart_rate ?? null,
        profile.training_days_per_week ?? 3,
        profile.preferred_sports ?? ['Running', 'Cycling'],
        profile.training_experience ?? 'INTERMEDIATE',
        profile.performance_objectives ?? 'Aerobic endurance with injury prevention',
        JSON.stringify(profile.physiological_measurements ?? {}),
      ]
    );
    const r = res.rows[0];
    return {
      ...r,
      age: r.age ? Number(r.age) : null,
      height_cm: r.height_cm ? Number(r.height_cm) : null,
      weight_kg: r.weight_kg ? Number(r.weight_kg) : null,
      bmi: r.bmi ? Number(r.bmi) : null,
      resting_heart_rate: r.resting_heart_rate ? Number(r.resting_heart_rate) : null,
      training_days_per_week: Number(r.training_days_per_week || 3),
      physiological_measurements: r.physiological_measurements || {},
    };
  }

  const store = ensureLocalStore();
  const idx = store.athlete_profiles.findIndex((p) => p.user_id === profile.user_id);
  const now = new Date().toISOString();
  const weight = profile.weight_kg ?? 65;
  const height = profile.height_cm ?? 170;
  const bmi = Math.round((weight / ((height / 100) * (height / 100))) * 10) / 10;

  const record: AthleteProfile = {
    id: idx !== -1 ? store.athlete_profiles[idx].id : crypto.randomUUID(),
    user_id: profile.user_id,
    age: profile.age ?? 22,
    height_cm: height,
    weight_kg: weight,
    bmi,
    resting_heart_rate: profile.resting_heart_rate ?? 68,
    training_days_per_week: profile.training_days_per_week ?? 3,
    preferred_sports: profile.preferred_sports ?? ['Running', 'Cycling'],
    training_experience: profile.training_experience ?? 'INTERMEDIATE',
    performance_objectives: profile.performance_objectives ?? 'Aerobic endurance with injury prevention',
    physiological_measurements: profile.physiological_measurements ?? {
      hr_max: null,
      lthr: null,
      ftp_watts: null,
      vo2_max: null,
      running_threshold_pace_sec: null,
      cycling_power_zones: null,
      baseline_consistency_weeks: null,
      sleep_recovery_baseline: null,
    },
    created_at: idx !== -1 ? store.athlete_profiles[idx].created_at : now,
    updated_at: now,
  };

  if (idx !== -1) {
    store.athlete_profiles[idx] = record;
  } else {
    store.athlete_profiles.push(record);
  }
  saveLocalStore(store);
  return record;
}

export async function getAthleteInjuries(userId: string = DEFAULT_USER_ID): Promise<AthleteInjury[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_injuries WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows.map((r) => ({
      ...r,
      previous_swelling: Boolean(r.previous_swelling),
      estimated_injury_date: r.estimated_injury_date ? r.estimated_injury_date.toISOString().split('T')[0] : null,
    }));
  }

  const store = ensureLocalStore();
  return store.athlete_injuries.filter((i) => i.user_id === userId);
}

export async function createAthleteInjury(
  injury: Omit<AthleteInjury, 'id' | 'created_at' | 'updated_at'>
): Promise<AthleteInjury> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_injuries (
        user_id, body_region, side, injury_mechanism, timeframe_description,
        estimated_injury_date, previous_symptoms, initial_severity,
        previous_swelling, previous_swelling_duration, medical_evaluation_status,
        current_status, clinician_restrictions, functional_limitations,
        recovery_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        injury.user_id,
        injury.body_region,
        injury.side,
        injury.injury_mechanism,
        injury.timeframe_description,
        injury.estimated_injury_date || null,
        injury.previous_symptoms || null,
        injury.initial_severity || 'MODERATE',
        Boolean(injury.previous_swelling),
        injury.previous_swelling_duration || null,
        injury.medical_evaluation_status || 'PENDING_CLINICAL_ASSESSMENT',
        injury.current_status || 'ACTIVE_SYMPTOMATIC',
        injury.clinician_restrictions || null,
        injury.functional_limitations || null,
        injury.recovery_notes || null,
      ]
    );
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const now = new Date().toISOString();
  const record: AthleteInjury = {
    ...injury,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  store.athlete_injuries.unshift(record);
  saveLocalStore(store);
  return record;
}

export async function getAthletePainLogs(
  userId: string = DEFAULT_USER_ID,
  limit: number = 20
): Promise<AthletePainLog[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_pain_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT $2',
      [userId, limit]
    );
    return res.rows.map((r) => ({
      ...r,
      pain_score: r.pain_score !== null ? Number(r.pain_score) : null,
      pain_during_activity: r.pain_during_activity !== null ? Number(r.pain_during_activity) : null,
      pain_immediately_after: r.pain_immediately_after !== null ? Number(r.pain_immediately_after) : null,
      pain_24h_after: r.pain_24h_after !== null ? Number(r.pain_24h_after) : null,
      swelling_present: Boolean(r.swelling_present),
      joint_instability: Boolean(r.joint_instability),
    }));
  }

  const store = ensureLocalStore();
  return store.athlete_pain_logs.filter((p) => p.user_id === userId).slice(0, limit);
}

export async function createAthletePainLog(
  log: Omit<AthletePainLog, 'id' | 'created_at'>
): Promise<AthletePainLog> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_pain_logs (
        user_id, injury_id, body_region, side, pain_score, pain_type,
        associated_activity, pain_during_activity, pain_immediately_after,
        pain_24h_after, swelling_present, joint_instability,
        functional_limitations, logged_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        log.user_id,
        log.injury_id || null,
        log.body_region,
        log.side,
        log.pain_score ?? null,
        log.pain_type || null,
        log.associated_activity || null,
        log.pain_during_activity ?? null,
        log.pain_immediately_after ?? null,
        log.pain_24h_after ?? null,
        Boolean(log.swelling_present),
        Boolean(log.joint_instability),
        log.functional_limitations || null,
        log.logged_at || new Date().toISOString(),
      ]
    );
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const record: AthletePainLog = {
    ...log,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.athlete_pain_logs.unshift(record);
  saveLocalStore(store);
  return record;
}

export async function getAthleteTrainingResponses(
  userId: string = DEFAULT_USER_ID,
  limit: number = 20
): Promise<AthleteTrainingResponse[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_training_responses WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return res.rows.map((r) => ({
      ...r,
      distance_km: Number(r.distance_km),
      duration_seconds: Number(r.duration_seconds),
      rpe_score: r.rpe_score !== null ? Number(r.rpe_score) : null,
      pain_during_activity: r.pain_during_activity !== null ? Number(r.pain_during_activity) : null,
      pain_after_activity: r.pain_after_activity !== null ? Number(r.pain_after_activity) : null,
      pain_next_day: r.pain_next_day !== null ? Number(r.pain_next_day) : null,
      swelling_observed: Boolean(r.swelling_observed),
      instability_observed: Boolean(r.instability_observed),
    }));
  }

  const store = ensureLocalStore();
  return store.athlete_training_responses.filter((r) => r.user_id === userId).slice(0, limit);
}

export async function upsertAthleteTrainingResponse(
  resp: Omit<AthleteTrainingResponse, 'id' | 'created_at'>
): Promise<AthleteTrainingResponse> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_training_responses (
        user_id, activity_id, strava_activity_id, sport_type, distance_km,
        duration_seconds, rpe_score, pain_during_activity, pain_after_activity,
        pain_next_day, swelling_observed, instability_observed,
        fatigue_response, athlete_comments, checkin_completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (user_id, activity_id) DO UPDATE SET
        rpe_score = EXCLUDED.rpe_score,
        pain_during_activity = EXCLUDED.pain_during_activity,
        pain_after_activity = EXCLUDED.pain_after_activity,
        pain_next_day = EXCLUDED.pain_next_day,
        swelling_observed = EXCLUDED.swelling_observed,
        instability_observed = EXCLUDED.instability_observed,
        fatigue_response = EXCLUDED.fatigue_response,
        athlete_comments = EXCLUDED.athlete_comments,
        checkin_completed_at = NOW()
      RETURNING *`,
      [
        resp.user_id,
        resp.activity_id || null,
        resp.strava_activity_id || null,
        resp.sport_type,
        resp.distance_km,
        resp.duration_seconds,
        resp.rpe_score ?? null,
        resp.pain_during_activity ?? null,
        resp.pain_after_activity ?? null,
        resp.pain_next_day ?? null,
        Boolean(resp.swelling_observed),
        Boolean(resp.instability_observed),
        resp.fatigue_response || 'NORMAL',
        resp.athlete_comments || null,
        resp.checkin_completed_at || new Date().toISOString(),
      ]
    );
    const r = res.rows[0];
    return {
      ...r,
      distance_km: Number(r.distance_km),
      duration_seconds: Number(r.duration_seconds),
      rpe_score: r.rpe_score !== null ? Number(r.rpe_score) : null,
      pain_during_activity: r.pain_during_activity !== null ? Number(r.pain_during_activity) : null,
      pain_after_activity: r.pain_after_activity !== null ? Number(r.pain_after_activity) : null,
      pain_next_day: r.pain_next_day !== null ? Number(r.pain_next_day) : null,
      swelling_observed: Boolean(r.swelling_observed),
      instability_observed: Boolean(r.instability_observed),
    };
  }

  const store = ensureLocalStore();
  const idx = store.athlete_training_responses.findIndex(
    (r) => r.user_id === resp.user_id && r.activity_id === resp.activity_id
  );
  const record: AthleteTrainingResponse = {
    ...resp,
    id: idx !== -1 ? store.athlete_training_responses[idx].id : crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  if (idx !== -1) {
    store.athlete_training_responses[idx] = record;
  } else {
    store.athlete_training_responses.unshift(record);
  }
  saveLocalStore(store);
  return record;
}

export async function getAthleteMedicalAssessments(
  userId: string = DEFAULT_USER_ID
): Promise<AthleteMedicalAssessment[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_medical_assessments WHERE user_id = $1 ORDER BY assessment_date DESC',
      [userId]
    );
    return res.rows.map((r) => ({
      ...r,
      assessment_date: r.assessment_date ? r.assessment_date.toISOString().split('T')[0] : '',
      follow_up_date: r.follow_up_date ? r.follow_up_date.toISOString().split('T')[0] : null,
    }));
  }

  const store = ensureLocalStore();
  return store.athlete_medical_assessments.filter((m) => m.user_id === userId);
}

export async function createAthleteMedicalAssessment(
  assessment: Omit<AthleteMedicalAssessment, 'id' | 'created_at'>
): Promise<AthleteMedicalAssessment> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_medical_assessments (
        user_id, injury_id, assessment_date, healthcare_provider_type,
        provider_name, clinical_findings, confirmed_diagnosis,
        imaging_summary, clinician_restrictions, rehabilitation_protocol,
        return_to_sport_criteria, follow_up_date, verification_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        assessment.user_id,
        assessment.injury_id || null,
        assessment.assessment_date,
        assessment.healthcare_provider_type,
        assessment.provider_name || null,
        assessment.clinical_findings,
        assessment.confirmed_diagnosis || null,
        assessment.imaging_summary || null,
        assessment.clinician_restrictions,
        assessment.rehabilitation_protocol || null,
        assessment.return_to_sport_criteria || null,
        assessment.follow_up_date || null,
        assessment.verification_status || 'ATHLETE_ENTERED',
      ]
    );
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const record: AthleteMedicalAssessment = {
    ...assessment,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.athlete_medical_assessments.unshift(record);
  saveLocalStore(store);
  return record;
}

export async function getLatestAthleteReadiness(
  userId: string = DEFAULT_USER_ID
): Promise<AthleteTrainingReadiness | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_training_readiness WHERE user_id = $1 ORDER BY evaluated_at DESC LIMIT 1',
      [userId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      ...r,
      trigger_symptoms: Array.isArray(r.trigger_symptoms) ? r.trigger_symptoms : [],
      source_telemetry_refs: Array.isArray(r.source_telemetry_refs) ? r.source_telemetry_refs : [],
      medical_clearance: Boolean(r.medical_clearance),
      automatic_progression_allowed: Boolean(r.automatic_progression_allowed),
    };
  }

  const store = ensureLocalStore();
  const list = store.athlete_training_readiness.filter((r) => r.user_id === userId);
  return list.length > 0 ? list[0] : null;
}

export async function saveAthleteReadiness(
  readiness: Omit<AthleteTrainingReadiness, 'id' | 'created_at'>
): Promise<AthleteTrainingReadiness> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO athlete_training_readiness (
        user_id, evaluated_at, athlete_status, running_readiness,
        cycling_readiness, general_readiness, running_restrictions,
        cycling_restrictions, rationale, trigger_symptoms,
        source_telemetry_refs, medical_clearance, automatic_progression_allowed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        readiness.user_id,
        readiness.evaluated_at || new Date().toISOString(),
        readiness.athlete_status,
        readiness.running_readiness,
        readiness.cycling_readiness,
        readiness.general_readiness,
        readiness.running_restrictions || null,
        readiness.cycling_restrictions || null,
        readiness.rationale,
        JSON.stringify(readiness.trigger_symptoms || []),
        JSON.stringify(readiness.source_telemetry_refs || []),
        Boolean(readiness.medical_clearance),
        Boolean(readiness.automatic_progression_allowed),
      ]
    );
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const record: AthleteTrainingReadiness = {
    ...readiness,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.athlete_training_readiness.unshift(record);
  saveLocalStore(store);
  return record;
}

export async function logHealthAuditTrail(
  trail: Omit<HealthAuditTrail, 'id' | 'created_at'>
): Promise<HealthAuditTrail> {
  if (pgPool) {
    const res = await pgPool.query(
      `INSERT INTO health_audit_trail (
        user_id, entity_type, entity_id, action, state_before, state_after, modified_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        trail.user_id,
        trail.entity_type,
        trail.entity_id,
        trail.action,
        trail.state_before ? JSON.stringify(trail.state_before) : null,
        trail.state_after ? JSON.stringify(trail.state_after) : null,
        trail.modified_by || 'ATHLETE',
      ]
    );
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const record: HealthAuditTrail = {
    ...trail,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.health_audit_trail.unshift(record);
  saveLocalStore(store);
  return record;
}

export async function getAuthoritativeHealthContext(
  userId: string = DEFAULT_USER_ID
): Promise<AuthoritativeAthleteHealthContext> {
  const [profile, injuries, painLogs, responses, assessments, readiness] = await Promise.all([
    getAthleteProfile(userId),
    getAthleteInjuries(userId),
    getAthletePainLogs(userId, 15),
    getAthleteTrainingResponses(userId, 15),
    getAthleteMedicalAssessments(userId),
    getLatestAthleteReadiness(userId),
  ]);

  const clinicianRestrictions: string[] = [];
  for (const m of assessments) {
    if (m.clinician_restrictions && m.clinician_restrictions.trim().length > 0) {
      clinicianRestrictions.push(m.clinician_restrictions.trim());
    }
  }
  for (const inj of injuries) {
    if (inj.clinician_restrictions && inj.clinician_restrictions.trim().length > 0) {
      clinicianRestrictions.push(inj.clinician_restrictions.trim());
    }
  }

  return {
    profile,
    injuries,
    recentPainLogs: painLogs,
    recentResponses: responses,
    medicalAssessments: assessments,
    latestReadiness: readiness,
    clinicianRestrictions,
  };
}

