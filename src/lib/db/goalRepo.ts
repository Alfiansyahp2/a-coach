import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from './client';
import { FitnessGoal, PersonalRecord } from '@/types';

export async function getFitnessGoals(userId: string = DEFAULT_USER_ID): Promise<FitnessGoal[]> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM fitness_goals WHERE user_id = $1 ORDER BY is_primary DESC, priority ASC, target_date ASC',
      [userId]
    );
    return res.rows.map((row) => ({
      ...row,
      target_value: Number(row.target_value),
      current_value: Number(row.current_value),
      sport_type: row.sport_type || 'All',
      priority: Number(row.priority || 1),
      is_primary: Boolean(row.is_primary ?? (row.priority === 1)),
      target_event_name: row.target_event_name || '',
      start_date: formatDateOnly(row.start_date),
      target_date: formatDateOnly(row.target_date),
    }));
  }
  const store = ensureLocalStore();
  return store.fitness_goals
    .filter((g) => g.user_id === userId)
    .sort((a, b) => {
      const aPri = a.is_primary ? 0 : 1;
      const bPri = b.is_primary ? 0 : 1;
      return aPri - bPri;
    });
}

export async function getPrimaryFitnessGoal(userId: string = DEFAULT_USER_ID): Promise<FitnessGoal | null> {
  if (pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM fitness_goals WHERE user_id = $1 AND (is_primary = TRUE OR priority = 1) ORDER BY is_primary DESC, priority ASC LIMIT 1',
      [userId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      target_value: Number(row.target_value),
      current_value: Number(row.current_value),
      sport_type: row.sport_type || 'All',
      priority: Number(row.priority || 1),
      is_primary: Boolean(row.is_primary ?? (row.priority === 1)),
      target_event_name: row.target_event_name || '',
      start_date: formatDateOnly(row.start_date),
      target_date: formatDateOnly(row.target_date),
    };
  }
  const store = ensureLocalStore();
  const goals = store.fitness_goals.filter((g) => g.user_id === userId);
  return goals.find((g) => g.is_primary) || goals.find((g) => g.priority === 1) || goals[0] || null;
}

