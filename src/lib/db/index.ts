export * from './client';
export * from './userRepo';
export * from './stravaRepo';
export * from './activityRepo';
export * from './trainingRepo';
export * from './goalRepo';
export * from './healthRepo';
export * from './availabilityRepo';
export * from './equipmentRepo';
export * from './wellnessRepo';

import * as client from './client';
import * as userRepo from './userRepo';
import * as stravaRepo from './stravaRepo';
import * as activityRepo from './activityRepo';
import * as trainingRepo from './trainingRepo';
import * as goalRepo from './goalRepo';
import * as healthRepo from './healthRepo';
import * as availabilityRepo from './availabilityRepo';
import * as equipmentRepo from './equipmentRepo';
import * as wellnessRepo from './wellnessRepo';

const db = {
  ...client,
  ...userRepo,
  ...stravaRepo,
  ...activityRepo,
  ...trainingRepo,
  ...goalRepo,
  ...healthRepo,
  ...availabilityRepo,
  ...equipmentRepo,
  ...wellnessRepo,
};

export default db;
