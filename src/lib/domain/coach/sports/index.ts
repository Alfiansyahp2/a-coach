// Master Registry & Barrel Export for All 33 Sports Vertical Slices
import { sportCoordinatorRouter, SportCoordinatorRouter } from '../core/SportCoordinatorRouter';
export { sportCoordinatorRouter, SportCoordinatorRouter };
import { DistanceRunningCoachAgent } from './running';
import { RoadCyclingCoachAgent } from './road-cycling';
import { MtbXcCoachAgent } from './mtb-xc';
import { PowerliftingCoachAgent } from './powerlifting';
import { OlympicWeightliftingCoachAgent } from './weightlifting';
import { CalisthenicsCoachAgent } from './calisthenics';
import { StrongmanCoachAgent } from './strongman';
import { BodybuildingCoachAgent } from './bodybuilding';
import { FootballCoachAgent } from './football';
import { BasketballCoachAgent } from './basketball';
import { VolleyballCoachAgent } from './volleyball';
import { FutsalCoachAgent } from './futsal';
import { RugbyCoachAgent } from './rugby';
import { FieldHockeyCoachAgent } from './field-hockey';
import { BoxingCoachAgent } from './boxing';
import { MmaCoachAgent } from './mma';
import { BjjCoachAgent } from './bjj';
import { PencakSilatCoachAgent } from './pencak-silat';
import { JudoCoachAgent } from './judo';
import { MuayThaiCoachAgent } from './muay-thai';
import { BadmintonCoachAgent } from './badminton';
import { TennisCoachAgent } from './tennis';
import { TableTennisCoachAgent } from './table-tennis';
import { ArcheryCoachAgent } from './archery';
import { ShootingCoachAgent } from './shooting';
import { SwimmingCoachAgent } from './swimming';
import { RowingCoachAgent } from './rowing';
import { TriathlonCoachAgent } from './triathlon';
import { FunctionalFitnessCoachAgent } from './crossfit-hyrox';
import { SportClimbingCoachAgent } from './climbing';
import { GymnasticsCoachAgent } from './gymnastics';
import { SurfingCoachAgent } from './surfing';
import { SkateboardingCoachAgent } from './skateboarding';

// Re-export all vertical slices
export * from './running';
export * from './road-cycling';
export * from './mtb-xc';
export * from './powerlifting';
export * from './weightlifting';
export * from './calisthenics';
export * from './strongman';
export * from './bodybuilding';
export * from './football';
export * from './basketball';
export * from './volleyball';
export * from './futsal';
export * from './rugby';
export * from './field-hockey';
export * from './boxing';
export * from './mma';
export * from './bjj';
export * from './pencak-silat';
export * from './judo';
export * from './muay-thai';
export * from './badminton';
export * from './tennis';
export * from './table-tennis';
export * from './archery';
export * from './shooting';
export * from './swimming';
export * from './rowing';
export * from './triathlon';
export * from './crossfit-hyrox';
export * from './climbing';
export * from './gymnastics';
export * from './surfing';
export * from './skateboarding';

export function registerDefaultEnduranceAgents(router: SportCoordinatorRouter = sportCoordinatorRouter): void {
  if (!router.hasAgent('SPORT_DISTANCE_RUNNING')) router.registerAgent(new DistanceRunningCoachAgent());
  if (!router.hasAgent('SPORT_ROAD_CYCLING')) router.registerAgent(new RoadCyclingCoachAgent());
  if (!router.hasAgent('SPORT_MTB_XC')) router.registerAgent(new MtbXcCoachAgent());
}

export function registerDefaultStrengthAgents(router: SportCoordinatorRouter = sportCoordinatorRouter): void {
  if (!router.hasAgent('SPORT_POWERLIFTING')) router.registerAgent(new PowerliftingCoachAgent());
  if (!router.hasAgent('SPORT_WEIGHTLIFTING')) router.registerAgent(new OlympicWeightliftingCoachAgent());
  if (!router.hasAgent('SPORT_CALISTHENICS')) router.registerAgent(new CalisthenicsCoachAgent());
  if (!router.hasAgent('SPORT_STRONGMAN')) router.registerAgent(new StrongmanCoachAgent());
  if (!router.hasAgent('SPORT_BODYBUILDING')) router.registerAgent(new BodybuildingCoachAgent());
}

