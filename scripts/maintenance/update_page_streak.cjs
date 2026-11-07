const fs = require('fs');

let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Add import
if (!code.includes('calculateWeeklyStreak')) {
  code = code.replace(
    'import { computePersonalRecords } from "@/lib/personalRecords";',
    'import { computePersonalRecords } from "@/lib/personalRecords";\nimport { calculateWeeklyStreak } from "@/lib/streakEngine";'
  );
}

// 2. Compute streak
if (!code.includes('const streak = calculateWeeklyStreak')) {
  code = code.replace(
    'const summary = computeDashboardSummary(activities, workouts);',
    'const streak = calculateWeeklyStreak(activities, workouts);\n  const summary = computeDashboardSummary(activities, workouts);'
  );
}

// 3. Pass to AppShell
code = code.replace(
  '<AppShell user={user} dbStatus={dbStatus} healthContext={healthContext}>',
  '<AppShell user={user} dbStatus={dbStatus} healthContext={healthContext} streakWeeks={streak.currentStreakWeeks}>'
);

fs.writeFileSync('src/app/page.tsx', code, 'utf8');
console.log('Successfully updated page.tsx with streakWeeks prop');

