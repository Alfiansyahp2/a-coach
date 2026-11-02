# Changelog: Overhaul Antarmuka Obsidian Telemetry (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-02 07:00:00 WIB
- **Tipe**: `feat(ui)` / `feat(design-system)` / `feat(telemetry)` / `feat(viz)`
- **Commit Message Rujukan**: `feat(ui): implement obsidian telemetry design system and human-art-directed performance interface`
- **Branch**: `feat/ui`

---

## 1. Latar Belakang & Pernyataan Masalah

Sebelum pembaruan ini, antarmuka aplikasi masih memiliki karakteristik template prototipe generik (*AI Slop*):
1. **Pola Grid 4 Kartu Seragam**: Layout dashboard mengulang kartu statistik identik tanpa visual anchor dan hirarki informasi editorial yang kuat.
2. **Pelanggaran Radius Sudut (*Bubble Radii*)**: Terdapat sudut melengkung berlebih (`rounded-xl` 12px dan `rounded-2xl` 16px) yang melanggar manifesto [`docs/02-design/ANTI_AI_SLOP.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/02-design/ANTI_AI_SLOP.md) (maksimum 4px–6px).
3. **Warna Metrik Tidak Semantis**: Seluruh pace/kecepatan (baik lari maupun bersepeda) diwarnai seragam menggunakan oranye Strava (`#FC4C02`), alih-alih warna fungsional cabang olahraga (**Volt Lime** `#D4FF00` untuk Run dan **Electric Cyan** `#00F0FF` untuk Ride).
4. **Ketiadaan Visualisasi Beban Latihan**: Data volume mingguan belum divisualisasikan dalam bentuk grafik analitis yang menjawab pertanyaan perkembangan harian atlet.

Pembaruan ini mengeksekusi misi desain **"Obsidian Telemetry"**: menggabungkan kedisiplinan instrumen telemetri atletik presisi (terinspirasi Garmin Marq, WHOOP 4.0, dan telemetri F1/aerospace) dengan tata letak editorial asimetris berdensitas data tinggi.

---

## 2. Rincian Perubahan Berdasarkan Git Diff

### A. Fondasi Desain & Token Tema (`src/app/globals.css`)
- **Integrasi `@theme` Tailwind CSS v4**:
  Mendefinisikan palet token desain resmi ke dalam CSS theme engine:
  - Surfaces: `--color-surface-canvas` (`#090A0F`), `--color-surface-card` (`#12151D`), `--color-surface-elevated` (`#161922`), `--color-surface-highlight` (`#1C212E`).
  - Borders: `--color-border-subtle` (`#1F2430`), `--color-border-medium` (`#2D3547`).
  - Typography: `--color-text-primary` (`#F0F2F5`), `--color-text-secondary` (`#9BA3AF`), `--color-text-muted` (`#5A6272`).
  - Athletic Accents: `--color-accent-volt` (`#D4FF00`), `--color-accent-cyan` (`#00F0FF`), `--color-accent-amber` (`#FF9500`), `--color-accent-crimson` (`#FF2A6D`), `--color-accent-strava` (`#FC4C02`).
- **Strict Tabular Numerals**: Mempertegas utilitas `.font-tabular` (`font-variant-numeric: tabular-nums; font-feature-settings: "tnum"`) agar seluruh pembacaan angka tidak bergeser secara horizontal.
- **Precision Focus & Scrollbar**: Focus ring bergaris tipis 2px (`outline: 2px solid var(--accent-volt)`) dan scrollbar obsidian kustom 6px.

---

### B. Komponen Baru

#### 1. `src/components/MetricCard.tsx`
- Komponen blok metrik telemetri yang mematuhi [`docs/02-design/COMPONENT_GUIDELINES.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/02-design/COMPONENT_GUIDELINES.md):
  - Label atas monospaced uppercase 11px.
  - Nilai hero 28–32px berjarak tetap (`font-mono font-tabular`).
  - Unit data terintegrasi (misal: `km`, `min/km`).
  - Aksen semantik garis vertikal kiri 2px (`volt`, `cyan`, `amber`, `crimson`).
  - Badge persentase delta terhadap periode sebelumnya dengan indikator arah.
  - Sudut batas tajam `rounded-sm` (4px).

#### 2. `src/components/VolumeProgressionChart.tsx`
- Visualisasi native SVG interaktif untuk progres volume latihan 7 hari (Senin–Minggu):
  - Tanpa dependensi charting eksternal (menghemat bundle size dan kompatibel 100% dengan Turbopack SSR).
  - Stacked bar: Segmen bawah **Electric Cyan** (`#00F0FF`) untuk Cycling, segmen atas **Volt Lime** (`#D4FF00`) untuk Running.
  - Garis dasar nol mutlak ($Y=0$) dan garis panduan horizontal tipis (`#1F2430`).
  - Interaksi hover dinamis yang menampilkan breakdown jarak lari, jarak sepeda, elevasi daki, atau status hari istirahat.

---

### C. Pembaruan Komponen Eksisting

#### 1. `src/components/ActivityFeed.tsx`
- Mengganti seluruh radius sudut lebar (`rounded-xl` dan `rounded-lg`) menjadi `rounded-sm` (4px).
- Mengubah pewarnaan pace/kecepatan menjadi dinamis: **Volt Lime** (`#D4FF00`) untuk sesi Run dan **Electric Cyan** (`#00F0FF`) untuk sesi Ride.
- Menghilangkan efek blur drop-shadow oranye tebal pada thumbnail rute, digantikan dengan penyesuaian kontras taktis (`brightness-110`).
- Menyempurnakan filter tab segmented (`All`, `Run`, `Ride`) dengan counter monospaced dan input filter pencarian seketika dengan tombol clear.

#### 2. `src/components/StravaConnectCard.tsx`
- Menstandarkan seluruh kontainer dan tombol dari `rounded-xl`/`rounded-lg` ke `rounded-sm` (4px).
- Menghilangkan `shadow-xl` dan `shadow-lg shadow-[#FC4C02]/20` generik, beralih ke batas hairline 1px `#1F2430`.
- Mempertahankan fungsionalitas panduan setup API Strava yang dapat diciutkan (*collapsible*) dan strip status telemetri sinkronisasi inkremental.

---

### D. Rekonstruksi Halaman Dashboard (`src/app/page.tsx`)
- **Navigasi Atas & Status Integritas Sistem**:
  - Header berlatar obsidian dengan logo teknis `AC` dan penanda mode `OBSIDIAN TELEMETRY`.
  - Strip integritas telemetri: Status database PostgreSQL 16 (Online), enkripsi token AES-256-GCM, dan profil kalibrasi biometrik pengguna (`68 bpm RHR`, `170 cm`, `65 kg`, `BMI 22.5`).
- **Hero Workload Deck (Tata Letak Asimetris)**:
  - 4 Blok `MetricCard` di sisi kiri (Total Jarak Mingguan, Durasi Bergerak, Kecepatan Aerobik Rata-rata, Adherence Rencana).
  - Grafik `VolumeProgressionChart` di sisi kanan yang menyajikan proporsi latihan Run vs. Ride secara visual.
- **Operations Deck (Dua Kolom Asimetris)**:
  - **Kolom Kiri (60%)**: Ingested Telemetry Stream (`ActivityFeed`) menampilkan 34 sesi nyata dengan thumbnail rute GPS.
  - **Kolom Kanan (40%)**:
    1. *Scheduled Training Calendar*: Penjadwalan sesi latihan atau empty state informatif jika jadwal belum dibuat.
    2. *Personal Records (PR) Benchmarks*: Rekor terbaik terverifikasi pengguna (5K: `20:30`, 10K: `42:30`, Half Marathon: `1:36:00`).
    3. *Active Target Objectives*: Progress bar target bulanan dan konsistensi mingguan.
- **Grounded AI Coach Analytical Dossier**:
  - Kartu analisis beban kerja (ACWR) dengan badge tingkat urgensi (*optimal*, *caution*, *warning*) berbasis data aktual tanpa halusinasi diagnostik.

---

### E. Penyempurnaan Halaman Detail Aktivitas (`src/app/activities/[id]/page.tsx`)
- Mengubah seluruh kontainer kartu dari `rounded-2xl` dan `rounded-xl` menjadi `rounded-sm` (4px).
- Mengganti seluruh garis batas usang (`#232838`, `#1E2330`) ke token `#1F2430`.
- Memperbaiki kartu Quick KPI agar menampilkan warna semantik cabang olahraga (Volt Lime untuk lari, Cyan untuk sepeda).
- Menata ulang showcase peta rute GPS dengan grid pattern 24px kontras tinggi.
- Memperbarui visualisasi 5-Zone Heart Rate Karvonen berbasis resting HR 68 bpm dan max HR 188 bpm dengan batas strip yang presisi.

---

## 3. Daftar File yang Diubah & Ditambahkan

| File | Status | Keterangan |
| :--- | :--- | :--- |
| `src/app/globals.css` | `Modified` | Token `@theme` Tailwind v4, variabel CSS, `.font-tabular`, scrollbar |
| `src/components/MetricCard.tsx` | `Added` | Komponen kartu metrik tabular telemetry-grade beraksen 4 warna |
| `src/components/VolumeProgressionChart.tsx` | `Added` | Komponen visualisasi native SVG stacked bar 7 hari (Run vs Ride) |
| `src/components/ActivityFeed.tsx` | `Modified` | Reduksi sudut ke 4px, pewarnaan semantik sport, pencarian instan |
| `src/components/StravaConnectCard.tsx` | `Modified` | Standarisasi sudut 4px, pembersihan dropshadow, penyesuaian hairline |
| `src/app/page.tsx` | `Modified` | Redesain arsitektur dashboard asimetris berdensitas data tinggi |
| `src/app/activities/[id]/page.tsx` | `Modified` | Refinement sudut 4px, pewarnaan semantik, kalibrasi Karvonen |

---

## 4. Hasil Verifikasi & Pengujian Mutu

1. **Turbopack Production Build**:
   ```powershell
   npm run build
   ```
   - Hasil: **Exit Code 0** (Berhasil tanpa error atau peringatan tipe TypeScript).
   - Rute terkompilasi:
     - `◐ /` (Partial Prerendering - Dynamic Stream)
     - `◐ /activities/[id]` (Partial Prerendering - Dynamic Stream)
     - `ƒ /api/auth/strava/*` dan `ƒ /api/strava/sync`
2. **Runtime Verification**:
   - `http://localhost:3000` merespons dengan HTTP Status **200 OK**.
   - `http://localhost:3000/activities/035dfa10-9104-4395-a94d-6fc545efb57f` merespons dengan HTTP Status **200 OK**.
3. **Audit Kepatuhan Anti-AI-Slop**:
   - Zero bubble radii (>6px dilarang).
   - Zero gradien ungu/biru generik.
   - 100% data performa menggunakan monospace tabular figures.
   - Densitas informasi tinggi tanpa whitespace dekoratif kosong.

