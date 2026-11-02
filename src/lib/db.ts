/**
 * Backward compatibility facade.
 * The monolithic 2,174-line database access layer has been decomposed into
 * modular domain-driven repositories in @/lib/db/:
 *   - client.ts: PostgreSQL connection pool, local JSON file store fallback, and base utilities
 *   - userRepo.ts: User profiles and biometrics
 *   - stravaRepo.ts: Strava OAuth, token management, and sync logs
 *   - activityRepo.ts: Activity queries, manual activities, and workout matching
 *   - trainingRepo.ts: Training plans and scheduled workouts
 *   - goalRepo.ts: Fitness goals and personal records
 *   - healthRepo.ts: Athlete health profiles, injuries, pain logs, medical assessments, and readiness
 */

export * from './db/index';
export { default } from './db/index';
