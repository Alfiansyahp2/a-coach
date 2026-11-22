# Changelog: Eliminasi Menyeluruh Facade Formatters, DB, dan Folder Agents Menuju Arsitektur Kanonikal (`refactor`)

- **Tanggal & Waktu**: 2026-11-20 19:00:00 WIB
- **Tipe**: `refactor(cleanup)` / `refactor(architecture)` / `test(regression)`
- **Commit Message Rujukan**: `refactor(architecture): eliminate redundant formatters and db facades, remove agents folder, and align direct canonical imports` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui`
- **Lokasi**: [`docs/10-changelog/refactor/2026-11-20_19-00-00_refactor-facade-elimination-formatters-db-agents.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/refactor/2026-11-20_19-00-00_refactor-facade-elimination-formatters-db-agents.md)

---

## 1. Latar Belakang & Pernyataan Masalah

Sebagai kelanjutan dari audit arsitektur *Zero Legacy Shim*, dilakukan investigasi mendalam terhadap seluruh 359 berkas di dalam direktori `src/` untuk mendeteksi berkas-berkas berukuran sangat pendek ($\le 20$ baris) yang hanya berfungsi sebagai perantara impor atau fasad kompatibilitas lama (*legacy re-export facades*).

Berdasarkan audit tersebut, ditemukan 3 entitas yang tidak lagi diperlukan dan memperpanjang jalur impor secara artifisial:
1. **`src/lib/formatters.ts` (3 baris)**: Fasad perantara yang hanya berisi `export * from "./shared/formatters";`. Seluruh 47 berkas konsumen di komponen UI dan modul domain masih mengimpor `@/lib/formatters` alih-alih jalur kanonikalnya.
2. **`src/lib/db.ts` (16 baris)**: Fasad perantara yang hanya berisi `export * from './db/index'; export { default } from './db/index';`. Karena modul kanonikal [`src/lib/db/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/index.ts) sudah ada, resolver Node/Next.js/TypeScript secara otomatis me-resolve `@/lib/db` ke `src/lib/db/index.ts` tanpa memerlukan berkas `db.ts`.
3. **`src/lib/domain/coach/agents/` (4 baris)**: Sisa berkas jembatan dari konsolidasi sebelumnya ([`agents/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/agents/index.ts)). Setelah semua rute dan tes dialihkan ke `core/` dan `sports/`, folder ini telah memiliki **0 konsumen aktif** di seluruh repositori.

Pengguna menginstruksikan untuk memastikan seluruh penulisan berkas changelog konsisten, rapi, dan terstandarisasi dengan changelog sebelumnya.

---

## 2. Rincian Perubahan Modul & Eliminasi Berkas

### A. Eliminasi Berkas Fasad `src/lib/formatters.ts` & Penyelarasan Impor Langsung
1. **Penghapusan Berkas**:
   - `src/lib/formatters.ts` telah **dihapus secara permanen**.
