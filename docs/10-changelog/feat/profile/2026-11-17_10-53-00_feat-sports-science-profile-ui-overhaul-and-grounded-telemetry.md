# Changelog: Sports Science Athlete Profile UI Overhaul & Grounded Telemetry (`feat/profile`)

- **Tanggal & Waktu**: 2026-11-17 10:53:00 WIB
- **Tipe**: `feat(profile)` / `feat(ui)` / `style(telemetry-instrument)` / `refactor(ergonomics)`
- **Commit Message Rujukan**: `feat(profile): overhaul athlete profile ui with sports science visual spectrum, grounded telemetry, and cross-training matrix` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui`
- **Lokasi**: [`docs/10-changelog/feat/profile/2026-11-17_10-53-00_feat-sports-science-profile-ui-overhaul-and-grounded-telemetry.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/profile/2026-11-17_10-53-00_feat-sports-science-profile-ui-overhaul-and-grounded-telemetry.md)

---

## 1. Latar Belakang & Evaluasi Kebutuhan Atlet

Pengguna melampirkan tangkapan layar penuh dari antarmuka halaman profil atlet ([`/profile`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/profile/page.tsx)) disertai instruksi:
> *"perbarui tampilan ui utnuk profile agar terlhiat seperti kebuthuan ayng pas"*

### Akar Masalah pada Tampilan Profil Sebelumnya:
1. **Tata Letak Header yang Renggang & Kurang Berkarakter Paspor Atlet**:
   - Di layar desktop, terdapat ruang kosong (*empty void*) yang cukup lebar di antara blok identitas atlet dan tombol aksi di sisi kanan.
   - Disiplin olahraga utama atlet (*MTB Zone 2 aerobik & transisi lari rehabilitasi*) belum ditegaskan secara visual pada level header.
2. **Tampilan 6-Kartu Biometrik yang Monoton**:
   - Seluruh kartu antropometri menggunakan border abu-abu seragam tanpa aksen warna fungsional sesuai ranah metriknya.
   - Teks deskriptif terasa kaku (misal: `"1.70 m statura"`).
3. **Spektrum 5 Zona Denyut Jantung yang Menguras Ruang Vertikal**:
   - Zona Karvonen disajikan dalam bentuk 5 kartu tebal bertumpuk secara vertikal (~480px tinggi layar), memaksa pengguna menggulir layar terlalu jauh ke bawah.
   - Tidak ada visualisasi spektrum kontinu (*continuous multi-zone spectrum gauge*) yang memetakan rentang denyut dari RHR (68 bpm) hingga HRmax (188 bpm).
4. **Pelanggaran Prinsip *Grounded Indicator Protocol***:
   - Komponen kapasitas fisiologis menampilkan angka statis (`165 Watts` dan `48.5 ml/kg/mnt`) sebagai fallback teks biasa, tanpa membedakan apakah angka tersebut merupakan hasil uji laboratorium, uji lapangan (*20-min field test*), atau estimasi komputasi usia.
5. **Ketiadaan Matriks Alokasi Beban Lintas Disiplin (*Cross-Training Split*)**:
   - Atlet tidak dapat melihat proporsi pembagian sesi antara sepeda MTB (beban aerobik utama non-impak) dan lari (fase transisi rehabilitasi sendi ATFL).

---

## 2. Rincian Pembaruan UI & Rekayasa Komponen

### A. Paspor Komando Atlet ([`AthleteProfileHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/profile/AthleteProfileHeader.tsx) - 159 baris)
- **Badge Spesialisasi Multi-Sport Terintegrasi**:
  - Menambahkan chip disiplin aktif langsung di bawah identitas nama:
    - `<Bike /> MTB Zone 2 (Aktif)` dengan aksen toska `--color-cycling`.
    - `<Footprints /> Lari (Transisi Rehab)` dengan aksen oranye `--color-running`.
- **Hierarki Metadata Terkalibrasi**:
  - Menampilkan usia (`22 Tahun`), email internal, dan tanggal kalibrasi aktif secara rapi.
- **Cluster Status Kesiapan Cepat**:
  - Menyatukan indikator rentetan latihan (`11 MINGGU STREAK 🔥` dengan spektrum suhu termodinamika) dan gerbang sendi (`GATE: PEMANTAUAN SENDI`) di sisi kanan secara seimbang.

### B. Baseline Biometrik & Kinematik Beraksen Semantik ([`BiometricsCardGrid.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/profile/BiometricsCardGrid.tsx) - 166 baris)
- **Aksen Garis Domain Atas (*2px Top Border*)**:
  - **Tinggi Badan**: Aksen toska `--color-cycling` (`170.0 cm` • `1.70 m stature`).
  - **Berat Badan**: Aksen toska `--color-cycling` (`65.0 kg` • `143.3 lbs massa`).
  - **Indeks BMI**: Aksen hijau zamrud `emerald-500` (`22.5` • badge `Ideal` • progress track terkalibrasi).
  - **Resting HR**: Aksen merah klinis `--color-alert-red` (`68 bpm` • detak nadi berdenyut • informasi cadangan **HRR: 120 bpm**).
  - **Max Heart Rate**: Aksen oranye lari `--color-running` (`188 bpm` • formula Tanaka `208 - 0.7×U`).
  - **Ketersediaan Latihan**: Aksen ungu endurance `--color-endurance` (`3 hari/mgg` • `4 hari recovery aktif`).

