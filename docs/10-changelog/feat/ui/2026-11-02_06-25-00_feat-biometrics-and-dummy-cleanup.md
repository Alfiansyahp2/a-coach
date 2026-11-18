# Changelog: Pembersihan Data Dummy & Kalibrasi Biometrik Atlet (`feat/biometrics-and-dummy-cleanup`)

- **Tanggal & Waktu**: 2026-11-02 06:25:00 WIB
- **Tipe**: `feat(biometrics)` / `fix(data)` / `feat(db)` / `feat(ui)`
- **Commit Message**: `feat(biometrics): calibrate athlete profile (68 bpm, 170cm, 65kg) and purge dummy seed activities`
- **Branch**: `main`

---

## 1. Ringkasan Perubahan

1. **Pembersihan Data Dummy**:
   - Menghapus 3 aktivitas seed dummy awal (`Morning Aerobic Threshold Run`, `Zone 2 Aerobic Base Builder`, `Recovery Spin & Mobility` dengan `strava_activity_id`: `11002001`, `11002002`, `11002003`) dari PostgreSQL 16 dan store atomik.
   - Database kini murni berisikan **34 aktivitas Strava nyata** (10 Run, 24 Ride) yang diekstrak dari gambar rute pengguna.

2. **Penerapan Parameter Biometrik Atlet**:
   - **Resting Heart Rate ($HR_{rest}$)**: `68 bpm`
   - **Tinggi Badan**: `170 cm`
   - **Berat Badan**: `65 kg`
   - **Body Mass Index (BMI)**: `22.5 kg/m²` (Kategori Optimal / Athletic)
   - **Max Heart Rate ($HR_{max}$)**: `188 bpm`
   - **Heart Rate Reserve (HRR)**: `120 bpm` (`68 - 188 bpm`)

3. **Kalibrasi Zona Latihan Fisiologis (Metode Karvonen)**:
   - *Zone 1 Active Recovery (50-60% HRR)*: < 140 bpm
   - *Zone 2 Aerobic Base (60-70% HRR)*: 140 - 152 bpm
   - *Zone 3 Tempo Sustained (70-80% HRR)*: 152 - 164 bpm
   - *Zone 4 Lactate Threshold (80-90% HRR)*: 164 - 176 bpm
   - *Zone 5 Neuromuscular VO2 Max (90-100% HRR)*: 176 - 188+ bpm
   - Target intensitas pada `scheduled_workouts` diselaraskan dengan rentang detak jantung Karvonen.

4. **Integrasi Antarmuka (UI)**:
   - **Dashboard Top Telemetry Bar** ([`src/app/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/page.tsx)): Badge biometrik menampilkan `68 bpm rest | 170 cm | 65 kg | BMI 22.5`.
   - **Halaman Detail Aktivitas** ([`src/app/activities/[id]/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/activities/%5Bid%5D/page.tsx)): Distribusi 5 zona HR dihitung berbasis resting HR 68 bpm, serta menampilkan massa atlet dan baseline HR istirahat pada kartu biometrik.

