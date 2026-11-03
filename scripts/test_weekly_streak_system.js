/**
 * Verification Test Suite: Weekly Training Streak & Thermodynamic Flame Heat Progression Engine
 */

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:admin123@localhost:5432/sport_training',
});

const MONTH_NAMES_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function getMondayOfWeek(dateInput) {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.getTime());
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff, 0, 0, 0, 0);
}

function getSundayOfWeek(mondayInput) {
  return new Date(mondayInput.getFullYear(), mondayInput.getMonth(), mondayInput.getDate() + 6, 23, 59, 59, 999);
}

function formatLocalDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatMonthDay(d) {
  return `${MONTH_NAMES_EN[d.getMonth()]} ${d.getDate()}`;
}

function formatMonthDayYear(d) {
  return `${MONTH_NAMES_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getFlameHeatTier(streakWeeks, isFlameBurning = true) {
  if (streakWeeks <= 0 || !isFlameBurning) {
    return {
      stage: 0,
      name: 'Api Padam',
      minWeeks: 0,
      maxWeeks: 0,
      colorHex: '#5A6272',
      glowRgba: 'rgba(90, 98, 114, 0.2)',
      temperatureText: '0°C',
      description: 'Api padam — selesaikan 1 sesi minggu ini untuk menyalakan api',
      nextTierWeeks: 1,
      weeksToNextTier: 1,
    };
  }

  // Tahap 1: 1 - 9 Minggu (Paling tidak panas / Merah ~800°C)
  if (streakWeeks < 10) {
    return {
      stage: 1,
      name: 'Api Merah',
      minWeeks: 1,
      maxWeeks: 9,
      colorHex: '#EF4444',
      glowRgba: 'rgba(239, 68, 68, 0.45)',
      temperatureText: '~800°C',
      description: 'Tahap 1: Api Merah (Suhu awal / paling tidak panas)',
      nextTierWeeks: 10,
      weeksToNextTier: 10 - streakWeeks,
    };
  }

  // Tahap 2: 10 - 19 Minggu (Oranye / Panas Sedang ~1,100°C)
  if (streakWeeks < 20) {
    return {
      stage: 2,
      name: 'Api Oranye',
      minWeeks: 10,
      maxWeeks: 19,
      colorHex: '#F97316',
      glowRgba: 'rgba(249, 115, 22, 0.45)',
      temperatureText: '~1,100°C',
      description: 'Tahap 2: Api Oranye (Panas sedang membara)',
      nextTierWeeks: 20,
      weeksToNextTier: 20 - streakWeeks,
    };
  }

  // Tahap 3: 20 - 29 Minggu (Kuning Emas / Panas Tinggi ~1,300°C)
  if (streakWeeks < 30) {
    return {
      stage: 3,
      name: 'Api Kuning',
      minWeeks: 20,
      maxWeeks: 29,
      colorHex: '#EAB308',
      glowRgba: 'rgba(234, 179, 8, 0.45)',
      temperatureText: '~1,300°C',
      description: 'Tahap 3: Api Kuning (Panas tinggi stabil)',
      nextTierWeeks: 30,
      weeksToNextTier: 30 - streakWeeks,
    };
  }

  // Tahap 4: 30 - 39 Minggu (Putih Terang / Sangat Panas ~1,500°C)
  if (streakWeeks < 40) {
    return {
      stage: 4,
      name: 'Api Putih',
      minWeeks: 30,
      maxWeeks: 39,
      colorHex: '#F8FAFC',
      glowRgba: 'rgba(248, 250, 252, 0.5)',
      temperatureText: '~1,500°C',
      description: 'Tahap 4: Api Putih (Sangat panas / White hot)',
      nextTierWeeks: 40,
      weeksToNextTier: 40 - streakWeeks,
    };
  }

  // Tahap 5: 40 - 49 Minggu (Biru Cyan / Api Terpanas Pembakaran ~1,800°C)
  if (streakWeeks < 50) {
    return {
      stage: 5,
      name: 'Api Biru',
      minWeeks: 40,
      maxWeeks: 49,
      colorHex: '#00F0FF',
      glowRgba: 'rgba(0, 240, 255, 0.5)',
      temperatureText: '~1,800°C',
      description: 'Tahap 5: Api Biru (Api pembakaran terpanas)',
      nextTierWeeks: 50,
      weeksToNextTier: 50 - streakWeeks,
    };
  }

  // Tahap 6: 50+ Minggu / 1 Tahun+ (Ungu Plasma / Puncak Suhu Kosmik >2,200°C)
  return {
    stage: 6,
    name: 'Api Ungu Plasma',
    minWeeks: 50,
    maxWeeks: null,
    colorHex: '#C084FC',
    glowRgba: 'rgba(192, 132, 252, 0.55)',
    temperatureText: '>2,200°C',
    description: 'Tahap 6: Api Ungu Plasma (Puncak suhu kosmik legendaris)',
    nextTierWeeks: null,
    weeksToNextTier: null,
  };
}

function calculateWeeklyStreak(activities = [], workouts = [], referenceDate = new Date()) {
  const timestamps = [];

  for (const act of activities) {
    if (act.start_date) {
      const t = new Date(act.start_date).getTime();
      if (!isNaN(t)) timestamps.push(t);
    }
  }

  for (const w of workouts) {
    if (w.status === 'COMPLETED' && w.scheduled_date) {
      const t = new Date(w.scheduled_date).getTime();
      if (!isNaN(t)) timestamps.push(t);
    }
  }

  timestamps.sort((a, b) => a - b);
  const totalContributions = timestamps.length;

  if (totalContributions === 0) {
    const heatTier = getFlameHeatTier(0, false);
    return {
      totalContributions: 0,
      totalDateRange: 'No recorded sessions',
      currentStreakWeeks: 0,
      currentStreakDateRange: 'None',
      longestStreakWeeks: 0,
      longestStreakDateRange: 'None',
      isFlameBurning: false,
      isFlameAtRisk: false,
      daysRemainingThisWeek: 7,
      activeWeeksCount: 0,
      heatTier,
    };
  }

  const activeWeeksMap = new Map();

  for (const t of timestamps) {
    const actDate = new Date(t);
    const mon = getMondayOfWeek(actDate);
    const key = formatLocalDateKey(mon);

    const existing = activeWeeksMap.get(key);
    if (!existing) {
      activeWeeksMap.set(key, {
        monday: mon,
        sunday: getSundayOfWeek(mon),
        earliestDate: actDate,
        latestDate: actDate,
        count: 1,
      });
    } else {
      existing.count++;
      if (actDate.getTime() < existing.earliestDate.getTime()) existing.earliestDate = actDate;
      if (actDate.getTime() > existing.latestDate.getTime()) existing.latestDate = actDate;
    }
  }

  const sortedWeekKeys = Array.from(activeWeeksMap.keys()).sort();
  const activeWeeksCount = sortedWeekKeys.length;

  const currentWeekMonday = getMondayOfWeek(referenceDate);
  const currentWeekKey = formatLocalDateKey(currentWeekMonday);

  const prevWeekMonday = new Date(currentWeekMonday.getFullYear(), currentWeekMonday.getMonth(), currentWeekMonday.getDate() - 7, 0, 0, 0, 0);
  const prevWeekKey = formatLocalDateKey(prevWeekMonday);

  const isFlameBurning = activeWeeksMap.has(currentWeekKey);
  const isFlameAtRisk = !isFlameBurning && activeWeeksMap.has(prevWeekKey);

  const refDay = referenceDate.getDay();
  const daysRemainingThisWeek = refDay === 0 ? 0 : 7 - refDay;

  let currentStreakWeeks = 0;
  let currentStreakStartDate = null;
  let currentStreakEndDate = null;

  const startCheckKey = isFlameBurning ? currentWeekKey : isFlameAtRisk ? prevWeekKey : null;

  if (startCheckKey && activeWeeksMap.has(startCheckKey)) {
    const endWeekData = activeWeeksMap.get(startCheckKey);
    currentStreakEndDate = endWeekData.latestDate;

    let cursorMonday = new Date(endWeekData.monday.getTime());

    while (true) {
      const k = formatLocalDateKey(cursorMonday);
      const wData = activeWeeksMap.get(k);
      if (wData) {
        currentStreakWeeks++;
        currentStreakStartDate = wData.earliestDate;
        cursorMonday.setDate(cursorMonday.getDate() - 7);
      } else {
        break;
      }
    }
  }

  let longestStreakWeeks = 0;
  let longestStreakStartDate = null;
  let longestStreakEndDate = null;

  for (let i = 0; i < sortedWeekKeys.length; i++) {
    const startKey = sortedWeekKeys[i];
    const startWeekData = activeWeeksMap.get(startKey);

    let streakLen = 1;
    let earliest = startWeekData.earliestDate;
    let latest = startWeekData.latestDate;
    let cursorMonday = new Date(startWeekData.monday.getTime());

    for (let j = i + 1; j < sortedWeekKeys.length; j++) {
      const nextMonday = new Date(cursorMonday.getFullYear(), cursorMonday.getMonth(), cursorMonday.getDate() + 7, 0, 0, 0, 0);
      const nextKey = formatLocalDateKey(nextMonday);

      if (sortedWeekKeys[j] === nextKey) {
        const nextWeekData = activeWeeksMap.get(nextKey);
        streakLen++;
        latest = nextWeekData.latestDate;
        cursorMonday = nextMonday;
      } else {
        break;
      }
    }

    if (streakLen > longestStreakWeeks) {
      longestStreakWeeks = streakLen;
      longestStreakStartDate = earliest;
      longestStreakEndDate = latest;
    }
  }

  const firstOverallDate = new Date(timestamps[0]);
  const totalDateRange = `${formatMonthDayYear(firstOverallDate)} - Present`;

  const currentStreakDateRange =
    currentStreakStartDate && currentStreakEndDate
      ? `${formatMonthDay(currentStreakStartDate)} - ${formatMonthDay(currentStreakEndDate)}`
      : 'None';

  const longestStreakDateRange =
    longestStreakStartDate && longestStreakEndDate
      ? `${formatMonthDay(longestStreakStartDate)} - ${formatMonthDay(longestStreakEndDate)}`
      : 'None';

  const heatTier = getFlameHeatTier(currentStreakWeeks, isFlameBurning || isFlameAtRisk);

  return {
    totalContributions,
    totalDateRange,
    currentStreakWeeks,
    currentStreakDateRange,
    longestStreakWeeks,
    longestStreakDateRange,
    isFlameBurning,
    isFlameAtRisk,
    daysRemainingThisWeek,
    activeWeeksCount,
    heatTier,
  };
}

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 RUNNING WEEKLY TRAINING STREAK & FLAME HEAT SPECTRUM TEST SUITE');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Unit Test 1: Empty state
  console.log('--- 1. Boundary Condition: Empty Activity Stream ---');
  const emptyRes = calculateWeeklyStreak([], []);
  assert(emptyRes.totalContributions === 0, 'Total contributions is 0 when no activities');
  assert(emptyRes.currentStreakWeeks === 0, 'Current streak is 0 weeks');
  assert(emptyRes.heatTier.stage === 0, 'Stage 0 for 0 weeks (Api Padam)');
  assert(emptyRes.heatTier.colorHex === '#5A6272', 'Color is gray #5A6272');

  // Unit Test 2: Active in current week maintains flame
  console.log('\n--- 2. Active Session in Current Week ---');
  const refDate = new Date('2026-11-04T10:00:00Z'); // Wednesday Nov 4
  const singleWeekRes = calculateWeeklyStreak(
    [{ start_date: '2026-11-02T08:00:00Z' }],
    [],
    refDate
  );
  assert(singleWeekRes.totalContributions === 1, 'Total contributions is 1');
  assert(singleWeekRes.currentStreakWeeks === 1, 'Current streak is 1 week');
  assert(singleWeekRes.heatTier.stage === 1, 'Stage 1 for 1 week (Api Merah)');
  assert(singleWeekRes.heatTier.colorHex === '#EF4444', 'Flame color is Red #EF4444 (~800°C)');

  // Unit Test 3: Thermodynamic Heat Progression Tiers Verification
  console.log('\n--- 3. Thermodynamic Flame Heat Progression Tiers (Least Hot -> Hottest) ---');
  const t1 = getFlameHeatTier(8, true);
  assert(t1.stage === 1 && t1.name === 'Api Merah' && t1.colorHex === '#EF4444', '8 weeks -> Stage 1 (Api Merah #EF4444, ~800°C - Least Hot)');
  assert(t1.weeksToNextTier === 2, '8 weeks -> exactly 2 weeks to next tier (Stage 2)');

  const t2 = getFlameHeatTier(10, true);
  assert(t2.stage === 2 && t2.name === 'Api Oranye' && t2.colorHex === '#F97316', '10 weeks -> Stage 2 (Api Oranye #F97316, ~1,100°C - Panas Sedang)');
  assert(t2.weeksToNextTier === 10, '10 weeks -> 10 weeks to next tier (Stage 3)');

  const t3 = getFlameHeatTier(25, true);
  assert(t3.stage === 3 && t3.name === 'Api Kuning' && t3.colorHex === '#EAB308', '25 weeks -> Stage 3 (Api Kuning #EAB308, ~1,300°C - Panas Tinggi)');

  const t4 = getFlameHeatTier(35, true);
  assert(t4.stage === 4 && t4.name === 'Api Putih' && t4.colorHex === '#F8FAFC', '35 weeks -> Stage 4 (Api Putih #F8FAFC, ~1,500°C - Sangat Panas)');

  const t5 = getFlameHeatTier(42, true);
  assert(t5.stage === 5 && t5.name === 'Api Biru' && t5.colorHex === '#00F0FF', '42 weeks -> Stage 5 (Api Biru #00F0FF, ~1,800°C - Api Pembakaran Terpanas)');

  const t6 = getFlameHeatTier(54, true);
  assert(t6.stage === 6 && t6.name === 'Api Ungu Plasma' && t6.colorHex === '#C084FC', '54 weeks -> Stage 6 (Api Ungu Plasma #C084FC, >2,200°C - Puncak Kosmik)');

  // Unit Test 4: Grounded Real Database Streak Telemetry
  console.log('\n--- 4. Grounded Real Database Streak & Thermal Tier Telemetry ---');
  const dbRes = await pool.query('SELECT id, name, sport_type, start_date FROM activities ORDER BY start_date ASC');
  const dbActivities = dbRes.rows.map(r => ({ ...r, start_date: r.start_date.toISOString() }));
  const realStreak = calculateWeeklyStreak(dbActivities, [], new Date('2026-11-02T12:00:00Z'));

  assert(realStreak.currentStreakWeeks === 8, `Current weekly streak is exactly 8 weeks (Actual: ${realStreak.currentStreakWeeks})`);
  assert(realStreak.heatTier.stage === 1, 'Current DB streak maps to Stage 1');
  assert(realStreak.heatTier.name === 'Api Merah', 'Current flame is Api Merah (paling tidak panas)');
  assert(realStreak.heatTier.colorHex === '#EF4444', 'Current flame color is #EF4444');
  assert(realStreak.heatTier.weeksToNextTier === 2, '2 weeks left to unlock Api Oranye at 10 weeks');

  console.log('\n======================================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  await pool.end();
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
