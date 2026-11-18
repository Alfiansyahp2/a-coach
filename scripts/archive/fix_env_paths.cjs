const fs = require('fs');
const path = require('path');

const filesToFix = [
  path.join(__dirname, '..', 'migrations', 'migrate_health_schema.js'),
  path.join(__dirname, '..', 'seed', 'seed_athlete_health.js'),
  path.join(__dirname, '..', 'tests', 'test_athlete_health_system.js'),
];

filesToFix.forEach((f) => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    const oldPattern = `const envLocalPath = path.join(__dirname, '..', '.env.local');`;
    const newPattern = `const envCandidates = [
  path.resolve(process.cwd(), '.env.local'),
  path.join(__dirname, '..', '.env.local'),
  path.join(__dirname, '..', '..', '.env.local'),
];
const envLocalPath = envCandidates.find((p) => fs.existsSync(p)) || envCandidates[0];`;
    if (content.includes(oldPattern)) {
      content = content.replace(oldPattern, newPattern);
      fs.writeFileSync(f, content, 'utf8');
      console.log('Fixed env path in:', f);
    }
  }
});

