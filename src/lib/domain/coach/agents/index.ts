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
import { FootballCoachAgent } from './FootballCoachAgent';
import { BasketballCoachAgent } from './BasketballCoachAgent';
import { VolleyballCoachAgent } from './VolleyballCoachAgent';
import { FutsalCoachAgent } from './FutsalCoachAgent';
import { RugbyCoachAgent } from './RugbyCoachAgent';
import { FieldHockeyCoachAgent } from './FieldHockeyCoachAgent';

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
export * from './FootballCoachAgent';
export * from './BasketballCoachAgent';
export * from './VolleyballCoachAgent';
export * from './FutsalCoachAgent';
export * from './RugbyCoachAgent';
export * from './FieldHockeyCoachAgent';

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

/**
 * Bootstraps and registers the Phase 4 flagship team field & court agents into the router.
 */
export function registerDefaultTeamSportsAgents(
  router: SportCoordinatorRouter = sportCoordinatorRouter
): void {
  if (!router.hasAgent('SPORT_FOOTBALL')) {
    router.registerAgent(new FootballCoachAgent());
  }
  if (!router.hasAgent('SPORT_BASKETBALL')) {
    router.registerAgent(new BasketballCoachAgent());
  }
  if (!router.hasAgent('SPORT_VOLLEYBALL')) {
    router.registerAgent(new VolleyballCoachAgent());
  }
  if (!router.hasAgent('SPORT_FUTSAL')) {
    router.registerAgent(new FutsalCoachAgent());
  }
  if (!router.hasAgent('SPORT_RUGBY')) {
    router.registerAgent(new RugbyCoachAgent());
  }
  if (!router.hasAgent('SPORT_FIELD_HOCKEY')) {
    router.registerAgent(new FieldHockeyCoachAgent());
  }
}

// Auto-register default endurance, strength, and team sports agents on module load
registerDefaultEnduranceAgents(sportCoordinatorRouter);
registerDefaultStrengthAgents(sportCoordinatorRouter);
registerDefaultTeamSportsAgents(sportCoordinatorRouter);
