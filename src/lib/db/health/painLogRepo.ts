import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID } from '../client';
import { AthletePainLog } from '@/types';

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

