# Changelog: Goal-Driven Training Engine & Adaptive Periodization (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-04 08:30:00 WIB
- **Tipe**: `feat(backend)` / `feat(domain)` / `feat(training)` / `feat(goals)`
- **Commit Message Rujukan**: `feat(backend): implement goal-driven adaptive training engine, weekly milestone periodization, and recovery interval gating`
- **Branch**: `feat/backend`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-04_08-30-00_feat-goal-driven-training-engine-and-adaptive-periodization.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Sebelum implementasi ini, antarmuka perencanaan latihan (`/training`) dan manajemen target (`/goals`) beroperasi secara terpisah (*decoupled without physiological coupling*):

1. **Jadwal Latihan Statis & Monolitik**:
   - Generator latihan hanya memproduksi 1 jadwal statis (12-minggu Zone 2 MTB umum), tanpa memedulikan target apa yang dipilih atau dibuat atlet di `/goals`.
   - Ketika atlet memilih target lari maraton, tanjakan elevasi, atau konsistensi mingguan, kalender `/training` tidak mengalami perubahan dan tetap menampilkan jadwal sepeda yang sama.
2. **Ambiguitas Target Utama vs Milestone**:
   - Sasaran makro sering diperlakukan sebagai akumulasi jarak bulanan, padahal dalam fisiologi olahraga ketahanan (*endurance sports science*), target seperti **100 km Century Ride** atau **Maraton 42.2 km** adalah **pencapaian dalam SATU KALI SESI AKTIVITAS TUNGGAL (*single continuous session*)**, bukan cicilan berkala.
   - Ketiadaan tonggak per minggu (*weekly milestones*) yang terukur membuat atlet tidak memiliki target spesifik per 7 hari untuk menguji kesiapan fisik bertahap.
3. **Ketiadaan Pengendalian Berbasis Superkompensasi**:
   - Selang waktu istirahat antar latihan (*recovery intervals*) belum diikat secara eksplisit ke dalam model matematika beban latihan, padahal sintesis kolagen ligamen, resintesis glikogen otot, dan adaptasi performa hanya terjadi pada fase istirahat (*supercompensation window*).

Pembaruan ini menghadirkan **Goal-Driven Training Engine** yang menjadikan sasaran (*goal*) sebagai otoritas utama pengemudi seluruh kalender latihan 12-minggu, dengan diferensiasi arketipe lengkap, 12 tonggak mingguan terstruktur, dan perlindungan ketat hari puasa Senin & Kamis.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Migrasi Skema Basis Data Non-Destruktif (`scripts/migrations/002_goal_driven_training.sql`)
1. **Relasi `training_plans.goal_id`**:
   - Menambahkan kolom `goal_id UUID REFERENCES fitness_goals(id) ON DELETE SET NULL` pada tabel `training_plans`.
   - Menambahkan indeks performa `idx_training_plans_goal_id`.
2. **Indikator Tonggak Sesi pada `scheduled_workouts`**:
   - Menambahkan kolom `is_key_session BOOLEAN DEFAULT FALSE NOT NULL` dan `milestone_target_km NUMERIC(10, 2)`.
   - Menambahkan indeks `idx_workouts_key_session`.
3. **Integritas Data Riil**:
   - Seluruh 34 aktivitas autentik Strava di basis data PostgreSQL 16 tetap **100% utuh tanpa mutasi**.

### B. Modul Generator Adaptif Berbasis Arketipe (`src/lib/training/generators/`)
Membuat direktori domain baru berstruktur modular:
1. `types.ts`: Mendefinisikan `GoalArchetype` (`CENTURY_100K`, `MARATHON_REHAB`, `CLIMBING_ELEVATION`, `WEEKLY_CONSISTENCY`) dan fungsi detektor otomatis `detectGoalArchetype`.
2. `century100kGenerator.ts`: Generator 36 sesi latihan sepeda MTB dengan tonggak Minggu dari 10 km hingga puncak 100 km sekali jalan di Minggu 12, dengan jeda *deload* di Minggu 4 dan 8.
3. `marathonRehabGenerator.ts`: Generator 36 sesi lari bertahap berbasis metode interval Galloway (jalan-lari) dengan gerbang nyeri $\le 2/10$ dan latihan penguatan tendon Achilles di hari Jumat.
4. `climbingGenerator.ts`: Generator 36 sesi tanjakan berbasis *seated climbing torque* dan piramida kadens menuju 1.000m D+ sekali gowes.
5. `consistencyGenerator.ts`: Generator 36 sesi multi-sport berimbang untuk pemeliharaan kebugaran kardiorespirasi.
6. `index.ts`: Orkestrator `generateWorkoutsForGoal` dan `getGoalMetadata`.

