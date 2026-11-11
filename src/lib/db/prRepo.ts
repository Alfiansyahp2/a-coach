import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from './client';
import { PersonalRecord } from '@/types';

export async function getPersonalRecords(userId: string = DEFAULT_USER_ID): Promise<PersonalRecord[]> {
  if (pgPool) {
    const query = `
      SELECT pr.*, a.name as activity_name, COALESCE(pr.sport_type, a.sport_type, 'Run') as sport_type
      FROM personal_records pr
      LEFT JOIN activities a ON pr.activity_id = a.id
      WHERE pr.user_id = $1
      ORDER BY pr.category ASC
    `;
    const res = await pgPool.query(query, [userId]);
    return res.rows.map((row) => ({
      ...row,
      record_value: Number(row.record_value),
      achieved_date: formatDateOnly(row.achieved_date),
    }));
  }
  const store = ensureLocalStore();
  return store.personal_records.filter((p) => p.user_id === userId);
}

export async function upsertPersonalRecord(
  pr: Omit<PersonalRecord, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<PersonalRecord> {
  const now = new Date().toISOString();
  if (pgPool) {
    const query = `
      INSERT INTO personal_records (
        id, user_id, activity_id, sport_type, category,
        record_value, record_display, achieved_date, subtext, updated_at
      ) VALUES (
        COALESCE($1, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, $9, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        activity_id = EXCLUDED.activity_id,
        sport_type = EXCLUDED.sport_type,
        category = EXCLUDED.category,
        record_value = EXCLUDED.record_value,
        record_display = EXCLUDED.record_display,
        achieved_date = EXCLUDED.achieved_date,
        subtext = EXCLUDED.subtext,
        updated_at = NOW()
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      pr.id || null,
      pr.user_id,
      pr.activity_id || null,
      pr.sport_type || 'Run',
      pr.category,
      pr.record_value,
      pr.record_display,
      pr.achieved_date,
      pr.subtext || null,
    ]);
    const row = res.rows[0];
    return {
      ...row,
      record_value: Number(row.record_value),
      achieved_date: formatDateOnly(row.achieved_date),
    };
  }
  const store = ensureLocalStore();
  const existingIdx = pr.id ? store.personal_records.findIndex((p) => p.id === pr.id) : -1;
  const record: PersonalRecord = {
    ...pr,
    id: pr.id || crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  if (existingIdx >= 0) {
    store.personal_records[existingIdx] = record;
  } else {
    store.personal_records.push(record);
  }
  saveLocalStore(store);
  return record;
}

