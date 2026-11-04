const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'src', 'lib', 'db', 'goalRepo.ts');
const content = fs.readFileSync(filePath, 'utf8');

const func = `

export async function setPrimaryFitnessGoal(
  userId: string = DEFAULT_USER_ID,
  goalId: string
): Promise<FitnessGoal | null> {
  if (pgPool) {
    // Demote all other goals of user to priority 2
    await pgPool.query('UPDATE fitness_goals SET priority = 2 WHERE user_id = $1', [userId]);
    // Promote target goal to priority 1
    const res = await pgPool.query(
      'UPDATE fitness_goals SET priority = 1, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
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
      start_date: formatDateOnly(r.start_date),
      target_date: formatDateOnly(r.target_date),
    };
  }
  const store = ensureLocalStore();
  let found: FitnessGoal | null = null;
  store.fitness_goals.forEach((g) => {
    if (g.user_id === userId) {
      if (g.id === goalId) {
        g.priority = 1;
        found = g;
      } else if (g.priority === 1) {
        g.priority = 2;
      }
    }
  });
  saveLocalStore(store);
  return found;
}
`;

fs.writeFileSync(filePath, content.trimEnd() + func, 'utf8');
console.log('Successfully appended setPrimaryFitnessGoal to goalRepo.ts');
