const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/sport_training',
});

async function main() {
  console.log('Seeding 12-Week Zone 2 Endurance Program (Road to 100km MTB & Marathon Pathway)...');

  const userId = '00000000-0000-0000-0000-000000000001';

  // 1. Clear old workouts and plans for user
  await pool.query('DELETE FROM workout_activity_matches WHERE workout_id IN (SELECT id FROM scheduled_workouts WHERE user_id = $1)', [userId]);
  await pool.query('DELETE FROM scheduled_workouts WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM training_plans WHERE user_id = $1', [userId]);

  // 2. Create 12-Week Training Plan
  const planTitle = '12-Week Zone 2 Endurance Program (Road to 100km Century & Marathon Pathway)';
  const planDesc = 'Program periodisasi aerobik 12 minggu (3 bulan) berbasis Zone 2 (RPE 3–4 / Talk Test) untuk sepeda MTB dan lari bertahap. Dikalibrasi presisi dengan rutinitas puasa Senin & Kamis (wajib istirahat penuh), slot latihan aktif Selasa/Rabu, Jumat, dan Minggu, serta perlindungan ketat terhadap riwayat keluhan pergelangan kaki kanan dan kedua lutut.';
  
  const planRes = await pool.query(`
    INSERT INTO training_plans (user_id, title, description, start_date, end_date, is_active, updated_at)
    VALUES ($1, $2, $3, $4, $5, TRUE, NOW())
    RETURNING id;
  `, [userId, planTitle, planDesc, '2026-11-02', '2027-01-24']);

  const planId = planRes.rows[0].id;
  console.log(`Created Active 12-Week Training Plan: ${planId}`);

  // 3. Update Fitness Goals Grounded in Real Data & 12-Week Targets
  const goals = [
    {
      id: '00000000-0000-0000-0000-000000000031',
      title: 'First 100 km Century Ride (MTB Zone 2)',
      goal_type: 'CUSTOM',
      target_value: 100,
      current_value: 56.1,
      start_date: '2026-09-01',
      target_date: '2027-03-31',
      is_achieved: false,
      unit: 'km'
    },
    {
      id: '00000000-0000-0000-0000-000000000032',
      title: 'Marathon Pathway (42.2K) • Return-to-Run (Zone 2)',
      goal_type: 'CUSTOM',
      target_value: 42.2,
      current_value: 12.33,
      start_date: '2026-09-01',
      target_date: '2027-04-30',
      is_achieved: false,
      unit: 'km'
    },
    {
      id: '00000000-0000-0000-0000-000000000033',
      title: 'Konsistensi 3 Sesi Mingguan (Non-Puasa)',
      goal_type: 'FREQUENCY_WEEKLY',
      target_value: 3,
      current_value: 3,
      start_date: '2026-11-02',
      target_date: '2027-01-24',
      is_achieved: true,
      unit: 'sessions'
    },
    {
      id: '00000000-0000-0000-0000-000000000034',
      title: 'Akumulasi Siklus 12-Minggu (Sepeda + Lari)',
      goal_type: 'DISTANCE_MONTHLY',
      target_value: 400,
      current_value: 79.5,
      start_date: '2026-11-02',
      target_date: '2027-01-24',
      is_achieved: false,
      unit: 'km'
    }
  ];

  for (const g of goals) {
    await pool.query(`
      INSERT INTO fitness_goals (id, user_id, title, goal_type, target_value, current_value, start_date, target_date, is_achieved, unit, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        goal_type = EXCLUDED.goal_type,
        target_value = EXCLUDED.target_value,
        current_value = EXCLUDED.current_value,
        start_date = EXCLUDED.start_date,
        target_date = EXCLUDED.target_date,
        is_achieved = EXCLUDED.is_achieved,
        unit = EXCLUDED.unit,
        updated_at = NOW();
    `, [g.id, userId, g.title, g.goal_type, g.target_value, g.current_value, g.start_date, g.target_date, g.is_achieved, g.unit]);
  }

  // 4. Insert 12-Week Scheduled Workouts (36 planned workouts + 2 historical verified = 38 workouts)
  // Aligned with:
  // - Senin & Kamis: PUASA SUNNAH & ISTIRAHAT TOTAL
  // - Selasa / Rabu: Easy MTB
  // - Jumat: Recovery / Upper Body / Return-to-Run bertahap
  // - Sabtu: Rest / Buffer Opsional
  // - Minggu: Long MTB Endurance
  const scheduledWorkouts = [
    // Historical Verified Sessions
    {
      date: '2026-10-25',
      cat: 'Cycling',
      dist: 51370,
      dur: 7800,
      intensity: 'Zone 2 Long Aerobic Foundation',
      desc: 'Sesi ketahanan 50K+ terencana. Sukses diselesaikan atlet tanpa keluhan nyeri sendi.',
      status: 'COMPLETED'
    },
    {
      date: '2026-10-27',
      cat: 'Cycling',
      dist: 23360,
      dur: 3480,
      intensity: 'Zone 2 Aerobic Sustained',
      desc: 'Sesi sepeda aerobik terencana yang telah diselesaikan atlet dengan pace prima 24.2 km/h.',
      status: 'COMPLETED'
    },

    // =========================================================================
    // FASE 1: AEROBIC FOUNDATION & ADAPTASI KONSERVATIF (MINGGU 1 - 4)
    // =========================================================================
    // --- MINGGU 1 (2 - 8 Nov 2026) ---
    {
      date: '2026-11-03', // Selasa
      cat: 'Cycling',
      dist: 8000,
      dur: 1200, // 20 min
      intensity: 'Zone 2 Perkiraan • RPE 2–3/10',
      desc: 'Easy MTB 20 menit: Jalur datar dan stabil, gear kayuhan ringan, hindari sprint dan tanjakan bertorsi tinggi pasca puasa Senin.',
      status: 'PLANNED'
    },
    {
      date: '2026-11-06', // Jumat
      cat: 'Cross Training',
      dist: null,
      dur: 1500, // 25 min
      intensity: 'Upper-Body Strength & Mobility • RPE 3/10',
      desc: 'Latihan penguatan tubuh bagian atas dalam posisi duduk/berbaring (25 menit). Tanpa membebani pergelangan kaki kanan dan kedua lutut pasca puasa Kamis.',
      status: 'PLANNED'
    },
    {
      date: '2026-11-08', // Minggu
      cat: 'Cycling',
      dist: 10000,
      dur: 1500, // 25 min
      intensity: 'Zone 2 Endurance • RPE 2–3/10',
      desc: 'Easy MTB Endurance 25 menit: Membangun konsistensi pernapasan aerobik stabil (talk test bisa bicara kalimat lengkap) pada medan datar.',
      status: 'PLANNED'
    },

    // --- MINGGU 2 (9 - 15 Nov 2026) ---
    {
      date: '2026-11-10', // Selasa
      cat: 'Cycling',
      dist: 10000,
      dur: 1500, // 25 min
      intensity: 'Zone 2 Perkiraan • RPE 3–4/10',
      desc: 'Easy MTB 25 menit: Menjaga irama putaran pedal 85 RPM tanpa hentakan, melancarkan sirkulasi cairan sinovial sendi pasca puasa Senin.',
      status: 'PLANNED'
    },
    {
      date: '2026-11-13', // Jumat
      cat: 'Cross Training',
      dist: null,
      dur: 1500, // 25 min
      intensity: 'Active Recovery & Core Stability • RPE 3/10',
      desc: 'Pemulihan aktif & stabilitas core: Penguatan panggul, glute bridge, dan mobilitas tubuh atas tanpa tekanan vertikal.',
      status: 'PLANNED'
    },
    {
      date: '2026-11-15', // Minggu
      cat: 'Cycling',
      dist: 12000,
      dur: 1800, // 30 min
      intensity: 'Zone 2 Endurance • RPE 3–4/10',
      desc: 'Easy MTB Endurance 30 menit: Peningkatan durasi bertahap pada medan halus. Evaluasi respons engkel dan lutut 24 jam pasca sesi.',
      status: 'PLANNED'
    },

    // --- MINGGU 3 (16 - 22 Nov 2026) ---
    {
      date: '2026-11-17', // Selasa
      cat: 'Cycling',
      dist: 10000,
      dur: 1500, // 25 min
      intensity: 'Zone 2 Perkiraan • RPE 3–4/10',
      desc: 'Easy MTB 25 menit: Pacing terkontrol, pernapasan ritmis hidung-mulut, memelihara kapasitas aerobik pasca puasa Senin.',
      status: 'PLANNED'
    },
    {
      date: '2026-11-20', // Jumat
      cat: 'Cross Training',
      dist: null,
      dur: 1500, // 25 min
      intensity: 'Rehab & Kinetic Mobility • RPE 3/10',
      desc: 'Sesi pemulihan terarah: Penguatan isometric pergelangan kaki dan fleksibilitas paha depan tanpa beban kompresif.',
      status: 'PLANNED'
    },
    {
      date: '2026-11-22', // Minggu
      cat: 'Cycling',
      dist: 12000,
      dur: 1800, // 30 min
      intensity: 'Zone 2 Endurance • RPE 3–4/10',
      desc: 'Easy MTB Endurance 30 menit: Menguji konsistensi intensitas rendah (RPE 3-4) pada akhir pekan dengan nutrisi dan hidrasi cukup.',
      status: 'PLANNED'
    },

    // --- MINGGU 4 (23 - 29 Nov 2026) --- [EVALUASI FASE 1]
    {
      date: '2026-11-24', // Selasa
      cat: 'Cycling',
      dist: 12000,
      dur: 1800, // 30 min
      intensity: 'Zone 2 Perkiraan • RPE 3–4/10',
      desc: 'Easy MTB 30 menit: Penutupan siklus adaptasi awal. Pertahankan kayuhan rileks dan cek kesiapan untuk evaluasi medis.',
      status: 'PLANNED'
    },
    {
      date: '2026-11-27', // Jumat
      cat: 'Cross Training',
      dist: null,
      dur: 1800, // 30 min
      intensity: 'Functional Mobility & Clinical Review Prep',
      desc: 'Pemeriksaan fungsi mandiri dan latihan pemulihan 30 menit. Evaluasi ada/tidaknya pembengkakan sebelum masuk Fase 2.',
      status: 'PLANNED'
    },
    {
      date: '2026-11-29', // Minggu
      cat: 'Cycling',
      dist: 14000,
      dur: 2100, // 35 min
      intensity: 'Zone 2 Endurance • RPE 3–4/10',
      desc: 'Easy MTB Endurance 35 menit: Puncak durasi Fase 1. Mengamati toleransi sendi terhadap 35 menit kayuhan kontinu.',
      status: 'PLANNED'
    },

    // =========================================================================
    // FASE 2: AEROBIC BASE & ENDURANCE DEVELOPMENT (MINGGU 5 - 8)
    // =========================================================================
    // --- MINGGU 5 (30 Nov - 6 Des 2026) ---
    {
      date: '2026-12-01', // Selasa
      cat: 'Cycling',
      dist: 12000,
      dur: 1800, // 30 min
      intensity: 'Zone 2 Aerobic Base • RPE 3–4/10',
      desc: 'Easy MTB 30 menit: Membuka Fase 2 dengan intensitas terukur pasca puasa Senin. Hindari percepatan mendadak.',
      status: 'PLANNED'
    },
    {
      date: '2026-12-04', // Jumat
      cat: 'Recovery Run',
      dist: 2500, // 2.5 km jika diizinkan, atau Walk-Jog konservatif
      dur: 1500, // 25 min
      intensity: 'Gated Return-to-Run Walk/Jog • RPE 3/10',
      desc: 'Sesi uji coba bertahap pasca evaluasi: 5 min jalan cepat + 5x (1 min jog santai pace 8:00 + 1 min jalan) + pendinginan. Stop jika timbul nyeri.',
      status: 'PLANNED'
    },
    {
      date: '2026-12-06', // Minggu
      cat: 'Cycling',
      dist: 16000,
      dur: 2400, // 40 min
      intensity: 'Zone 2 Long Aerobic • RPE 3–4/10',
      desc: 'Long MTB Endurance 40 menit: Menembus batas durasi 40 menit secara aman dalam Zone 2 pada medan rata dan stabil.',
      status: 'PLANNED'
    },

    // --- MINGGU 6 (7 - 13 Des 2026) ---
    {
      date: '2026-12-08', // Selasa
      cat: 'Cycling',
      dist: 14000,
      dur: 2100, // 35 min
      intensity: 'Zone 2 Aerobic Cadence • RPE 3–4/10',
      desc: 'Easy MTB 35 menit: Melatih efisiensi pernapasan dan kadens konsisten 85–90 RPM pasca istirahat puasa Senin.',
      status: 'PLANNED'
    },
    {
      date: '2026-12-11', // Jumat
      cat: 'Recovery Run',
      dist: 3000,
      dur: 1500, // 25 min
      intensity: 'Zone 1-2 Controlled Stride • RPE 3–4/10',
      desc: 'Sesi lari bertahap 3 km: Kadens langkah tinggi (170+ spm) untuk mengurangi beban kejut pada lutut dan pergelangan kaki.',
      status: 'PLANNED'
    },
    {
      date: '2026-12-13', // Minggu
      cat: 'Cycling',
      dist: 16000,
      dur: 2400, // 40 min
      intensity: 'Zone 2 Long Aerobic • RPE 3–4/10',
      desc: 'Long MTB Endurance 40 menit: Mengokohkan toleransi aerobik 40 menit sebelum peningkatan ke 45 menit.',
      status: 'PLANNED'
    },

    // --- MINGGU 7 (14 - 20 Des 2026) ---
    {
      date: '2026-12-15', // Selasa
      cat: 'Cycling',
      dist: 14000,
      dur: 2100, // 35 min
      intensity: 'Zone 2 Aerobic Base • RPE 3–4/10',
      desc: 'Easy MTB 35 menit: Menjaga stabilitas kardiovaskular dan efisiensi metabolisme lemak.',
      status: 'PLANNED'
    },
    {
      date: '2026-12-18', // Jumat
      cat: 'Recovery Run',
      dist: 3500,
      dur: 1800, // 30 min
      intensity: 'Zone 2 Easy Stride • RPE 3–4/10',
      desc: 'Lari santai terkontrol 3.5 km di lintasan datar halus. Evaluasi kekakuan sendi keesokan harinya.',
      status: 'PLANNED'
    },
    {
      date: '2026-12-20', // Minggu
      cat: 'Cycling',
      dist: 18000,
      dur: 2700, // 45 min
      intensity: 'Zone 2 Long Aerobic • RPE 3–4/10',
      desc: 'Long MTB Endurance 45 menit: Puncak durasi Fase 2. Latih konsumsi hidrasi tiap 15–20 menit.',
      status: 'PLANNED'
    },

    // --- MINGGU 8 (21 - 27 Des 2026) --- [DELOAD WEEK 1: ADAPTASI & SUPERKOMPENSASI]
    {
      date: '2026-12-22', // Selasa
      cat: 'Cycling',
      dist: 12000,
      dur: 1800, // 30 min
      intensity: 'Deload Easy MTB • RPE 2–3/10',
      desc: 'Sesi deload 30 menit: Pengurangan beban volume terencana untuk memberi kesempatan tubuh memulihkan jaringan ikat dan sendi.',
      status: 'PLANNED'
    },
    {
      date: '2026-12-25', // Jumat
      cat: 'Cross Training',
      dist: null,
      dur: 1500, // 25 min
      intensity: 'Deload Recovery & Gentle Stretching • RPE 2/10',
      desc: 'Pemulihan pasif-aktif: Peregangan dinamis, foam rolling paha dan betis, hidrasi optimal pasca puasa Kamis.',
      status: 'PLANNED'
    },
    {
      date: '2026-12-27', // Minggu
      cat: 'Cycling',
      dist: 14000,
      dur: 2100, // 35 min
      intensity: 'Deload Easy Spin • RPE 2–3/10',
      desc: 'Deload MTB 35 menit: Putaran pedal rileks tanpa target jarak, menyegarkan kaki menyambut Fase 3.',
      status: 'PLANNED'
    },

    // =========================================================================
    // FASE 3: SPECIFICITY & KONSOLIDASI ZONE 2 (MINGGU 9 - 12)
    // =========================================================================
    // --- MINGGU 9 (28 Des 2026 - 3 Jan 2027) ---
    {
      date: '2026-12-29', // Selasa
      cat: 'Cycling',
      dist: 16000,
      dur: 2400, // 40 min
      intensity: 'Zone 2 Specificity • RPE 3–4/10',
      desc: 'Easy MTB 40 menit: Peningkatan durasi awal Fase 3. Pacing disiplin di zona hijau RPE 3–4.',
      status: 'PLANNED'
    },
    {
      date: '2027-01-01', // Jumat
      cat: 'Recovery Run',
      dist: 4500,
      dur: 2100, // 35 min
      intensity: 'Zone 2 Controlled Tolerance Test • RPE 3–4/10',
      desc: 'Lari aerobik santai 4.5 km menyambut tahun baru. Monitor kenyamanan lutut bilateral.',
      status: 'PLANNED'
    },
    {
      date: '2027-01-03', // Minggu
      cat: 'Cycling',
      dist: 20000,
      dur: 3000, // 50 min
      intensity: 'Zone 2 Long Endurance • RPE 3–4/10',
      desc: 'Long MTB Endurance 50 menit: Menjaga kestabilan energi dan postur duduk ergonomis selama 50 menit.',
      status: 'PLANNED'
    },

    // --- MINGGU 10 (4 - 10 Jan 2027) ---
    {
      date: '2027-01-05', // Selasa
      cat: 'Cycling',
      dist: 16000,
      dur: 2400, // 40 min
      intensity: 'Zone 2 Specificity • RPE 3–4/10',
      desc: 'Easy MTB 40 menit: Ritme kayuhan stabil pasca puasa Senin. Fokus konsistensi kadens.',
      status: 'PLANNED'
    },
    {
      date: '2027-01-08', // Jumat
      cat: 'Easy Run',
      dist: 5000,
      dur: 2280, // 38 min
      intensity: 'Zone 2 5K Benchmark Tolerance Test • RPE 3–4/10',
      desc: 'Uji coba tonggak lari 5.0 km santai. Menguji toleransi jarak menengah dalam batasan Zone 2 bebas nyeri.',
      status: 'PLANNED'
    },
    {
      date: '2027-01-10', // Minggu
      cat: 'Cycling',
      dist: 22000,
      dur: 3300, // 55 min
      intensity: 'Zone 2 Long Endurance • RPE 3–4/10',
      desc: 'Long MTB Endurance 55 menit: Sesi ketahanan mendekati 1 jam penuh. Latihan fueling berkendara.',
      status: 'PLANNED'
    },

    // --- MINGGU 11 (11 - 17 Jan 2027) --- [PUNCAK FONDASI 1 JAM ZONE 2]
    {
      date: '2027-01-12', // Selasa
      cat: 'Cycling',
      dist: 18000,
      dur: 2700, // 45 min
      intensity: 'Zone 2 Peak Foundation • RPE 3–4/10',
      desc: 'Easy MTB 45 menit: Sesi weekday terpanjang. Kaki tetap terasa segar dan pernapasan stabil.',
      status: 'PLANNED'
    },
    {
      date: '2027-01-15', // Jumat
      cat: 'Easy Run',
      dist: 6000,
      dur: 2700, // 45 min
      intensity: 'Zone 2 Aerobic Base • RPE 3–4/10',
      desc: 'Lari dasar aerobik 6.0 km: Mendekati rekor 6.31 km historis dengan keselamatan sendi sebagai prioritas mutlak.',
      status: 'PLANNED'
    },
    {
      date: '2027-01-17', // Minggu
      cat: 'Cycling',
      dist: 25000,
      dur: 3600, // 60 min (1 JAM PENUH ZONE 2)
      intensity: 'Zone 2 Peak Endurance Milestone • RPE 3–4/10',
      desc: 'Puncak Fondasi 1 Jam Penuh MTB Zone 2 (60 menit): Tonggak utama ketahanan aerobik 12 minggu. Menuntaskan 60 menit continuous tanpa lonjakan detak jantung.',
      status: 'PLANNED'
    },

    // --- MINGGU 12 (18 - 24 Jan 2027) --- [DELOAD & KONSOLIDASI AKHIR 12 MINGGU]
    {
      date: '2027-01-19', // Selasa
      cat: 'Cycling',
      dist: 14000,
      dur: 2100, // 35 min
      intensity: 'Deload Easy MTB • RPE 2–3/10',
      desc: 'Deload MTB 35 menit: Memulai penutupan program 12 minggu dengan putaran santai pasca puasa Senin.',
      status: 'PLANNED'
    },
    {
      date: '2027-01-22', // Jumat
      cat: 'Cross Training',
      dist: null,
      dur: 1800, // 30 min
      intensity: 'Active Recovery & Joint Health Audit • RPE 2/10',
      desc: 'Pemeriksaan status kesehatan sendi & pemulihan aktif 30 menit. Audit kesiapan untuk roadmap lanjutan menuju Century 100K.',
      status: 'PLANNED'
    },
    {
      date: '2027-01-24', // Minggu
      cat: 'Cycling',
      dist: 18000,
      dur: 2700, // 45 min
      intensity: '12-Week Consolidation Spin • RPE 3/10',
      desc: 'Sesi penutup 12-Week Zone 2 Endurance Program (45 menit): Evaluasi kebugaran menyeluruh dan penetapan target blok berikutnya.',
      status: 'PLANNED'
    }
  ];

  // Insert all workouts
  for (const w of scheduledWorkouts) {
    const res = await pool.query(`
      INSERT INTO scheduled_workouts (
        user_id, plan_id, scheduled_date, workout_category, target_distance_meters,
        target_duration_seconds, target_intensity, description, status, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id;
    `, [
      userId,
      planId,
      w.date,
      w.cat,
      w.dist,
      w.dur,
      w.intensity,
      w.desc,
      w.status
    ]);

    const workoutId = res.rows[0].id;

    // Match historical workouts
    if (w.status === 'COMPLETED') {
      const actRes = await pool.query(
        'SELECT id, distance_meters, moving_time_seconds FROM activities WHERE user_id = $1 AND start_date::date = $2::date LIMIT 1',
        [userId, w.date]
      );
      if (actRes.rows.length > 0) {
        const act = actRes.rows[0];
        await pool.query(`
          INSERT INTO workout_activity_matches (
            workout_id, activity_id, is_manual_match, completion_percentage,
            distance_delta_meters, duration_delta_seconds, pace_delta_seconds_per_km, matched_at
          )
          VALUES ($1, $2, FALSE, 100, 0, 0, 0, NOW())
          ON CONFLICT (activity_id) DO NOTHING;
        `, [workoutId, act.id]);
      }
    }
  }

  console.log(`Seeded ${scheduledWorkouts.length} scheduled workouts successfully across 12 weeks!`);
  await pool.end();
}

main().catch(err => {
  console.error('Error seeding coach training:', err);
  pool.end();
  process.exit(1);
});
