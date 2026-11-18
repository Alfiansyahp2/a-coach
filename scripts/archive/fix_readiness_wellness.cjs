const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'lib', 'readinessEngine.ts');
let content = fs.readFileSync(file, 'utf8');

const targetSnippet = `  // 3b. Evaluate Proactive Morning Daily Wellness (Point 5)
  if (todayWellness) {
    if (todayWellness.readiness_flag === 'REST_RECOMMENDED' || (todayWellness.fatigue_score && todayWellness.fatigue_score >= 8)) {
      sourceTelemetryRefs.push({
        source: \`Morning Daily Wellness (\${todayWellness.entry_date})\`,
        details: \`Acute systemic fatigue (Score: \${todayWellness.fatigue_score}/10, Sleep: \${todayWellness.sleep_hours ?? '?'}\h). Proactive recovery recommended.\`,
      });
    }
  }`;

const replSnippet = `  // 3b. Evaluate Proactive Morning Daily Wellness (Point 5)
  if (todayWellness) {
    if (todayWellness.perceived_readiness === 'REST_RECOMMENDED' || (todayWellness.fatigue_score && todayWellness.fatigue_score >= 4)) {
      sourceTelemetryRefs.push({
        source: \`Morning Daily Wellness (\${todayWellness.logged_date})\`,
        details: \`Acute systemic fatigue (Score: \${todayWellness.fatigue_score}/5, Sleep: \${todayWellness.sleep_duration_hours ?? '?'}h). Proactive recovery recommended.\`,
      });
    }
  }`;

content = content.replace(/\r\n/g, '\n').replace(targetSnippet.replace(/\r\n/g, '\n'), replSnippet.replace(/\r\n/g, '\n'));
fs.writeFileSync(file, content, 'utf8');
console.log('src/lib/readinessEngine.ts aligned with DB schema');

