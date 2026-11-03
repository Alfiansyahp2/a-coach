import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from './client';
import { FitnessGoal, PersonalRecord } from '@/types';

export async function getFitnessGoals(userId: string = DEFAULT_USER_ID): Promise<FitnessGoal[]> {
  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM fitness_goals WHERE user_id = $1 ORDER BY target_date ASC', [userId]);
    return res.rows.map((row) => ({
      ...row,
      start_date: formatDateOnly(row.start_date),
      target_date: formatDateOnly(row.target_date),
    }));
  }
  const store = ensureLocalStore();
  return store.fitness_goals.filter((g) => g.user_id === userId);
}

export async function createFitnessGoal(goal: Omit<FitnessGoal, 'id' | 'created_at' | 'updated_at'>): Promise<FitnessGoal> {
  const now = new Date().toISOString();
  if (pgPool) {
    const query = `
      INSERT INTO fitness_goals (user_id, title, goal_type, target_value, current_value, start_date, target_date, is_achieved, unit, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *;
    `;
    const res = await pgPool.query(query, [
      goal.user_id,
      goal.title,
      goal.goal_type,
      goal.target_value,
      goal.current_value,
      goal.start_date,
      goal.target_date,
      goal.is_achieved,
      goal.unit,
    ]);
    return res.rows[0];
  }

  const store = ensureLocalStore();
  const created: FitnessGoal = {
    ...goal,
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
  if (pgPool) {
    if (goal.id) {
      const query = `
        INSERT INTO fitness_goals (id, user_id, title, goal_type, target_value, current_value, start_date, target_date, is_achieved, unit, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          goal_type = EXCLUDED.goal_type,
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
        start_date:
          row.start_date instanceof Date
            ? row.start_date.toISOString().split('T')[0]
            : String(row.start_date).split('T')[0],
        target_date:
          row.target_date instanceof Date
            ? row.target_date.toISOString().split('T')[0]
            : String(row.target_date).split('T')[0],
      };
    } else {
      return createFitnessGoal(goal);
    }
  }
  const store = ensureLocalStore();
  const existingIdx = goal.id ? store.fitness_goals.findIndex((g) => g.id === goal.id) : -1;
  const record: FitnessGoal = {
    ...goal,
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

export async function getPersonalRecords(userId: string = DEFAULT_USER_ID): Promise<PersonalRecord[]> {
  if (pgPool) {
    const query = `
      SELECT pr.*, a.name as activity_name, COALESCE(pr.sport_type, a.sport_type, 'Run') as sport_type
      FROM personal_records pr
      LEFT JOIN activities a ON pr.activity_id = a.id
      WHERE pr.user_id = $1
      ORDER BY pr.sport_type ASC, pr.achieved_date DESC
    `;
    const res = await pgPool.query(query, [userId]);
    return res.rows;
  }
  const store = ensureLocalStore();
  const prs = store.personal_records.filter((p) => p.user_id === userId);
  return prs.map((pr) => {
    const act = store.activities.find((a) => a.id === pr.activity_id);
    return {
      ...pr,
      activity_name: act?.name,
      sport_type: pr.sport_type || act?.sport_type || 'Run',
    };
  });
}

export async function getDatabaseStatus(): Promise<{ type: 'PostgreSQL' | 'Local Store'; connected: boolean; info: string }> {
  if (pgPool) {
    try {
      const res = await pgPool.query('SELECT NOW() as current_time');
      return {
        type: 'PostgreSQL',
        connected: true,
        info: `Connected to PostgreSQL (${res.rows[0].current_time})`,
      };
    } catch (err: any) {
      return {
        type: 'PostgreSQL',
        connected: false,
        info: `Connection error: ${err.message}`,
      };
    }
  }
  return {
    type: 'Local Store',
    connected: true,
    info: 'Using file-backed atomic store (.data/store.json). Set DATABASE_URL to connect to PostgreSQL.',
  };
}
