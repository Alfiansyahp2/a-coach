# Changelog: Eliminasi Berkas Legacy Facade/Shim & Penyelarasan Jalur Impor Kanonikal (`refactor`)

- **Tanggal & Waktu**: 2026-11-20 14:30:00 WIB
- **Tipe**: `refactor(cleanup)` / `refactor(architecture)` / `test(regression)`
- **Commit Message Rujukan**: `refactor(architecture): eliminate redundant legacy shim files, consolidate coach agents to index facade, and align direct imports` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui`
- **Lokasi**: [`docs/10-changelog/refactor/2026-11-20_14-30-00_refactor-legacy-facade-elimination-and-canonical-import-alignment.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/refactor/2026-11-20_14-30-00_refactor-legacy-facade-elimination-and-canonical-import-alignment.md)

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit komprehensif terhadap 359 berkas di dalam direktori `src/`, ditemukan sejumlah berkas usang (*legacy facades/shims*) yang berukuran sangat pendek ($\le 10$ baris) dan hanya berisi re-export sederhana (`export * from ...`). Berkas-berkas tersebut merupakan artefak sisa dari dekomposisi modularitas sebelumnya yang memperpanjang jalur impor secara artifisial dan mengaburkan kejelasan Clean Architecture:

1. **`src/lib/domain/streak/streakDateUtils.ts` (2 baris)**: Hanya melakukan *pass-through* `export * from '@/lib/shared/dateUtils';` dan hanya diimpor oleh 1 berkas (`streakEngine.ts`).
2. **`src/lib/db/activityRepo.ts` (9 baris)**: Hanya melakukan re-export ke `./activity`.
3. **`src/lib/db/healthRepo.ts` (7 baris)**: Hanya melakukan re-export ke `./health`.
4. **`src/lib/domain/coach/agents/` (35 berkas perantara 1-baris)**: 35 berkas perantara cabor individual yang hanya berisi re-export ke vertical slice `sports/`.

Pengguna menginstruksikan untuk mengaudit kembali seluruh berkas pendek sejenis, membersihkan redundansi, dan merestrukturisasi impor agar lebih rapi, terpusat, dan kanonikal.

---

## 2. Rincian Perubahan Modul & Eliminasi Berkas

### A. Eliminasi Berkas Legacy Shim & Penyelarasan Impor Langsung
1. **Eliminasi `src/lib/domain/streak/streakDateUtils.ts`**:
   - Berkas dihapus.
   - [`src/lib/domain/streak/streakEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/streak/streakEngine.ts) kini mengimpor utilitas tanggal langsung dari sumber kanonikalnya di [`@/lib/shared/dateUtils`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/shared/dateUtils.ts).

2. **Eliminasi `src/lib/db/activityRepo.ts` & `src/lib/db/healthRepo.ts`**:
   - Kedua berkas dihapus.
   - Seluruh modul repositori dan rute API yang sebelumnya mengimpor kedua file tersebut dialihkan langsung ke folder domainnya:
     - [`src/lib/db/workoutMatchRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/workoutMatchRepo.ts) $\to$ mengimpor dari `./activity`.
     - [`src/lib/db/activity/activityMutationRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activity/activityMutationRepo.ts) $\to$ mengimpor dari `../health`.
     - [`src/lib/db/activity/manualActivityRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activity/manualActivityRepo.ts) $\to$ mengimpor dari `../health`.
     - [`src/lib/db/userRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/userRepo.ts) $\to$ mengimpor dari `./health`.
     - [`src/lib/db/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/index.ts) $\to$ mengekspor `./activity` dan `./health` secara langsung.
     - [`src/app/api/athlete/weekly-recap/route.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/weekly-recap/route.ts) $\to$ mengimpor dari `@/lib/db/activity` dan `@/lib/db/health`.

### B. Konsolidasi Direktori Transisional `src/lib/domain/coach/agents/`
1. **Penghapusan 35 Berkas Shim 1-Baris**:
   - Seluruh 35 berkas individu di folder lama (`contracts.ts`, `SportCoordinatorRouter.ts`, dan ke-33 berkas `<SportName>CoachAgent.ts`) telah dihapus secara tuntas.
2. **Satu Berkas Tunggal Penjaga Kompatibilitas ([`agents/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/agents/index.ts)) (3 baris)**:
   - Direktori `src/lib/domain/coach/agents/` kini **hanya berisi satu berkas saja**: `index.ts`, yang mengekspor ulang `export * from '../core'` dan `export * from '../sports'`.
   - Mengalihkan kelima berkas pengujian otomatis (`test_combat_sports_agents.js`, `test_endurance_flagship_agents.js`, `test_phase6_sports_agents.js`, `test_strength_power_agents.js`, `test_team_field_court_agents.js`) ke [`src/lib/domain/coach/sports/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/sports/index.ts).

---

## 3. Rangkaian Pengujian Otomatis & Verifikasi

- **Hasil Pengujian Terpadu (`npm run test:all`)**:
  - Lulus **18 dari 18 test suite** (**639+ pengujian terverifikasi, 0 gagal**).
- **Next.js Turbopack Build**: `npm run build` sukses mengompilasi **35/35 rute** aplikasi dalam 3.9 detik (TypeScript 6.2s) dengan **0 kesalahan TypeScript**.
- **Status Berkas Bersih**:
  - 3 berkas legacy shim dihapus total.
  - Direktori `agents/` hanya tersisa 1 berkas `index.ts`.
  - **100% berkas berada di bawah batas 300 baris kode**.
