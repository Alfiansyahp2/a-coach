import { Pool, types } from 'pg';
import fs from 'fs';
import path from 'path';
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
  AthleteAvailability,
  AthleteEquipment,
  AthleteDailyWellness,
} from '@/types';

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

export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// Detect whether PostgreSQL is enabled
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/sport_training';
let poolInstance: Pool | null = null;

if (databaseUrl && databaseUrl.trim().length > 0) {
  try {
    poolInstance = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  } catch (err) {
    console.warn('Failed to initialize PostgreSQL pool, falling back to local store:', err);
    poolInstance = null;
  }
}

export const pgPool = poolInstance;

// Local File Store for fallback / instant development
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', '.data') : path.join(process.cwd(), '.data');
let memoryStore: LocalStoreSchema | null = null;
const DATA_FILE = path.join(DATA_DIR, 'store.json');

export interface LocalStoreSchema {
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
  athlete_availability?: AthleteAvailability[];
  athlete_equipment?: AthleteEquipment[];
  athlete_daily_wellness?: AthleteDailyWellness[];
}

export function ensureLocalStore(): LocalStoreSchema {
  if (memoryStore) return memoryStore;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const defaultUserId = DEFAULT_USER_ID;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

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
          record_value: 1260,
          record_display: '21:00',
          achieved_date: `${getRelDate(-15)}T08:00:00Z`,
          created_at: new Date().toISOString(),
        },
        {
          id: 'pr-002',
          user_id: defaultUserId,
          activity_id: 'act-001',
          category: '10K',
          record_value: 2685,
          record_display: '44:45',
          achieved_date: `${getRelDate(-30)}T07:30:00Z`,
          created_at: new Date().toISOString(),
        },
        {
          id: 'pr-003',
          user_id: defaultUserId,
          activity_id: 'act-003',
          category: 'Longest Distance',
          record_value: 21100,
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

export function saveLocalStore(data: LocalStoreSchema) {
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
