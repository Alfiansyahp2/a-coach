# Changelog: Phase 8 — UI Ingress, Multi-Sport Telemetry Widgets & Capacity Radar Chart (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-19 11:30:00 WIB
- **Tipe**: `feat(ui)` / `feat(telemetry)` / `feat(analytics)` / `refactor(ergonomics)`
- **Commit Message Rujukan**: `feat(ui): implement multi-sport dynamic telemetry ingress, capacity radar chart, and telemetry badges for 33 decoupled sports (phase 8)` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/strava-activity-ingestion`
- **Lokasi**: [`docs/10-changelog/feat/ui/2026-11-19_11-30-00_feat-ui-ingress-multi-sport-telemetry-widgets-and-radar-chart-phase-8.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-19_11-30-00_feat-ui-ingress-multi-sport-telemetry-widgets-and-radar-chart-phase-8.md)

---

## 1. Latar Belakang & Rasional Arsitektur (Phase 8)

Dengan terselesaikannya Phase 1 hingga Phase 7 yang mengimplementasikan fondasi *decoupled AI sports coach*, 33 agen cabang olahraga spesifik dunia, dan *Global Systemic Fatigue Arbiter*, Phase 8 berfokus pada **lapisan pengalaman visual atlet (UI Ingress, Telemetri Visual, dan Analitik Radar Multi-Sport)**:

1. **Ingress Telemetri Cabor Dinamis & Modular**:
   - Atlet membutuhkan formulir entri telemetri cerdas yang menyesuaikan variabel fisiologis secara otomatis saat jenis olahraga dipilih di modal `AddActivityModal`.
   - Misalnya: saat memilih *Powerlifting*, antarmuka menyajikan beban (kg), set, repetisi, dan RPE untuk menghitung tonase instan; saat memilih *Swimming*, antarmuka menyajikan waktu putaran dan laju kayuhan untuk menghitung skor efisiensi SWOLF; saat memilih cabang bela diri (*Combat*), antarmuka menyajikan jumlah ronde dan skrining gegar otak SCAT6.

2. **Visualisasi Kapasitas Atlet Hibrida (Multi-Sport Hexagonal Radar Chart)**:
   - Atlet yang berpartisipasi dalam berbagai cabang olahraga membutuhkan representasi visual kapasitas atletik 6 kluster fisiologis (*Endurance, Strength, Team Field/Court, Combat, Racquet & Precision, Functional Extreme*).
   - Dibuat komponen SVG murni `MultiSportRadarChart.tsx` tanpa dependensi charting eksternal yang berat, disematkan pada `AthleteProfileHub.tsx`.

3. **Multi-Sport Telemetry Badge pada Feed & Registry Aktivitas**:
   - Kartu aktivitas pada `ActivityGroupCard.tsx` dan bilah kepala sesi pada `ActivityDetailHeader.tsx` dilengkapi dengan lencana telemetri interaktif (`MultiSportTelemetryBadge.tsx`) yang merangkum indikator performa utama masing-masing cabang olahraga secara elegan.

4. **Kepatuhan Disiplin Arsitektur Ketat**:
   - Seluruh berkas baru maupun yang dimodifikasi dalam `src/` dipastikan **secara mutlak tetap berada di bawah batas 300 baris** (`< 300 lines`).
   - Kompilasi produksi Next.js Turbopack (`npm run build`) berhasil 100% (35/35 rute statis & dinamis).
   - Pengujian terpadu (`npm run test:all`) lulus 100% (353+ tes di 14 suite pengujian).

---

## 2. Rincian Implementasi & Modul Berkas Baru

### A. Komponen Telemetri Dinamis & Dekomposisi Modal
1. **[`SportSpecificTelemetryFields.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/SportSpecificTelemetryFields.tsx) (105 baris)**:
   - Bertindak sebagai *coordinator component* yang mendeteksi kluster olahraga yang dipilih atlet dan mengalirkan state formulir ke subkomponen modular terkait.
2. **[`StrengthTelemetryFields.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/telemetry/StrengthTelemetryFields.tsx) (73 baris)**:
   - Bidang telemetri khusus *Powerlifting, Olympic Weightlifting, Calisthenics, Strongman, Bodybuilding*: Beban (kg), Jumlah Set, Repetisi, serta estimasi tonase langsung.
