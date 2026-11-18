# Changelog: Clean Architecture Modular Decomposition & Bulk Line Remediation (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-07 09:55:00 WIB
- **Tipe**: `refactor(architecture)` / `refactor(domain)` / `refactor(db)` / `refactor(components)`
- **Commit Message Rujukan**: `refactor(backend): decompose monolithic repositories and god components, enforce domain purity, and extract volume analytics`
- **Branch**: `feat/backend`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-07_09-55-00_feat-clean-architecture-decomposition-and-bulk-line-remediation.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit komprehensif terhadap 183 file kode (24.482 baris) di repository `project_strava`, teridentifikasi sejumlah akumulasi kompleksitas struktural (*architectural debt*) dan file berukuran masif (*bulk lines / god files*) yang melanggar prinsip *Clean Architecture* dan *Single Responsibility Principle (SRP)*:

1. **Monolithic Repository Bloat**:
   - Berbeda dengan modul `src/lib/db/health/` yang telah dipecah rapi menjadi 7 sub-repository domain, file [`src/lib/db/activityRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activityRepo.ts) membengkak hingga **555 baris**. Modul ini menggabungkan query pembacaan, mutasi CRUD, operasi batch update, sinkronisasi file store lokal fallback, dan pencocokan sesi latihan.
2. **Form God Components & State Overload**:
   - [`src/components/activity/modal/AddActivityModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/AddActivityModal.tsx) mencapai **574 baris** dengan 18 `useState` hooks independen, menggabungkan parser OCR, formulir isian manual, kalkulasi kinematika kecepatan/pace, slider RPE/nyeri, dan mutasi API HTTP.
   - [`src/components/health/EditAthleteProfileModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/EditAthleteProfileModal.tsx) memiliki **21 useState hooks** dalam satu komponen berukuran **418 baris**.
3. **Pelanggaran Kemurnian Domain (*Domain Purity Violation*)**:
   - File domain [`src/lib/domain/sports/sportUtils.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/sports/sportUtils.ts) mengimpor `React` dan icon dari `lucide-react`. Layer Domain seharusnya murni TypeScript agnostik tanpa dependensi visual. Terlebih, impor tersebut sama sekali tidak digunakan di dalam fungsi.
4. **Logika Analitik Bocor ke Layer Presentasi**:
   - Komponen [`src/components/charts/VolumeProgressionChart.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/charts/VolumeProgressionChart.tsx) (464 baris) memproses lebih dari 190 baris logika penanggalan, windowing kalender, dan agregasi jarak per cabang olahraga di dalam hook React `useMemo`, sehingga menyatukan kalkulasi matematika domain dengan visualisasi SVG bar chart.
5. **Duplikasi Antarmuka Pelatih (*Coach View Duplication*)**:
   - [`src/components/coach/RunningCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/RunningCoachView.tsx) (403 baris) dan [`src/components/coach/CyclingCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CyclingCoachView.tsx) (365 baris) memiliki struktur ~80% identik pada clinical gate banner dan arsip tabel telemetri sesi.

---

## 2. Rincian Implementasi Per Phase

### Phase A: Pemulihan Kemurnian Domain & Kanonikalisasi Impor (P0)

1. **Enforce Domain Purity pada `sportUtils.ts`**:
   - Menghapus impor `React` dan icon `lucide-react` (`Bike`, `Footprints`, `Waves`, dll.) dari [`src/lib/domain/sports/sportUtils.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/sports/sportUtils.ts).
   - Domain model kini 100% agnostik terhadap UI dan framework.
2. **Kanonikalisasi Jalur Impor**:
   - Mengalihkan impor langsung ke path Clean Architecture kanonikal (`@/lib/domain/*` dan `@/lib/db/*`) pada:
     - [`src/app/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/page.tsx)
     - [`src/app/api/athlete/checkin/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/checkin/route.ts)
     - [`src/app/api/athlete/injuries/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/injuries/route.ts)
     - [`src/app/api/athlete/injuries/[id]/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/injuries/[id]/route.ts)
     - [`src/app/api/goals/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/goals/route.ts)
     - [`src/app/api/training/generate/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/training/generate/route.ts)
     - [`src/app/api/strava/sync/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/strava/sync/route.ts)
     - [`src/components/dashboard/WeeklyStreakCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/WeeklyStreakCard.tsx)

---

### Phase B: Dekomposisi Komponen God Modal & Ekstraksi Analitik (P1)

1. **Ekstraksi Domain Engine: `volumeBucketer.ts`**:
   - Dibuat file domain baru: [`src/lib/domain/analytics/volumeBucketer.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/volumeBucketer.ts).
   - Mengekstrak fungsi murni `computeVolumeProgression(activities, timeframe)` yang menangani logika periodisasi mingguan (*All History*) dan rentang harian (*7D, 14D, 30D*).
   - Memangkas [`VolumeProgressionChart.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/charts/VolumeProgressionChart.tsx) dari **464 baris menjadi 242 baris** murni tata letak SVG dan interaksi pengguna.
