import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID } from '../client';
import { AthleteProfile } from '@/types';

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

