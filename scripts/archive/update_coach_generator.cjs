const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'lib', 'coachTrainingGenerator.ts');
let content = fs.readFileSync(file, 'utf8');

const targetGoals = `  // Goal A: First 100 km Century Ride (MTB Zone 2)
  const goal100k = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000031',
    user_id: userId,
    title: 'First 100 km Century Ride (MTB Zone 2)',
    goal_type: 'CUSTOM',
    target_value: 100, // 100 km
    current_value: maxRideKm > 0 ? maxRideKm : 56.1, // 56.1 km validated baseline
    start_date: '2026-09-01',
    target_date: '2027-03-31',
    is_achieved: maxRideKm >= 100,
    unit: 'km',
  });

  // Goal B: Marathon Return-to-Run Pathway (42.2 km)
  const goalMarathon = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000032',
    user_id: userId,
    title: 'Marathon Pathway (42.2K) • Return-to-Run (Zone 2)',
    goal_type: 'CUSTOM',
    target_value: 42.2,
    current_value: maxRunKm > 0 ? maxRunKm : 12.3, // 12.3 km historical baseline
    start_date: '2026-09-01',
    target_date: '2027-04-30',
    is_achieved: false,
    unit: 'km',
  });

  // Goal C: Weekly Cadence Compliance (3 Sessions / Week)
  const goalFrequency = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000033',
    user_id: userId,
    title: 'Konsistensi 3 Sesi Mingguan (Non-Puasa)',
    goal_type: 'FREQUENCY_WEEKLY',
    target_value: 3,
    current_value: 3,
    start_date: '2026-11-02',
    target_date: '2027-01-24',
    is_achieved: true,
    unit: 'sessions',
  });

  // Goal D: 12-Week Total Mileage Accumulation
  const goalMileage = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000034',
    user_id: userId,
    title: 'Akumulasi Siklus 12-Minggu (Sepeda + Lari)',
    goal_type: 'DISTANCE_MONTHLY',
    target_value: 400,
    current_value: 79.5,
    start_date: '2026-11-02',
    target_date: '2027-01-24',
    is_achieved: false,
    unit: 'km',
  });`;

const replacementGoals = `  // Goal A: First 100 km Century Ride (MTB Zone 2)
  const goal100k = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000031',
    user_id: userId,
    title: 'First 100 km Century Ride (MTB Zone 2)',
    goal_type: 'CUSTOM',
    sport_type: 'Ride',
    priority: 1,
    target_event_name: 'Century Ride 100K MTB',
    target_value: 100, // 100 km
    current_value: maxRideKm > 0 ? maxRideKm : 56.1, // 56.1 km validated baseline
    start_date: '2026-09-01',
    target_date: '2027-03-31',
    is_achieved: maxRideKm >= 100,
    unit: 'km',
  });

  // Goal B: Marathon Return-to-Run Pathway (42.2 km)
  const goalMarathon = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000032',
    user_id: userId,
    title: 'Marathon Pathway (42.2K) • Return-to-Run (Zone 2)',
    goal_type: 'CUSTOM',
    sport_type: 'Run',
    priority: 2,
    target_event_name: 'Marathon Return-to-Run (42.2K)',
    target_value: 42.2,
    current_value: maxRunKm > 0 ? maxRunKm : 12.3, // 12.3 km historical baseline
    start_date: '2026-09-01',
    target_date: '2027-04-30',
    is_achieved: false,
    unit: 'km',
  });

  // Goal C: Weekly Cadence Compliance (3 Sessions / Week)
  const goalFrequency = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000033',
    user_id: userId,
    title: 'Konsistensi 3 Sesi Mingguan (Non-Puasa)',
    goal_type: 'FREQUENCY_WEEKLY',
    sport_type: 'All',
    priority: 1,
    target_event_name: 'Weekly Cadence 3x',
    target_value: 3,
    current_value: 3,
    start_date: '2026-11-02',
    target_date: '2027-01-24',
    is_achieved: true,
    unit: 'sessions',
  });

  // Goal D: 12-Week Total Mileage Accumulation
  const goalMileage = await upsertFitnessGoal({
    id: '00000000-0000-0000-0000-000000000034',
    user_id: userId,
    title: 'Akumulasi Siklus 12-Minggu (Sepeda + Lari)',
    goal_type: 'DISTANCE_MONTHLY',
    sport_type: 'All',
    priority: 2,
    target_event_name: '12-Week Endurance Accumulation',
    target_value: 400,
    current_value: 79.5,
    start_date: '2026-11-02',
    target_date: '2027-01-24',
    is_achieved: false,
    unit: 'km',
  });`;

let norm = content.replace(/\r\n/g, '\n');
norm = norm.replace(targetGoals.replace(/\r\n/g, '\n'), replacementGoals.replace(/\r\n/g, '\n'));

fs.writeFileSync(file, norm, 'utf8');
console.log('src/lib/coachTrainingGenerator.ts successfully updated');

