# Changelog: Goal-Driven Training Engine & Adaptive Periodization (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-04 08:48:00 WIB
- **Tipe**: `feat(backend)` / `feat(domain)` / `feat(training)` / `feat(goals)` / `feat(ui)`
- **Commit Message Rujukan**: `feat(backend): implement goal-driven adaptive training engine, authoritative primary goal logic, weekly milestone periodization, and recovery interval gating`
- **Branch**: `feat/backend`
- **Lokasi**: [`docs/10-changelog/feat/backend/2026-11-04_08-30-00_feat-goal-driven-training-engine-and-adaptive-periodization.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-04_08-30-00_feat-goal-driven-training-engine-and-adaptive-periodization.md)

---

## 1. Latar Belakang & Pernyataan Masalah

Sebelum implementasi ini, antarmuka perencanaan latihan (`/training`) dan manajemen target (`/goals`) beroperasi secara terpisah (*decoupled without physiological coupling*):

1. **Jadwal Latihan Statis & Monolitik**:
   - Generator latihan hanya memproduksi 1 jadwal statis (12-minggu Zone 2 MTB umum), tanpa memedulikan target apa yang dipilih atau dibuat atlet di `/goals`.
   - Ketika atlet memilih target lari maraton, tanjakan elevasi, atau konsistensi mingguan, kalender `/training` tidak mengalami perubahan dan tetap menampilkan jadwal sepeda yang sama.
2. **Ambiguitas Target Utama vs Tonggak Mingguan (Milestones)**:
   - Sasaran makro sering diperlakukan keliru sebagai akumulasi jarak berkala, padahal dalam fisiologi olahraga ketahanan (*endurance sports science*), target seperti **100 km Century Ride** atau **Maraton 42.2 km** adalah **pencapaian dalam SATU KALI SESI AKTIVITAS TUNGGAL (*single continuous session peak effort*)**, bukan cicilan berkala.
   - Diperlukan pemisahan tegas antara **Target Utama** (puncak sekali aktivitas) dengan **Tonggak Mingguan (*weekly milestones*)** (progresi bertahap per 7 hari di hari Minggu).
3. **Ketiadaan Konsep Otoritatif "Target Utama" (Single Authoritative Primary Goal)**:
   - Pengguna memiliki beberapa target sekaligus tanpa ada satu target yang secara tegas ditunjuk sebagai *Primary Goal* (`is_primary = TRUE`) yang berdaulat mengendalikan program periodisasi 12-minggu.
4. **Ketiadaan Pengendalian Berbasis Superkompensasi**:
   - Selang waktu istirahat antar latihan (*recovery intervals*) belum diikat secara eksplisit ke dalam model matematika beban latihan, padahal sintesis kolagen ligamen, resintesis glikogen otot, dan adaptasi performa hanya terjadi pada fase istirahat (*supercompensation window*).

Pembaruan ini menghadirkan **Goal-Driven Training Engine** lengkap dengan arsitektur **Target Utama Otoritatif**, 4 arketipe generator tujuan, 12 tonggak mingguan terstruktur, Hero Showcase di UI `/goals` & Dashboard `/`, serta perlindungan ketat hari puasa Senin & Kamis.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Migrasi Skema Basis Data Non-Destruktif PostgreSQL 16
1. **Migrasi 002 (`scripts/migrations/002_goal_driven_training.sql`)**:
   - Menambahkan kolom `goal_id UUID REFERENCES fitness_goals(id) ON DELETE SET NULL` pada tabel `training_plans`.
   - Menambahkan indeks performa `idx_training_plans_goal_id`.
   - Menambahkan kolom `is_key_session BOOLEAN DEFAULT FALSE NOT NULL` dan `milestone_target_km NUMERIC(10, 2)` pada tabel `scheduled_workouts`.
   - Menambahkan indeks `idx_workouts_key_session`.
2. **Migrasi 003 (`scripts/migrations/003_primary_goal_logic.sql`)**:
   - Menambahkan kolom `is_primary BOOLEAN DEFAULT FALSE NOT NULL` pada tabel `fitness_goals`.
   - Menginisialisasi `is_primary = TRUE` untuk baris dengan `priority = 1`.
   - Menambahkan indeks pencarian `idx_fitness_goals_primary ON fitness_goals(user_id, is_primary)`.
3. **Integritas Data Riil (Zero Loss)**:
   - Seluruh 34 aktivitas autentik Strava (24 Ride, 10 Run) di basis data PostgreSQL 16 tetap **100% utuh tanpa mutasi**.

### B. Modul Generator Adaptif Berbasis Arketipe (`src/lib/training/generators/`)
Membuat direktori domain baru berstruktur modular:
1. `types.ts`: Mendefinisikan `GoalArchetype` (`CENTURY_100K`, `MARATHON_REHAB`, `CLIMBING_ELEVATION`, `WEEKLY_CONSISTENCY`) dan fungsi detektor otomatis `detectGoalArchetype`.
2. `century100kGenerator.ts`: Generator 36 sesi latihan sepeda MTB dengan tonggak Minggu dari 10 km hingga puncak 100 km sekali jalan di Minggu 12, dengan jeda *deload* di Minggu 4 dan 8.
3. `marathonRehabGenerator.ts`: Generator 36 sesi lari bertahap berbasis metode interval Galloway (jalan-lari) dengan gerbang nyeri $\le 2/10$ dan latihan penguatan tendon Achilles di hari Jumat.
4. `climbingGenerator.ts`: Generator 36 sesi tanjakan berbasis *seated climbing torque* dan piramida kadens menuju 1.000m D+ sekali gowes.
5. `consistencyGenerator.ts`: Generator 36 sesi multi-sport berimbang untuk pemeliharaan kebugaran kardiorespirasi.
6. `index.ts`: Orkestrator `generateWorkoutsForGoal` dan `getGoalMetadata`.

### C. Repositori & Otoritas Target Utama (`src/lib/coachTrainingGenerator.ts`, `goalRepo.ts`, `trainingRepo.ts`)
1. `coachTrainingGenerator.ts`: Menerima parameter `targetGoalId?: string`, mengaitkan `goal_id` ke `training_plans`, mempromosikan target terkait ke `is_primary = true`, dan menghasilkan 36 sesi khusus arketipe tujuan terpilih.
2. `goalRepo.ts`:
   - Menambahkan `getPrimaryFitnessGoal(userId)` untuk query target utama tercepat.
   - Memperbarui `setPrimaryFitnessGoal(userId, goalId)` secara atomik menurunkan semua sasaran lain ke `is_primary = FALSE, priority = 2` dan menetapkan target terpilih menjadi `is_primary = TRUE, priority = 1`.
   - Mengurutkan `getFitnessGoals` dengan `ORDER BY is_primary DESC, priority ASC, target_date ASC`.
3. `trainingRepo.ts`: Memperbarui `createTrainingPlan` dan `createScheduledWorkout` untuk mendukung `goal_id`, `is_key_session`, dan `milestone_target_km`.

### D. Endpoint REST API Baru (`src/app/api/goals/route.ts` & `src/app/api/training/generate/route.ts`)
1. `src/app/api/goals/route.ts`: Menyediakan endpoint `GET` dan `POST` untuk mengambil, membuat, dan mempromosikan sasaran utama dengan regenerasi otomatis kalender latihan.
2. `src/app/api/training/generate/route.ts`: Menerima `{ goal_id, user_id }` di payload POST untuk memicu kalibrasi ulang jadwal dari target spesifik.

### E. Modernisasi Antarmuka Pengguna (UI)
1. `GoalsManagementHub.tsx`:
   - **Hero Showcase Target Utama**: Ditampilkan di bagian paling atas dengan gradien khusus, lencana `★ TARGET UTAMA YANG SEDANG DIPERJUANGKAN`, rasio rekor sekali jalan vs target puncak (`56.1 km / 100.0 km`), 3 pilar telemetri, serta tombol cepat ke kalender latihan.
   - **Aksi Cepat Pengalihan Sasaran**: Tombol `🎯 Jadikan Target Utama` yang seketika memicu API atomik dan mengalibrasi ulang kalender 12-minggu.
   - **Lencana Otoritas pada Kartu**: Kartu target utama menampilkan lencana emas/cyan `★ TARGET UTAMA AKTIF` dan label `Target Puncak Sekali Aktivitas (Single Effort)`.
2. `DashboardMacroGoalsCard.tsx`:
   - Memisahkan Target Utama ke dalam Hero Card tersendiri di bagian atas widget dashboard dengan progress bar beranimasi halus, indikator rekor sekali jalan, dan tautan ke jadwal latihan.
   - Menampilkan sasaran sekunder di bawahnya secara rapi dan kompak.
3. `MacroObjectivesStrip.tsx`: Menerima properti dinamis `goals` dan `plan` untuk menampilkan sasaran aktif dan progres persentase target tunggal secara real-time.
4. `CalendarDayCard.tsx`: Menampilkan lencana visual `⚡ TONGGAK MINGGUAN (X KM)` pada setiap sesi kunci hari Minggu.

---

## 3. Matriks File Termodifikasi & Baru

| Jalur File | Status | Penambahan | Pengurangan | Cakupan Perubahan |
|---|---|---|---|---|
| `schema.sql` | Modifikasi | +6 | -0 | Definisi kolom `goal_id`, `is_key_session`, `milestone_target_km`, dan `is_primary` |
| `src/types/index.ts` | Modifikasi | +5 | -0 | Penambahan tipe `is_primary` pada `FitnessGoal`, `goal_id` di `TrainingPlan`, dan `is_key_session`, `milestone_target_km` di `ScheduledWorkout` |
| `src/lib/training/generators/types.ts` | Baru | +56 | -0 | Definisi tipe `GoalArchetype` dan detektor arketipe |
| `src/lib/training/generators/century100kGenerator.ts` | Baru | +98 | -0 | Generator 12-minggu Century Ride 100K MTB |
| `src/lib/training/generators/marathonRehabGenerator.ts` | Baru | +96 | -0 | Generator 12-minggu Marathon Return-to-Run Galloway |
| `src/lib/training/generators/climbingGenerator.ts` | Baru | +98 | -0 | Generator 12-minggu Elevasi 1.000m D+ |
| `src/lib/training/generators/consistencyGenerator.ts` | Baru | +72 | -0 | Generator 12-minggu Konsistensi 3x Mingguan |
| `src/lib/training/generators/index.ts` | Baru | +68 | -0 | Orkestrator generator berbasis target |
| `src/lib/coachTrainingGenerator.ts` | Modifikasi | +65 | -25 | Penanganan `targetGoalId`, metadata dinamis, dan korelasi benchmark |
| `src/lib/db/goalRepo.ts` | Modifikasi | +55 | -15 | Implementasi `getPrimaryFitnessGoal`, pemetaan `is_primary`, dan update atomik `setPrimaryFitnessGoal` |
| `src/lib/db/trainingRepo.ts` | Modifikasi | +8 | -3 | Penanganan query SQL `goal_id` dan kolom tonggak sesi |
| `src/lib/db/client.ts` | Modifikasi | +1 | -1 | Fallback aman koneksi pool PostgreSQL |
| `src/app/api/goals/route.ts` | Baru | +82 | -0 | API endpoint manajemen target dan regenerasi |
| `src/app/api/training/generate/route.ts` | Modifikasi | +6 | -2 | Penerimaan parameter `goal_id` di body POST |
| `src/components/goals/GoalsManagementHub.tsx` | Modifikasi | +150 | -25 | Hero Showcase Target Utama, tombol pengalihan sasaran utama, dan regenerasi rencana latihan |
| `src/components/dashboard/DashboardMacroGoalsCard.tsx` | Modifikasi | +85 | -30 | Hero Showcase Target Utama di dashboard dengan pemisahan sasaran sekunder |
| `src/components/training/MacroObjectivesStrip.tsx` | Modifikasi | +65 | -35 | Kartu telemetri target dinamis berbasis sasaran aktif |
| `src/components/training/ScheduleTrainingHub.tsx` | Modifikasi | +2 | -1 | Penerusan properti sasaran ke `MacroObjectivesStrip` |
| `src/components/training/CalendarDayCard.tsx` | Modifikasi | +7 | -0 | Lencana tonggak mingguan pada sesi hari Minggu |
| `scripts/migrations/002_goal_driven_training.sql` | Baru | +16 | -0 | DDL SQL migrasi 002 (goal_id, key_session, milestone_target_km) |
| `scripts/migrations/run_migration_002.cjs` | Baru | +44 | -0 | Runner aman migrasi 002 |
| `scripts/migrations/003_primary_goal_logic.sql` | Baru | +18 | -0 | DDL SQL migrasi 003 (is_primary column & index) |
| `scripts/migrations/run_migration_003.cjs` | Baru | +44 | -0 | Runner aman migrasi 003 |
| `scripts/tests/test_goal_driven_training_engine.js` | Baru | +115 | -0 | Test suite integrasi generator adaptif & verifikasi keutuhan Target Utama |
| `scripts/tests/test_coach_training_system.js` | Modifikasi | +5 | -5 | Penyesuaian asersi pengujian arketipe aktif |
| `scripts/README.md` | Modifikasi | +5 | -0 | Dokumentasi migrasi dan skrip uji baru |

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Uji Otoritas Target Utama & Pengalihan Sasaran (Goal Switching Verification)**:
   - Tepat SATU target memiliki `is_primary = TRUE` pada PostgreSQL `fitness_goals`.
   - Mengalihkan target secara instan menurunkan prioritas sasaran lama dan mengalibrasi ulang 36 sesi latihan sesuai arketipe baru.
2. **Uji Keutuhan Data Riil (Zero Data Loss)**:
   - Terverifikasi 100%: Sebanyak 34 aktivitas autentik Strava (24 Ride, 10 Run) tetap utuh di tabel `activities`.
3. **Perlindungan Hari Puasa Sunnah (Senin & Kamis)**:
   - Terverifikasi 100%: **0 sesi terjadwal pada hari Senin dan Kamis**, menjamin istirahat total dan pemulihan metabolik.
4. **Pemeriksaan Kompilasi TypeScript**:
   - `npx tsc --noEmit` $\to$ **Exit code 0 (0 Error, 100% Type-Safe)**.
5. **Suite Pengujian Sistem**:
   - `node scripts/tests/test_goal_driven_training_engine.js` $\to$ **13 PASSED, 0 FAILED**.
   - `npm run test:health` $\to$ **31 PASSED, 0 FAILED**.
   - `npm run test:coach` $\to$ **5 PASSED, 0 FAILED**.
   - `npm run test:streak` $\to$ **21 PASSED, 0 FAILED**.
6. **Next.js Production Build**:
   - `npm run build` $\to$ **Build selesai sukses dalam 10.3s**, seluruh 23 rute statis & dinamis terkompilasi sempurna.
