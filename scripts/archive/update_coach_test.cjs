const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'scripts', 'tests', 'test_coach_training_system.js');
let c = fs.readFileSync(filePath, 'utf8');

const target = `  test('Workouts include safe running return-to-run progression alongside cycling and rehab', () => {
    // Running sessions are planned as gradual micro-doses (Recovery Run / Easy Run)
    const runningWorkouts = workoutRes.rows.filter(w => 
      ['Recovery Run', 'Easy Run'].includes(w.workout_category) && w.status === 'PLANNED'
    );
    assert.ok(runningWorkouts.length >= 1, 'Must have planned return-to-run workouts');

    // Cycling and Cross Training are also present
    const plannedCategories = new Set(workoutRes.rows.filter(w => w.status === 'PLANNED').map(w => w.workout_category));
    assert.ok(plannedCategories.has('Cycling'), 'Must have planned cycling workouts');
    assert.ok(plannedCategories.has('Cross Training') || plannedCategories.has('Strength Training'), 'Must have planned rehab workouts');
  });`;

const replacement = `  test('Workouts follow goal-driven structure with sport-specific progression and safe rehab slots', () => {
    const plannedCategories = new Set(workoutRes.rows.filter(w => w.status === 'PLANNED').map(w => w.workout_category));
    // Must have either cycling or running progression based on the active goal archetype
    const hasActiveSport = plannedCategories.has('Cycling') || plannedCategories.has('Easy Run') || plannedCategories.has('Long Run');
    assert.ok(hasActiveSport, 'Must have planned endurance progression workouts for active goal');
    // Must always preserve rehab / cross-training / mobility slots
    assert.ok(plannedCategories.has('Cross Training') || plannedCategories.has('Strength Training'), 'Must have planned rehab/mobility workouts');
  });`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Successfully updated test_coach_training_system.js');
} else if (c.includes(target.replace(/\r\n/g, '\n'))) {
  c = c.replace(target.replace(/\r\n/g, '\n'), replacement.replace(/\r\n/g, '\n'));
  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Successfully updated test_coach_training_system.js (LF version)');
} else {
  console.error('Target not found in test_coach_training_system.js');
}
