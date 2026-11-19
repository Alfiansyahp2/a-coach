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
import { BoxingCoachAgent } from './BoxingCoachAgent';
import { MmaCoachAgent } from './MmaCoachAgent';
import { BjjCoachAgent } from './BjjCoachAgent';
import { PencakSilatCoachAgent } from './PencakSilatCoachAgent';
import { JudoCoachAgent } from './JudoCoachAgent';
import { MuayThaiCoachAgent } from './MuayThaiCoachAgent';
import { SwimmingCoachAgent } from './SwimmingCoachAgent';
import { RowingCoachAgent } from './RowingCoachAgent';
import { TriathlonCoachAgent } from './TriathlonCoachAgent';
import { BadmintonCoachAgent } from './BadmintonCoachAgent';
import { TennisCoachAgent } from './TennisCoachAgent';
import { TableTennisCoachAgent } from './TableTennisCoachAgent';
import { ArcheryCoachAgent } from './ArcheryCoachAgent';
import { ShootingCoachAgent } from './ShootingCoachAgent';
import { FunctionalFitnessCoachAgent } from './FunctionalFitnessCoachAgent';
import { SportClimbingCoachAgent } from './SportClimbingCoachAgent';
import { GymnasticsCoachAgent } from './GymnasticsCoachAgent';
import { SurfingCoachAgent } from './SurfingCoachAgent';
import { SkateboardingCoachAgent } from './SkateboardingCoachAgent';

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
export * from './BoxingCoachAgent';
export * from './MmaCoachAgent';
export * from './BjjCoachAgent';
export * from './PencakSilatCoachAgent';
export * from './JudoCoachAgent';
export * from './MuayThaiCoachAgent';
export * from './SwimmingCoachAgent';
export * from './RowingCoachAgent';
export * from './TriathlonCoachAgent';
export * from './BadmintonCoachAgent';
export * from './TennisCoachAgent';
export * from './TableTennisCoachAgent';
export * from './ArcheryCoachAgent';
export * from './ShootingCoachAgent';
export * from './FunctionalFitnessCoachAgent';
export * from './SportClimbingCoachAgent';
export * from './GymnasticsCoachAgent';
export * from './SurfingCoachAgent';
export * from './SkateboardingCoachAgent';

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

/**
 * Bootstraps and registers the Phase 5 flagship combat & martial arts agents into the router.
 */
export function registerDefaultCombatSportsAgents(
  router: SportCoordinatorRouter = sportCoordinatorRouter
): void {
  if (!router.hasAgent('SPORT_BOXING')) {
    router.registerAgent(new BoxingCoachAgent());
  }
  if (!router.hasAgent('SPORT_MMA')) {
    router.registerAgent(new MmaCoachAgent());
  }
  if (!router.hasAgent('SPORT_BJJ')) {
    router.registerAgent(new BjjCoachAgent());
  }
  if (!router.hasAgent('SPORT_PENCAK_SILAT')) {
    router.registerAgent(new PencakSilatCoachAgent());
  }
  if (!router.hasAgent('SPORT_JUDO')) {
    router.registerAgent(new JudoCoachAgent());
  }
  if (!router.hasAgent('SPORT_MUAY_THAI')) {
    router.registerAgent(new MuayThaiCoachAgent());
  }
}

/**
 * Bootstraps and registers the Phase 6 aquatic, racquet, precision & functional extreme agents.
 */
export function registerDefaultAquaticRacquetFunctionalAgents(
  router: SportCoordinatorRouter = sportCoordinatorRouter
): void {
  if (!router.hasAgent('SPORT_SWIMMING')) {
    router.registerAgent(new SwimmingCoachAgent());
  }
  if (!router.hasAgent('SPORT_ROWING')) {
    router.registerAgent(new RowingCoachAgent());
  }
  if (!router.hasAgent('SPORT_TRIATHLON')) {
    router.registerAgent(new TriathlonCoachAgent());
  }
  if (!router.hasAgent('SPORT_BADMINTON')) {
    router.registerAgent(new BadmintonCoachAgent());
  }
  if (!router.hasAgent('SPORT_TENNIS')) {
    router.registerAgent(new TennisCoachAgent());
  }
  if (!router.hasAgent('SPORT_TABLE_TENNIS')) {
    router.registerAgent(new TableTennisCoachAgent());
  }
  if (!router.hasAgent('SPORT_ARCHERY')) {
    router.registerAgent(new ArcheryCoachAgent());
  }
  if (!router.hasAgent('SPORT_SHOOTING')) {
    router.registerAgent(new ShootingCoachAgent());
  }
  if (!router.hasAgent('SPORT_FUNCTIONAL_FITNESS')) {
    router.registerAgent(new FunctionalFitnessCoachAgent());
  }
  if (!router.hasAgent('SPORT_CLIMBING')) {
    router.registerAgent(new SportClimbingCoachAgent());
  }
  if (!router.hasAgent('SPORT_GYMNASTICS')) {
    router.registerAgent(new GymnasticsCoachAgent());
  }
  if (!router.hasAgent('SPORT_SURFING')) {
    router.registerAgent(new SurfingCoachAgent());
  }
  if (!router.hasAgent('SPORT_SKATEBOARDING')) {
    router.registerAgent(new SkateboardingCoachAgent());
  }
}

// Auto-register all 33 sports agents across 6 physiological clusters on module load
registerDefaultEnduranceAgents(sportCoordinatorRouter);
registerDefaultStrengthAgents(sportCoordinatorRouter);
registerDefaultTeamSportsAgents(sportCoordinatorRouter);
registerDefaultCombatSportsAgents(sportCoordinatorRouter);
registerDefaultAquaticRacquetFunctionalAgents(sportCoordinatorRouter);