2. **Dekomposisi Modal Tambah Aktivitas (`AddActivityModal.tsx`)**:
   - Mengekstrak custom hook [`src/components/activity/modal/useAddActivityForm.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/useAddActivityForm.ts) untuk mengisolasi 18 `useState` hooks, penanganan OCR, dan pengiriman formulir.
   - Mengekstrak halaman kiri buku telemetri ke [`src/components/activity/modal/AddActivityLeftPage.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/AddActivityLeftPage.tsx).
   - Memangkas [`AddActivityModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/AddActivityModal.tsx) dari **574 baris menjadi 244 baris**.
3. **Dekomposisi Modal Profil Atlet (`EditAthleteProfileModal.tsx`)**:
   - Mengekstrak custom hook [`src/components/health/useAthleteProfileForm.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/useAthleteProfileForm.ts) untuk mengelola 21 state biometrik dan prosedur medis.
   - Memangkas [`EditAthleteProfileModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/EditAthleteProfileModal.tsx) dari **418 baris menjadi 238 baris**.

---

### Phase C: Modularisasi Repositori Aktivitas & Unifikasi Coach View (P2)

1. **Dekomposisi Modular `src/lib/db/activity/`**:
   - Memecah monolit `activityRepo.ts` (555 baris) menjadi 4 sub-modul terpisah:
     - [`src/lib/db/activity/activityTypes.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activity/activityTypes.ts): Normalisasi baris database dan kontrak tipe parameter.
     - [`src/lib/db/activity/activityQueryRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activity/activityQueryRepo.ts): Operasi pembacaan, filtering, dan pencarian adjacent activities.
     - [`src/lib/db/activity/activityMutationRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activity/activityMutationRepo.ts): Operasi update, delete dengan pelepasan relasi workout, batch update atomik, upsert Strava, dan registrasi manual journal.
     - [`src/lib/db/activity/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activity/index.ts): Barrel export terpadu.
   - Mengubah [`src/lib/db/activityRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activityRepo.ts) menjadi facade ringan (8 baris) untuk menjamin kompatibilitas 100% tanpa mengubah impor di modul lain.
2. **Ekstraksi Reusable Coach Deck Components**:
   - Dibuat [`src/components/coach/CoachClinicalBanner.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CoachClinicalBanner.tsx) untuk menampilkan banner safety gate dan grid rasional klinis.
   - Dibuat [`src/components/coach/CoachRecentSessionsList.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CoachRecentSessionsList.tsx) untuk menampilkan daftar sesi telemetri terverifikasi.
   - Memangkas [`RunningCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/RunningCoachView.tsx) dari **403 baris menjadi 260 baris**.
   - Memangkas [`CyclingCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CyclingCoachView.tsx) dari **365 baris menjadi 247 baris**.

---

## 3. Ringkasan Perbandingan Baris Kode (Before vs After)

| File / Modul | Baris Sebelum | Baris Sesudah | Status / Dekomposisi |
| :--- | :---: | :---: | :--- |
| `src/components/activity/modal/AddActivityModal.tsx` | **574** | **244** | ⬇️ **-57.5%** (Diekstrak ke `useAddActivityForm` & `AddActivityLeftPage`) |
| `src/lib/db/activityRepo.ts` | **555** | **8** | ⬇️ **-98.5%** (Diekstrak ke sub-repo modular `activity/`) |
| `src/components/charts/VolumeProgressionChart.tsx` | **464** | **242** | ⬇️ **-47.8%** (Logika diekstrak ke `volumeBucketer.ts`) |
| `src/components/health/EditAthleteProfileModal.tsx` | **418** | **238** | ⬇️ **-43.1%** (State diekstrak ke `useAthleteProfileForm`) |
| `src/components/coach/RunningCoachView.tsx` | **403** | **260** | ⬇️ **-35.5%** (Komponen diekstrak ke `CoachClinicalBanner`) |
| `src/components/coach/CyclingCoachView.tsx` | **365** | **247** | ⬇️ **-32.3%** (Komponen diekstrak ke `CoachRecentSessionsList`) |
| **File > 500 Baris di `src/`** | **2 file** | **0 file** | ✅ **Nol file melebihi batas 500 baris di folder `src/`** |

---

## 4. Hasil Verifikasi & Jaminan Integritas

1. **Pemeriksaan Tipe TypeScript**:
   ```bash
   npx tsc --noEmit
   # Exit code: 0 (0 error, 100% type-safe)
   ```
2. **Pengujian Regresi Otomatis (70 / 70 Asersi Lolos)**:
   - `node scripts/tests/test_athlete_health_system.js`: **31 / 31 PASSED**
   - `node scripts/tests/test_weekly_streak_system.js`: **21 / 21 PASSED**
   - `node scripts/tests/test_coach_training_system.js`: **5 / 5 PASSED**
   - `node scripts/tests/test_goal_driven_training_engine.js`: **13 / 13 PASSED**
   - `node scripts/tests/test_add_activity_flow.js`: **PASSED** (Python OCR + DB creation test)
3. **Integritas Basis Data**:
   - Seluruh 36 aktivitas autentik, profil atlet, dan rekam jejak medis di database PostgreSQL 16 tetap utuh tanpa data loss.

