# Changelog: Sports Science Professional UI Design System & Telemetry Instrument Polish (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-17 09:30:00 WIB
- **Tipe**: `feat(ui)` / `style(telemetry-instrument)` / `refactor(ergonomics)`
- **Commit Message Rujukan**: `feat(ui): elevate athlete telemetry instrument panels, equipment wear gauges, and sports science visual hierarchy across all views strictly under 300 lines` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui`
- **Lokasi**: [`docs/10-changelog/feat/ui/2026-11-17_09-30-00_feat-sports-science-professional-ui-and-telemetry-polish.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-17_09-30-00_feat-sports-science-professional-ui-and-telemetry-polish.md)

---

## 1. Latar Belakang & Evaluasi Visual Pengguna

Pengguna melampirkan tangkapan layar langsung dari komponen antarmuka yang menampilkan teks mentah (*raw string*):
> `56.1 km / 5000 km`

Bersamaan dengan instruksi:
> *"perbaiki semua ui yang ada agar terlihat profesional dan sesuai dengan tema di aplikasi ini. apakah bisa?"*

### Akar Masalah pada Tampilan Sebelumnya:
1. **Tipografi & Hierarki Telemetri yang Terlalu Mentah (*Raw Unstyled Metric Display*)**:
   - Angka jarak terakumulasi dan target rekomendasi perlengkapan dicetak sebagai teks datar (`56.1 km / 5000 km`) tanpa kontras hierarkis, pemisahan unit yang terkalibrasi, maupun badge status kapasitas peralatan.
2. **Inkonsistensi Skema Warna & Token Semantik**:
   - Terdapat penggunaan warna *hardcoded* Tailwind arbitrer (`text-purple-400`, `text-amber-500`, `bg-cyan-500/20`, dsb.) yang melompati token CSS Variables resmi tema (`var(--color-cycling)`, `var(--color-running)`, `var(--color-alert-amber)`, dsb.).
   - Jadwal puasa sunnah proteksi cedera (Senin & Kamis) belum memiliki token semantik tersendiri.
3. **Komponen Pembacaan Gap Jarak & Kapasitas Sendi**:
   - Pada modul *Cycling Coach* dan *Running Coach*, metrik kemajuan disajikan dalam bentuk teks `max / target` yang kurang berbobot layaknya *instrument panel lab* olahraga ketahanan.

---

## 2. Rincian Rekayasa & Peningkatan Visual Profesional

### A. Kalibrasi Desain Sistem Global ([`src/app/globals.css`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/globals.css) - 145 baris)
- **Token Semantik Puasa Proteksi (`--color-fasting`)**:
  - Didefinisikan pada `@theme`, `:root` (`#7C3AED` - royally deep purple untuk mode terang), dan `.dark` (`#A78BFA` - glowing lavender untuk mode graphite obsidian).
- **Penajaman Tipografi & Antialiasing Mesin Rendering**:
  - Mengaktifkan `-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale`, dan `text-rendering: optimizeLegibility` pada elemen `body` untuk ketajaman angka-angka tabular (`font-tabular`).

### B. Transformasi Kartu Perlengkapan Atlet ([`AthleteEquipmentCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/profile/AthleteEquipmentCard.tsx) - 275 baris)
- **Desain Panel Instrumen Beraksen Cabang Olahraga**:
  - Setiap kartu peralatan kini memiliki aksen garis atas (*top-border accent*) 2px sesuai cabang: `--color-cycling` untuk sepeda dan `--color-running` untuk sepatu lari.
- **Hierarki Angka Telemetri Presisi Tinggi**:
  - Menggantikan teks datar menjadi blok metrik bervolume: angka capaian dibuat besar dan tebal (`text-lg font-black font-tabular text-[var(--color-text-primary)]`), unit dipisahkan (`text-[10px] uppercase font-bold`), dan target maksimum disajikan halus (`/ 5,000 km`).
- **Badge Kapasitas Bergradasi & Threshold Keausan**:
  - Badge persentase keausan dengan batas klinis: `< 65%` (kondisi prima - hijau/cyan/coral), `65% - 85%` (waspada - amber), dan `≥ 85%` (batas aus tercapai - alert red).
  - Dilengkapi *track gauge* halus berbingkai (*pill container*) dan kalkulasi sisa kuota kilometer aman.

### C. Polishing Modul Coach & Preskripsi Biomekanika
1. **Cycling Coach View ([`CyclingCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CyclingCoachView.tsx) - 285 baris)**:
   - Metrik sesi terjauh terverifikasi dinaikkan menjadi instrumen digital bervolume besar (`text-xl font-black font-tabular`).
   - Jadwal puasa Senin & Kamis diselaraskan menggunakan token `var(--color-fasting)`.
2. **Running Coach View ([`RunningCoachView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/RunningCoachView.tsx) - 283 baris)**:
   - Menggantikan teks statis `0.0 km / 42.2 km (0%)` menjadi instrument readout keselamatan sendi dengan badge `0% (DITAHAN)` berbingkai amber.
   - Seluruh warna tahapan *Return-to-Run (RTR)* dialihkan ke token semantik `[var(--color-alert-amber)]`.

