const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'src', 'lib', 'db', 'trainingRepo.ts');
let c = fs.readFileSync(filePath, 'utf8');

// Fix createTrainingPlan
c = c.replace(
  `      INSERT INTO training_plans (user_id, title, description, start_date, end_date, is_active, updated_at)\r
      VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
  `      INSERT INTO training_plans (user_id, goal_id, title, description, start_date, end_date, is_active, updated_at)\r
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`
);
c = c.replace(
  `      INSERT INTO training_plans (user_id, title, description, start_date, end_date, is_active, updated_at)\n      VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
  `      INSERT INTO training_plans (user_id, goal_id, title, description, start_date, end_date, is_active, updated_at)\n      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`
);

// Fix createScheduledWorkout
c = c.replace(
  `      INSERT INTO scheduled_workouts (\r
        user_id, plan_id, scheduled_date, workout_category, target_distance_meters,\r
        target_duration_seconds, target_pace_seconds_per_km, target_intensity, description, status, updated_at\r
      )\r
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
  `      INSERT INTO scheduled_workouts (\r
        user_id, plan_id, scheduled_date, workout_category, target_distance_meters,\r
        target_duration_seconds, target_pace_seconds_per_km, target_intensity, description, status, is_key_session, milestone_target_km, updated_at\r
      )\r
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`
);
c = c.replace(
  `      INSERT INTO scheduled_workouts (\n        user_id, plan_id, scheduled_date, workout_category, target_distance_meters,\n        target_duration_seconds, target_pace_seconds_per_km, target_intensity, description, status, updated_at\n      )\n      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
  `      INSERT INTO scheduled_workouts (\n        user_id, plan_id, scheduled_date, workout_category, target_distance_meters,\n        target_duration_seconds, target_pace_seconds_per_km, target_intensity, description, status, is_key_session, milestone_target_km, updated_at\n      )\n      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`
);

fs.writeFileSync(filePath, c, 'utf8');
console.log('Successfully fixed trainingRepo.ts SQL queries');
