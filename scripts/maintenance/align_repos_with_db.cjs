const fs = require('fs');
const path = require('path');

// 1. Align types in src/types/index.ts
const typesFile = path.join(__dirname, '..', 'src', 'types', 'index.ts');
let typesContent = fs.readFileSync(typesFile, 'utf8');

const targetTypes = `export interface AthleteAvailability {
  id: string;
  user_id: string;
  available_days: string[]; // ['Tuesday', 'Friday', 'Sunday']
  preferred_days: string[]; // ['Tuesday', 'Friday', 'Sunday']
  preferred_time_of_day?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FLEXIBLE';
  max_duration_weekday_minutes: number;
  max_duration_weekend_minutes: number;
  fasting_schedule?: string; // 'NONE', 'INTERMITTENT_16_8', 'RAMADHAN'
  occupation_activity_level?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE';
  sleep_target_hours: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AthleteEquipment {
  id: string;
  user_id: string;
  equipment_type: 'SHOES' | 'BIKE' | 'WATCH' | 'OTHER';
  name: string;
  brand?: string;
  model?: string;
  sport_type: string; // 'Run', 'Ride', 'All'
  total_distance_meters: number;
  max_recommended_distance_meters?: number; // e.g. 800000 meters (800km) for shoes
  is_primary: boolean;
  is_active: boolean;
  retired_at?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AthleteDailyWellness {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  sleep_hours?: number;
  sleep_quality_score?: number; // 1-10
  resting_heart_rate?: number;
  fatigue_score?: number; // 1-10 (1 = fresh, 10 = exhausted)
  stress_level_score?: number; // 1-10
  muscle_soreness_score?: number; // 1-10
  mood_score?: number; // 1-10
  readiness_flag: 'OPTIMAL' | 'MODERATE' | 'CAUTION' | 'REST_RECOMMENDED';
  subjective_notes?: string;
  created_at: string;
  updated_at: string;
}`;

const alignedTypes = `export interface AthleteAvailability {
  id: string;
  user_id: string;
  preferred_days: string[]; // ['Tuesday', 'Friday', 'Sunday']
  preferred_time_of_day: 'MORNING' | 'EVENING' | 'FLEXIBLE' | string;
  max_session_duration_minutes: number;
  weekend_duration_minutes: number;
  fasting_schedule?: { type: string; is_fasting?: boolean } | any;
  protected_rest_days?: string[];
  created_at: string;
  updated_at: string;
}

export interface AthleteEquipment {
  id: string;
  user_id: string;
  sport_type: string; // 'Run', 'Ride', 'CrossTraining'
  name: string;
  brand?: string;
  model?: string;
  accumulated_distance_meters: number;
  max_recommended_distance_meters: number;
  gear_type: 'RUNNING_SHOES' | 'MTB' | 'ROAD_BIKE' | 'GRAVEL_BIKE' | string;
  is_active: boolean;
  is_retired: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AthleteDailyWellness {
  id: string;
  user_id: string;
  logged_date: string; // YYYY-MM-DD
  resting_heart_rate?: number;
  sleep_duration_hours?: number;
  sleep_quality_score?: number; // 1-5
  fatigue_score?: number; // 1-5
  muscle_soreness_score?: number; // 1-5
  life_stress_score?: number; // 1-5
  perceived_readiness: 'OPTIMAL' | 'NORMAL' | 'REDUCED' | 'REST_RECOMMENDED' | string;
  notes?: string;
  created_at: string;
  updated_at: string;
}`;

typesContent = typesContent.replace(/\r\n/g, '\n').replace(targetTypes.replace(/\r\n/g, '\n'), alignedTypes.replace(/\r\n/g, '\n'));
fs.writeFileSync(typesFile, typesContent, 'utf8');
console.log('src/types/index.ts aligned with DB schema');