export async function createFitnessGoal(
  goal: Omit<FitnessGoal, 'id' | 'created_at' | 'updated_at'>
): Promise<FitnessGoal> {
  const now = new Date().toISOString();
  const sportType = goal.sport_type || 'All';
  const priority = goal.priority || (goal.is_primary ? 1 : 2);
  const isPrimary = goal.is_primary ?? (priority === 1);
  const eventName = goal.target_event_name || null;

  if (pgPool) {
    // If setting as primary, demote any other existing primary goals first
    if (isPrimary) {
      await pgPool.query('UPDATE fitness_goals SET is_primary = FALSE, priority = 2 WHERE user_id = $1', [goal.user_id]);
    }

    const query = `
      INSERT INTO fitness_goals (user_id, title, goal_type, sport_type, priority, is_primary, target_event_name, target_value, current_value, start_date, target_date, is_achieved, unit, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      goal.user_id,
      goal.title,
      goal.goal_type,
      sportType,
      priority,
      isPrimary,
      eventName,
      goal.target_value,
      goal.current_value,
      goal.start_date,
      goal.target_date,
      goal.is_achieved,
      goal.unit,
    ]);
    const r = res.rows[0];
    return {
      ...r,
      target_value: Number(r.target_value),
      current_value: Number(r.current_value),
      sport_type: r.sport_type || 'All',
      priority: Number(r.priority || 1),
      is_primary: Boolean(r.is_primary),
      start_date: formatDateOnly(r.start_date),
      target_date: formatDateOnly(r.target_date),
    };
  }

  const store = ensureLocalStore();
  if (isPrimary) {
    store.fitness_goals.forEach((g) => {
      if (g.user_id === goal.user_id) {
        g.is_primary = false;
        if (g.priority === 1) g.priority = 2;
      }
    });
  }
  const created: FitnessGoal = {
    ...goal,
    sport_type: sportType,
    priority,
    is_primary: isPrimary,
    target_event_name: eventName || undefined,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  store.fitness_goals.push(created);
  saveLocalStore(store);
  return created;
}

export async function upsertFitnessGoal(
  goal: Omit<FitnessGoal, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<FitnessGoal> {
  const now = new Date().toISOString();
  const sportType = goal.sport_type || 'All';
  const priority = goal.priority || (goal.is_primary ? 1 : 2);
  const isPrimary = goal.is_primary ?? (priority === 1);
  const eventName = goal.target_event_name || null;

  if (pgPool) {
    if (isPrimary) {
      await pgPool.query('UPDATE fitness_goals SET is_primary = FALSE, priority = 2 WHERE user_id = $1', [goal.user_id]);
    }

    if (goal.id) {
      const query = `
        INSERT INTO fitness_goals (id, user_id, title, goal_type, sport_type, priority, is_primary, target_event_name, target_value, current_value, start_date, target_date, is_achieved, unit, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          goal_type = EXCLUDED.goal_type,
          sport_type = EXCLUDED.sport_type,
          priority = EXCLUDED.priority,
          is_primary = EXCLUDED.is_primary,
          target_event_name = EXCLUDED.target_event_name,
          target_value = EXCLUDED.target_value,
          current_value = EXCLUDED.current_value,
          start_date = EXCLUDED.start_date,
          target_date = EXCLUDED.target_date,
          is_achieved = EXCLUDED.is_achieved,
          unit = EXCLUDED.unit,
          updated_at = NOW()
        RETURNING *;
      `;
      const res = await pgPool.query(query, [
        goal.id,
        goal.user_id,
        goal.title,
        goal.goal_type,
        sportType,
        priority,
        isPrimary,
        eventName,
        goal.target_value,
        goal.current_value,
        goal.start_date,
        goal.target_date,
        goal.is_achieved,
        goal.unit,
      ]);
      const row = res.rows[0];
      return {
        ...row,
        target_value: Number(row.target_value),
        current_value: Number(row.current_value),
        sport_type: row.sport_type || 'All',
        priority: Number(row.priority || 1),
        is_primary: Boolean(row.is_primary),
        target_event_name: row.target_event_name || '',
        start_date: formatDateOnly(row.start_date),
        target_date: formatDateOnly(row.target_date),
      };
    } else {
      return createFitnessGoal(goal);
    }
  }
  const store = ensureLocalStore();
  if (isPrimary) {
    store.fitness_goals.forEach((g) => {
      if (g.user_id === goal.user_id) {
        g.is_primary = false;
        if (g.priority === 1) g.priority = 2;
      }
    });
  }
  const existingIdx = goal.id ? store.fitness_goals.findIndex((g) => g.id === goal.id) : -1;
  const record: FitnessGoal = {
    ...goal,
    sport_type: sportType,
    priority,
    is_primary: isPrimary,
    target_event_name: eventName || undefined,
    id: goal.id || crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  if (existingIdx >= 0) {
    store.fitness_goals[existingIdx] = record;
  } else {
    store.fitness_goals.push(record);
  }
  saveLocalStore(store);
  return record;
}

export async function setPrimaryFitnessGoal(
  userId: string = DEFAULT_USER_ID,
  goalId: string
): Promise<FitnessGoal | null> {
  if (pgPool) {
    // Demote all other goals of user to is_primary = FALSE, priority = 2
    await pgPool.query('UPDATE fitness_goals SET is_primary = FALSE, priority = 2 WHERE user_id = $1', [userId]);
    // Promote target goal to is_primary = TRUE, priority = 1
    const res = await pgPool.query(
      'UPDATE fitness_goals SET is_primary = TRUE, priority = 1, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
      [goalId, userId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      ...r,
      target_value: Number(r.target_value),
      current_value: Number(r.current_value),
      sport_type: r.sport_type || 'All',
      priority: 1,
      is_primary: true,
      start_date: formatDateOnly(r.start_date),
      target_date: formatDateOnly(r.target_date),
    };
  }
  const store = ensureLocalStore();
  let found: FitnessGoal | null = null;
  store.fitness_goals.forEach((g) => {
    if (g.user_id === userId) {
      if (g.id === goalId) {
        g.is_primary = true;
        g.priority = 1;
        found = g;
      } else {
        g.is_primary = false;
        if (g.priority === 1) g.priority = 2;
      }
    }
  });
  saveLocalStore(store);
  return found;
}

export { getPersonalRecords, upsertPersonalRecord } from './prRepo';

