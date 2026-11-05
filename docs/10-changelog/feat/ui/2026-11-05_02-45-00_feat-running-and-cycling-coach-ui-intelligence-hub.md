# Changelog: Pembangunan Antarmuka AI Running Coach & Cycling Coach Intelligence Hub (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-05 02:45:00 WIB
- **Tipe**: `feat(ui)` / `feat(coach)` / `feat(sports-science)`
- **Commit Message Rujukan**: `feat(coach): build specialized running coach and cycling coach ui hubs with safety gates and telemetry`
- **Branch**: `feat/ui`
- **Lokasi Berkas**: `docs/10-changelog/feat/ui/2026-11-05_02-45-00_feat-running-and-cycling-coach-ui-intelligence-hub.md`

---

## 1. Latar Belakang & Identifikasi Kebutuhan

Pada menu sidebar [`AppSidebar.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/AppSidebar.tsx), terdapat dua elemen navigasi penting:
1. **`Running Coach`** (dengan ikon sepasang jejak kaki / `Footprints`).
2. **`Cycling Coach`** (dengan ikon pesepeda / `Bike`).

Sebelumnya, kedua item ini hanya berupa tautan jangkar (*anchor link*) dummy (`/#running-coach` dan `/#cycling-coach`) tanpa antarmuka (*dedicated UI*) yang sesungguhnya. Atlet meminta untuk dibuatkan UI yang sesuai dan presisi dengan sistem kepelatihan olahraga multi-disiplin.

---

## 2. Rincian Arsitektur & Implementasi UI

### A. AI Running Coach View ([`src/components/coach/RunningCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/RunningCoachView.tsx))
Disesuaikan dengan status kesehatan dan biomekanika atlet saat ini:
1. **Safety Circuit Breaker & Health Gate Banner**:
   - Status: `ON_HOLD (DITUNDA SEMENTARA)`.
   - Menjelaskan landasan fisiologis mengapa impak lari (2.5–3x berat badan per langkah) dikontraindikasikan saat ini akibat riwayat keseleo inversi pergelangan kaki kanan (*right ankle sprain*) dan nyeri tempurung lutut bilateral (*anterior knee pain*).
   - Menautkan status evaluasi klinis `PENDING_CLINICAL_ASSESSMENT` dengan tautan langsung ke dossier kesehatan atlet.
2. **Sasaran Jangka Panjang: Road to Marathon 42.2K**:
   - Memetakan target maraton sebagai sasaran jangka panjang (Prioritas #2).
   - Menampilkan status volume lari mingguan yang terproteksi pada 0.0 km.
3. **Protokol 4-Tahap Kembali Berlari (Return-to-Run / RTR)**:
   - **Tahap 1**: Mobilitas & Penguatan Tanpa Beban (*Aktif Saat Ini*).
   - **Tahap 2**: Walk/Jog Interval (15–20 menit, rasio 1:2 setelah izin klinis).
   - **Tahap 3**: Continuous Easy Jog (<20 menit, RPE 3, bebas nyeri).
   - **Tahap 4**: Volume Fondasi Aerobik (Aturan 10%).
   - Menerapkan *Zero Pain Rule* ($\le 2/10$ toleransi nyeri).
4. **Arsip Telemetri Sesi Lari (10 Sesi Strava Tercatat)**:
   - Menampilkan akumulasi jarak lari, laju (*pace*) rata-rata, dan daftar kartu sesi lari historis.

---

### B. AI Cycling Coach View ([`src/components/coach/CyclingCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CyclingCoachView.tsx))
Disesuaikan dengan cabang olahraga aktif dan toleransi sendi positif:
1. **Status Otorisasi Beban Aerobik Aktif**:
   - Status: `CONDITIONAL AUTHORIZED (BEBAN AEROBIK AKTIF)`.
   - Mengintegrasikan bukti empiris: Sesi **56.10 km** telah tuntas dengan **0 nyeri dan 0 pembengkakan**, membuktikan beban putaran tertutup (*closed-chain*) sangat aman.
2. **Sasaran Utama: First 100 km Century Ride (MTB)**:
   - Progres Terkini: Sesi terjauh **56.10 km** dari target 100.0 km (**56.1% tercapai**).
   - Menampilkan progres periodisasi 12-Minggu Zone 2: Minggu 1 (Target: 18.0 km $\rightarrow$ Realisasi tercatat **26.91 km / 149% tercapai**).
   - Proteksi puasa Sunnah Senin & Kamis sebagai hari pemulihan penuh glikogen.
3. **Parameter Pacing Zone 2 Tanpa Heart-Rate Monitor**:
   - Patokan RPE 3–4 (Beban ringan, pernapasan stabil).
   - Kunci *Talk Test*: Dapat mengobrol kalimat lengkap tanpa terengah-engah.
   - Kadens 85+ RPM pada jalur datar dengan gigi ringan untuk memproteksi sendi lutut dari torsi tinggi.
4. **Arsip Telemetri Sesi Sepeda (25 Sesi Strava Tercatat)**:
   - Menampilkan total jarak tempuh sepeda, sesi terjauh (56.1 km), kecepatan rata-rata, dan daftar kartu sesi sepeda.

---

### C. Hub & Navigasi Terpadu ([`src/components/coach/CoachHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CoachHub.tsx) & Rute)
1. **Coach Header Strip**:
   - Menampilkan tab selector yang mencerminkan ikon dan nama persis sesuai tangkapan layar atlet:
     - `[Footprints] Running Coach` dengan lencana `HOLD`
     - `[Bike] Cycling Coach` dengan lencana `ACTIVE`
2. **Rute Server Components Baru**:
   - [`/coach`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/coach/page.tsx) — Halaman hub terpadu dengan dukungan query `?mode=running` atau `?mode=cycling`.
   - [`/coach/running`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/coach/running/page.tsx) — Rute permanen untuk Running Coach.
   - [`/coach/cycling`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/coach/cycling/page.tsx) — Rute permanen untuk Cycling Coach.
3. **Pembaruan Sidebar**:
   - Memperbarui tautan sidebar di [`AppSidebar.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/AppSidebar.tsx) ke rute `/coach/running` dan `/coach/cycling`, dilengkapi lencana status `HOLD` dan `ACTIVE`.

---

## 3. Matriks Berkas

| Berkas | Tipe | Deskripsi Singkat |
|---|---|---|
| [`src/components/coach/CoachHeaderStrip.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CoachHeaderStrip.tsx) | Baru | Tab pemilih Running & Cycling Coach sesuai tampilan navigasi |
| [`src/components/coach/RunningCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/RunningCoachView.tsx) | Baru | Antarmuka khusus AI Running Coach (Safety Gate & RTR) |
| [`src/components/coach/CyclingCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CyclingCoachView.tsx) | Baru | Antarmuka khusus AI Cycling Coach (Zone 2 Base & 100K Century) |
| [`src/components/coach/CoachHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CoachHub.tsx) | Baru | Hub utama pengalih mode antarmuka kepelatihan |
| [`src/app/coach/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/coach/page.tsx) | Baru | Halaman server rute `/coach` |
| [`src/app/coach/running/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/coach/running/page.tsx) | Baru | Halaman server rute `/coach/running` |
| [`src/app/coach/cycling/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/coach/cycling/page.tsx) | Baru | Halaman server rute `/coach/cycling` |
| [`src/components/layout/AppSidebar.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/AppSidebar.tsx) | Modifikasi | Menautkan navigasi sidebar ke rute riil `/coach/running` & `/coach/cycling` |

---

## 4. Hasil Verifikasi & Pengujian

- **TypeScript Compilation (`npx tsc --noEmit`)**: 0 error.
- **Weekly Streak & Retention Tests (`npm run test:streak`)**: 21/21 passed.
- **Production Build (`npm run build`)**: Berhasil mengompilasi seluruh 27 rute (`27/27`) termasuk 3 rute baru modul Coach.