export function registerDefaultTeamSportsAgents(router: SportCoordinatorRouter = sportCoordinatorRouter): void {
  if (!router.hasAgent('SPORT_FOOTBALL')) router.registerAgent(new FootballCoachAgent());
  if (!router.hasAgent('SPORT_BASKETBALL')) router.registerAgent(new BasketballCoachAgent());
  if (!router.hasAgent('SPORT_VOLLEYBALL')) router.registerAgent(new VolleyballCoachAgent());
  if (!router.hasAgent('SPORT_FUTSAL')) router.registerAgent(new FutsalCoachAgent());
  if (!router.hasAgent('SPORT_RUGBY')) router.registerAgent(new RugbyCoachAgent());
  if (!router.hasAgent('SPORT_FIELD_HOCKEY')) router.registerAgent(new FieldHockeyCoachAgent());
}

export function registerDefaultCombatSportsAgents(router: SportCoordinatorRouter = sportCoordinatorRouter): void {
  if (!router.hasAgent('SPORT_BOXING')) router.registerAgent(new BoxingCoachAgent());
  if (!router.hasAgent('SPORT_MMA')) router.registerAgent(new MmaCoachAgent());
  if (!router.hasAgent('SPORT_BJJ')) router.registerAgent(new BjjCoachAgent());
  if (!router.hasAgent('SPORT_PENCAK_SILAT')) router.registerAgent(new PencakSilatCoachAgent());
  if (!router.hasAgent('SPORT_JUDO')) router.registerAgent(new JudoCoachAgent());
  if (!router.hasAgent('SPORT_MUAY_THAI')) router.registerAgent(new MuayThaiCoachAgent());
}

export function registerDefaultAquaticRacquetFunctionalAgents(router: SportCoordinatorRouter = sportCoordinatorRouter): void {
  if (!router.hasAgent('SPORT_SWIMMING')) router.registerAgent(new SwimmingCoachAgent());
  if (!router.hasAgent('SPORT_ROWING')) router.registerAgent(new RowingCoachAgent());
  if (!router.hasAgent('SPORT_TRIATHLON')) router.registerAgent(new TriathlonCoachAgent());
  if (!router.hasAgent('SPORT_BADMINTON')) router.registerAgent(new BadmintonCoachAgent());
  if (!router.hasAgent('SPORT_TENNIS')) router.registerAgent(new TennisCoachAgent());
  if (!router.hasAgent('SPORT_TABLE_TENNIS')) router.registerAgent(new TableTennisCoachAgent());
  if (!router.hasAgent('SPORT_ARCHERY')) router.registerAgent(new ArcheryCoachAgent());
  if (!router.hasAgent('SPORT_SHOOTING')) router.registerAgent(new ShootingCoachAgent());
  if (!router.hasAgent('SPORT_FUNCTIONAL_FITNESS')) router.registerAgent(new FunctionalFitnessCoachAgent());
  if (!router.hasAgent('SPORT_CLIMBING')) router.registerAgent(new SportClimbingCoachAgent());
  if (!router.hasAgent('SPORT_GYMNASTICS')) router.registerAgent(new GymnasticsCoachAgent());
  if (!router.hasAgent('SPORT_SURFING')) router.registerAgent(new SurfingCoachAgent());
  if (!router.hasAgent('SPORT_SKATEBOARDING')) router.registerAgent(new SkateboardingCoachAgent());
}

export function registerAllSystemSportsAgents(router: SportCoordinatorRouter = sportCoordinatorRouter): void {
  registerDefaultEnduranceAgents(router);
  registerDefaultStrengthAgents(router);
  registerDefaultTeamSportsAgents(router);
  registerDefaultCombatSportsAgents(router);
  registerDefaultAquaticRacquetFunctionalAgents(router);
}

// Auto-register all 33 sports on module load
registerAllSystemSportsAgents(sportCoordinatorRouter);