3. **[`CombatAquaticFields.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/telemetry/CombatAquaticFields.tsx) (123 baris)**:
   - Bidang telemetri olahraga air (*Swimming, Rowing, Triathlon*): SWOLF, *stroke rate*, waktu putaran, transisi T1/T2.
   - Bidang telemetri olahraga tarung (*Boxing, MMA, BJJ, Silat, Judo, Muay Thai*): Jumlah ronde, submission/takedown, serta skrining SCAT6 jika mengalami benturan kepala.
4. **[`TeamRacquetFunctionalFields.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/telemetry/TeamRacquetFunctionalFields.tsx) (172 baris)**:
   - Bidang telemetri olahraga beregu (*Football, Basketball, Volleyball, Futsal, Rugby, Field Hockey*): High-Speed Running (HSR), sprint, dan durasi tanding.
   - Bidang telemetri raket & presisi (*Badminton, Tennis, Table Tennis, Archery, Shooting*): Smash, unforced errors, panah/tembakan, tonase draw weight.
   - Bidang telemetri fungsional & ekstrem (*Functional Fitness, Climbing, Gymnastics, Surfing, Skateboarding*): AMRAP rounds, grade rute, durasi TUT, ombak diselancar.

### B. Komponen Analisis & Radar Atlet Hibrida
1. **[`MultiSportRadarChart.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/analytics/MultiSportRadarChart.tsx) (226 baris)**:
   - Menggambar proyeksi radar heksagonal SVG murni dengan perhitungan trigonometri sudut $60^\circ$ $(\frac{2\pi}{6})$ untuk masing-masing kluster fisiologis.
   - Dilengkapi titik interaktif, jaring konsentris (25%, 50%, 75%, 100%), serta kartu ringkasan status dominan atlet hibrida.
2. **[`AthleteProfileHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/profile/AthleteProfileHub.tsx) (117 baris)**:
   - Mengintegrasikan `MultiSportRadarChart` pada Bagian 4 profil atlet untuk melengkapi biometrik dan zona detak jantung Karvonen.

### C. Komponen Lencana Telemetri & Tampilan Feed Aktivitas
1. **[`MultiSportTelemetryBadge.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/MultiSportTelemetryBadge.tsx) (109 baris)**:
   - Komponen badge reaktif yang menampilkan metrik esensial berdasarkan cabor (misal: "Sepeda • Zone 2", "Lari • RTR Guard", "Renang • SWOLF 68", "Kekuatan • 3500 kg Tonase", "Bela Diri • SCAT6 Guard", dsb.).
2. **[`ActivityGroupCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/deck/ActivityGroupCard.tsx) (245 baris)**:
   - Merender `MultiSportTelemetryBadge` di samping tautan nama aktivitas pada daftar aktivitas grup.
3. **[`ActivityDetailHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/detail/ActivityDetailHeader.tsx) (98 baris)**:
   - Merender `MultiSportTelemetryBadge` pada bilah atas sesi aktivitas.

---

## 3. Integrasi & Alur Data Formulir Modal Sesi
1. **[`ActivityManualFormFields.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/ActivityManualFormFields.tsx) (211 baris)**:
   - Terkoneksi dengan state `sportSpecificData` dan menyajikan blok formulir dinamis saat jenis olahraga diganti.
2. **[`AddActivityRightPage.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/AddActivityRightPage.tsx) (164 baris)** & **[`useAddActivityForm.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/useAddActivityForm.ts) (174 baris)**:
   - Mengelola lifecycle state `sportSpecificData` dan menyimpannya saat atlet menekan tombol simpan.
3. **[`activitySubmissionHelpers.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/activitySubmissionHelpers.ts) (169 baris)**:
   - Menyinkronkan telemetri cabor ke `/api/coach/multi-sport` dengan mode arbitrase sistemik hibrida (`arbitrateHybrid: true`).

---

## 4. Rangkaian Pengujian Otomatis & Verifikasi

- **Suite Pengujian Baru**: [`scripts/tests/test_ui_telemetry_ingress.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/tests/test_ui_telemetry_ingress.js) (14 pengujian).
- **Hasil Pengujian Lengkap (`npm run test:all`)**:
  - `test:health`: 31 Passed, 0 Failed
  - `test:coach`: 5 Passed, 0 Failed
  - `test:streak`: 21 Passed, 0 Failed
  - `test:bola`: Passed
  - `test:multi-week-recap`: Passed
  - `test:coordinator`: 13 Passed, 0 Failed
  - `test:endurance`: 21 Passed, 0 Failed
  - `test:strength`: 30 Passed, 0 Failed
  - `test:team`: 32 Passed, 0 Failed
  - `test:combat`: 60 Passed, 0 Failed
  - `test:phase6`: 57 Passed, 0 Failed
  - `test:arbiter`: 37 Passed, 0 Failed
  - `test:ui-telemetry`: 14 Passed, 0 Failed
  - `test:python`: 16 Passed, 0 Failed
  - **TOTAL**: **353+ Pengujian Lulus, 0 Gagal (100% Pass Rate)**.
- **Next.js Turbopack Build**: `npm run build` sukses mengompilasi 35/35 rute dalam 14.7s dengan 0 kesalahan TypeScript.
- **Audit Baris Kode (`src/`)**: 100% berkas berada di bawah batas 300 baris.