// 2. Rewrite src/lib/db/availabilityRepo.ts
const availFile = path.join(__dirname, '..', 'src', 'lib', 'db', 'availabilityRepo.ts');
fs.writeFileSync(availFile, `import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID } from './client';
import { AthleteAvailability } from '@/types';

export async function getAthleteAvailability(
  userId: string = DEFAULT_USER_ID
): Promise<AthleteAvailability | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_availability WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [userId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      user_id: r.user_id,
      preferred_days: Array.isArray(r.preferred_days) ? r.preferred_days : ['Tuesday', 'Friday', 'Sunday'],
      preferred_time_of_day: r.preferred_time_of_day || 'MORNING',
      max_session_duration_minutes: Number(r.max_session_duration_minutes ?? 60),
      weekend_duration_minutes: Number(r.weekend_duration_minutes ?? 120),
      fasting_schedule: r.fasting_schedule || { type: 'NONE', is_fasting: false },
      protected_rest_days: Array.isArray(r.protected_rest_days) ? r.protected_rest_days : ['Monday'],
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  }

  const store = ensureLocalStore();
  const list = ((store as any).athlete_availability || []) as AthleteAvailability[];
  return list.find((a) => a.user_id === userId) || null;
}

export async function upsertAthleteAvailability(
  userId: string = DEFAULT_USER_ID,
  data: Partial<Omit<AthleteAvailability, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<AthleteAvailability> {
  const preferredDays = data.preferred_days || ['Tuesday', 'Friday', 'Sunday'];
  const preferredTime = data.preferred_time_of_day || 'MORNING';
  const weekdayMax = data.max_session_duration_minutes ?? 60;
  const weekendMax = data.weekend_duration_minutes ?? 120;
  const fasting = data.fasting_schedule || { type: 'NONE', is_fasting: false };
  const restDays = data.protected_rest_days || ['Monday'];

  if (pgPool) {
    const res = await pgPool.query(
      \`INSERT INTO athlete_availability (
        user_id, preferred_days, preferred_time_of_day,
        max_session_duration_minutes, weekend_duration_minutes,
        fasting_schedule, protected_rest_days, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        preferred_days = EXCLUDED.preferred_days,
        preferred_time_of_day = EXCLUDED.preferred_time_of_day,
        max_session_duration_minutes = EXCLUDED.max_session_duration_minutes,
        weekend_duration_minutes = EXCLUDED.weekend_duration_minutes,
        fasting_schedule = EXCLUDED.fasting_schedule,
        protected_rest_days = EXCLUDED.protected_rest_days,
        updated_at = NOW()
      RETURNING *\`,
      [userId, preferredDays, preferredTime, weekdayMax, weekendMax, JSON.stringify(fasting), restDays]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      user_id: r.user_id,
      preferred_days: r.preferred_days,
      preferred_time_of_day: r.preferred_time_of_day,
      max_session_duration_minutes: Number(r.max_session_duration_minutes),
      weekend_duration_minutes: Number(r.weekend_duration_minutes),
      fasting_schedule: r.fasting_schedule,
      protected_rest_days: r.protected_rest_days,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  }

  const store = ensureLocalStore();
  if (!(store as any).athlete_availability) (store as any).athlete_availability = [];
  const list = (store as any).athlete_availability as AthleteAvailability[];
  const idx = list.findIndex((a) => a.user_id === userId);
  const now = new Date().toISOString();
  const record: AthleteAvailability = {
    id: idx !== -1 ? list[idx].id : crypto.randomUUID(),
    user_id: userId,
    preferred_days: preferredDays,
    preferred_time_of_day: preferredTime,
    max_session_duration_minutes: weekdayMax,
    weekend_duration_minutes: weekendMax,
    fasting_schedule: fasting,
    protected_rest_days: restDays,
    created_at: idx !== -1 ? list[idx].created_at : now,
    updated_at: now,
  };
  if (idx !== -1) list[idx] = record;
  else list.push(record);
  saveLocalStore(store);
  return record;
}
`, 'utf8');
console.log('src/lib/db/availabilityRepo.ts rewritten successfully');

