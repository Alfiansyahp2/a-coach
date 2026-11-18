const fs = require('fs');
const path = require('path');

const goalRepoFile = path.join(__dirname, '..', 'src', 'lib', 'db', 'goalRepo.ts');

const newGoalRepo = `import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from './client';
import { FitnessGoal, PersonalRecord } from '@/types';

export async function getFitnessGoals(userId: string = DEFAULT_USER_ID): Promise<FitnessGoal[]> {
  if (pgPool) {
    const res = await pgPool.query('SELECT * FROM fitness_goals WHERE user_id = $1 ORDER BY priority ASC, target_date ASC', [userId]);
    return res.rows.map((row) => ({
      ...row,
      target_value: Number(row.target_value),
      current_value: Number(row.current_value),
      sport_type: row.sport_type || 'All',
      priority: Number(row.priority || 1),
      target_event_name: row.target_event_name || '',
      start_date: formatDateOnly(row.start_date),
      target_date: formatDateOnly(row.target_date),
    }));
  }
  const store = ensureLocalStore();
  return store.fitness_goals.filter((g) => g.user_id === userId);
}

export async function createFitnessGoal(goal: Omit<FitnessGoal, 'id' | 'created_at' | 'updated_at'>): Promise<FitnessGoal> {
  const now = new Date().toISOString();
  const sportType = goal.sport_type || 'All';
  const priority = goal.priority || 1;
  const eventName = goal.target_event_name || null;

  if (pgPool) {
    const query = \`
      INSERT INTO fitness_goals (user_id, title, goal_type, sport_type, priority, target_event_name, target_value, current_value, start_date, target_date, is_achieved, unit, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *;
    \`;
    const res = await pgPool.query(query, [
      goal.user_id,
      goal.title,
      goal.goal_type,
      sportType,
      priority,
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
      start_date: formatDateOnly(r.start_date),
      target_date: formatDateOnly(r.target_date),
    };
  }

  const store = ensureLocalStore();
  const created: FitnessGoal = {
    ...goal,
    sport_type: sportType,
    priority,
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
  const priority = goal.priority || 1;
  const eventName = goal.target_event_name || null;

  if (pgPool) {
    if (goal.id) {
      const query = \`
        INSERT INTO fitness_goals (id, user_id, title, goal_type, sport_type, priority, target_event_name, target_value, current_value, start_date, target_date, is_achieved, unit, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          goal_type = EXCLUDED.goal_type,
          sport_type = EXCLUDED.sport_type,
          priority = EXCLUDED.priority,
          target_event_name = EXCLUDED.target_event_name,
          target_value = EXCLUDED.target_value,
          current_value = EXCLUDED.current_value,
          start_date = EXCLUDED.start_date,
          target_date = EXCLUDED.target_date,
          is_achieved = EXCLUDED.is_achieved,
          unit = EXCLUDED.unit,
          updated_at = NOW()
        RETURNING *;
      \`;
      const res = await pgPool.query(query, [
        goal.id,
        goal.user_id,
        goal.title,
        goal.goal_type,
        sportType,
        priority,
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
        target_event_name: row.target_event_name || '',
        start_date: formatDateOnly(row.start_date),
        target_date: formatDateOnly(row.target_date),
      };
    } else {
      return createFitnessGoal(goal);
    }
  }
  const store = ensureLocalStore();
  const existingIdx = goal.id ? store.fitness_goals.findIndex((g) => g.id === goal.id) : -1;
  const record: FitnessGoal = {
    ...goal,
    sport_type: sportType,
    priority,
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

export async function getPersonalRecords(userId: string = DEFAULT_USER_ID): Promise<PersonalRecord[]> {
  if (pgPool) {
    const query = \`
      SELECT pr.*, a.name as activity_name, COALESCE(pr.sport_type, a.sport_type, 'Run') as sport_type
      FROM personal_records pr
      LEFT JOIN activities a ON pr.activity_id = a.id
      WHERE pr.user_id = $1
      ORDER BY pr.category ASC
    \`;
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
    const query = \`
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
    \`;
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
`;

fs.writeFileSync(goalRepoFile, newGoalRepo, 'utf8');
console.log('src/lib/db/goalRepo.ts successfully updated');

