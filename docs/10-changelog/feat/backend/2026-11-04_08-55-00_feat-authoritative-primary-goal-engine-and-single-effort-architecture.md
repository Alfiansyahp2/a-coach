# Changelog: Authoritative Primary Goal Engine & Peak Single Effort Architecture (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-04 08:55:00 WIB
- **Tipe**: `feat(backend)` / `feat(domain)` / `feat(goals)` / `feat(ui)`
- **Commit Message Rujukan**: `feat(backend): implement authoritative primary goal logic, peak single effort architecture, and hero showcase hub`
- **Branch**: `feat/backend`
- **Lokasi**: [`docs/10-changelog/feat/backend/2026-11-04_08-55-00_feat-authoritative-primary-goal-engine-and-single-effort-architecture.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-04_08-55-00_feat-authoritative-primary-goal-engine-and-single-effort-architecture.md)

---

## 1. Latar Belakang & Pernyataan Masalah

Sebelum pembaruan ini, modul sasaran kebugaran atlet (`fitness_goals`) dan kalender latihan adaptif 12-minggu masih memiliki celah semantik dan arsitektural:

1. **Ketiadaan Otoritas Target Tunggal (*Absence of Sole Primary Goal*)**:
   - Atlet dapat memiliki beberapa sasaran sekaligus di database (misalnya: Century 100 km MTB, Maraton 42.2 km, dan Konsistensi 3x Mingguan), namun tidak ada kolom boolean berdaulat (`is_primary = TRUE`) yang secara tegas menetapkan target mana yang menjadi sasaran utama yang memerintah generator kalender latihan 12-minggu.
   - Tanpa status otoritatif ini, generator berpotensi mengalami konflik prioritas atau mengabaikan target yang sesungguhnya paling diprioritaskan oleh atlet.
2. **Kekeliruan Konseptual: Target Akumulasi vs Target Sekali Aktivitas (*Single Session Peak Effort*)**:
   - Dalam olahraga ketahanan (*endurance sports*), sasaran puncak seperti **100 km Century Ride** atau **42.2 km Marathon** adalah pencapaian yang harus dibuktikan dalam **SATU KALI SESI AKTIVITAS KONTINU (*single continuous session peak effort*)**, bukan akumulasi atau cicilan jarak bulanan.
   - Sebelumnya, indikator antarmuka sering kali menyamakan target puncak ini dengan akumulasi volume mingguan, sehingga atlet kehilangan kejelasan fisiologis antara apa yang menjadi rekor sesi tunggal terjauh dengan akumulasi volume latihan.
3. **Ketiadaan Visualisasi Hero Showcase Target Utama**:
   - Di halaman `/goals` dan dashboard `/`, target ditampilkan setara dalam daftar kartu seragam tanpa hirarki visual yang menegaskan mana target yang sedang diperjuangkan secara intensif. Atlet memerlukan representasi visual terdepan (*Hero Section*) yang membandingkan rekor terbaik sekali jalan saat ini dengan target puncak yang dituju.

Pembaruan ini mengimplementasikan **Authoritative Primary Goal Engine & Peak Single Effort Architecture** yang menjamin tepat SATU target utama aktif berdaulat per atlet, menghubungkannya secara atomik ke kalender periodisasi 12-minggu, serta menyajikan Hero Showcase terpadu di UI `/goals` dan Dashboard.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Migrasi Skema Basis Data Non-Destruktif (`scripts/migrations/003_primary_goal_logic.sql`)

Ekstensi skema PostgreSQL 16 tanpa mengganggu 34 aktivitas autentik Strava yang tersimpan:

1. **Penambahan Kolom `is_primary`**:
   ```sql
   ALTER TABLE fitness_goals 
   ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE NOT NULL;
   ```
2. **Inisialisasi Data Eksisting Berdasarkan Prioritas**:
   ```sql
   UPDATE fitness_goals 
   SET is_primary = TRUE 
   WHERE priority = 1;
   ```
3. **Indeks Pencarian Otoritatif**:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_fitness_goals_primary 
   ON fitness_goals(user_id, is_primary);
   ```
4. **Runner Transaksional ACID (`scripts/migrations/run_migration_003.cjs`)**:
   - Memastikan pra-kondisi koneksi pool PostgreSQL valid.
   - Menjalankan migrasi dalam blok transaksi `BEGIN ... COMMIT`.
   - Melakukan verifikasi pasca-migrasi: memastikan tepat satu sasaran utama berstatus `is_primary = TRUE` dan jumlah 34 aktivitas Strava (24 Ride, 10 Run) tetap 100% utuh tanpa mutasi.

---

### B. Otoritas Target Tunggal & Integrasi Repositori (`src/lib/db/goalRepo.ts`, `src/types/index.ts`)

1. **Pembaruan Interface TypeScript (`src/types/index.ts`)**:
   ```typescript
   export interface FitnessGoal {
     id: string;
     user_id: string;
     title: string;
     goal_type: GoalType;
     sport_type?: string;
     priority?: number; // 1 = Primary, 2 = Secondary, 3 = Maintenance
     is_primary?: boolean; // true = Target Utama governing the training plan
     target_event_name?: string;
     target_value: number;
     current_value: number;
     start_date: string;
     target_date: string;
     is_achieved: boolean;
     unit: string;
     created_at: string;
     updated_at: string;
   }
   ```
2. **Pengambilan Cepat Sasaran Utama `getPrimaryFitnessGoal(userId)`**:
   - Mengambil target utama aktif melalui query terindeks:
     ```sql
     SELECT * FROM fitness_goals 
     WHERE user_id = $1 AND (is_primary = TRUE OR priority = 1) 
     ORDER BY is_primary DESC, priority ASC 
     LIMIT 1
     ```
3. **Mutasi Atomik Promosi Sasaran `setPrimaryFitnessGoal(userId, goalId)`**:
   - Secara atomik menurunkan semua sasaran lain milik pengguna menjadi `is_primary = FALSE, priority = 2`:
     ```sql
     UPDATE fitness_goals SET is_primary = FALSE, priority = 2 WHERE user_id = $1;
     ```
   - Secara eksklusif menaikkan target sasaran terpilih menjadi `is_primary = TRUE, priority = 1`:
     ```sql
     UPDATE fitness_goals SET is_primary = TRUE, priority = 1, updated_at = NOW() 
     WHERE id = $1 AND user_id = $2 RETURNING *;
     ```
4. **Pengurutan Terstandarisasi pada `getFitnessGoals`**:
   - Seluruh daftar sasaran kini diurutkan secara deterministik dengan klausul `ORDER BY is_primary DESC, priority ASC, target_date ASC`, memastikan Target Utama selalu muncul di posisi pertama.

---

### C. Modernisasi Antarmuka Pengguna & Hero Showcase Target Utama

1. **Hero Showcase Section di Hub Sasaran (`src/components/goals/GoalsManagementHub.tsx`)**:
   - Menambahkan kartu **Hero Section** di bagian atas `/goals` berbingkai aksen neon khas olahraga dengan gradien lembut:
     - Lencana Khusus: `★ TARGET UTAMA YANG SEDANG DIPERJUANGKAN` dengan indikator driver kalender 12-minggu.
     - Penegasan Konseptual: Menjelaskan bahwa target ini berstatus **Target Puncak Sekali Aktivitas (*Single Session Peak Effort*)**, bukan akumulasi jarak berkala.
     - Visualisasi Telemetri: Menampilkan rasio rekor sekali jalan saat ini terhadap target puncak (contoh: `56.1 km / 100.0 km (56.1%)`) dengan progress bar beranimasi.
     - 3 Pilar Metrik:
       1. *Target Spesifikasi*: Sekali Aktivitas (*Single Effort*).
       2. *Jadwal Tonggak Mingguan*: Setiap Minggu (*Sunday Peak Key Session*).
       3. *Selang Pemulihan Puasa*: Senin & Kamis Terproteksi (Beban = 0 Sesi).
     - Tombol Cepat: Tautan langsung ke `Buka Kalender Latihan 12-Minggu →` (`/training`).
   - Tombol Aksi Pengalihan Otoritas: Tombol `🎯 Jadikan Target Utama` yang ketika diklik akan memanggil API `POST /api/goals` dan secara otomatis memicu regenerasi kalender `/api/training/generate` khusus untuk arketipe target yang baru dipilih.
2. **Hero Target Utama di Dashboard (`src/components/dashboard/DashboardMacroGoalsCard.tsx`)**:
   - Memisahkan Target Utama ke dalam Hero Card tersendiri di bagian atas widget dashboard dengan lencana `★ TARGET UTAMA (SASARAN INTI)`.
   - Menampilkan status rekor terbaik sekali jalan, tanggal jatuh tempo, dan indikator kepatuhan kalender.
   - Sasaran sekunder ditampilkan secara rapi dan kompak di bawahnya dalam bagian *Sasaran Pendukung / Sekunder* dengan tautan ke halaman pengelolaan `/goals`.

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `schema.sql` | Modifikasi | +3 | 0 | Definisi kolom `is_primary` dan indeks `idx_fitness_goals_primary` pada `fitness_goals` |
| `src/types/index.ts` | Modifikasi | +1 | 0 | Penambahan atribut `is_primary?: boolean;` pada interface `FitnessGoal` |
| `src/lib/db/goalRepo.ts` | Modifikasi | +184 | -95 | Implementasi `getPrimaryFitnessGoal`, pemetaan `is_primary`, dan mutasi atomik `setPrimaryFitnessGoal` |
| `src/components/goals/GoalsManagementHub.tsx` | Modifikasi | +188 | -25 | Hero Showcase Target Utama di `/goals`, penegasan target sekali aktivitas, dan aksi pengalihan target utama |
| `src/components/dashboard/DashboardMacroGoalsCard.tsx` | Modifikasi | +205 | -88 | Hero card sasaran utama di dashboard dengan pemisahan sasaran sekunder |
| `scripts/migrations/003_primary_goal_logic.sql` | Baru | +18 | 0 | DDL SQL migrasi non-destruktif penambahan `is_primary` dan indeks pencarian |
| `scripts/migrations/run_migration_003.cjs` | Baru | +44 | 0 | Script eksekutor migrasi 003 dengan verifikasi integritas 34 aktivitas PostgreSQL |
| `scripts/tests/test_goal_driven_training_engine.js` | Modifikasi | +24 | -4 | Penambahan asersi pengujian kolom `is_primary`, batasan tepat 1 target utama, dan verifikasi single effort |
| `scripts/README.md` | Modifikasi | +2 | 0 | Dokumentasi berkas migrasi 003 dan runner transaksional pada katalog skrip |

**Total Perubahan**: 9 file termodifikasi/dibuat, **+669 baris ditambahkan**, **-212 baris dihapus**.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Uji Asersi Logika Target Utama (`test_goal_driven_training_engine.js`)**:
   - Menjalankan suite pengujian integrasi mesin latihan berdasar sasaran:
     ```bash
     node scripts/tests/test_goal_driven_training_engine.js
     ```
   - **Hasil**: 13 asersi lulus (13 passed, 0 failed):
     - `[PASS] Authentic activities preserved: exactly 34 activities (found: 34)`
     - `[PASS] training_plans table has goal_id foreign key column`
     - `[PASS] scheduled_workouts has is_key_session and milestone_target_km columns`
     - `[PASS] Active training plan exists in PostgreSQL`
     - `[PASS] Workouts generated for plan: 38 sessions (target: >= 36)`
     - `[PASS] Key Sunday milestone sessions flagged: 12 (target: 12)`
     - `[PASS] Senin Puasa Sunnah is strictly protected: 0 scheduled workouts (found: 0)`
     - `[PASS] Kamis Puasa Sunnah is strictly protected: 0 scheduled workouts (found: 0)`
     - `[PASS] fitness_goals table has is_primary column`
     - `[PASS] Authoritative goals exist in DB: 4 goals`
     - `[PASS] Exactly ONE Target Utama has is_primary = TRUE (found: 1)`
     - `[PASS] Target Utama is designated: "First 100 km Century Ride (MTB Zone 2)"`
     - `[PASS] Target Utama target_value > 0 represents single activity benchmark (100.00)`
2. **Uji Integritas Kesehatan Atlet & Sirkuit Pengaman Sendi**:
   - `npm run test:health` $\to$ **31 PASSED, 0 FAILED (100%)**.
3. **Uji Logika Coaching & Rencana Latihan**:
   - `npm run test:coach` $\to$ **5 PASSED, 0 FAILED (100%)**.
4. **Uji Mesin Konsistensi & Streak Termal**:
   - `npm run test:streak` $\to$ **21 PASSED, 0 FAILED (100%)**.
5. **Pemeriksaan Kompilasi TypeScript**:
   - `npx tsc --noEmit` $\to$ **Exit code 0 (0 Error, 100% Type-Safe)**.
6. **Kompilasi Build Produksi Next.js**:
   - `npm run build` $\to$ **Exit code 0**, terkompilasi dalam 10.3 detik pada seluruh 23 rute platform.
7. **Verifikasi Integritas Data Riil PostgreSQL**:
   - Menjalankan query langsung ke PostgreSQL 16:
     ```
     Activities: [ { sport_type: 'Ride', count: '24' }, { sport_type: 'Run', count: '10' } ]
     Primary Goal: 'First 100 km Century Ride (MTB Zone 2)' (is_primary = true, priority = 1)
     Secondary Goals: 3 target (is_primary = false, priority = 2)
     ```
   - **Status**: Keutuhan data 100% terjaga tanpa mutasi data autentik Strava.

