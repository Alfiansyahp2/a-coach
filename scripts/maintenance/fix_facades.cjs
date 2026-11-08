const fs = require('fs');
const path = require('path');

// 1. Fix aiCoachEngine.ts
const aiCoachPath = path.join('src', 'lib', 'domain', 'coach', 'aiCoachEngine.ts');
if (fs.existsSync(aiCoachPath)) {
  let content = fs.readFileSync(aiCoachPath, 'utf8');
  content = content.replace("from './formatters'", "from '@/lib/formatters'");
  fs.writeFileSync(aiCoachPath, content, 'utf8');
  console.log('[FIX] Fixed imports in aiCoachEngine.ts');
}

// 2. Fix coachTrainingGenerator.ts
const coachGenPath = path.join('src', 'lib', 'domain', 'coach', 'coachTrainingGenerator.ts');
if (fs.existsSync(coachGenPath)) {
  let content = fs.readFileSync(coachGenPath, 'utf8');
  content = content.replace("from './db'", "from '@/lib/db'");
  content = content.replace("from './training/workoutTemplates'", "from '@/lib/training/workoutTemplates'");
  content = content.replace("from './training/generators'", "from '@/lib/training/generators'");
  fs.writeFileSync(coachGenPath, content, 'utf8');
  console.log('[FIX] Fixed imports in coachTrainingGenerator.ts');
}

// 3. Fix matchingEngine.ts
const matchPath = path.join('src', 'lib', 'domain', 'matching', 'matchingEngine.ts');
if (fs.existsSync(matchPath)) {
  let content = fs.readFileSync(matchPath, 'utf8');
  content = content.replace("from './db'", "from '@/lib/db'");
  fs.writeFileSync(matchPath, content, 'utf8');
  console.log('[FIX] Fixed imports in matchingEngine.ts');
}

// 4. Update all facades to safely export without forcing non-existent default exports
const facades = [
  { file: 'src/components/ActivityFeed.tsx', target: './activity/ActivityFeed' },
  { file: 'src/components/ActivityManagementDeck.tsx', target: './activity/ActivityManagementDeck' },
  { file: 'src/components/AddActivityModal.tsx', target: './activity/modal/AddActivityModal' },
  { file: 'src/components/EditActivityModal.tsx', target: './activity/modal/EditActivityModal' },
  { file: 'src/components/MetricCard.tsx', target: './ui/MetricCard', hasDefault: true },
  { file: 'src/components/PersonalRecordsDeck.tsx', target: './records/PersonalRecordsDeck' },
  { file: 'src/components/StravaConnectCard.tsx', target: './strava/StravaConnectCard' },
  { file: 'src/components/VolumeProgressionChart.tsx', target: './charts/VolumeProgressionChart' },
  { file: 'src/lib/readinessEngine.ts', target: './domain/readiness/readinessEngine' },
  { file: 'src/lib/streakEngine.ts', target: './domain/streak/streakEngine' },
  { file: 'src/lib/ai-coach.ts', target: './domain/coach/aiCoachEngine' },
  { file: 'src/lib/coachTrainingGenerator.ts', target: './domain/coach/coachTrainingGenerator' },
  { file: 'src/lib/matching.ts', target: './domain/matching/matchingEngine' },
  { file: 'src/lib/personalRecords.ts', target: './domain/records/personalRecordsEngine' },
  { file: 'src/lib/sportUtils.ts', target: './domain/sports/sportUtils' },
  { file: 'src/lib/formatters.ts', target: './shared/formatters' },
  { file: 'src/lib/analytics.ts', target: './shared/analytics' },
];

for (const facade of facades) {
  let facadeCode = `// Clean Architecture Backward-Compatibility Facade\nexport * from "${facade.target}";\n`;
  if (facade.hasDefault) {
    facadeCode += `export { default } from "${facade.target}";\n`;
  }
  fs.writeFileSync(facade.file, facadeCode, 'utf8');
  console.log(`[FIX] Updated facade ${facade.file}`);
}

console.log('Facade and import fixes applied successfully.');

