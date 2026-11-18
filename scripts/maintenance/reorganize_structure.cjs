const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function moveWithFacade(srcRel, destRel, transformFn) {
  const root = process.cwd();
  const srcPath = path.join(root, srcRel);
  const destPath = path.join(root, destRel);

  if (!fs.existsSync(srcPath)) {
    console.log(`[SKIP] Source ${srcRel} does not exist`);
    return;
  }

  ensureDir(path.dirname(destPath));

  let content = fs.readFileSync(srcPath, 'utf8');
  if (transformFn) {
    content = transformFn(content);
  }

  fs.writeFileSync(destPath, content, 'utf8');

  // Compute relative path from srcPath to destPath
  const relPathFromSrc = path.relative(path.dirname(srcPath), destPath).replace(/\\/g, '/').replace(/\.tsx?$/, '');
  const importPath = relPathFromSrc.startsWith('.') ? relPathFromSrc : `./${relPathFromSrc}`;

  const facadeContent = `// Auto-generated Clean Architecture Facade
export * from "${importPath}";
export { default } from "${importPath}";
`;
  fs.writeFileSync(srcPath, facadeContent, 'utf8');
  console.log(`[OK] Relocated: ${srcRel} -> ${destRel} (Facade installed at ${srcRel})`);
}

console.log('=== Executing Clean Architecture Codebase Reorganization ===\n');

// 1. PersonalRecordsDeck
moveWithFacade(
  'src/components/PersonalRecordsDeck.tsx',
  'src/components/records/PersonalRecordsDeck.tsx'
);

// 2. StravaConnectCard
moveWithFacade(
  'src/components/StravaConnectCard.tsx',
  'src/components/strava/StravaConnectCard.tsx',
  (code) => {
    return code
      .replace(/from "\.\/strava\/StravaSetupGuide"/g, 'from "./StravaSetupGuide"')
      .replace(/from "\.\/strava\/StravaConnectedView"/g, 'from "./StravaConnectedView"');
  }
);

// 3. VolumeProgressionChart
moveWithFacade(
  'src/components/VolumeProgressionChart.tsx',
  'src/components/charts/VolumeProgressionChart.tsx'
);

// 4. ActivityFeed
moveWithFacade(
  'src/components/ActivityFeed.tsx',
  'src/components/activity/ActivityFeed.tsx'
);

// 5. ActivityManagementDeck
moveWithFacade(
  'src/components/ActivityManagementDeck.tsx',
  'src/components/activity/ActivityManagementDeck.tsx',
  (code) => {
    return code.replace(/from "\.\/activity\/deck\//g, 'from "./deck/');
  }
);

// 6. AddActivityModal
moveWithFacade(
  'src/components/AddActivityModal.tsx',
  'src/components/activity/modal/AddActivityModal.tsx',
  (code) => {
    return code.replace(/from "\.\/activity\/modal\//g, 'from "./');
  }
);

// 7. EditActivityModal
moveWithFacade(
  'src/components/EditActivityModal.tsx',
  'src/components/activity/modal/EditActivityModal.tsx'
);

// 8. Domain Engines in src/lib/
moveWithFacade(
  'src/lib/readinessEngine.ts',
  'src/lib/domain/readiness/readinessEngine.ts'
);

moveWithFacade(
  'src/lib/streakEngine.ts',
  'src/lib/domain/streak/streakEngine.ts'
);

moveWithFacade(
  'src/lib/ai-coach.ts',
  'src/lib/domain/coach/aiCoachEngine.ts'
);

moveWithFacade(
  'src/lib/coachTrainingGenerator.ts',
  'src/lib/domain/coach/coachTrainingGenerator.ts'
);

moveWithFacade(
  'src/lib/matching.ts',
  'src/lib/domain/matching/matchingEngine.ts'
);

moveWithFacade(
  'src/lib/personalRecords.ts',
  'src/lib/domain/records/personalRecordsEngine.ts'
);

moveWithFacade(
  'src/lib/sportUtils.ts',
  'src/lib/domain/sports/sportUtils.ts'
);

// 9. Shared Utilities in src/lib/
moveWithFacade(
  'src/lib/formatters.ts',
  'src/lib/shared/formatters.ts'
);

moveWithFacade(
  'src/lib/analytics.ts',
  'src/lib/shared/analytics.ts'
);

console.log('\n=== Reorganization Complete ===');