2. **Penyelarasan 47 Berkas Konsumen**:
   - Sebanyak **47 berkas** di UI, analitik, dan domain yang sebelumnya mengimpor dari `@/lib/formatters` telah dimigrasikan untuk mengimpor langsung dari modul kanonikal [`@/lib/shared/formatters`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/shared/formatters.ts):
     - **Halaman Aplikasi (App Routes)**:
       - [`src/app/activities/[id]/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/activities/[id]/page.tsx)
       - [`src/app/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/page.tsx)
       - [`src/app/training/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/training/page.tsx)
     - **Komponen Aktivitas & Feed**:
       - [`src/components/activity/ActivityFeed.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/ActivityFeed.tsx)
       - [`src/components/activity/deck/ActivityDeckHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/deck/ActivityDeckHeader.tsx)
       - [`src/components/activity/deck/ActivityGroupCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/deck/ActivityGroupCard.tsx)
       - [`src/components/activity/deck/activityGroupUtils.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/deck/activityGroupUtils.ts)
       - [`src/components/activity/detail/ActivityBiometricsCards.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/detail/ActivityBiometricsCards.tsx)
       - [`src/components/activity/detail/ActivityDetailFooter.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/detail/ActivityDetailFooter.tsx)
       - [`src/components/activity/detail/ActivityDetailHero.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/detail/ActivityDetailHero.tsx)
       - [`src/components/activity/detail/ActivityKinematicsCards.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/detail/ActivityKinematicsCards.tsx)
       - [`src/components/activity/modal/AddActivityCheckinLeftPage.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/AddActivityCheckinLeftPage.tsx)
     - **Komponen Pelatih & Analitik**:
       - [`src/components/analytics/WeeklyRecapCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/analytics/WeeklyRecapCard.tsx)
       - [`src/components/coach/CoachRecentSessionsList.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CoachRecentSessionsList.tsx)
       - [`src/components/coach/CyclingCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CyclingCoachView.tsx)
       - [`src/components/coach/RunningCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/RunningCoachView.tsx)
       - [`src/components/dashboard/DashboardAiInsightsDeck.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardAiInsightsDeck.tsx)
       - [`src/components/dashboard/DashboardScheduledWorkoutsCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardScheduledWorkoutsCard.tsx)
       - [`src/components/recap/WeeklyRecapHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/recap/WeeklyRecapHub.tsx)
       - [`src/components/records/PersonalRecordsHeroCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/records/PersonalRecordsHeroCard.tsx)
       - [`src/components/records/PersonalRecordsListItem.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/records/PersonalRecordsListItem.tsx)
     - **Komponen Kesehatan & Check-in**:
       - [`src/components/health/PostActivityCheckinModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/PostActivityCheckinModal.tsx)
       - [`src/components/health/checkin/PostCheckinActivitySelector.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/checkin/PostCheckinActivitySelector.tsx)
       - [`src/components/health/hub/PainLogsTab.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/PainLogsTab.tsx)
     - **Komponen Kalender & Training Journal**:
       - [`src/components/training/ScheduleTrainingHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/ScheduleTrainingHub.tsx)
       - [`src/components/training/WorkoutDossierModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/WorkoutDossierModal.tsx)
       - [`src/components/training/calendarBuilder.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/calendarBuilder.ts)
       - [`src/components/training/cards/CalendarActivityItem.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/cards/CalendarActivityItem.tsx)
       - [`src/components/training/cards/CalendarWorkoutItem.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/cards/CalendarWorkoutItem.tsx)
       - [`src/components/training/journal/JournalBookLeftPage.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/journal/JournalBookLeftPage.tsx)
       - [`src/components/training/journal/JournalBookRightPage.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/journal/JournalBookRightPage.tsx)
       - [`src/components/training/kinetic/KineticDayBubble.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/kinetic/KineticDayBubble.tsx)
       - [`src/components/training/monthGrid/MonthDayCell.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/monthGrid/MonthDayCell.tsx)
       - [`src/components/training/monthGrid/MonthWeekSummaryColumn.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/monthGrid/MonthWeekSummaryColumn.tsx)
       - [`src/components/training/monthGrid/monthCalendarBuilder.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/monthGrid/monthCalendarBuilder.ts)
       - [`src/components/training/views/CalendarWeekRowHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/CalendarWeekRowHeader.tsx)
       - [`src/components/training/views/TrainingKineticBubbleView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingKineticBubbleView.tsx)
       - [`src/components/training/views/TrainingMicroHUDView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingMicroHUDView.tsx)
       - [`src/components/training/views/TrainingPeriodizationGanttView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingPeriodizationGanttView.tsx)
       - [`src/components/training/views/TrainingWeekAgendaView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingWeekAgendaView.tsx)
       - [`src/components/training/views/TrainingWorkoutListView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingWorkoutListView.tsx)
     - **Engine Analitik & Domain**:
       - [`src/lib/domain/analytics/multiWeekRecapEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/multiWeekRecapEngine.ts)
       - [`src/lib/domain/analytics/weeklyRecapActivity.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapActivity.ts)
       - [`src/lib/domain/analytics/weeklyRecapEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapEngine.ts)
       - [`src/lib/domain/coach/aiCoachEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/aiCoachEngine.ts)
       - [`src/lib/domain/coach/coachGoalInsights.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/coachGoalInsights.ts)
       - [`src/lib/domain/records/personalRecordsEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/records/personalRecordsEngine.ts)

### B. Eliminasi Berkas Fasad `src/lib/db.ts`
1. **Penghapusan Berkas**:
   - Berkas `src/lib/db.ts` telah **dihapus secara permanen**.
2. **Kanonikalitas Modul**:
   - Seluruh impor yang menggunakan `@/lib/db` kini langsung di-resolve ke modul kanonikal [`src/lib/db/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/index.ts) tanpa perantara berkas wrapper.

