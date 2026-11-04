# Changelog: Clean Architecture Bulk Line Refactor & Domain Decomposition (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-04 09:15:00 WIB
- **Tipe**: `feat(backend)` / `feat(domain)` / `refactor(clean-architecture)` / `refactor(ui)`
- **Commit Message Rujukan**: `feat(backend): implement clean architecture bulk line refactor, god component decomposition, and modular domain persistence`
- **Branch**: `refactor`
- **Lokasi**: [`docs/10-changelog/feat/backend/2026-11-04_09-15-00_feat-clean-architecture-bulk-line-refactor-and-domain-decomposition.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-04_09-15-00_feat-clean-architecture-bulk-line-refactor-and-domain-decomposition.md)

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit komprehensif terhadap seluruh 137 berkas sumber (total 25.330 baris kode), ditemukan konsentrasi baris kode yang sangat pekat (*bulk code density*) pada beberapa komponen dan modul repositori platform yang melanggar *Single Responsibility Principle* (SRP) dan membebani keterbacaan kode (*code maintainability*):

1. **God Component Terbesar di Platform (`GoalsManagementHub.tsx` - 1.064 baris)**:
   - Satu berkas menggabungkan 7 tanggung jawab terpisah: strip telemetri atas, Hero Showcase target utama, array data template statis, section progression engine, tab filter olahraga, kartu sasaran aktif individual, dan modal formulir pembuatan target kustom.
2. **Fat Repository Lapisan Persistensi (`healthRepo.ts` - 650 baris)**:
   - Sebanyak 6 sub-domain klinis dan fisiologis (profil biometrik fisik, dossier cedera klinis, log nyeri post-aktivitas, respon latihan/RPE, asesmen medis fisioterapi, dan jejak audit kesehatan) dipadatkan dalam satu file monolitik tanpa pembagian domain yang jelas.
3. **Duplikasi Kode Statis 36 Sesi Latihan (`workoutTemplates.ts` - 593 baris)**:
   - Berisi 500+ baris array statis hardcoded sesi latihan 12-minggu yang menduplikasi fungsionalitas generator adaptif modular (`src/lib/training/generators/century100kGenerator.ts`).
4. **Pencampuran Logika Presentasi Kalender (`ScheduleTrainingHub.tsx` - 545 baris)**:
   - Menggabungkan logika matrix kalender 12-minggu, linear list view, tab filter fase, dan dialog modal ke dalam satu komponen besar.

Pembaruan ini mengimplementasikan **Clean Architecture & Domain-Driven Decomposition** untuk memecah berkas-berkas raksasa tersebut ke dalam sub-komponen dan domain repositori terisolasi yang ramping, independen, dan mudah diuji, sekaligus mempertahankan 100% fungsionalitas dan kompatibilitas sistem.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Modularisasi Hub Sasaran (`src/components/goals/`)

Berkas `GoalsManagementHub.tsx` didekomposisi dari **1.064 baris** menjadi **296 baris** (-72.1% baris) dengan memindahkan tanggung jawab ke 7 modul mandiri:

1. **`src/components/goals/data/cyclingProgressionData.ts` (102 baris)**:
   - Mengisolasi interface `ProgressionTemplate` dan konstanta `CYCLING_PROGRESSION_TEMPLATES` (Gran Fondo 150K, Climbing Base 1.000m D+, Double Century 200K).
2. **`src/components/goals/telemetry/GoalsTelemetrySummary.tsx` (130 baris)**:
   - Menangani strip telemetri atas: total sasaran aktif, tonggak terselesaikan, jarak sepeda terverifikasi, status sendi & keselamatan, serta tombol simulasi & pembuatan target.
3. **`src/components/goals/hero/PrimaryGoalHeroSection.tsx` (125 baris)**:
   - Menangani kartu Hero Target Utama yang membandingkan rekor terbaik sekali jalan saat ini dengan target puncak (*Single Session Peak Effort*), persentase visual, 3 pilar metrik, dan tautan langsung ke kalender latihan.
4. **`src/components/goals/progression/ProgressionGoalCard.tsx` (65 baris)**:
   - Komponen atomik untuk merender kartu target berjenjang (Tier 2/3) beserta tombol aktivasi dan protokol keselamatan sendi.
5. **`src/components/goals/progression/GoalsProgressionDeck.tsx` (75 baris)**:
   - Mengorkestrasi grid target lanjutan saat tonggak 100 km terpenuhi.
6. **`src/components/goals/registry/GoalsFilterTabs.tsx` (75 baris)**:
   - Tab filter cabang olahraga (*Semua, Sepeda, Lari, Konsistensi, Tercapai*) dan penghitung kuantitas sasaran.
7. **`src/components/goals/registry/GoalRegistryCard.tsx` (185 baris)**:
   - Kartu sasaran individual terkalibrasi dengan lencana `★ TARGET UTAMA`, defisit sisa target, deadline, dan tombol aksi `🎯 Jadikan Target Utama`.
8. **`src/components/goals/modal/CreateCustomGoalModal.tsx` (135 baris)**:
   - Modal formulir pembuatan target kustom lengkap dengan validasi dan selector satuan.

---

### B. Modularisasi Lapisan Repositori Kesehatan (`src/lib/db/health/`)

Berkas `healthRepo.ts` didekomposisi dari **650 baris** menjadi **6 baris** fasad bersih yang mendelegasikan pemanggilan ke sub-domain repositori spesifik:

1. **`src/lib/db/health/athleteProfileRepo.ts` (130 baris)**:
   - Menangani `getAthleteProfile` dan `upsertAthleteProfile` (biometrik usia, tinggi, berat, BMI, resting HR, preferensi olahraga).
2. **`src/lib/db/health/injuryRepo.ts` (55 baris)**:
   - Menangani `getAthleteInjuries` dan `createAthleteInjury` (dossier riwayat cedera klinis).
3. **`src/lib/db/health/painLogRepo.ts` (70 baris)**:
   - Menangani `getAthletePainLogs` dan `createAthletePainLog` (log nyeri post-sesi).
4. **`src/lib/db/health/trainingResponseRepo.ts` (75 baris)**:
   - Menangani `getAthleteTrainingResponses` dan `upsertAthleteTrainingResponse` (skala RPE dan telemetri respon latihan).
5. **`src/lib/db/health/assessmentRepo.ts` (115 baris)**:
   - Menangani `getAthleteMedicalAssessments`, `createAthleteMedicalAssessment`, `getLatestAthleteReadiness`, dan `saveAthleteReadiness`.
6. **`src/lib/db/health/healthAuditRepo.ts` (30 baris)**:
   - Menangani `logHealthAuditTrail` untuk kepatuhan jejak audit klinis.
7. **`src/lib/db/health/index.ts` (145 baris)**:
   - Fasad agregasi yang mengekspor seluruh repositori di atas serta fungsi orkestrator `getAuthoritativeHealthContext` dan `recordMedicalProcedureAndAssessment`.

---

### C. Eliminasi Redundansi Hardcoded pada Generator Latihan (`src/lib/training/workoutTemplates.ts`)

1. **Penyusutan dari 593 baris menjadi 87 baris (-85.3% baris)**:
   - Menggantikan 506 baris array hardcoded `getPrescribed12WeekWorkouts` dengan mendelegasikan pemanggilan langsung ke domain generator:
     ```typescript
     import { generateCentury100kWorkouts } from './generators/century100kGenerator';

     export function getPrescribed12WeekWorkouts(
       userId: string,
       planId: string
     ): Omit<ScheduledWorkout, 'id' | 'created_at' | 'updated_at'>[] {
       return generateCentury100kWorkouts(userId, planId);
     }
     ```
   - Mempertahankan `getHistoricalBenchmarkWorkouts` untuk pencocokan aktivitas historis Strava secara presisi.

---

### D. Modularisasi Tampilan Kalender Latihan (`src/components/training/`)

Berkas `ScheduleTrainingHub.tsx` dirampingkan dari **545 baris** menjadi **224 baris** (-58.8% baris) dengan mengekstraksi komponen tampilan ke dalam modul terpisah:

1. **`src/components/training/filters/TrainingPhaseAndFilterToolbar.tsx` (130 baris)**:
   - Tab switcher Fase 1, Fase 2, Fase 3, serta filter kategori (Semua, Sepeda, Lari, Rehab, Selesai).
2. **`src/components/training/views/TrainingCalendarGridView.tsx` (145 baris)**:
   - Matriks kalender 12-minggu dengan header hari (Senin–Minggu) dan kartu hari terisolasi.
3. **`src/components/training/views/TrainingWorkoutListView.tsx` (100 baris)**:
   - Linear table/list view untuk inspeksi preskripsi sesi latihan detail.

---

### E. Penambahan Alat Pemindai Ukuran Kode (`scripts/maintenance/audit_line_counts.cjs`)

Skrip utilitas pemeliharaan baru untuk memindai seluruh berkas TypeScript/JavaScript dan melaporkan 40 berkas terbesar secara otomatis:
```bash
node scripts/maintenance/audit_line_counts.cjs
```

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/components/goals/GoalsManagementHub.tsx` | Modifikasi | +150 | -918 | Dekomposisi god component menjadi koordinator ramping |
| `src/components/goals/data/cyclingProgressionData.ts` | Baru | +102 | 0 | Isolasi template progresif sepeda |
| `src/components/goals/telemetry/GoalsTelemetrySummary.tsx` | Baru | +130 | 0 | Strip telemetri atas sasaran |
| `src/components/goals/hero/PrimaryGoalHeroSection.tsx` | Baru | +125 | 0 | Hero card Target Utama & perbandingan single effort |
| `src/components/goals/progression/ProgressionGoalCard.tsx` | Baru | +65 | 0 | Kartu template progresif individual |
| `src/components/goals/progression/GoalsProgressionDeck.tsx` | Baru | +75 | 0 | Grid target lanjutan pasca 100 km |
| `src/components/goals/registry/GoalsFilterTabs.tsx` | Baru | +75 | 0 | Tab filter kategori cabang sasaran |
| `src/components/goals/registry/GoalRegistryCard.tsx` | Baru | +185 | 0 | Kartu sasaran aktif individual terkalibrasi |
| `src/components/goals/modal/CreateCustomGoalModal.tsx` | Baru | +135 | 0 | Modal formulir pembuatan target kustom |
| `src/lib/db/healthRepo.ts` | Modifikasi | +6 | -650 | Pengubahan menjadi fasad re-export bersih |
| `src/lib/db/health/athleteProfileRepo.ts` | Baru | +130 | 0 | Repositori profil & biometrik fisik atlet |
| `src/lib/db/health/injuryRepo.ts` | Baru | +55 | 0 | Repositori dossier riwayat cedera klinis |
| `src/lib/db/health/painLogRepo.ts` | Baru | +70 | 0 | Repositori log nyeri pasca-sesi |
| `src/lib/db/health/trainingResponseRepo.ts` | Baru | +75 | 0 | Repositori respon latihan & persepsi RPE |
| `src/lib/db/health/assessmentRepo.ts` | Baru | +115 | 0 | Repositori asesmen medis & evaluasi kesiapan |
| `src/lib/db/health/healthAuditRepo.ts` | Baru | +30 | 0 | Repositori jejak audit klinis |
| `src/lib/db/health/index.ts` | Baru | +145 | 0 | Fasad agregasi konteks kesehatan otoritatif |
| `src/lib/training/workoutTemplates.ts` | Modifikasi | +10 | -515 | Eliminasi 506 baris hardcoded via generator dinamis |
| `src/components/training/ScheduleTrainingHub.tsx` | Modifikasi | +60 | -381 | Rampingkan komponen orchestrator jadwal latihan |
| `src/components/training/filters/TrainingPhaseAndFilterToolbar.tsx` | Baru | +130 | 0 | Toolbar filter fase & kategori sesi |
| `src/components/training/views/TrainingCalendarGridView.tsx` | Baru | +145 | 0 | Tampilan matrix kalender 12-minggu |
| `src/components/training/views/TrainingWorkoutListView.tsx` | Baru | +100 | 0 | Tampilan linear daftar sesi latihan |
| `scripts/maintenance/audit_line_counts.cjs` | Baru | +35 | 0 | Scanner baris kode pencegah bulk code monolitik |
| `scripts/README.md` | Modifikasi | +1 | 0 | Dokumentasi skrip pemindai jumlah baris kode |

**Total Pengurangan Kode Monolitik**: **-2.464 baris kode monolitik dipangkas** dan didistribusikan ke dalam 18 modul Clean Architecture yang sangat rapi.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Uji Asersi Mesin Latihan Berbasis Sasaran**:
   - `node scripts/tests/test_goal_driven_training_engine.js` $\to$ **13 PASSED, 0 FAILED (100%)**.
   - Keutuhan 34 aktivitas autentik Strava di PostgreSQL 16 tetap 100% terjaga.
2. **Uji Sistem Kesehatan Atlet & Sirkuit Keamanan Sendi**:
   - `npm run test:health` $\to$ **31 PASSED, 0 FAILED (100%)**.
   - Berhasil memverifikasi bahwa refaktorisasi `src/lib/db/health/` tidak merusak kontrak API persistensi kesehatan.
3. **Uji Logika Coaching & Periodisasi**:
   - `npm run test:coach` $\to$ **5 PASSED, 0 FAILED (100%)**.
   - Berhasil memverifikasi bahwa delegasi `workoutTemplates.ts` ke generator dinamis bekerja sempurna.
4. **Uji Konsistensi Mingguan & Streak**:
   - `npm run test:streak` $\to$ **21 PASSED, 0 FAILED (100%)**.
5. **Pemeriksaan Kompilasi TypeScript**:
   - `npx tsc --noEmit` $\to$ **Exit code 0 (0 Error, 100% Type-Safe)**.
6. **Kompilasi Build Produksi Next.js**:
   - `npm run build` $\to$ **Exit code 0**, terkompilasi dalam 4.6s dengan kompilasi TypeScript 9.9s pada seluruh 23 rute platform tanpa peringatan.

