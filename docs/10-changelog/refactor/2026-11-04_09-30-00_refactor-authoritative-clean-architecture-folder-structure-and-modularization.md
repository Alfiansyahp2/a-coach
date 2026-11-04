# Changelog: Authoritative Clean Architecture Folder Structure & Codebase Reorganization (`refactor`)

- **Tanggal & Waktu**: 2026-11-04 09:30:00 WIB
- **Tipe**: `feat(architecture)` / `feat(backend)` / `refactor(clean-architecture)` / `docs(architecture)`
- **Commit Message Rujukan**: `feat(architecture): implement authoritative clean architecture folder structure, domain engine isolation, and project structure v3.0`
- **Branch**: `refactor`
- **Lokasi**: [`docs/10-changelog/refactor/2026-11-04_09-30-00_refactor-authoritative-clean-architecture-folder-structure-and-modularization.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/refactor/2026-11-04_09-30-00_refactor-authoritative-clean-architecture-folder-structure-and-modularization.md)

---

## 1. Latar Belakang & Pernyataan Masalah

Platform Endurance Performance Lab telah berkembang pesat dengan fitur telemetri ketahanan multi-sport, perlindungan sendi berbasis riwayat cedera, periodisasi latihan 12-minggu, dan sasaran target utama (*Primary Goal*). Namun, penataan berkas pada direktori inti `src/` sebelumnya masih memiliki sejumlah inkonsistensi arsitektur:

1. **Komponen Berserakan di Root `src/components/`**:
   - Terdapat 8 komponen besar yang berada langsung di root direktori `src/components/` (`MetricCard.tsx`, `PersonalRecordsDeck.tsx`, `StravaConnectCard.tsx`, `VolumeProgressionChart.tsx`, `ActivityFeed.tsx`, `ActivityManagementDeck.tsx`, `AddActivityModal.tsx`, `EditActivityModal.tsx`), yang melanggar pengelompokan berbasis domain (*Domain Feature Co-location*).
2. **Pencampuran Logika Domain Murni di Root `src/lib/`**:
   - Mesin domain sains olahraga (*readiness engine, streak engine, AI coach, session matching, personal records, sport kinematics*) bercampur langsung di root `src/lib/` bersama infrastruktur database, client API Strava, dan enkripsi token.
3. **Dokumentasi Struktur Direktori Usang (`PROJECT_STRUCTURE.md`)**:
   - Berkas [`docs/03-architecture/PROJECT_STRUCTURE.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/03-architecture/PROJECT_STRUCTURE.md) masih berada pada Versi 2.0 (November 3) dan belum mencerminkan batas Clean Architecture modern, aturan pembagian lapisan, pembatasan ukuran berkas (< 300 baris), dan dekomposisi modular.

Pembaruan ini menetapkan dan mengimplementasikan **Authoritative Clean Architecture Directory Structure (v3.0)** yang baku, rapi, dan modular dengan jaminan 100% backward compatibility melalui pola fasad re-export.

---

## 2. Rincian Perubahan Arsitektur & Reorganisasi Berkas

### A. Pembaruan Dokumen Spesifikasi Resmi ([`PROJECT_STRUCTURE.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/03-architecture/PROJECT_STRUCTURE.md))
- Diperbarui ke **Versi 3.0** (Status: *AUTHORITATIVE & STRICTLY ENFORCED*).
- Menetapkan 4 Lapisan Bersih (*Clean Architecture Layers*):
  1. **Layer 1: Presentation Layer** (`src/app/` dan `src/components/`).
  2. **Layer 2: Pure Domain Layer** (`src/lib/domain/` dan `src/lib/training/`).
  3. **Layer 3: Infrastructure Layer** (`src/lib/db/`, `src/lib/strava.ts`, `src/lib/crypto.ts`).
  4. **Layer 0: Types & Shared Layer** (`src/types/`, `src/lib/shared/`).
- Menetapkan aturan batas ketergantungan inward (*Dependency Rule*): Lapisan domain murni **DILARANG KERAS** mengimpor komponen UI, routing Next.js, atau modul koneksi database langsung.
- Menetapkan batas ketat ukuran berkas: **Maksimal 300 baris kode per berkas**.

---

### B. Reorganisasi Lapisan Presentasi (`src/components/`)

Seluruh komponen yang sebelumnya berada di root `src/components/` dipindahkan ke subdirektori domain masing-masing, dengan fasad re-export di lokasi lama untuk mencegah broken imports:

1. **`src/components/ui/MetricCard.tsx`**:
   - Komponen atomik kartu telemetri dipindahkan ke folder khusus UI primitives `src/components/ui/`.
   - Fasad re-export dipasang di `src/components/MetricCard.tsx`.
2. **`src/components/records/PersonalRecordsDeck.tsx`**:
   - Deck rekor benchmark personal dipindahkan ke folder domain `src/components/records/`.
   - Fasad re-export dipasang di `src/components/PersonalRecordsDeck.tsx`.