### C. Pembaruan Repositori & Engine (`src/lib/coachTrainingGenerator.ts`, `goalRepo.ts`, `trainingRepo.ts`)
1. `coachTrainingGenerator.ts`: Menerima parameter `targetGoalId?: string`, mengaitkan `goal_id` ke `training_plans`, dan menghasilkan 36 sesi khusus arketipe tujuan terpilih.
2. `goalRepo.ts`: Menambahkan fungsi `setPrimaryFitnessGoal(userId, goalId)` untuk mempromosikan target terpilih menjadi `priority = 1` dan menurunkan target lainnya ke `priority = 2`.
3. `trainingRepo.ts`: Memperbarui `createTrainingPlan` dan `createScheduledWorkout` untuk mendukung `goal_id`, `is_key_session`, dan `milestone_target_km`.

### D. Endpoint REST API Baru (`src/app/api/goals/route.ts` & `src/app/api/training/generate/route.ts`)
1. `src/app/api/goals/route.ts`: Menyediakan endpoint `GET` dan `POST` untuk mengambil, membuat, dan mempromosikan sasaran utama dengan regenerasi otomatis kalender latihan.
2. `src/app/api/training/generate/route.ts`: Menerima `{ goal_id, user_id }` di payload POST untuk memicu kalibrasi ulang jadwal dari target spesifik.

### E. Modernisasi Antarmuka Pengguna (`GoalsManagementHub.tsx`, `MacroObjectivesStrip.tsx`, `CalendarDayCard.tsx`)
1. `GoalsManagementHub.tsx`:
   - Menambahkan tombol aksi pada setiap kartu sasaran: `🎯 Jadikan Sasaran Utama & Kalibrasi Kalender` (dengan status pemuatan `isActivatingGoalId`).
   - Menyediakan lencana visual `★ SASARAN UTAMA AKTIF` dengan tautan langsung `Lihat Kalender →`.
   - Menghubungkan template progresif ke API pembuatan target dan kalibrasi kalender.
2. `MacroObjectivesStrip.tsx`: Menerima properti dinamis `goals` dan `plan` untuk menampilkan sasaran aktif dan progres persentase target tunggal secara real-time.
3. `CalendarDayCard.tsx`: Menampilkan lencana visual `⚡ TONGGAK MINGGUAN (X KM)` pada setiap sesi kunci hari Minggu.

---

## 3. Matriks File Termodifikasi & Baru

