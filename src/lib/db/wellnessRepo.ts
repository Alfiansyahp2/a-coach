import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from './client';
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
      `INSERT INTO athlete_daily_wellness (
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
      RETURNING *`,
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
