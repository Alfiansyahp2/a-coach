const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'lib', 'readinessEngine.ts');
let content = fs.readFileSync(file, 'utf8');

const target = `export function evaluateTrainingReadiness(
  context: AuthoritativeAthleteHealthContext
): Omit<AthleteTrainingReadiness, 'id' | 'created_at'> {
  const { injuries, recentPainLogs, recentResponses, medicalAssessments, clinicianRestrictions } = context;`;

const replacement = `export function evaluateTrainingReadiness(
  context: AuthoritativeAthleteHealthContext
): Omit<AthleteTrainingReadiness, 'id' | 'created_at'> {
  const { injuries, recentPainLogs, recentResponses, medicalAssessments, clinicianRestrictions, todayWellness } = context;`;

const targetRationale = `  // 4. Compute Sport-Specific Readiness States`;

const insertWellness = `  // 3b. Evaluate Proactive Morning Daily Wellness (Point 5)
  if (todayWellness) {
    if (todayWellness.readiness_flag === 'REST_RECOMMENDED' || (todayWellness.fatigue_score && todayWellness.fatigue_score >= 8)) {
      sourceTelemetryRefs.push({
        source: \`Morning Daily Wellness (\${todayWellness.entry_date})\`,
        details: \`Acute systemic fatigue (Score: \${todayWellness.fatigue_score}/10, Sleep: \${todayWellness.sleep_hours ?? '?'}h). Proactive recovery recommended.\`,
      });
    }
  }

  // 4. Compute Sport-Specific Readiness States`;

let norm = content.replace(/\r\n/g, '\n');
norm = norm.replace(target.replace(/\r\n/g, '\n'), replacement.replace(/\r\n/g, '\n'));
norm = norm.replace(targetRationale.replace(/\r\n/g, '\n'), insertWellness.replace(/\r\n/g, '\n'));

fs.writeFileSync(file, norm, 'utf8');
console.log('src/lib/readinessEngine.ts successfully updated');

