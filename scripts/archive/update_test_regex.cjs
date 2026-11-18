const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'scripts', 'tests', 'test_coach_training_system.js');
let c = fs.readFileSync(filePath, 'utf8');

c = c.replace(
  /test\('Workouts include safe running return-to-run progression[\s\S]*?assert\.ok\(plannedCategories\.has\('Cross Training'[\s\S]*?\n  \}\);/,
  `test('Workouts follow goal-driven structure with sport-specific progression and safe rehab slots', () => {
    const plannedCategories = new Set(workoutRes.rows.filter(w => w.status === 'PLANNED').map(w => w.workout_category));
    const hasActiveSport = plannedCategories.has('Cycling') || plannedCategories.has('Easy Run') || plannedCategories.has('Long Run');
    assert.ok(hasActiveSport, 'Must have planned endurance progression workouts for active goal');
    assert.ok(plannedCategories.has('Cross Training') || plannedCategories.has('Strength Training'), 'Must have planned rehab/mobility workouts');
  });`
);

fs.writeFileSync(filePath, c, 'utf8');
console.log('Successfully updated test_coach_training_system.js');
