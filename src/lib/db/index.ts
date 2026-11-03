export * from './client';
export * from './userRepo';
export * from './stravaRepo';
export * from './activityRepo';
export * from './trainingRepo';
export * from './goalRepo';
export * from './healthRepo';

import * as client from './client';
import * as userRepo from './userRepo';
import * as stravaRepo from './stravaRepo';
import * as activityRepo from './activityRepo';
import * as trainingRepo from './trainingRepo';
import * as goalRepo from './goalRepo';
import * as healthRepo from './healthRepo';

const db = {
  ...client,
  ...userRepo,
  ...stravaRepo,
  ...activityRepo,
  ...trainingRepo,
  ...goalRepo,
  ...healthRepo,
};

export default db;

