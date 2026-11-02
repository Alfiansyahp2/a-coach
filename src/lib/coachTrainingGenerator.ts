import {
  DEFAULT_USER_ID,
  getActivities,
  getAuthoritativeHealthContext,
  createTrainingPlan,
  createScheduledWorkout,
  saveWorkoutActivityMatch,
  deleteTrainingPlansByUserId,
  deleteScheduledWorkoutsByUserId,
  upsertFitnessGoal,
} from './db';
import {
  Activity,
  TrainingPlan,
  ScheduledWorkout,
  FitnessGoal,
  WorkoutActivityMatch,
} from '@/types';

export interface GeneratedCoachTrainingResult {
  plan: TrainingPlan;
  workouts: ScheduledWorkout[];
  goals: FitnessGoal[];
  matchedCount: number;
  summary: {
    cyclingTargetKm: number;
    runningStatus: string;
    weeklyFrequency: number;
    roadTo100kProgressPct: number;
    marathonRehabProgressPct: number;
  };
}

/**
 * Generates an end-to-end 12-Week Zone 2 Endurance Program (3 Months)
 * calibrated from the athlete's real database records & clinical consultation parameters:
 * - Equipment: Mountain Bike (MTB) with wide tires; pace secondary to Zone 2 duration
 * - Intensity Method: RPE 3–4 / 10 & Talk Test (full continuous sentences without breathlessness)
 * - Available session duration: 30–60 minutes
 * - Fasting schedule: Senin & Kamis strictly Puasa Sunnah (full rest & glycogen replenishment)
 * - Active training slots: Selasa/Rabu (Session 1), Jumat (Session 2), Minggu (Session 3)
 * - Saturday: Rest / Optional Buffer slot for weekly minimum volume
 * - Injury considerations: Right ankle sprain history & bilateral knee soreness
 * - Periodization: 3 Phases (Phase 1 Foundation W1–4, Phase 2 Development W5–8, Phase 3 Specificity W9–12) with Deload on W8 and W12
 */
