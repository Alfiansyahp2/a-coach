import { User, AthleteProfile, PhysiologicalMeasurements } from '@/types';
import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID } from './client';
import { getAthleteProfile, upsertAthleteProfile, logHealthAuditTrail } from './healthRepo';

export interface UpdateUserProfileParams {
  name?: string;
  avatar_url?: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  resting_heart_rate?: number;
  max_heart_rate?: number;
  training_days_per_week?: number;
  preferred_sports?: string[];
  training_experience?: string;
  performance_objectives?: string;
  physiological_measurements?: Partial<PhysiologicalMeasurements>;
}

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

export async function updateUserProfile(
  userId: string = DEFAULT_USER_ID,
  params: UpdateUserProfileParams
): Promise<{ user: User; profile: AthleteProfile }> {
  const currentUser = await getUser(userId);
  const currentProfile = await getAthleteProfile(userId);

  const updatedName = params.name !== undefined && params.name.trim().length > 0 ? params.name.trim() : currentUser?.name || 'Altra';
  const updatedAvatar = params.avatar_url !== undefined ? params.avatar_url : currentUser?.avatar_url;
  const updatedHeight = params.height_cm !== undefined ? Number(params.height_cm) : currentUser?.height_cm || 170.0;
  const updatedWeight = params.weight_kg !== undefined ? Number(params.weight_kg) : currentUser?.weight_kg || 65.0;
  const updatedRhr = params.resting_heart_rate !== undefined ? Number(params.resting_heart_rate) : currentUser?.resting_heart_rate || 68;
  const updatedMaxHr = params.max_heart_rate !== undefined ? Number(params.max_heart_rate) : currentUser?.max_heart_rate || 188;
  const updatedAge = params.age !== undefined ? Number(params.age) : currentProfile?.age || 22;
  const updatedDays = params.training_days_per_week !== undefined ? Number(params.training_days_per_week) : currentProfile?.training_days_per_week || 3;
  const updatedSports = params.preferred_sports || currentProfile?.preferred_sports || ['Running', 'Cycling'];
  const updatedExperience = params.training_experience || currentProfile?.training_experience || 'INTERMEDIATE';
  const updatedObjectives = params.performance_objectives || currentProfile?.performance_objectives || 'Aerobic endurance maintenance with safe multi-sport progression';

  // Merged physiological measurements
  const updatedPhysio = params.physiological_measurements
    ? { ...(currentProfile?.physiological_measurements || {}), ...params.physiological_measurements }
    : currentProfile?.physiological_measurements || {};

  const calculatedBmi = Math.round((updatedWeight / Math.pow(updatedHeight / 100, 2)) * 10) / 10;

  let user: User;
  let profile: AthleteProfile;

  if (pgPool) {
    const userRes = await pgPool.query(
      `UPDATE users
       SET name = $1, avatar_url = $2, height_cm = $3, weight_kg = $4, resting_heart_rate = $5, max_heart_rate = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [updatedName, updatedAvatar || null, updatedHeight, updatedWeight, updatedRhr, updatedMaxHr, userId]
    );
    const uRow = userRes.rows[0];
    user = {
      ...uRow,
      weight_kg: Number(uRow.weight_kg),
      height_cm: Number(uRow.height_cm),
      resting_heart_rate: Number(uRow.resting_heart_rate),
      max_heart_rate: Number(uRow.max_heart_rate),
    };

    const profRes = await pgPool.query(
      `INSERT INTO athlete_profiles (
        user_id, age, height_cm, weight_kg, bmi, resting_heart_rate,
        training_days_per_week, preferred_sports, training_experience,
        performance_objectives, physiological_measurements, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        age = EXCLUDED.age,
        height_cm = EXCLUDED.height_cm,
        weight_kg = EXCLUDED.weight_kg,
        bmi = EXCLUDED.bmi,
        resting_heart_rate = EXCLUDED.resting_heart_rate,
        training_days_per_week = EXCLUDED.training_days_per_week,
        preferred_sports = EXCLUDED.preferred_sports,
        training_experience = EXCLUDED.training_experience,
        performance_objectives = EXCLUDED.performance_objectives,
        physiological_measurements = EXCLUDED.physiological_measurements,
        updated_at = NOW()
      RETURNING *`,
      [
        userId,
        updatedAge,
        updatedHeight,
        updatedWeight,
        calculatedBmi,
        updatedRhr,
        updatedDays,
        updatedSports,
        updatedExperience,
        updatedObjectives,
        JSON.stringify(updatedPhysio),
      ]
    );
    const pRow = profRes.rows[0];
    profile = {
      ...pRow,
      age: Number(pRow.age),
      height_cm: Number(pRow.height_cm),
      weight_kg: Number(pRow.weight_kg),
      bmi: Number(pRow.bmi),
      resting_heart_rate: Number(pRow.resting_heart_rate),
      training_days_per_week: Number(pRow.training_days_per_week),
      preferred_sports: pRow.preferred_sports || ['Running', 'Cycling'],
      training_experience: pRow.training_experience || 'INTERMEDIATE',
      performance_objectives: pRow.performance_objectives || '',
      physiological_measurements: pRow.physiological_measurements || {},
    };
  } else {
    const store = ensureLocalStore();
    const uIdx = store.users.findIndex((u) => u.id === userId);
    user = {
      id: userId,
      email: currentUser?.email || 'athlete@personal.internal',
      name: updatedName,
      avatar_url: updatedAvatar,
      height_cm: updatedHeight,
      weight_kg: updatedWeight,
      resting_heart_rate: updatedRhr,
      max_heart_rate: updatedMaxHr,
      created_at: currentUser?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (uIdx !== -1) store.users[uIdx] = user;
    else store.users.push(user);

    profile = await upsertAthleteProfile({
      user_id: userId,
      age: updatedAge,
      height_cm: updatedHeight,
      weight_kg: updatedWeight,
      resting_heart_rate: updatedRhr,
      training_days_per_week: updatedDays,
      preferred_sports: updatedSports,
      training_experience: updatedExperience,
      performance_objectives: updatedObjectives,
      physiological_measurements: updatedPhysio as any,
    });
    saveLocalStore(store);
  }

  await logHealthAuditTrail({
    user_id: userId,
    entity_type: 'ATHLETE_PROFILE',
    entity_id: userId,
    action: 'UPDATE',
    state_before: {
      name: currentUser?.name,
      avatar: currentUser?.avatar_url,
      rhr: currentUser?.resting_heart_rate,
      height: currentUser?.height_cm,
      weight: currentUser?.weight_kg,
      age: currentProfile?.age,
      objectives: currentProfile?.performance_objectives,
    },
    state_after: {
      name: user.name,
      avatar: user.avatar_url,
      rhr: user.resting_heart_rate,
      height: user.height_cm,
      weight: user.weight_kg,
      age: profile.age,
      bmi: profile.bmi,
      objectives: profile.performance_objectives,
    },
    modified_by: 'ATHLETE',
  });

  return { user, profile };
}

