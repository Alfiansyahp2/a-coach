import { pgPool, ensureLocalStore, DEFAULT_USER_ID } from '../client';
import { Activity } from '@/types';
import { normalizeActivityRow } from './activityTypes';

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

