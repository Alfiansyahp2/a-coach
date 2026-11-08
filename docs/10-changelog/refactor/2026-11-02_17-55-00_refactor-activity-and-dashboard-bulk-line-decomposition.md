# Changelog: Architectural Codebase Audit & Bulk Line Modular Decomposition (Phase 2 - UI & Pages)

- **Tanggal & Waktu**: 2026-11-02 17:55:00 WIB
- **Tipe**: `refactor(ui)` / `refactor(activity)` / `refactor(dashboard)` / `refactor(architecture)`
- **Commit Message**: `refactor(ui): decompose activity deck, detail page, add modal, dashboard, and strava card into domain-driven subcomponents`
- **Branch**: `refactor`

---

## 1. Latar Belakang & Ringkasan Refactoring

Melanjutkan audit arsitektur kode secara menyeluruh di direktori `src/`, ditemukan sejumlah file halaman dan komponen antarmuka (*UI Components & Pages*) yang memiliki volume baris kode masif (*bulk line / God-components*). Komponen-komponen ini mencampurkan logika layout server, parsing form, state lokal, rendering SVG telemetri, tabel agregasi, dan kartu metrik dalam satu file berukuran 500–800 baris.

Untuk mematuhi prinsip **Single Responsibility Principle (SRP)**, meningkatkan *maintainability*, isolasi *testing*, serta mempermudah pengembangan fitur di masa depan, dilakukan dekomposisi arsitektur fase kedua dengan fokus pada komponen aktivitas, dashboard, dan integrasi eksternal:

1. **`src/components/AddActivityModal.tsx` (816 baris $\to$ 407 baris):**
   - Sebelumnya memadukan kontrol drag-and-drop OCR upload, live OCR text viewer, formulir 6-sport input dengan kalkulasi real-time laju/pace, serta formulir audit keamanan sendi & RPE Borg CR10.
   - Didekomposisi menjadi 3 subkomponen terisolasi dalam `src/components/activity/modal/`.

2. **`src/app/activities/[id]/page.tsx` (717 baris $\to$ 137 baris):**
   - Sebelumnya menyatukan header navigasi breadcrumb, hero KPI title, GPS polyline canvas, 4 kartu telemetri kinematika, 4 kartu telemetri biometrik/sensor, visualisasi distribusi 5-zona HR, kartu status rekonsiliasi rencana latihan (*planned vs actual*), serta footer riwayat sekuensial aktivitas (*prev/next*).
   - Didekomposisi menjadi 8 subkomponen presentasional di `src/components/activity/detail/`.

3. **`src/components/ActivityManagementDeck.tsx` (687 baris $\to$ 163 baris):**
   - Sebelumnya mencampuradukkan helper inferensi kategori/volume/bulan, toolbar pencarian & filter cabang olahraga, batch actions toolbar, dan kartu grup aktivitas yang dapat dilipat (*collapsible*).
   - Didekomposisi menjadi 5 modul terpisah di `src/components/activity/deck/`.

4. **`src/components/StravaConnectCard.tsx` (503 baris $\to$ 314 baris):**
   - Sebelumnya menggabungkan panduan setup developer API Strava (collapsible checklist), tampilan kartu profil atlet terhubung beserta telemetri enkripsi & otorisasi scope, serta tombol pemicu sinkronisasi inkremental dalam satu file.
   - Didekomposisi ke `src/components/strava/`.

5. **`src/app/page.tsx` (523 baris $\to$ 202 baris):**
   - Sebelumnya memuat seluruh strip status integritas basis data, kalender latihan terjadwal, kartu target sasaran makro (100K Century & Jalur Maraton), serta dossier analitik AI Coach.
   - Didekomposisi menjadi modul-modul presentasi di `src/components/dashboard/`.

---

## 2. Rincian Dekomposisi & Struktur Modul Baru

### A. Subkomponen Modal Aktivitas (`src/components/activity/modal/`)

1. **`ActivityImageUploader.tsx` (183 baris):**
   - Mengelola area dropzone unggah screenshot Strava/Garmin/Apple Watch.
   - Menjalankan OCR parser melalui `/api/activities/parse-image`.
   - Menampilkan pratinjau gambar, lencana status telemetri terdeteksi, dan collapsible raw OCR text viewer.
