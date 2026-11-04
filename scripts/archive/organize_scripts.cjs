const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const scriptsDir = path.join(rootDir, 'scripts');

// 1. Define target directories
const targetDirs = [
  'migrations',
  'maintenance',
  'tests',
  'parsers',
  'seed',
  'archive',
];

targetDirs.forEach((dir) => {
  const fullPath = path.join(scriptsDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: scripts/${dir}`);
  }
});

// 2. Mapping of files to their destination folder
const moveMap = {
  // Migrations
  'run_migration_001.cjs': 'migrations/run_migration_001.cjs',
  'migrate_health_schema.js': 'migrations/migrate_health_schema.js',
  'migrate_biometrics_and_clean_dummy.js': 'migrations/migrate_biometrics_and_clean_dummy.js',

  // Maintenance & Audit
  'audit_database_schema.cjs': 'maintenance/audit_database_schema.cjs',
  'align_repos_with_db.cjs': 'maintenance/align_repos_with_db.cjs',
  'update_schema_sql.cjs': 'maintenance/update_schema_sql.cjs',
  'sync_personal_records.js': 'maintenance/sync_personal_records.js',
  'add_get_db_status.cjs': 'maintenance/add_get_db_status.cjs',

  // Tests
  'test_athlete_health_system.js': 'tests/test_athlete_health_system.js',
  'test_coach_training_system.js': 'tests/test_coach_training_system.js',
  'test_weekly_streak_system.js': 'tests/test_weekly_streak_system.js',
  'test_add_activity_flow.js': 'tests/test_add_activity_flow.js',

  // Parsers (Python)
  'parse_activity_image.py': 'parsers/parse_activity_image.py',
  'process_strava_images.py': 'parsers/process_strava_images.py',

  // Seeders
  'seed.js': 'seed/seed.js',
  'personal/seed_athlete_health.js': 'seed/seed_athlete_health.js',
  'personal/seed_coach_training.js': 'seed/seed_coach_training.js',
  'personal/seed_imported_activities.js': 'seed/seed_imported_activities.js',

  // Archive (completed one-off transforms)
  'update_types.cjs': 'archive/update_types.cjs',
  'update_client_schema.cjs': 'archive/update_client_schema.cjs',
  'update_goal_repo.cjs': 'archive/update_goal_repo.cjs',
  'update_health_repo.cjs': 'archive/update_health_repo.cjs',
  'update_coach_generator.cjs': 'archive/update_coach_generator.cjs',
  'fix_readiness_wellness.cjs': 'archive/fix_readiness_wellness.cjs',
};

// 3. Move files
for (const [srcRel, destRel] of Object.entries(moveMap)) {
  const srcPath = path.join(scriptsDir, srcRel);
  const destPath = path.join(scriptsDir, destRel);
  if (fs.existsSync(srcPath)) {
    // ensure parent dir exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.renameSync(srcPath, destPath);
    console.log(`Moved: scripts/${srcRel} -> scripts/${destRel}`);
  } else {
    console.log(`Notice: source file not found (might already be moved): scripts/${srcRel}`);
  }
}

// 4. Remove empty scripts/personal if empty
const personalDir = path.join(scriptsDir, 'personal');
if (fs.existsSync(personalDir)) {
  const files = fs.readdirSync(personalDir);
  if (files.length === 0) {
    fs.rmdirSync(personalDir);
    console.log('Removed empty directory: scripts/personal');
  }
}

console.log('Files organized successfully!');
