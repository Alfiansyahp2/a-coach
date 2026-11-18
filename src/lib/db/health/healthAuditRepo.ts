import { pgPool, ensureLocalStore, saveLocalStore } from '../client';
import { HealthAuditTrail } from '@/types';

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