2. **`ActivityManualFormFields.tsx` (231 baris):**
   - Selektor jenis olahraga (Ride, Run, Walk, CrossTraining, WeightTraining, Workout).
   - Input judul, tanggal/jam, jarak tempuh (km), durasi jam/menit/detik, elevasi gain (m), dan catatan deskripsi.
   - Menampilkan strip kalkulasi kinematika dinamis (kecepatan rata-rata km/j dan perkiraan pace mnt/km secara live).
3. **`ActivityHealthCheckinFields.tsx` (154 baris):**
   - Selektor skala intensitas RPE Borg CR10 (1–10) dengan sorotan target Zone 2 (RPE 3–4).
   - Skala nyeri sendi engkel kanan & kedua lutut (0–10).
   - Kotak centang observasi pembengkakan dan instabilitas sendi.

### B. Subkomponen Detail Aktivitas (`src/components/activity/detail/`)

1. **`ActivityDetailHeader.tsx` (130 baris):**
   - Navigasi breadcrumb dashboard & registry, ID Strava, serta kontrol navigasi sekuensial aktivitas sebelumnya/berikutnya (*Prev/Next*).
2. **`ActivityDetailHero.tsx` (76 baris):**
   - Judul aktivitas, modal edit, tanggal/jam mulai, catatan deskripsi, serta KPI pill jarak dan laju rata-rata.
3. **`ActivityGpsTrackMap.tsx` (60 baris):**
   - Visualisasi kanvas rute GPS polyline dengan watermark telemetri dan latar belakang grid sensor.
4. **`ActivityKinematicsCards.tsx` (160 baris):**
   - 4 kartu performa kinematika: Average Velocity/Pace (dengan Max Speed & m/s), Total Distance (meter & mil), Moving Time (dengan elapsed time & pause ratio), serta Elevation Gain (dengan persentase grade & feet).
5. **`ActivityBiometricsCards.tsx` (168 baris):**
   - 4 kartu biometrik: Average Heart Rate (dengan max HR & baseline RHR 68 bpm Karvonen), Cadence (spm/rpm & rhythm quality), Mechanical Power (kJ workload & sensor mode), serta Calories (hourly burn rate & metabolic fuel).
6. **`ActivityHeartRateZones.tsx` (84 baris):**
   - Bar visual 5-zona HR berwarna serta grid 5 kolom rincian persentase dan rentang detak jantung.
7. **`ActivityPlanMatchCard.tsx` (87 baris):**
   - Kartu rekonsiliasi latihan: Completion Adherence (%), Distance Delta (km), dan Pace Delta (s/km) terhadap rencana sesi terjadwal.
8. **`ActivityDetailFooter.tsx` (75 baris):**
   - Tombol kembali ke dashboard dan kartu navigasi sekuensial dua arah (*Newer & Older Activities*).

### C. Subkomponen Deck Manajemen Aktivitas (`src/components/activity/deck/`)

1. **`activityGroupUtils.ts` (105 baris):**
   - Ekstraksi helper murni: `inferCategory()`, `inferVolumeBucket()`, `inferMonth()`, dan fungsi pengelompokan `groupActivities()`.
2. **`ActivityDeckHeader.tsx` (55 baris):**
   - Header registry aktivitas, tombol "Tambah Aktivitas", dan strip KPI total sesi, running, dan cycling.
3. **`ActivityFilterToolbar.tsx` (125 baris):**
   - Selektor mode pengelompokan (Cabang Olahraga, Kategori, Bulan, Rentang Jarak).
   - Dropdown pengurutan (tanggal dan jarak naik/turun).
   - Input pencarian real-time dan tombol filter cepat cabang olahraga.
4. **`ActivityBatchActionBar.tsx` (65 baris):**
   - Toolbar aksi massal (*bulk update*) yang muncul saat sesi dicentang untuk mengubah jenis olahraga secara serempak.
5. **`ActivityGroupCard.tsx` (226 baris):**
   - Kartu grup collapsible dengan subtotal jarak, durasi, elevasi, dan rata-rata kecepatan.
   - Daftar baris aktivitas individual lengkap dengan checkbox, thumbnail GPS, metrik, tombol edit langsung, dan tautan detail.

### D. Subkomponen Strava API Gateway (`src/components/strava/`)

1. **`StravaSetupGuide.tsx` (82 baris):**
   - Panduan konfigurasi developer Strava (API settings, callback domain localhost:3000, panduan env).
2. **`StravaConnectedView.tsx` (193 baris):**
   - Tampilan profil atlet, telemetri enkripsi AES-256-GCM, daftar scopes, tombol pemutus koneksi, serta panel pemicu sinkronisasi inkremental dengan log audit sinkronisasi terakhir.