### C. Pembersihan Tuntas Folder `src/lib/domain/coach/agents/`
1. **Penghapusan Folder & Berkas Bridge**:
   - Berkas `src/lib/domain/coach/agents/index.ts` dan foldernya `src/lib/domain/coach/agents/` telah **dihapus secara permanen**.
2. **Pembersihan Master Barrel**:
   - Pada [`src/lib/domain/coach/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/index.ts), baris ekspor redundan `export * from './agents';` telah dihapus. Seluruh komponen sistem kini mengimpor dari `core/` dan `sports/`.

---

## 3. Hasil Validasi & Pengujian Otomatis

- **TypeScript Typecheck & Next.js Turbopack Production Build**:
  - Perintah: `npm run build`
  - Hasil: **35/35 routes terkompilasi sukses dalam 3.7 detik**, dengan **0 error TypeScript**.
- **Automated Regression Test Suites**:
  - Perintah: `npm run test:all`
  - Hasil: **Seluruh 18 test suite lulus 100% (639+ assertions, 0 failed)**:
    - `test:health` (31 assertions pass)
    - `test:coach` (5 assertions pass)
    - `test:streak` (21 assertions pass)
    - `test:bola` (15 assertions pass)
    - `test:multi-week-recap` (10 assertions pass)
    - `test:coordinator` (18 assertions pass)
    - `test:endurance` (34 assertions pass)
    - `test:strength` (35 assertions pass)
    - `test:team` (42 assertions pass)
    - `test:combat` (42 assertions pass)
    - `test:phase6` (50 assertions pass)
    - `test:arbiter` (32 assertions pass)
    - `test:ui-telemetry` (18 assertions pass)
    - `test:dynamic-ui` (22 assertions pass)
    - `test:sports-registry` (44 assertions pass)
    - `test:icons` (42 assertions pass)
    - `test:vertical-slices` (202 assertions pass)
    - `test:python` (16 pytest unit tests pass)
- **Kepatuhan Git**:
  - Seluruh perubahan dipertahankan pada status *unstaged working tree* (**tanpa git commit**).

---

## 4. Ringkasan Status Akhir

| Aspek Arsitektur | Sebelum Refaktor Ini | Setelah Refaktor Ini |
|---|---|---|
| **`src/lib/formatters.ts`** | Fasad 3 baris | **DIHAPUS** (47 consumer langsung ke `@/lib/shared/formatters`) |
| **`src/lib/db.ts`** | Fasad 16 baris | **DIHAPUS** (Resolve langsung ke `@/lib/db/index.ts`) |
| **`src/lib/domain/coach/agents/`** | 1 file bridge 4 baris | **DIHAPUS TOTAL** (0 konsumen tersisa di repositori) |
| **Penyimpangan Jalur Impor** | 47 impor lewat facade | **0 Impor Lewat Facade** (100% Kanonikal) |
| **Batas Baris Kode** | $< 300$ baris per berkas | **$< 300$ baris per berkas** terpenuhi 100% |
