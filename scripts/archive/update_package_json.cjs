const fs = require('fs');
const path = require('path');

const pkgFile = path.join(__dirname, '..', '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));

pkg.scripts = {
  dev: "next dev",
  build: "next build",
  start: "next start",
  lint: "eslint",
  seed: "node scripts/seed/seed.js",
  "seed:personal": "node scripts/seed/seed_athlete_health.js",
  "import:strava": "python scripts/parsers/process_strava_images.py && node scripts/seed/seed_imported_activities.js",
  "test:health": "node scripts/tests/test_athlete_health_system.js",
  "test:coach": "node scripts/tests/test_coach_training_system.js",
  "test:streak": "node scripts/tests/test_weekly_streak_system.js",
  "db:audit": "node scripts/maintenance/audit_database_schema.cjs",
};

fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('package.json scripts updated successfully');

