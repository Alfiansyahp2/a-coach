// Multi-Sport Decoupled Agents Registry & Barrel Exports
import { sportCoordinatorRouter, SportCoordinatorRouter } from './SportCoordinatorRouter';
import { DistanceRunningCoachAgent } from './DistanceRunningCoachAgent';
import { RoadCyclingCoachAgent } from './RoadCyclingCoachAgent';
import { MtbXcCoachAgent } from './MtbXcCoachAgent';
import { PowerliftingCoachAgent } from './PowerliftingCoachAgent';
import { OlympicWeightliftingCoachAgent } from './OlympicWeightliftingCoachAgent';
import { CalisthenicsCoachAgent } from './CalisthenicsCoachAgent';
import { StrongmanCoachAgent } from './StrongmanCoachAgent';
import { BodybuildingCoachAgent } from './BodybuildingCoachAgent';

export * from './contracts';
export * from './SportCoordinatorRouter';
export * from './DistanceRunningCoachAgent';
export * from './RoadCyclingCoachAgent';
export * from './MtbXcCoachAgent';
export * from './PowerliftingCoachAgent';
export * from './OlympicWeightliftingCoachAgent';
export * from './CalisthenicsCoachAgent';
export * from './StrongmanCoachAgent';
export * from './BodybuildingCoachAgent';

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

/**
 * Bootstraps and registers the Phase 3 flagship strength & power agents into the router.
 */
export function registerDefaultStrengthAgents(
  router: SportCoordinatorRouter = sportCoordinatorRouter
): void {
  if (!router.hasAgent('SPORT_POWERLIFTING')) {
    router.registerAgent(new PowerliftingCoachAgent());
  }
  if (!router.hasAgent('SPORT_WEIGHTLIFTING')) {
    router.registerAgent(new OlympicWeightliftingCoachAgent());
  }
  if (!router.hasAgent('SPORT_CALISTHENICS')) {
    router.registerAgent(new CalisthenicsCoachAgent());
  }
  if (!router.hasAgent('SPORT_STRONGMAN')) {
    router.registerAgent(new StrongmanCoachAgent());
  }
  if (!router.hasAgent('SPORT_BODYBUILDING')) {
    router.registerAgent(new BodybuildingCoachAgent());
  }
}

// Auto-register default endurance and strength agents on module load
registerDefaultEnduranceAgents(sportCoordinatorRouter);
registerDefaultStrengthAgents(sportCoordinatorRouter);