### C. Spektrum 5 Zona Karvonen & Gauge Kontinu ([`HeartRateZonesCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/profile/HeartRateZonesCard.tsx) - 136 baris)
- **Visual Continuous Multi-Zone Gauge**:
  - Menambahkan lintasan warna 5 segmen proporsional di bagian atas:
    - Z1 (Pemulihan Aktif / 50-60% HRR / Gray)
    - Z2 (Fondasi Aerobik / 60-70% HRR / Mint Green - Target Utama)
    - Z3 (Tempo / 70-80% HRR / Cyan)
    - Z4 (Ambang Laktat / 80-90% HRR / Orange)
    - Z5 (Anaerobik Maksimal / 90-100% HRR / Red)
  - Dilengkapi penanda denyut batas: `RHR 68 bpm` di kiri, `HRmax 188 bpm` di kanan, dan highlight `Zone 2 Target: 140 - 152 bpm`.
- **Baris Zona Densitas Tinggi**:
  - Mengurangi ketinggian vertikal dengan format baris instrumen yang rapi.
  - Zona 2 ditonjolkan dengan lencana khusus: `<CheckCircle2 /> Target Utama MTB`.

### D. Kapasitas Fisiologis & Matriks Lintas Disiplin ([`PhysiologicalTelemetryCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/profile/PhysiologicalTelemetryCard.tsx) - 162 baris)
- **Penerapan *Grounded Telemetry Status***:
  - Nilai FTP (`165 Watts` / `2.54 W/kg`) dan VO2max (`48.5 ml/kg/mnt`) kini secara jujur menampilkan status:
    - Badge `Model Estimasi` (apabila belum melalui tes laboratorium/lapangan resmi).
    - Menghilangkan kesan "klaim data palsu" dan memotivasi pengujian terukur.
- **Alokasi Beban Multi-Disiplin (*Cross-Training Split*)**:
  - **MTB Cycling (70% Volume)**: Alokasi volume aerobik rendah impak, kadens >80 RPM pada rute datar (Status: `AKTIF ZONE 2`).
  - **Running Rehab (30% Volume)**: Transisi beban sendi bertahap, protokol jalan-jogging bebas nyeri 48 jam (Status: `TRANSISI HOLD`).

### E. Penyelarasan Gerbang Keselamatan Kinematik ([`KinematicGateSummaryCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/profile/KinematicGateSummaryCard.tsx) - 118 baris)
- Menyesuaikan 3 pilar proteksi dengan aksen visual yang konsisten:
  - Status Kesiapan Atlet: `PEMULIHAN TERPANTAU` (Red pulse alert).
  - Protokol Lari: `KONDISIONAL / DITUNDA` (Proteksi Ankle Kanan ATFL).
  - Protokol Sepeda: `AKTIF: LOW IMPACT ZONE 2` (Clearance latihan aerobik).
- Strip titik anatomi terpantau (`Anterior Knees` & `Right Ankle`) dengan tautan langsung ke dossier medis di `/health`.

---

## 3. Matriks Kepatuhan Batas Ukuran Berkas (*Clean Architecture Audit*)

Seluruh berkas yang diperbarui diverifikasi patuh secara ketat terhadap batasan **< 300 baris**:

| Berkas / Modul Komponen | Jumlah Baris | Ambang Batas | Status |
| :--- | :---: | :---: | :---: |
| `src/components/profile/AthleteProfileHeader.tsx` | **159** | < 300 | ✅ Patuh |
| `src/components/profile/BiometricsCardGrid.tsx` | **166** | < 300 | ✅ Patuh |
| `src/components/profile/HeartRateZonesCard.tsx` | **136** | < 300 | ✅ Patuh |
| `src/components/profile/PhysiologicalTelemetryCard.tsx` | **162** | < 300 | ✅ Patuh |
| `src/components/profile/KinematicGateSummaryCard.tsx` | **118** | < 300 | ✅ Patuh |
| `src/components/profile/AthleteEquipmentCard.tsx` | **255** | < 300 | ✅ Patuh |
| `src/components/profile/AthleteProfileHub.tsx` | **99** | < 300 | ✅ Patuh |
| `src/components/profile/EditProfileModal.tsx` | **271** | < 300 | ✅ Patuh |

*Audit terhadap seluruh berkas di `src/components/profile/` memastikan **0 berkas $\ge$ 300 baris**.*

---

## 4. Hasil Verifikasi Sistem

1. **TypeScript Compilation (`npx tsc --noEmit`)**:
   - Status: **0 Type Errors** (Lolos 100%).
2. **Pengujian Unit & Integrasi Sistem (`npm run test:all`)**:
   - Health Intelligence & Ankle ATFL Protection: **31 / 31 Passed**
   - Coach Training & Mesocycle Prescriptions: **5 / 5 Passed**
   - Streak Thermal Heat Retaining: **21 / 21 Passed**
   - BOLA Defense & Session Security: **5 / 5 Passed**
   - Multi-Week Recap & Mesocycle Analytics: **10 / 10 Passed**
   - Python Pytest Domain Verification: **16 / 16 Passed**
   - **Total**: **88 / 88 Test Cases Passed** (100% Hijau).
3. **Turbopack Production Build (`npm run build`)**:
   - Status: **34 / 34 Routes Compiled Successfully** pada Next.js 16.4.6 tanpa peringatan.
4. **Status Git**:
   - **TIDAK ADA GIT COMMIT** otomatis yang dibuat (perubahan tetap berada dalam *working tree* branch `feat/ui`).