3. **`src/components/strava/StravaConnectCard.tsx`**:
   - Komponen integrasi OAuth Strava dipindahkan ke folder domain `src/components/strava/`.
   - Relatif import dirapikan untuk mengimpor `./StravaSetupGuide` dan `./StravaConnectedView` langsung di folder yang sama.
   - Fasad re-export dipasang di `src/components/StravaConnectCard.tsx`.
4. **`src/components/charts/VolumeProgressionChart.tsx`**:
   - Visualisasi SVG perkembangan volume mingguan dipindahkan ke folder `src/components/charts/`.
   - Fasad re-export dipasang di `src/components/VolumeProgressionChart.tsx`.
5. **`src/components/activity/ActivityFeed.tsx` & `ActivityManagementDeck.tsx`**:
   - Feed aktivitas dan deck manajemen dipindahkan ke folder domain `src/components/activity/`.
   - Relatif import dirapikan untuk mengimpor dari `./deck/`.
   - Fasad re-export dipasang di `src/components/ActivityFeed.tsx` dan `src/components/ActivityManagementDeck.tsx`.
6. **`src/components/activity/modal/AddActivityModal.tsx` & `EditActivityModal.tsx`**:
   - Modal formulir aktivitas dipindahkan ke folder co-located `src/components/activity/modal/`.
   - Fasad re-export dipasang di `src/components/AddActivityModal.tsx` dan `src/components/EditActivityModal.tsx`.

---

### C. Isolasi Lapisan Domain Murni (`src/lib/domain/`)

Seluruh mesin komputasi sains olahraga dipindahkan ke namespace domain murni yang terisolasi dari infrastruktur dan antarmuka pengguna:

1. **`src/lib/domain/readiness/readinessEngine.ts`**:
   - Logika joint safety gate asimetris dan skor kesiapan atlet.
   - Fasad re-export dipasang di `src/lib/readinessEngine.ts`.
2. **`src/lib/domain/streak/streakEngine.ts`**:
   - Algoritma weekly training streak dan spektrum panas api termodinamika.
   - Fasad re-export dipasang di `src/lib/streakEngine.ts`.
3. **`src/lib/domain/coach/aiCoachEngine.ts` & `coachTrainingGenerator.ts`**:
   - Mesin heuristik evaluasi beban latihan (ACWR) dan generator periodisasi 12-minggu.
   - Fasad re-export dipasang di `src/lib/ai-coach.ts` dan `src/lib/coachTrainingGenerator.ts`.
4. **`src/lib/domain/matching/matchingEngine.ts`**:
   - Algoritma pencocokan sesi terencana vs aktual dengan scoring 4-tier.
   - Fasad re-export dipasang di `src/lib/matching.ts`.
5. **`src/lib/domain/records/personalRecordsEngine.ts`**:
   - Detektor rekor sekali jalan (*Single Session Peak Effort*) multi-cabang.
   - Fasad re-export dipasang di `src/lib/personalRecords.ts`.
6. **`src/lib/domain/sports/sportUtils.ts`**:
   - Taksonomi cabang olahraga, kalkulasi MET, dan konversi pace.
   - Fasad re-export dipasang di `src/lib/sportUtils.ts`.

---

### D. Pengelompokan Utilitas Lintas-Sektor (`src/lib/shared/`)

1. **`src/lib/shared/formatters.ts`**:
   - Pemformat durasi, jarak, pace, dan tanggal ISO.
   - Fasad re-export dipasang di `src/lib/formatters.ts`.
2. **`src/lib/shared/analytics.ts`**:
   - Agregasi data volume mingguan dan konsistensi latihan.
   - Fasad re-export dipasang di `src/lib/analytics.ts`.

---

## 3. Verifikasi & Jaminan Kualitas Sistem

Seluruh verifikasi dijalankan secara berurutan dan menghasilkan keberhasilan 100%:

| Perintah Pengujian | Ruang Lingkup | Hasil |
|---|---|---|
| `npx tsc --noEmit` | Strict TypeScript Type Checking di seluruh berkas | **PASS (0 Error)** |
| `npm run test:streak` | 21 pengujian unit spektrum termodinamika streak | **PASS (21/21 passed)** |
| `node scripts/tests/test_goal_driven_training_engine.js` | 13 integrasi end-to-end Target Utama & Generator 100K | **PASS (13/13 passed)** |
| `npm run test:coach` | 5 pengujian sistem AI coach & periodisasi latihan | **PASS (5/5 passed)** |
| `npm run test:health` | 31 pengujian integritas biometrik & gerbang keselamatan | **PASS (31/31 passed)** |
| `npm run build` | Next.js 16 App Router Production Turbopack Build | **PASS (23/23 routes compiled)** |

### Verifikasi Integritas Data Riil (PostgreSQL 16)
- Query verifikasi langsung ke PostgreSQL 16:
  - `Ride`: **24 aktivitas**
  - `Run`: **10 aktivitas**
  - Total: **34 aktivitas autentik Strava 100% terjaga utuh tanpa modifikasi atau kehilangan data**.

