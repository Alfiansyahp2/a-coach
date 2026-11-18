// Multi-Sport Decoupled Agents Registry & Barrel Exports
import { sportCoordinatorRouter, SportCoordinatorRouter } from './SportCoordinatorRouter';
import { DistanceRunningCoachAgent } from './DistanceRunningCoachAgent';
import { RoadCyclingCoachAgent } from './RoadCyclingCoachAgent';
import { MtbXcCoachAgent } from './MtbXcCoachAgent';

export * from './contracts';
export * from './SportCoordinatorRouter';
export * from './DistanceRunningCoachAgent';
export * from './RoadCyclingCoachAgent';
export * from './MtbXcCoachAgent';

/**
 * Bootstraps and registers the Phase 2 flagship endurance agents into the router.
 */
export function registerDefaultEnduranceAgents(
  router: SportCoordinatorRouter = sportCoordinatorRouter
): void {
  if (!router.hasAgent('SPORT_DISTANCE_RUNNING')) {
    router.registerAgent(new DistanceRunningCoachAgent());
  }
  if (!router.hasAgent('SPORT_ROAD_CYCLING')) {
    router.registerAgent(new RoadCyclingCoachAgent());
  }
  if (!router.hasAgent('SPORT_MTB_XC')) {
    router.registerAgent(new MtbXcCoachAgent());
  }
}

// Auto-register default endurance agents on module load
registerDefaultEnduranceAgents(sportCoordinatorRouter);