| Jalur File | Status | Penambahan | Pengurangan | Cakupan Perubahan |
|---|---|---|---|---|
| `schema.sql` | Modifikasi | +5 | -0 | Definisi kolom `goal_id`, `is_key_session`, dan `milestone_target_km` |
| `src/types/index.ts` | Modifikasi | +4 | -0 | Penambahan tipe `goal_id` di `TrainingPlan` dan `is_key_session`, `milestone_target_km` di `ScheduledWorkout` |
| `src/lib/training/generators/types.ts` | Baru | +56 | -0 | Definisi tipe `GoalArchetype` dan detektor arketipe |
| `src/lib/training/generators/century100kGenerator.ts` | Baru | +98 | -0 | Generator 12-minggu Century Ride 100K MTB |
| `src/lib/training/generators/marathonRehabGenerator.ts` | Baru | +96 | -0 | Generator 12-minggu Marathon Return-to-Run Galloway |
| `src/lib/training/generators/climbingGenerator.ts` | Baru | +98 | -0 | Generator 12-minggu Elevasi 1.000m D+ |
| `src/lib/training/generators/consistencyGenerator.ts` | Baru | +72 | -0 | Generator 12-minggu Konsistensi 3x Mingguan |
| `src/lib/training/generators/index.ts` | Baru | +68 | -0 | Orkestrator generator berbasis target |
| `src/lib/coachTrainingGenerator.ts` | Modifikasi | +65 | -25 | Penanganan `targetGoalId`, metadata dinamis, dan korelasi benchmark |
| `src/lib/db/goalRepo.ts` | Modifikasi | +40 | -0 | Implementasi `setPrimaryFitnessGoal` |
| `src/lib/db/trainingRepo.ts` | Modifikasi | +8 | -3 | Penanganan query SQL `goal_id` dan kolom tonggak sesi |
| `src/lib/db/client.ts` | Modifikasi | +1 | -1 | Fallback aman koneksi pool PostgreSQL |
| `src/app/api/goals/route.ts` | Baru | +82 | -0 | API endpoint manajemen target dan regenerasi |
| `src/app/api/training/generate/route.ts` | Modifikasi | +6 | -2 | Penerimaan parameter `goal_id` di body POST |
| `src/components/goals/GoalsManagementHub.tsx` | Modifikasi | +75 | -20 | Tombol pengaktifan target utama dan banner interaktif |
| `src/components/training/MacroObjectivesStrip.tsx` | Modifikasi | +65 | -35 | Kartu telemetri target dinamis berbasis sasaran aktif |
| `src/components/training/ScheduleTrainingHub.tsx` | Modifikasi | +2 | -1 | Penerusan properti sasaran ke `MacroObjectivesStrip` |
| `src/components/training/CalendarDayCard.tsx` | Modifikasi | +7 | -0 | Lencana tonggak mingguan pada sesi hari Minggu |
| `scripts/migrations/002_goal_driven_training.sql` | Baru | +16 | -0 | DDL SQL migrasi 002 |
| `scripts/migrations/run_migration_002.cjs` | Baru | +44 | -0 | Runner aman migrasi 002 |
| `scripts/tests/test_goal_driven_training_engine.js` | Baru | +98 | -0 | Test suite integrasi generator adaptif |
| `scripts/tests/test_coach_training_system.js` | Modifikasi | +5 | -5 | Penyesuaian asersi pengujian arketipe aktif |
| `scripts/README.md` | Modifikasi | +3 | -0 | Dokumentasi migrasi dan skrip uji baru |

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Uji Coba Pengalihan Sasaran (Goal Switching Verification)**:
   - Mengalihkan target ke **Marathon Return-to-Run (42.2K)**:
     - Hasil: Rencana latihan berubah menjadi `12-Week Marathon Return-to-Run Pathway (Zone 2 Galloway Protocol)`.
     - Sesi lari bertahap terbit sebanyak 12 sesi dengan tonggak lari dari 1.5 km hingga 15.0 km bebas nyeri.
   - Mengalihkan target ke **Century Ride 100K MTB**:
     - Hasil: Rencana latihan berubah menjadi `12-Week Zone 2 Endurance Program (Road to 100km Century Ride MTB)`.
     - Sesi sepeda terbit sebanyak 26 sesi dengan tonggak jarak dari 10.0 km hingga puncak 100.0 km sekali jalan.
2. **Perlindungan Hari Puasa Sunnah (Senin & Kamis)**:
   - Terverifikasi 100%: **0 sesi terjadwal pada hari Senin dan Kamis**, menjamin istirahat total dan pemulihan metabolik.
3. **Pemeriksaan Kompilasi TypeScript**:
   - `npx tsc --noEmit` $\to$ **Exit code 0 (0 Error, 100% Type-Safe)**.
4. **Suite Pengujian Sistem**:
   - `node scripts/tests/test_goal_driven_training_engine.js` $\to$ **10 PASSED, 0 FAILED**.
   - `npm run test:health` $\to$ **31 PASSED, 0 FAILED**.
   - `npm run test:coach` $\to$ **5 PASSED, 0 FAILED**.
   - `npm run test:streak` $\to$ **21 PASSED, 0 FAILED**.
5. **Next.js Production Build**:
   - `npm run build` $\to$ **Build selesai sukses dalam 12.7s**, 23 rute statis & dinamis terkompilasi sempurna.