### E. Subkomponen Dashboard Beranda (`src/components/dashboard/`)

1. **`DashboardTopNavbar.tsx` (52 baris):**
   - Header navigasi sticky dengan logo a-coach, Obsidian telemetry badge, dan tautan langsung ke Jadwal Latihan, Profil Kesehatan, serta Manajemen Aktivitas.
2. **`DashboardIntegrityStrip.tsx` (53 baris):**
   - Strip telemetri status basis data (PostgreSQL/Local Online/Offline), enkripsi AES-256-GCM, tombol tambah aktivitas, dan kartu biometrik atlet.
3. **`DashboardScheduledWorkoutsCard.tsx` (140 baris):**
   - Kartu kalender sesi latihan terjadwal (5 sesi mendatang) beserta status kepatuhan (*COMPLETED / PRESCRIBED*).
4. **`DashboardMacroGoalsCard.tsx` (110 baris):**
   - Kartu pemantauan sasaran makro (Road to 100km Century, Jalur Maraton 10–20km, Frekuensi Mingguan) dengan progress bar bertema volt/cyan/magenta.
5. **`DashboardAiInsightsDeck.tsx` (78 baris):**
   - Kartu dossier analitik rekomendasi AI Coach berbasis prinsip beban adaptif dan keamanan sendi.

---

## 3. Matriks Perbandingan Baris Kode (Before vs After)

| File Monolitik Sebelumnya | Baris Awal | File Hasil Dekomposisi | Baris Baru | Reduksi |
| :--- | :---: | :--- | :---: | :---: |
| `src/app/activities/[id]/page.tsx` | 717 | `src/app/activities/[id]/page.tsx` (Orkestrator)<br>+ `src/components/activity/detail/*` (8 subkomponen) | 137 | **-80.9%** |
| `src/components/ActivityManagementDeck.tsx` | 687 | `src/components/ActivityManagementDeck.tsx`<br>+ `src/components/activity/deck/*` (5 subkomponen) | 163 | **-76.3%** |
| `src/app/page.tsx` | 523 | `src/app/page.tsx` (Orkestrator)<br>+ `src/components/dashboard/*` (5 subkomponen) | 202 | **-61.4%** |
| `src/components/AddActivityModal.tsx` | 816 | `src/components/AddActivityModal.tsx`<br>+ `src/components/activity/modal/*` (3 subkomponen) | 407 | **-50.1%** |
| `src/components/StravaConnectCard.tsx` | 503 | `src/components/StravaConnectCard.tsx`<br>+ `src/components/strava/*` (2 subkomponen) | 314 | **-37.6%** |
| **Total Eliminasi Monolitik** | **3,246** | **Koordinator Halaman & Komponen Induk** | **1,223** | **-62.3%** |

---

## 4. Hasil Verifikasi & Jaminan Kualitas

1. **TypeScript Type Safety:**
   - Eksekusi: `npx tsc --noEmit`
   - Hasil: **0 ERRORS** (Semua komponen bertipe ketat dan selaras dengan `src/types`).
2. **Coach Training & Indicators Test Suite:**
   - Eksekusi: `node scripts/test_coach_training_system.js`
   - Hasil: **5 PASSED, 0 FAILED**.
3. **Athlete Health & Injury Intelligence Test Suite:**
   - Eksekusi: `node scripts/test_athlete_health_system.js`
   - Hasil: **32 PASSED, 0 FAILED**.
4. **End-to-End Route Accessibility:**
   - `/` $\to$ **200 OK**
   - `/training` $\to$ **200 OK**
   - `/health` $\to$ **200 OK**
   - `/activities` $\to$ **200 OK**
   - `/activities/[id]` $\to$ **200 OK** (Diverifikasi dengan UUID aktivitas aktual)
   - `/api/athlete/health-context` $\to$ **200 OK**
   - `/api/athlete/profile` $\to$ **200 OK**
   - `/api/athlete/injuries` $\to$ **200 OK**
   - `/api/activities` $\to$ **200 OK**
5. **Konsistensi Visual:**
   - Seluruh tema visual Obsidian Dark (`#090A0F`, `#12151D`, `#161922`), aksen Volt (`#D4FF00`), Cyan (`#00F0FF`), Strava Orange (`#FC4C02`), dan Magenta (`#FF2A6D`) tetap utuh dan presisi.