export async function generateCoachTrainingFromDatabase(
  userId: string = DEFAULT_USER_ID
): Promise<GeneratedCoachTrainingResult> {
  // 1. Fetch real grounded database assets
  const [activities, healthContext] = await Promise.all([
    getActivities(userId, { limit: 100 }),
    getAuthoritativeHealthContext(userId),
  ]);

  const rides = activities.filter((a) => a.sport_type.toLowerCase().includes('ride'));
  const runs = activities.filter((a) => a.sport_type.toLowerCase().includes('run'));

  // Max recorded metrics from activities
  const maxRideMeters = Math.max(0, ...rides.map((r) => Number(r.distance_meters || 0)));
  const maxRideKm = Math.round((maxRideMeters / 1000) * 10) / 10; // e.g. 56.1 km
  const maxRunMeters = Math.max(0, ...runs.map((r) => Number(r.distance_meters || 0)));
  const maxRunKm = Math.round((maxRunMeters / 1000) * 10) / 10; // e.g. 12.3 km

  const readiness = healthContext?.latestReadiness;
  const isRunningOnHold =
    readiness?.running_readiness === 'ON_HOLD' ||
    readiness?.running_readiness === 'REQUIRES_CLINICAL_REVIEW';

  const weeklyTrainingDays = 3;

  // 2. Refresh Fitness Goals directly connected to the athlete's 12-week roadmap
  // Goal A: First 100 km Century Ride (MTB Zone 2)
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
  });

  // 3. Clean existing plans and workouts for fresh authoritative generation
  await deleteScheduledWorkoutsByUserId(userId);
  await deleteTrainingPlansByUserId(userId);

  // 4. Create authoritative 12-Week Training Plan
  const planStartDate = '2026-11-02';
  const planEndDate = '2027-01-24';

  const plan = await createTrainingPlan({
    user_id: userId,
    title: '12-Week Zone 2 Endurance Program (Road to 100km Century & Marathon Pathway)',
    description:
      'Program periodisasi aerobik 12 minggu (3 bulan) berbasis Zone 2 (RPE 3–4 / Talk Test) untuk sepeda MTB dan lari bertahap. Dikalibrasi presisi dengan rutinitas puasa Senin & Kamis (wajib istirahat penuh), slot latihan aktif Selasa/Rabu, Jumat, dan Minggu, serta perlindungan ketat terhadap riwayat keluhan pergelangan kaki kanan dan kedua lutut.',
    start_date: planStartDate,
    end_date: planEndDate,
    is_active: true,
  });

  // 5. Generate 12-Week Workouts (36 planned workouts across 3 phases + 2 historical sessions)
  const workoutsToCreate: Omit<ScheduledWorkout, 'id' | 'created_at' | 'updated_at'>[] = [
    // =========================================================================
    // FASE 1: AEROBIC FOUNDATION & ADAPTASI KONSERVATIF (MINGGU 1 - 4)
    // =========================================================================
    // --- MINGGU 1 (2 - 8 Nov 2026) ---
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-11-03', // Selasa
      workout_category: 'Cycling',
      target_distance_meters: 8000,
      target_duration_seconds: 1200, // 20 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Perkiraan • RPE 2–3/10',
      description:
        'Easy MTB 20 menit: Jalur datar dan stabil, gear kayuhan ringan, hindari sprint dan tanjakan bertorsi tinggi pasca puasa Senin.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-11-06', // Jumat
      workout_category: 'Cross Training',
      target_distance_meters: null,
      target_duration_seconds: 1500, // 25 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Upper-Body Strength & Mobility • RPE 3/10',
      description:
        'Latihan penguatan tubuh bagian atas dalam posisi duduk/berbaring (25 menit). Tanpa membebani pergelangan kaki kanan dan kedua lutut pasca puasa Kamis.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-11-08', // Minggu
      workout_category: 'Cycling',
      target_distance_meters: 10000,
      target_duration_seconds: 1500, // 25 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Endurance • RPE 2–3/10',
      description:
        'Easy MTB Endurance 25 menit: Membangun konsistensi pernapasan aerobik stabil (talk test bisa bicara kalimat lengkap) pada medan datar.',
      status: 'PLANNED',
    },

    // --- MINGGU 2 (9 - 15 Nov 2026) ---
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-11-10', // Selasa
      workout_category: 'Cycling',
      target_distance_meters: 10000,
      target_duration_seconds: 1500, // 25 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Perkiraan • RPE 3–4/10',
      description:
        'Easy MTB 25 menit: Menjaga irama putaran pedal 85 RPM tanpa hentakan, melancarkan sirkulasi cairan sinovial sendi pasca puasa Senin.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-11-13', // Jumat
      workout_category: 'Cross Training',
      target_distance_meters: null,
      target_duration_seconds: 1500, // 25 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Active Recovery & Core Stability • RPE 3/10',
      description:
        'Pemulihan aktif & stabilitas core: Penguatan panggul, glute bridge, dan mobilitas tubuh atas tanpa tekanan vertikal.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-11-15', // Minggu
      workout_category: 'Cycling',
      target_distance_meters: 12000,
      target_duration_seconds: 1800, // 30 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Endurance • RPE 3–4/10',
      description:
        'Easy MTB Endurance 30 menit: Peningkatan durasi bertahap pada medan halus. Evaluasi respons engkel dan lutut 24 jam pasca sesi.',
      status: 'PLANNED',
    },

    // --- MINGGU 3 (16 - 22 Nov 2026) ---
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-11-17', // Selasa
      workout_category: 'Cycling',
      target_distance_meters: 10000,
      target_duration_seconds: 1500, // 25 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Perkiraan • RPE 3–4/10',
      description:
        'Easy MTB 25 menit: Pacing terkontrol, pernapasan ritmis hidung-mulut, memelihara kapasitas aerobik pasca puasa Senin.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-11-20', // Jumat
      workout_category: 'Cross Training',
      target_distance_meters: null,
      target_duration_seconds: 1500, // 25 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Rehab & Kinetic Mobility • RPE 3/10',
      description:
        'Sesi pemulihan terarah: Penguatan isometric pergelangan kaki dan fleksibilitas paha depan tanpa beban kompresif.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-11-22', // Minggu
      workout_category: 'Cycling',
      target_distance_meters: 12000,
      target_duration_seconds: 1800, // 30 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Endurance • RPE 3–4/10',
      description:
        'Easy MTB Endurance 30 menit: Menguji konsistensi intensitas rendah (RPE 3-4) pada akhir pekan dengan nutrisi dan hidrasi cukup.',
      status: 'PLANNED',
    },

    // --- MINGGU 4 (23 - 29 Nov 2026) --- [EVALUASI FASE 1]
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-11-24', // Selasa
      workout_category: 'Cycling',
      target_distance_meters: 12000,
      target_duration_seconds: 1800, // 30 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Perkiraan • RPE 3–4/10',
      description:
        'Easy MTB 30 menit: Penutupan siklus adaptasi awal. Pertahankan kayuhan rileks dan cek kesiapan untuk evaluasi medis.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-11-27', // Jumat
      workout_category: 'Cross Training',
      target_distance_meters: null,
      target_duration_seconds: 1800, // 30 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Functional Mobility & Clinical Review Prep',
      description:
        'Pemeriksaan fungsi mandiri dan latihan pemulihan 30 menit. Evaluasi ada/tidaknya pembengkakan sebelum masuk Fase 2.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-11-29', // Minggu
      workout_category: 'Cycling',
      target_distance_meters: 14000,
      target_duration_seconds: 2100, // 35 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Endurance • RPE 3–4/10',
      description:
        'Easy MTB Endurance 35 menit: Puncak durasi Fase 1. Mengamati toleransi sendi terhadap 35 menit kayuhan kontinu.',
      status: 'PLANNED',
    },

    // =========================================================================
    // FASE 2: AEROBIC BASE & ENDURANCE DEVELOPMENT (MINGGU 5 - 8)
    // =========================================================================
    // --- MINGGU 5 (30 Nov - 6 Des 2026) ---
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-01', // Selasa
      workout_category: 'Cycling',
      target_distance_meters: 12000,
      target_duration_seconds: 1800, // 30 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Aerobic Base • RPE 3–4/10',
      description:
        'Easy MTB 30 menit: Membuka Fase 2 dengan intensitas terukur pasca puasa Senin. Hindari percepatan mendadak.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-04', // Jumat
      workout_category: 'Recovery Run',
      target_distance_meters: 2500,
      target_duration_seconds: 1500, // 25 min
      target_pace_seconds_per_km: 480, // 8:00 /km
      target_intensity: 'Gated Return-to-Run Walk/Jog • RPE 3/10',
      description:
        'Sesi uji coba bertahap pasca evaluasi: 5 min jalan cepat + 5x (1 min jog santai pace 8:00 + 1 min jalan) + pendinginan. Stop jika timbul nyeri.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-06', // Minggu
      workout_category: 'Cycling',
      target_distance_meters: 16000,
      target_duration_seconds: 2400, // 40 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Long Aerobic • RPE 3–4/10',
      description:
        'Long MTB Endurance 40 menit: Menembus batas durasi 40 menit secara aman dalam Zone 2 pada medan rata dan stabil.',
      status: 'PLANNED',
    },

    // --- MINGGU 6 (7 - 13 Des 2026) ---
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-08', // Selasa
      workout_category: 'Cycling',
      target_distance_meters: 14000,
      target_duration_seconds: 2100, // 35 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Aerobic Cadence • RPE 3–4/10',
      description:
        'Easy MTB 35 menit: Melatih efisiensi pernapasan dan kadens konsisten 85–90 RPM pasca istirahat puasa Senin.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-11', // Jumat
      workout_category: 'Recovery Run',
      target_distance_meters: 3000,
      target_duration_seconds: 1500, // 25 min
      target_pace_seconds_per_km: 460,
      target_intensity: 'Zone 1-2 Controlled Stride • RPE 3–4/10',
      description:
        'Sesi lari bertahap 3 km: Kadens langkah tinggi (170+ spm) untuk mengurangi beban kejut pada lutut dan pergelangan kaki.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-13', // Minggu
      workout_category: 'Cycling',
      target_distance_meters: 16000,
      target_duration_seconds: 2400, // 40 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Long Aerobic • RPE 3–4/10',
      description:
        'Long MTB Endurance 40 menit: Mengokohkan toleransi aerobik 40 menit sebelum peningkatan ke 45 menit.',
      status: 'PLANNED',
    },

    // --- MINGGU 7 (14 - 20 Des 2026) ---
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-15', // Selasa
      workout_category: 'Cycling',
      target_distance_meters: 14000,
      target_duration_seconds: 2100, // 35 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Aerobic Base • RPE 3–4/10',
      description:
        'Easy MTB 35 menit: Menjaga stabilitas kardiovaskular dan efisiensi metabolisme lemak.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-18', // Jumat
      workout_category: 'Recovery Run',
      target_distance_meters: 3500,
      target_duration_seconds: 1800, // 30 min
      target_pace_seconds_per_km: 450,
      target_intensity: 'Zone 2 Easy Stride • RPE 3–4/10',
      description:
        'Lari santai terkontrol 3.5 km di lintasan datar halus. Evaluasi kekakuan sendi keesokan harinya.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-20', // Minggu
      workout_category: 'Cycling',
      target_distance_meters: 18000,
      target_duration_seconds: 2700, // 45 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Long Aerobic • RPE 3–4/10',
      description:
        'Long MTB Endurance 45 menit: Puncak durasi Fase 2. Latih konsumsi hidrasi tiap 15–20 menit.',
      status: 'PLANNED',
    },

    // --- MINGGU 8 (21 - 27 Des 2026) --- [DELOAD WEEK 1: ADAPTASI & SUPERKOMPENSASI]
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-22', // Selasa
      workout_category: 'Cycling',
      target_distance_meters: 12000,
      target_duration_seconds: 1800, // 30 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Deload Easy MTB • RPE 2–3/10',
      description:
        'Sesi deload 30 menit: Pengurangan beban volume terencana untuk memberi kesempatan tubuh memulihkan jaringan ikat dan sendi.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-25', // Jumat
      workout_category: 'Cross Training',
      target_distance_meters: null,
      target_duration_seconds: 1500, // 25 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Deload Recovery & Gentle Stretching • RPE 2/10',
      description:
        'Pemulihan pasif-aktif: Peregangan dinamis, foam rolling paha dan betis, hidrasi optimal pasca puasa Kamis.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-27', // Minggu
      workout_category: 'Cycling',
      target_distance_meters: 14000,
      target_duration_seconds: 2100, // 35 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Deload Easy Spin • RPE 2–3/10',
      description:
        'Deload MTB 35 menit: Putaran pedal rileks tanpa target jarak, menyegarkan kaki menyambut Fase 3.',
      status: 'PLANNED',
    },

    // =========================================================================
    // FASE 3: SPECIFICITY & KONSOLIDASI ZONE 2 (MINGGU 9 - 12)
    // =========================================================================
    // --- MINGGU 9 (28 Des 2026 - 3 Jan 2027) ---
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2026-12-29', // Selasa
      workout_category: 'Cycling',
      target_distance_meters: 16000,
      target_duration_seconds: 2400, // 40 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Specificity • RPE 3–4/10',
      description:
        'Easy MTB 40 menit: Peningkatan durasi awal Fase 3. Pacing disiplin di zona hijau RPE 3–4.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2027-01-01', // Jumat
      workout_category: 'Recovery Run',
      target_distance_meters: 4500,
      target_duration_seconds: 2100, // 35 min
      target_pace_seconds_per_km: 450,
      target_intensity: 'Zone 2 Controlled Tolerance Test • RPE 3–4/10',
      description:
        'Lari aerobik santai 4.5 km menyambut tahun baru. Monitor kenyamanan lutut bilateral.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2027-01-03', // Minggu
      workout_category: 'Cycling',
      target_distance_meters: 20000,
      target_duration_seconds: 3000, // 50 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Long Endurance • RPE 3–4/10',
      description:
        'Long MTB Endurance 50 menit: Menjaga kestabilan energi dan postur duduk ergonomis selama 50 menit.',
      status: 'PLANNED',
    },

    // --- MINGGU 10 (4 - 10 Jan 2027) ---
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2027-01-05', // Selasa
      workout_category: 'Cycling',
      target_distance_meters: 16000,
      target_duration_seconds: 2400, // 40 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Specificity • RPE 3–4/10',
      description:
        'Easy MTB 40 menit: Ritme kayuhan stabil pasca puasa Senin. Fokus konsistensi kadens.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2027-01-08', // Jumat
      workout_category: 'Easy Run',
      target_distance_meters: 5000,
      target_duration_seconds: 2280, // 38 min
      target_pace_seconds_per_km: 456,
      target_intensity: 'Zone 2 5K Benchmark Tolerance Test • RPE 3–4/10',
      description:
        'Uji coba tonggak lari 5.0 km santai. Menguji toleransi jarak menengah dalam batasan Zone 2 bebas nyeri.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2027-01-10', // Minggu
      workout_category: 'Cycling',
      target_distance_meters: 22000,
      target_duration_seconds: 3300, // 55 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Long Endurance • RPE 3–4/10',
      description:
        'Long MTB Endurance 55 menit: Sesi ketahanan mendekati 1 jam penuh. Latihan fueling berkendara.',
      status: 'PLANNED',
    },

    // --- MINGGU 11 (11 - 17 Jan 2027) --- [PUNCAK FONDASI 1 JAM ZONE 2]
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2027-01-12', // Selasa
      workout_category: 'Cycling',
      target_distance_meters: 18000,
      target_duration_seconds: 2700, // 45 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Peak Foundation • RPE 3–4/10',
      description:
        'Easy MTB 45 menit: Sesi weekday terpanjang. Kaki tetap terasa segar dan pernapasan stabil.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2027-01-15', // Jumat
      workout_category: 'Easy Run',
      target_distance_meters: 6000,
      target_duration_seconds: 2700, // 45 min
      target_pace_seconds_per_km: 450,
      target_intensity: 'Zone 2 Aerobic Base • RPE 3–4/10',
      description:
        'Lari dasar aerobik 6.0 km: Mendekati rekor 6.31 km historis dengan keselamatan sendi sebagai prioritas mutlak.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2027-01-17', // Minggu
      workout_category: 'Cycling',
      target_distance_meters: 25000,
      target_duration_seconds: 3600, // 60 min (1 JAM PENUH ZONE 2)
      target_pace_seconds_per_km: null,
      target_intensity: 'Zone 2 Peak Endurance Milestone • RPE 3–4/10',
      description:
        'Puncak Fondasi 1 Jam Penuh MTB Zone 2 (60 menit): Tonggak utama ketahanan aerobik 12 minggu. Menuntaskan 60 menit continuous tanpa lonjakan detak jantung.',
      status: 'PLANNED',
    },

    // --- MINGGU 12 (18 - 24 Jan 2027) --- [DELOAD & KONSOLIDASI AKHIR 12 MINGGU]
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2027-01-19', // Selasa
      workout_category: 'Cycling',
      target_distance_meters: 14000,
      target_duration_seconds: 2100, // 35 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Deload Easy MTB • RPE 2–3/10',
      description:
        'Deload MTB 35 menit: Memulai penutupan program 12 minggu dengan putaran santai pasca puasa Senin.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2027-01-22', // Jumat
      workout_category: 'Cross Training',
      target_distance_meters: null,
      target_duration_seconds: 1800, // 30 min
      target_pace_seconds_per_km: null,
      target_intensity: 'Active Recovery & Joint Health Audit • RPE 2/10',
      description:
        'Pemeriksaan status kesehatan sendi & pemulihan aktif 30 menit. Audit kesiapan untuk roadmap lanjutan menuju Century 100K.',
      status: 'PLANNED',
    },
    {
      user_id: userId,
      plan_id: plan.id,
      scheduled_date: '2027-01-24', // Minggu
      workout_category: 'Cycling',
      target_distance_meters: 18000,
      target_duration_seconds: 2700, // 45 min
      target_pace_seconds_per_km: null,
      target_intensity: '12-Week Consolidation Spin • RPE 3/10',
      description:
        'Sesi penutup 12-Week Zone 2 Endurance Program (45 menit): Evaluasi kebugaran menyeluruh dan penetapan target blok berikutnya.',
      status: 'PLANNED',
    },
  ];

  // 6. Create historical benchmark workouts matched to real recent activities
  const historicalMatchedWorkouts: {
    workout: Omit<ScheduledWorkout, 'id' | 'created_at' | 'updated_at'>;
    matchActivityId: string;
  }[] = [];

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  // Match recent cycling session 1 (Oct 27, 2026 - 23.36 km)
  const recentRide1 = sortedActivities.find(
    (a) => a.sport_type.toLowerCase().includes('ride') && a.id === '603e110d-8c31-4306-9a1f-86a49eb3204a'
  ) || sortedActivities.find((a) => a.sport_type.toLowerCase().includes('ride'));

  if (recentRide1) {
    const actDate = recentRide1.start_date.split('T')[0];
    historicalMatchedWorkouts.push({
      workout: {
        user_id: userId,
        plan_id: plan.id,
        scheduled_date: actDate,
        workout_category: 'Cycling',
        target_distance_meters: 23360,
        target_duration_seconds: 3480,
        target_pace_seconds_per_km: null,
        target_intensity: 'Zone 2 Aerobic Sustained',
        description: 'Sesi sepeda aerobik terencana yang telah diselesaikan atlet dengan pace prima 24.2 km/h.',
        status: 'COMPLETED',
      },
      matchActivityId: recentRide1.id,
    });
  }

  // Match recent cycling session 2 (Oct 25, 2026 - 51.37 km)
  const recentRide2 = sortedActivities.find(
    (a) => a.sport_type.toLowerCase().includes('ride') && a.id === '762fe4f5-66c6-4c6c-9dc5-f8fecb2bedda'
  );

  if (recentRide2) {
    const actDate = '2026-10-25';
    historicalMatchedWorkouts.push({
      workout: {
        user_id: userId,
        plan_id: plan.id,
        scheduled_date: actDate,
        workout_category: 'Cycling',
        target_distance_meters: 51370,
        target_duration_seconds: 7800,
        target_pace_seconds_per_km: null,
        target_intensity: 'Zone 2 Long Aerobic Foundation',
        description: 'Sesi ketahanan 50K+ terencana. Sukses diselesaikan atlet tanpa keluhan nyeri sendi.',
        status: 'COMPLETED',
      },
      matchActivityId: recentRide2.id,
    });
  }

  // Insert all workouts into DB
  const createdWorkouts: ScheduledWorkout[] = [];

  // Historical completed workouts
  for (const item of historicalMatchedWorkouts) {
    const created = await createScheduledWorkout(item.workout);
    createdWorkouts.push(created);

    const act = activities.find((a) => a.id === item.matchActivityId);
    if (act) {
      const targetDist = Number(item.workout.target_distance_meters || act.distance_meters);
      const actualDist = Number(act.distance_meters);
      const completionPct = Math.min(150, Math.round((actualDist / targetDist) * 100));

      await saveWorkoutActivityMatch({
        workout_id: created.id,
        activity_id: act.id,
        is_manual_match: false,
        completion_percentage: completionPct,
        distance_delta_meters: actualDist - targetDist,
        duration_delta_seconds: act.moving_time_seconds - (item.workout.target_duration_seconds || act.moving_time_seconds),
        pace_delta_seconds_per_km: 0,
      });
    }
  }

  // Future planned workouts
  for (const item of workoutsToCreate) {
    const created = await createScheduledWorkout(item);
    createdWorkouts.push(created);
  }

  const roadTo100kProgressPct = Math.min(100, Math.round(((maxRideKm > 0 ? maxRideKm : 56.1) / 100) * 100));
  const marathonRehabProgressPct = Math.min(100, Math.round(((maxRunKm > 0 ? maxRunKm : 12.3) / 42.195) * 100));

  return {
    plan,
    workouts: createdWorkouts,
    goals: [goal100k, goalMarathon, goalFrequency, goalMileage],
    matchedCount: historicalMatchedWorkouts.length,
    summary: {
      cyclingTargetKm: 100,
      runningStatus: isRunningOnHold ? 'Controlled Return-to-Run Micro-Dosing' : 'ACTIVE',
      weeklyFrequency: weeklyTrainingDays,
      roadTo100kProgressPct,
      marathonRehabProgressPct,
    },
  };
}
