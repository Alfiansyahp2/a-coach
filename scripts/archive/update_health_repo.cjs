const fs = require('fs');
const path = require('path');

const healthRepoFile = path.join(__dirname, '..', 'src', 'lib', 'db', 'healthRepo.ts');
let content = fs.readFileSync(healthRepoFile, 'utf8');

// 1. Add imports for availabilityRepo, equipmentRepo, wellnessRepo
const importTarget = `import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from './client';`;
const importRepl = `import { pgPool, ensureLocalStore, saveLocalStore, DEFAULT_USER_ID, formatDateOnly } from './client';
import { getAthleteAvailability } from './availabilityRepo';
import { getAthleteEquipment } from './equipmentRepo';
import { getTodayWellness } from './wellnessRepo';`;

// 2. Update getAuthoritativeHealthContext
const contextTarget = `export async function getAuthoritativeHealthContext(
  userId: string = DEFAULT_USER_ID
): Promise<AuthoritativeAthleteHealthContext> {
  const [profile, injuries, painLogs, responses, assessments, readiness] = await Promise.all([
    getAthleteProfile(userId),
    getAthleteInjuries(userId),
    getAthletePainLogs(userId, 15),
    getAthleteTrainingResponses(userId, 15),
    getAthleteMedicalAssessments(userId),
    getLatestAthleteReadiness(userId),
  ]);`;

const contextRepl = `export async function getAuthoritativeHealthContext(
  userId: string = DEFAULT_USER_ID
): Promise<AuthoritativeAthleteHealthContext> {
  const [profile, injuries, painLogs, responses, assessments, readiness, availability, equipment, todayWellness] = await Promise.all([
    getAthleteProfile(userId),
    getAthleteInjuries(userId),
    getAthletePainLogs(userId, 15),
    getAthleteTrainingResponses(userId, 15),
    getAthleteMedicalAssessments(userId),
    getLatestAthleteReadiness(userId),
    getAthleteAvailability(userId),
    getAthleteEquipment(userId),
    getTodayWellness(userId),
  ]);`;

const returnTarget = `  return {
    profile,
    injuries,
    recentPainLogs: painLogs,
    recentResponses: responses,
    medicalAssessments: assessments,
    latestReadiness: readiness,
    clinicianRestrictions,
  };`;

const returnRepl = `  return {
    profile,
    injuries,
    recentPainLogs: painLogs,
    recentResponses: responses,
    medicalAssessments: assessments,
    latestReadiness: readiness,
    clinicianRestrictions,
    availability,
    equipment,
    todayWellness,
  };`;

let norm = content.replace(/\r\n/g, '\n');
norm = norm.replace(importTarget.replace(/\r\n/g, '\n'), importRepl.replace(/\r\n/g, '\n'));
norm = norm.replace(contextTarget.replace(/\r\n/g, '\n'), contextRepl.replace(/\r\n/g, '\n'));
norm = norm.replace(returnTarget.replace(/\r\n/g, '\n'), returnRepl.replace(/\r\n/g, '\n'));

fs.writeFileSync(healthRepoFile, norm, 'utf8');
console.log('src/lib/db/healthRepo.ts successfully updated');