### D. Rekap Mingguan & Navigasi Terpadu
1. **Header & Mobile Drawer ([`AppHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/layout/AppHeader.tsx) - 199 baris)**:
   - Menambahkan pelacakan judul otomatis untuk rute `/recap` ("Evaluasi & Rekap Mingguan") dan `/coach` ("Coach Intelligence & Preskripsi MTB").
   - Melengkapi drawer menu navigasi seluler dengan tautan langsung ke Rekap Mingguan dan Cycling Coach.
2. **Weekly Recap Hero Cards ([`WeeklyRecapHeroCards.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/recap/WeeklyRecapHeroCards.tsx) - 155 baris)**:
   - Menghilangkan warna Tailwind arbitrer `cyan-400/cyan-500` dan mengembalikan kepatuhan token CSS `[var(--color-cycling)]`.
3. **Tachometer Sasaran Puncak ([`PrimaryGoalHeroSection.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/goals/hero/PrimaryGoalHeroSection.tsx) - 157 baris)**:
   - Memformat komparasi pencapaian rekor vs sasaran menggunakan angka tabular berbobot visual tinggi.
4. **Kalender & Strip Objektif Makro ([`MacroObjectivesStrip.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/MacroObjectivesStrip.tsx), [`CalendarDayCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/CalendarDayCard.tsx), [`CalendarRestCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/cards/CalendarRestCard.tsx), [`TrainingPeriodizationGanttView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingPeriodizationGanttView.tsx), [`CalendarWeekRowHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/CalendarWeekRowHeader.tsx))**:
   - Menyatukan seluruh indikator visual hari puasa dan deload mesosiklus di bawah token `var(--color-fasting)`.

---

## 3. Matriks Kepatuhan Batas Ukuran Berkas (*Clean Architecture Audit*)

| Berkas / Modul | Jumlah Baris | Ambang Batas | Status |
| :--- | :---: | :---: | :---: |
| `src/app/globals.css` | **145** | < 300 | ✅ Patuh |
| `src/components/profile/AthleteEquipmentCard.tsx` | **275** | < 300 | ✅ Patuh |
| `src/components/coach/CyclingCoachView.tsx` | **285** | < 300 | ✅ Patuh |
| `src/components/coach/RunningCoachView.tsx` | **283** | < 300 | ✅ Patuh |
| `src/components/health/AthleteHealthDirectives.tsx` | **237** | < 300 | ✅ Patuh |
| `src/components/layout/AppHeader.tsx` | **199** | < 300 | ✅ Patuh |
| `src/components/goals/hero/PrimaryGoalHeroSection.tsx` | **157** | < 300 | ✅ Patuh |
| `src/components/recap/WeeklyRecapHeroCards.tsx` | **155** | < 300 | ✅ Patuh |
| `src/components/training/MacroObjectivesStrip.tsx` | **128** | < 300 | ✅ Patuh |
| `src/components/training/CalendarDayCard.tsx` | **197** | < 300 | ✅ Patuh |
| `src/components/training/cards/CalendarRestCard.tsx` | **83** | < 300 | ✅ Patuh |
| `src/components/training/views/CalendarWeekRowHeader.tsx` | **157** | < 300 | ✅ Patuh |
| `src/components/training/views/TrainingPeriodizationGanttView.tsx` | **146** | < 300 | ✅ Patuh |

*Seluruh 13 berkas yang disempurnakan berada di bawah batas 300 baris kode secara konsisten.*

---

## 4. Hasil Verifikasi Sistem

1. **TypeScript Typecheck (`npx tsc --noEmit`)**:
   - Status: **0 Type Errors** (Lolos 100%).
2. **Pengujian Unit & Integrasi Sistem (`npm run test:all`)**:
   - Health Suite: **31 / 31 Passed**
   - Coach Training Suite: **5 / 5 Passed**
   - Streak Thermal Heat Suite: **21 / 21 Passed**
   - BOLA Defense Suite: **5 / 5 Passed**
   - Multi-Week Recap Suite: **10 / 10 Passed**
   - Python Pytest Suite: **16 / 16 Passed**
   - **Total**: **83 / 83 Passed (100% Lolos)**.
3. **Kompilasi & Pembuatan Rute Produksi (`npm run build`)**:
   - Status: **34 / 34 Rute Sukses Dibuat** menggunakan Turbopack Next.js 16.4.3.
4. **Status Kontrol Versi (*Git Safety*)**:
   - Seluruh perubahan berada di *working tree* pada branch `feat/ui`.
   - **0 commit dibuat** (menjaga kepatuhan aturan pengguna).
