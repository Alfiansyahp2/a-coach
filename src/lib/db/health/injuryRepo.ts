import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from '../client';
import { AthleteInjury } from '@/types';

export async function getAthleteInjuries(userId: string = DEFAULT_USER_ID): Promise<AthleteInjury[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_injuries WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows.map((r) => ({
      ...r,
      previous_swelling: Boolean(r.previous_swelling),
      estimated_injury_date: r.estimated_injury_date ? formatDateOnly(r.estimated_injury_date) : null,
    }));
  }

  const store = ensureLocalStore();
  return store.athlete_injuries.filter((i) => i.user_id === userId);
}

export async function getAthleteInjuryById(
  id: string,
  userId: string = DEFAULT_USER_ID
): Promise<AthleteInjury | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM athlete_injuries WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      ...r,
      previous_swelling: Boolean(r.previous_swelling),
      estimated_injury_date: r.estimated_injury_date ? formatDateOnly(r.estimated_injury_date) : null,
    };
  }

  const store = ensureLocalStore();
  return store.athlete_injuries.find((i) => i.id === id && i.user_id === userId) || null;
}

export async function updateAthleteInjury(
  id: string,
  userId: string = DEFAULT_USER_ID,
  updates: Partial<Pick<AthleteInjury, 'current_status' | 'recovery_notes' | 'clinician_restrictions' | 'functional_limitations' | 'medical_evaluation_status'>>
): Promise<AthleteInjury | null> {
  if (pgPool) {
    const res = await pgPool.query(
      `UPDATE athlete_injuries SET
        current_status = COALESCE($1, current_status),
        recovery_notes = COALESCE($2, recovery_notes),
        clinician_restrictions = COALESCE($3, clinician_restrictions),
        functional_limitations = COALESCE($4, functional_limitations),
        medical_evaluation_status = COALESCE($5, medical_evaluation_status),
        updated_at = NOW()
      WHERE id = $6 AND user_id = $7
      RETURNING *`,
      [
        updates.current_status ?? null,
        updates.recovery_notes ?? null,
        updates.clinician_restrictions ?? null,
        updates.functional_limitations ?? null,
        updates.medical_evaluation_status ?? null,
        id,
        userId,
      ]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      ...r,
      previous_swelling: Boolean(r.previous_swelling),
      estimated_injury_date: r.estimated_injury_date ? formatDateOnly(r.estimated_injury_date) : null,
    };
  }

  const store = ensureLocalStore();
  const idx = store.athlete_injuries.findIndex((i) => i.id === id && i.user_id === userId);
  if (idx === -1) return null;

  const current = store.athlete_injuries[idx];
  const updated: AthleteInjury = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  store.athlete_injuries[idx] = updated;
  saveLocalStore(store);
  return updated;
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

