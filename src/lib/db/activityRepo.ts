/**
 * Activity Repository Facade
 * Decomposed into modular sub-repositories under @/lib/db/activity/:
 *  - activityTypes: Data normalization & types
 *  - activityQueryRepo: Read queries, filters, and adjacent lookups
 *  - activityMutationRepo: CRUD, batch updates, upsert, and manual correlation
 */

export * from './activity';
