# Changelog: Halaman Detail Aktivitas Telemetri & Interactive Activity Feed (`feat/activity-detail-and-feed`)

- **Tanggal & Waktu**: 2026-11-02 06:15:00 WIB
- **Tipe**: `feat(ui)` / `feat(telemetry)` / `feat(db)` / `feat(analytics)`
- **Commit Message**: `feat(ui): implement activity telemetry detail view and interactive activity feed`
- **Branch**: `main`

---

## 1. Latar Belakang & Kebutuhan Atlet

Pengguna telah mengunggah 34 dataset tangkapan layar rute Strava nyata yang terbagi menjadi:
- `data/from_strava/running/` (10 aktivitas lari)
- `data/from_strava/ride/` (24 aktivitas bersepeda)

Karena API Strava mewajibkan langganan berbayar aktif bagi pengembang baru, seluruh data dianalisis secara presisi dan diimpor ke dalam PostgreSQL 16 (`sport_training`) dan `.data/store.json` dengan metrik kinematis dan biometris nyata (pace, cadence, heart rate, wattage, elevation, route vector).

Kebutuhan antarmuka:
1. **Halaman Detail Aktivitas Komprehensif** (`/activities/[id]`):
   - Telemetri kinematis lengkap: Pace/Kecepatan, Jarak, Durasi Bergerak vs Diam, Elevasi, Grade pendakian.
   - Sensor biometrik: Heart Rate rata-rata & maksimal, Cadence (spm/rpm), Mechanical Power (W & kJ), Kalori.
   - Distribusi zona intensitas detak jantung (Zone 1 s.d. Zone 5).
   - Tampilan visual rute GPS nyata (*vector drop-shadow glow*).
   - Rekonsiliasi rencana latihan (planned vs actual variance mileage & pace).
   - Navigasi sequential (*Prev/Next Session*) untuk berpindah antar sesi latihan tanpa perlu kembali ke dashboard.
2. **Interactive Activity Feed** (`src/components/ActivityFeed.tsx`):
   - Segmented filter tabs (`All`, `Run` Volt Lime `#D4FF00`, `Ride` Electric Cyan `#00F0FF`).
   - Pencarian real-time berdasarkan judul aktivitas.
   - Pagination / "Load More" kontrol.
   - Link langsung ke `/activities/[id]`.
3. **Kepatuhan Desain Anti-AI-Slop**:
   - Mematuhi standar `docs/02-design/ANTI_AI_SLOP.md`, `COLOR_SYSTEM.md`, dan `TYPOGRAPHY.md`.
   - Latar belakang obsidian telemetry `#090A0F`, `#12151D`.
   - Tabular numerals (`font-tabular font-mono`) pada semua angka metrik.

---

## 2. Rincian Implementasi

### A. Route Detail Aktivitas (`src/app/activities/[id]/page.tsx`)
- Mendukung Next.js 16 Partial Prerendering (PPR) dengan pembungkusan `<Suspense fallback={<ActivityDetailSkeleton />}>` dan dynamic unwrapping parameter via `await connection()` dan `await params`.
- Query database ganda: `getActivityById(id)` dan `getAdjacentActivities(id)`.
- Navigasi sequential di header dan bottom bar (*Newer Activity* / *Older Activity*).

### B. Komponen Feed Interaktif (`src/components/ActivityFeed.tsx`)
- Tab filter dinamis dengan penghitung aktivitas: All (37), Run (12), Ride (25).
- Input pencarian seketika dengan tombol clear.
- Kartu sesi berdesain telemetry-grade lengkap dengan thumbnail rute Strava dan indikator warna sport type.

### C. Ekstensi Formatter & Database Helpers (`src/lib/formatters.ts` & `src/lib/db.ts`)
- `speedMpsToKmh(mps)`: Konversi kecepatan lari/sepeda mps ke km/jam.
- `formatHeartRate(bpm)`, `formatCadence(cadence, sportType)`, `formatPower(watts)`, `formatCalories(cal)`.
- `estimateHeartRateZones(avgHr, maxHr)`: Perhitungan persentase waktu di 5 zona detak jantung fisiologis.
- `getActivityById(id, userId)` dan `getAdjacentActivities(id, userId)`: Pengambilan data sesi dan tetangga kronologis.

---

## 3. Hasil Verifikasi

- **Build Turbopack**: `npm run build` sukses dengan exit code 0.
- **TypeScript**: 0 error.
- **Rute yang Dihasilkan**:
  - `◐ /` (Partial Prerender)
  - `◐ /activities/[id]` (Partial Prerender dynamic streaming)

