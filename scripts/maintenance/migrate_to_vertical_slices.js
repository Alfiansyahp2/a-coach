/**
 * Migration Script: Transition Coach Domain to Clean Vertical Slice Architecture
 * Implements: docs/11-ai/08-SPESIFIKASI_ARSITEKTUR_CLEAN_VERTICAL_SLICE_CABOR.md
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const COACH_DIR = path.join(ROOT, 'src/lib/domain/coach');
const AGENTS_DIR = path.join(COACH_DIR, 'agents');
const CORE_DIR = path.join(COACH_DIR, 'core');
const SPORTS_DIR = path.join(COACH_DIR, 'sports');

const MAPPINGS = [
  { agent: 'DistanceRunningCoachAgent.ts', folder: 'running', exportName: 'DistanceRunningCoachAgent' },
  { agent: 'RoadCyclingCoachAgent.ts', folder: 'road-cycling', exportName: 'RoadCyclingCoachAgent' },
  { agent: 'MtbXcCoachAgent.ts', folder: 'mtb-xc', exportName: 'MtbXcCoachAgent' },
  { agent: 'PowerliftingCoachAgent.ts', folder: 'powerlifting', exportName: 'PowerliftingCoachAgent' },
  { agent: 'OlympicWeightliftingCoachAgent.ts', folder: 'weightlifting', exportName: 'OlympicWeightliftingCoachAgent' },
  { agent: 'CalisthenicsCoachAgent.ts', folder: 'calisthenics', exportName: 'CalisthenicsCoachAgent' },
  { agent: 'StrongmanCoachAgent.ts', folder: 'strongman', exportName: 'StrongmanCoachAgent' },
  { agent: 'BodybuildingCoachAgent.ts', folder: 'bodybuilding', exportName: 'BodybuildingCoachAgent' },
  { agent: 'FootballCoachAgent.ts', folder: 'football', exportName: 'FootballCoachAgent' },
  { agent: 'BasketballCoachAgent.ts', folder: 'basketball', exportName: 'BasketballCoachAgent' },
  { agent: 'VolleyballCoachAgent.ts', folder: 'volleyball', exportName: 'VolleyballCoachAgent' },
  { agent: 'FutsalCoachAgent.ts', folder: 'futsal', exportName: 'FutsalCoachAgent' },
  { agent: 'RugbyCoachAgent.ts', folder: 'rugby', exportName: 'RugbyCoachAgent' },
  { agent: 'FieldHockeyCoachAgent.ts', folder: 'field-hockey', exportName: 'FieldHockeyCoachAgent' },
  { agent: 'BoxingCoachAgent.ts', folder: 'boxing', exportName: 'BoxingCoachAgent' },
  { agent: 'MmaCoachAgent.ts', folder: 'mma', exportName: 'MmaCoachAgent' },
  { agent: 'BjjCoachAgent.ts', folder: 'bjj', exportName: 'BjjCoachAgent' },
  { agent: 'PencakSilatCoachAgent.ts', folder: 'pencak-silat', exportName: 'PencakSilatCoachAgent' },
  { agent: 'JudoCoachAgent.ts', folder: 'judo', exportName: 'JudoCoachAgent' },
  { agent: 'MuayThaiCoachAgent.ts', folder: 'muay-thai', exportName: 'MuayThaiCoachAgent' },
  { agent: 'BadmintonCoachAgent.ts', folder: 'badminton', exportName: 'BadmintonCoachAgent' },
  { agent: 'TennisCoachAgent.ts', folder: 'tennis', exportName: 'TennisCoachAgent' },
  { agent: 'TableTennisCoachAgent.ts', folder: 'table-tennis', exportName: 'TableTennisCoachAgent' },
  { agent: 'ArcheryCoachAgent.ts', folder: 'archery', exportName: 'ArcheryCoachAgent' },
  { agent: 'ShootingCoachAgent.ts', folder: 'shooting', exportName: 'ShootingCoachAgent' },
  { agent: 'SwimmingCoachAgent.ts', folder: 'swimming', exportName: 'SwimmingCoachAgent' },
  { agent: 'RowingCoachAgent.ts', folder: 'rowing', exportName: 'RowingCoachAgent' },
  { agent: 'TriathlonCoachAgent.ts', folder: 'triathlon', exportName: 'TriathlonCoachAgent' },
  { agent: 'FunctionalFitnessCoachAgent.ts', folder: 'crossfit-hyrox', exportName: 'FunctionalFitnessCoachAgent' },
  { agent: 'SportClimbingCoachAgent.ts', folder: 'climbing', exportName: 'SportClimbingCoachAgent' },
  { agent: 'GymnasticsCoachAgent.ts', folder: 'gymnastics', exportName: 'GymnasticsCoachAgent' },
  { agent: 'SurfingCoachAgent.ts', folder: 'surfing', exportName: 'SurfingCoachAgent' },
  { agent: 'SkateboardingCoachAgent.ts', folder: 'skateboarding', exportName: 'SkateboardingCoachAgent' }
];

console.log('--- Step 1: Ensure core/ and sports/ directories exist ---');
fs.mkdirSync(CORE_DIR, { recursive: true });
fs.mkdirSync(SPORTS_DIR, { recursive: true });

console.log('--- Step 2: Move and setup core contracts & router ---');
// 2a. contracts.ts
const srcContracts = fs.readFileSync(path.join(AGENTS_DIR, 'contracts.ts'), 'utf8');
fs.writeFileSync(path.join(CORE_DIR, 'contracts.ts'), srcContracts, 'utf8');

// 2b. SportCoordinatorRouter.ts
const srcRouter = fs.readFileSync(path.join(AGENTS_DIR, 'SportCoordinatorRouter.ts'), 'utf8');
fs.writeFileSync(path.join(CORE_DIR, 'SportCoordinatorRouter.ts'), srcRouter, 'utf8');

// 2c. core/index.ts
fs.writeFileSync(
  path.join(CORE_DIR, 'index.ts'),
  `// Core Orchestration & Contracts Exports\nexport * from './contracts';\nexport * from './SportCoordinatorRouter';\n`,
  'utf8'
);

console.log('--- Step 3: Populate each sports/<folder>/ slice ---');
for (const item of MAPPINGS) {
  const targetFolder = path.join(SPORTS_DIR, item.folder);
  fs.mkdirSync(targetFolder, { recursive: true });

  const originalContent = fs.readFileSync(path.join(AGENTS_DIR, item.agent), 'utf8');
  
  // Adjust relative imports from ../ to ../../
  let updatedContent = originalContent
    .replace(/from '\.\/contracts'/g, "from '../../core/contracts'")
    .replace(/from "\.\/contracts"/g, 'from "../../core/contracts"')
    .replace(/from '\.\.\/kernels\//g, "from '../../kernels/")
    .replace(/from "\.\.\/kernels\//g, 'from "../../kernels/')
    .replace(/from '\.\.\/GlobalSystemicFatigueArbiter'/g, "from '../../GlobalSystemicFatigueArbiter'")
    .replace(/from "\.\.\/GlobalSystemicFatigueArbiter"/g, 'from "../../GlobalSystemicFatigueArbiter"');

  const targetAgentPath = path.join(targetFolder, item.agent);
  fs.writeFileSync(targetAgentPath, updatedContent, 'utf8');

  // Create slice index.ts
  const baseName = item.agent.replace('.ts', '');
  const sliceIndex = `// Vertical Slice Barrel: ${item.folder}\nexport * from './${baseName}';\n`;
  fs.writeFileSync(path.join(targetFolder, 'index.ts'), sliceIndex, 'utf8');
  console.log(`  -> Slice created: sports/${item.folder}/${item.agent}`);
}

console.log('--- Step 4: Create sports/index.ts master barrel ---');
let sportsIndexContent = `// Master Registry & Barrel Export for All 33 Sports Vertical Slices
import { sportCoordinatorRouter, SportCoordinatorRouter } from '../core/SportCoordinatorRouter';
`;

// Imports
for (const item of MAPPINGS) {
  const baseName = item.agent.replace('.ts', '');
  sportsIndexContent += `import { ${item.exportName} } from './${item.folder}';\n`;
}

sportsIndexContent += '\n// Re-export all vertical slices\n';
for (const item of MAPPINGS) {
  sportsIndexContent += `export * from './${item.folder}';\n`;
}

// Bootstrap functions
sportsIndexContent += `
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
`;

fs.writeFileSync(path.join(SPORTS_DIR, 'index.ts'), sportsIndexContent, 'utf8');

console.log('--- Step 5: Setup backward-compatibility shims in agents/ ---');
// 5a. contracts.ts shim
fs.writeFileSync(
  path.join(AGENTS_DIR, 'contracts.ts'),
  `// Backward-compatibility shim for core contracts\nexport * from '../core/contracts';\n`,
  'utf8'
);

// 5b. SportCoordinatorRouter.ts shim
fs.writeFileSync(
  path.join(AGENTS_DIR, 'SportCoordinatorRouter.ts'),
  `// Backward-compatibility shim for core router\nexport * from '../core/SportCoordinatorRouter';\n`,
  'utf8'
);

// 5c. Each agent shim in agents/
for (const item of MAPPINGS) {
  const baseName = item.agent.replace('.ts', '');
  fs.writeFileSync(
    path.join(AGENTS_DIR, item.agent),
    `// Backward-compatibility shim for ${item.folder}\nexport * from '../sports/${item.folder}/${baseName}';\n`,
    'utf8'
  );
}

// 5d. agents/index.ts facade
fs.writeFileSync(
  path.join(AGENTS_DIR, 'index.ts'),
  `// Backward-compatible Master Facade Bridge\nexport * from '../core';\nexport * from '../sports';\n`,
  'utf8'
);

console.log('--- Step 6: Update domain coach index.ts ---');
fs.writeFileSync(
  path.join(COACH_DIR, 'index.ts'),
  `// Authoritative Barrel Export for Coach Domain Engines & Vertical Slices
export * from './aiCoachEngine';
export * from './coachGoalInsights';
export * from './coachTrainingGenerator';
export * from './dailyCoachBriefingEngine';
export * from './core';
export * from './sports';
export * from './agents';
export * from './kernels/fosterSessionRpeKernel';
export * from './kernels/gabbettAcwrKernel';
export * from './kernels/issurinBlockPeriodizationKernel';
export * from './kernels/strengthCalculatorsKernel';
export * from './kernels/intermittentSportsKernel';
export * from './kernels/racketAndPrecisionKernel';
export * from './kernels/combatSportsKernel';
export * from './kernels/concurrentTrainingInterferenceKernel';
export * from './GlobalSystemicFatigueArbiter';
export * from './schema/sportCoachUiSchema';
`,
  'utf8'
);

console.log('--- MIGRATION TO VERTICAL SLICES COMPLETED SUCCESSFULLY ---');