// 3. Rewrite src/lib/db/equipmentRepo.ts
const equipFile = path.join(__dirname, '..', 'src', 'lib', 'db', 'equipmentRepo.ts');
fs.writeFileSync(equipFile, `import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID } from './client';
import { AthleteEquipment } from '@/types';

export async function getAthleteEquipment(
  userId: string = DEFAULT_USER_ID,
  sportType?: string
): Promise<AthleteEquipment[]> {
  if (pgPool) {
    let query = 'SELECT * FROM athlete_equipment WHERE user_id = $1';
    const params: any[] = [userId];
    if (sportType) {
      query += ' AND (sport_type = $2 OR sport_type = \\'All\\')';
      params.push(sportType);
    }
    query += ' ORDER BY is_active DESC, accumulated_distance_meters DESC';
    const res = await pgPool.query(query, params);
    return res.rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      sport_type: r.sport_type,
      name: r.name,
      brand: r.brand || '',
      model: r.model || '',
      accumulated_distance_meters: Number(r.accumulated_distance_meters || 0),
      max_recommended_distance_meters: Number(r.max_recommended_distance_meters || 800000),
      gear_type: r.gear_type || 'RUNNING_SHOES',
      is_active: Boolean(r.is_active),
      is_retired: Boolean(r.is_retired),
      notes: r.notes || '',
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    }));
  }

  const store = ensureLocalStore();
  const list = ((store as any).athlete_equipment || []) as AthleteEquipment[];
  return list.filter((e) => {
    if (e.user_id !== userId) return false;
    if (sportType && e.sport_type !== sportType && e.sport_type !== 'All') return false;
    return true;
  });
}

export async function upsertEquipment(
  userId: string = DEFAULT_USER_ID,
  data: Partial<AthleteEquipment> & { name: string; sport_type: string; gear_type: string }
): Promise<AthleteEquipment> {
  const distance = data.accumulated_distance_meters ?? 0;
  const maxDistance = data.max_recommended_distance_meters ?? 800000;
  const isActive = data.is_active ?? true;
  const isRetired = data.is_retired ?? false;

  if (pgPool) {
    if (data.id) {
      const res = await pgPool.query(
        \`UPDATE athlete_equipment SET
          sport_type = $1,
          name = $2,
          brand = $3,
          model = $4,
          accumulated_distance_meters = $5,
          max_recommended_distance_meters = $6,
          gear_type = $7,
          is_active = $8,
          is_retired = $9,
          notes = $10,
          updated_at = NOW()
        WHERE id = $11 AND user_id = $12
        RETURNING *\`,
        [data.sport_type, data.name, data.brand || null, data.model || null, distance, maxDistance, data.gear_type, isActive, isRetired, data.notes || null, data.id, userId]
      );
      const r = res.rows[0];
      return {
        ...r,
        accumulated_distance_meters: Number(r.accumulated_distance_meters),
        max_recommended_distance_meters: Number(r.max_recommended_distance_meters),
        is_active: Boolean(r.is_active),
        is_retired: Boolean(r.is_retired),
      };
    } else {
      const res = await pgPool.query(
        \`INSERT INTO athlete_equipment (
          user_id, sport_type, name, brand, model,
          accumulated_distance_meters, max_recommended_distance_meters,
          gear_type, is_active, is_retired, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *\`,
        [userId, data.sport_type, data.name, data.brand || null, data.model || null, distance, maxDistance, data.gear_type, isActive, isRetired, data.notes || null]
      );
      const r = res.rows[0];
      return {
        ...r,
        accumulated_distance_meters: Number(r.accumulated_distance_meters),
        max_recommended_distance_meters: Number(r.max_recommended_distance_meters),
        is_active: Boolean(r.is_active),
        is_retired: Boolean(r.is_retired),
      };
    }
  }

  const store = ensureLocalStore();
  if (!(store as any).athlete_equipment) (store as any).athlete_equipment = [];
  const list = (store as any).athlete_equipment as AthleteEquipment[];
  const now = new Date().toISOString();
  const record: AthleteEquipment = {
    id: data.id || crypto.randomUUID(),
    user_id: userId,
    sport_type: data.sport_type,
    name: data.name,
    brand: data.brand || '',
    model: data.model || '',
    accumulated_distance_meters: distance,
    max_recommended_distance_meters: maxDistance,
    gear_type: data.gear_type,
    is_active: isActive,
    is_retired: isRetired,
    notes: data.notes || '',
    created_at: now,
    updated_at: now,
  };
  const idx = list.findIndex((e) => e.id === record.id);
  if (idx !== -1) list[idx] = record;
  else list.push(record);
  saveLocalStore(store);
  return record;
}

export async function recordEquipmentMileage(
  equipmentId: string,
  additionalMeters: number
): Promise<void> {
  if (pgPool) {
    await pgPool.query(
      'UPDATE athlete_equipment SET accumulated_distance_meters = accumulated_distance_meters + $1, updated_at = NOW() WHERE id = $2',
      [additionalMeters, equipmentId]
    );
    return;
  }
  const store = ensureLocalStore();
  const list = ((store as any).athlete_equipment || []) as AthleteEquipment[];
  const found = list.find((e) => e.id === equipmentId);
  if (found) {
    found.accumulated_distance_meters += additionalMeters;
    saveLocalStore(store);
  }
}
`, 'utf8');
console.log('src/lib/db/equipmentRepo.ts rewritten successfully');

