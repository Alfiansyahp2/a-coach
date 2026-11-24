# Changelog: Spesifikasi Formula & Kalkulasi Matematis 33 Cabang Olahraga Sistem (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-21 09:30:00 WIB
- **Tipe**: `feat(sports-science)` / `docs(architecture)` / `spec(physiology)`
- **Commit Message Rujukan**: `feat(docs): author comprehensive mathematical formulations and physiological calculation specification for 33 world sports` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui`
- **Lokasi**: [`docs/10-changelog/feat/backend/2026-11-21_09-30-00_feat-sports-science-mathematics-and-33-cabor-calculation-specification.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-21_09-30-00_feat-sports-science-mathematics-and-33-cabor-calculation-specification.md)

---

## 1. Latar Belakang & Rasional Perubahan

Pada arsitektur sistem sebelumnya, perhitungan beban latihan pada `python_engine/` masih didominasi oleh pendekatan kardiorespirasi *Cyclic Endurance* (Banister TRIMP berbasis denyut jantung dan durasi). Hal ini menimbulkan keterbatasan ilmiah yang signifikan ketika diterapkan pada cabang olahraga non-endurance:
- Cabor kekuatan (Powerlifting, Angkat Besi, Kalistenik, Strongman, Binaraga) tidak mengukur beban melalui jarak kilometer atau denyut nadi semata, melainkan melalui **Volume Tonase**, **Sheiko INOL**, dan **1RM Brzycki**.
- Cabor bela diri menuntut pengukuran **Punch Density**, **Grappling vs Striking Workload**, dan batas benturan kepala (*Concussion SCAT6 Gate*).
- Cabor beregu lapangan menuntut kalkulasi **Catapult Tri-Axial PlayerLoad**, **Bradley High-Speed Running**, dan deselerasi eksentrik.
- Cabor raket dan presisi mengukur **Smash Acceleration**, **Tension Load Tarikan Busur (lbs)**, dan stabilitas getaran tangan (*Tremor Index*).
- Atlet hibrida menuntut arbitrase molekuler ketat (**AMPK vs mTORC1**) dan matriks tabrakan sendi.

Pengguna menginstruksikan: *"coba buat plan untk dokumentasi untk perhitungan yang lebih spesifik untuk masing-masing cabor yang ada disini docs"* dan kemudian *"implementasikan"*.

Untuk mewujudkan panduan matematika deterministik yang bebas dari fabrikasi AI generik, disusunlah dokumen spesifikasi induk [`09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md).

---

## 2. Rincian Dokumen & Cakupan Formula Matematis

### A. Dokumen Spesifikasi Induk yang Dihasilkan
- **Berkas**: [`docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md)
- **Cakupan**: Menjabarkan seluruh rumus matematika KaTeX, koefisien empiris, matriks input sensor, batas ambang cedera, dan algoritma aksi preskriptif untuk **33 cabang olahraga dunia** yang terbagi dalam **6 klaster fisiologis**:
  1. **Kluster 1: Ketahanan Siklik (6 Cabor)**: Lari Jarak Jauh (GAP, GCT Balance, Pa:Hr Decoupling), Sepeda Jalan Raya (Coggan NP, IF, TSS, VI), MTB XC (Torque Surge Index, VAM), Renang (SWOLF, CSS), Dayung (500m Split Wattage, Drive:Recovery 1:2), Triathlon (Brick Glycogen Penalty).
  2. **Kluster 2: Kekuatan & Daya Maksimal (5 Cabor)**: Powerlifting (Volume Tonase, Brzycki 1RM, Sheiko INOL), Angkat Besi (Barbell Peak Power, Velocity Decay Cut-off), Kalistenik (Biomechanical Lever Torque, Isometrik TUT), Strongman (Axial Compressive Load, Grip Margin), Binaraga (Weekly Effective Hard Sets, Proximity to Failure).
  3. **Kluster 3: Bela Diri & Kontak Fisik (6 Cabor)**: Tinju (Punch Density, Head Impact SCAT6 Gate), MMA (Striking vs Grappling Partitioning), BJJ (Isometric Mat Tension, Cervical Strain), Pencak Silat (Sweeping Angular Velocity), Judo (Throwing Work Output, Breakfall Shock Absorption), Muay Thai (Tibial Impact Load).
  4. **Kluster 4: Olahraga Beregu & Lapangan (6 Cabor)**: Sepak Bola (Catapult Tri-Axial PlayerLoad, Bradley HSR $>19.8\text{ km/h}$), Basket (Jump Count & Landing Shock, Jumper's Knee Boundary), Voli (CMJ Height Decay, Shoulder Rotational Load), Futsal (Micro-Deceleration Frequency), Rugby (High-G Collision $>5g$, RHIE), Hoki Lapangan (Lumbar Flexion Posture Time).
  5. **Kluster 5: Raket & Presisi (5 Cabor)**: Bulu Tangkis (Jump Smash Angular Energy, Lateral Lunge Deceleration), Tenis (Internal Shoulder Rotation, Rally Duration Strain), Tenis Meja (Loop Rotational Impulse, Micro-step Footwork), Panahan (Cumulative Draw Weight Volume lbs, Hold Tremor Amplitude), Menembak (Diastolic Cardio-Somatic Sync, Postural Sway).
  6. **Kluster 6: Fungsional & Ekstrem (5 Cabor)**: CrossFit/Hyrox (Metcon Power Density, Interference Load), Panjat Tebing (Finger Pulley A2/A4 Tension, Drop Shock GRF), Senam Artistik (Landing Reaction Force $8-14\times$ BW), Selancar (Paddle-to-Wave Ratio), Skateboarding (Drop Impact Acceleration, Ankle Shear Strain).
  7. **Universal Multi-Sport Arbiter**: Jeda molekuler $\ge 6$ jam AMPK vs mTORC1, Indeks Pengurasan Sistem Saraf Pusat (CNS Drain), dan Matriks Tabrakan Sendi Anatomis.

### B. Pembaruan Katalog & Indeks Ekosistem
- [`docs/11-ai/README.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/11-ai/README.md): Mendaftarkan berkas `09-SPESIFIKASI_FORMULA_DAN_KALKULASI_MATEMATIS_33_CABOR.md` ke dalam pohon berkas arsitektur AI dan menambahkan rangkuman isi dokumen pada Seksi 9.
- [`docs/10-changelog/README.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/README.md): Mendaftarkan berkas changelog ini ke dalam kategori backend feature.

---

## 3. Hasil Validasi & Pengujian

- **Integritas Dokumen**: Format penulisan formula matematis KaTeX diverifikasi valid dan konsisten dengan taksonomi cabor pada `docs/11-ai/02-TAKSONOMI_33_CABOR_DAN_PROFIL_FISIOLOGIS.md`.
- **Automated Test Suites**: Seluruh 18 test suite pada `npm run test:all` tetap **100% Passed (639+ assertions, 0 failed)**.
- **Turbopack Build**: `npm run build` tetap **100% Passed (35/35 routes compiled in 3.7s)**.
- **Git State**: Seluruh perubahan tersimpan di *unstaged working tree* (**tanpa git commit**).