// 4. Rewrite src/lib/db/wellnessRepo.ts
const wellFile = path.join(__dirname, '..', 'src', 'lib', 'db', 'wellnessRepo.ts');
fs.writeFileSync(wellFile, `import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from './client';
import { AthleteDailyWellness } from '@/types';

export async function getTodayWellness(
  userId: string = DEFAULT_USER_ID,
  dateStr?: string
): Promise<AthleteDailyWellness | null> {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];

  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_daily_wellness WHERE user_id = $1 AND logged_date = $2 LIMIT 1',
      [userId, targetDate]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      user_id: r.user_id,
      logged_date: formatDateOnly(r.logged_date),
      resting_heart_rate: r.resting_heart_rate ? Number(r.resting_heart_rate) : undefined,
      sleep_duration_hours: r.sleep_duration_hours ? Number(r.sleep_duration_hours) : undefined,
      sleep_quality_score: r.sleep_quality_score ? Number(r.sleep_quality_score) : undefined,
      fatigue_score: r.fatigue_score ? Number(r.fatigue_score) : undefined,
      muscle_soreness_score: r.muscle_soreness_score ? Number(r.muscle_soreness_score) : undefined,
      life_stress_score: r.life_stress_score ? Number(r.life_stress_score) : undefined,
      perceived_readiness: r.perceived_readiness || 'OPTIMAL',
      notes: r.notes || '',
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  }

  const store = ensureLocalStore();
  const list = ((store as any).athlete_daily_wellness || []) as AthleteDailyWellness[];
  const found = list.find((w) => w.user_id === userId && w.logged_date === targetDate);
  return found || null;
}

export async function getRecentWellnessLogs(
  userId: string = DEFAULT_USER_ID,
  days: number = 14
): Promise<AthleteDailyWellness[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_daily_wellness WHERE user_id = $1 ORDER BY logged_date DESC LIMIT $2',
      [userId, days]
    );
    return res.rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      logged_date: formatDateOnly(r.logged_date),
      resting_heart_rate: r.resting_heart_rate ? Number(r.resting_heart_rate) : undefined,
      sleep_duration_hours: r.sleep_duration_hours ? Number(r.sleep_duration_hours) : undefined,
      sleep_quality_score: r.sleep_quality_score ? Number(r.sleep_quality_score) : undefined,
      fatigue_score: r.fatigue_score ? Number(r.fatigue_score) : undefined,
      muscle_soreness_score: r.muscle_soreness_score ? Number(r.muscle_soreness_score) : undefined,
      life_stress_score: r.life_stress_score ? Number(r.life_stress_score) : undefined,
      perceived_readiness: r.perceived_readiness || 'OPTIMAL',
      notes: r.notes || '',
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    }));
  }

  const store = ensureLocalStore();
  const list = ((store as any).athlete_daily_wellness || []) as AthleteDailyWellness[];
  return list
    .filter((w) => w.user_id === userId)
    .sort((a, b) => b.logged_date.localeCompare(a.logged_date))
    .slice(0, days);
}

export async function recordDailyWellness(
  userId: string = DEFAULT_USER_ID,
  data: Partial<AthleteDailyWellness>
): Promise<AthleteDailyWellness> {
  const loggedDate = data.logged_date || new Date().toISOString().split('T')[0];
  const restingHr = data.resting_heart_rate ?? null;
  const sleepDuration = data.sleep_duration_hours ?? null;
  const sleepQuality = data.sleep_quality_score ?? null;
  const fatigue = data.fatigue_score ?? null;
  const soreness = data.muscle_soreness_score ?? null;
  const stress = data.life_stress_score ?? null;

  let readiness = data.perceived_readiness;
  if (!readiness) {
    if ((fatigue && fatigue >= 4) || (soreness && soreness >= 4) || (sleepDuration && sleepDuration < 5)) {
      readiness = 'REST_RECOMMENDED';
    } else if ((fatigue && fatigue >= 3) || (soreness && soreness >= 3)) {
      readiness = 'REDUCED';
    } else {
      readiness = 'OPTIMAL';
    }
  }

  const notes = data.notes ?? null;

  if (pgPool) {
    const res = await pgPool.query(
      \`INSERT INTO athlete_daily_wellness (
        user_id, logged_date, resting_heart_rate, sleep_duration_hours,
        sleep_quality_score, fatigue_score, muscle_soreness_score,
        life_stress_score, perceived_readiness, notes, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (user_id, logged_date) DO UPDATE SET
        resting_heart_rate = EXCLUDED.resting_heart_rate,
        sleep_duration_hours = EXCLUDED.sleep_duration_hours,
        sleep_quality_score = EXCLUDED.sleep_quality_score,
        fatigue_score = EXCLUDED.fatigue_score,
        muscle_soreness_score = EXCLUDED.muscle_soreness_score,
        life_stress_score = EXCLUDED.life_stress_score,
        perceived_readiness = EXCLUDED.perceived_readiness,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING *\`,
      [userId, loggedDate, restingHr, sleepDuration, sleepQuality, fatigue, soreness, stress, readiness, notes]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      user_id: r.user_id,
      logged_date: formatDateOnly(r.logged_date),
      resting_heart_rate: r.resting_heart_rate ? Number(r.resting_heart_rate) : undefined,
      sleep_duration_hours: r.sleep_duration_hours ? Number(r.sleep_duration_hours) : undefined,
      sleep_quality_score: r.sleep_quality_score ? Number(r.sleep_quality_score) : undefined,
      fatigue_score: r.fatigue_score ? Number(r.fatigue_score) : undefined,
      muscle_soreness_score: r.muscle_soreness_score ? Number(r.muscle_soreness_score) : undefined,
      life_stress_score: r.life_stress_score ? Number(r.life_stress_score) : undefined,
      perceived_readiness: r.perceived_readiness || 'OPTIMAL',
      notes: r.notes || '',
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  }

  const store = ensureLocalStore();
  if (!(store as any).athlete_daily_wellness) (store as any).athlete_daily_wellness = [];
  const list = (store as any).athlete_daily_wellness as AthleteDailyWellness[];
  const now = new Date().toISOString();
  const record: AthleteDailyWellness = {
    id: crypto.randomUUID(),
    user_id: userId,
    logged_date: loggedDate,
    resting_heart_rate: restingHr ?? undefined,
    sleep_duration_hours: sleepDuration ?? undefined,
    sleep_quality_score: sleepQuality ?? undefined,
    fatigue_score: fatigue ?? undefined,
    muscle_soreness_score: soreness ?? undefined,
    life_stress_score: stress ?? undefined,
    perceived_readiness: readiness,
    notes: notes || undefined,
    created_at: now,
    updated_at: now,
  };
  const idx = list.findIndex((w) => w.user_id === userId && w.logged_date === loggedDate);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...record, id: list[idx].id, updated_at: now };
    saveLocalStore(store);
    return list[idx];
  } else {
    list.unshift(record);
    saveLocalStore(store);
    return record;
  }
}
`, 'utf8');
console.log('src/lib/db/wellnessRepo.ts rewritten successfully');

