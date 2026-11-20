# Changelog: Schema-Driven Dynamic Sport Coach UI Generator Control (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-20 13:00:00 WIB
- **Tipe**: `feat(ui)` / `feat(coach)` / `feat(architecture)` / `refactor(ergonomics)`
- **Commit Message Rujukan**: `feat(ui): implement schema-driven dynamic sport coach ui generator control with instant reactive telemetry and debrief synthesis` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui`
- **Lokasi**: [`docs/10-changelog/feat/ui/2026-11-20_13-00-00_feat-schema-driven-dynamic-sport-coach-ui-generator-control.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-20_13-00-00_feat-schema-driven-dynamic-sport-coach-ui-generator-control.md)

---

## 1. Latar Belakang & Rasional Rekayasa

Sebelum pembaruan ini, penambahan atau aktivasi cabang olahraga (*cabor*) baru memerlukan pembuatan komponen JSX secara manual (`switch-case` / `if-else` pada formulir entri, pemetaan field yang berulang di berbagai modal, dan pembuatan tampilan baru per cabor). 

Ketika pengguna/atlet ingin melanjutkan atau menambahkan cabor baru (baik dari 33 cabor yang sudah terdaftar maupun cabor baru di masa mendatang), sistem membutuhkan **sebuah Kontrol UI Dinamis (*Schema-Driven Dynamic Sport Coach UI Generator Control*)** yang dapat:

1. **Mengeliminasi Kode Antarmuka Hardcoded (*Zero Hardcoded JSX Boilerplate*)**:
   - Seluruh elemen antarmuka dihasilkan secara reaktif dan otomatis (*runtime UI generation*) dari kontrak skema deklaratif cabor (`sportCoachUiSchema.ts`).
2. **Generasi Form Telemetri Seketika (*Instant Telemetry Ingress Generation*)**:
   - Begitu sebuah cabor coach dipilih atau didaftarkan (misal: *Padel, Kempo, Golf, Powerlifting, Lari, Bela Diri*), formulir input telemetri langsung dibuat secara otomatis sesuai kategori fisiologisnya:
     - **Kekuatan**: Beban (kg), Set, Reps, RPE, serta kalkulasi tonase instan.
     - **Daya Tahan**: Jarak (km), Heart Rate (bpm), Kadens, dan Elevasi.
     - **Bela Diri**: Jumlah ronde, durasi per ronde, intensitas sparring, dan skrining gegar otak SCAT6.
     - **Beregu**: Durasi bermain aktif, High-Speed Running (HSR), sprint, dan pemanasan FIFA 11+.
     - **Raket / Presisi / Fungsional**: SWOLF / akurasi, smash, AMRAP rounds, dan Time Under Tension (TUT).
3. **Generasi Panel AI Coach Debrief & Safety Circuit Breaker Langsung**:
   - Menghasilkan kartu analisis pelatih AI instan yang merangkum identitas pelatih cabor, jalur metabolisme energi (*Oxidative, Phosphagen, Glycolytic*), standar sains federasi, kalkulasi beban internal (*Foster Session-RPE Strain*), serta *Circuit Breaker* proteksi cedera atlet.

---

## 2. Rincian Komponen & Berkas yang Diimplementasikan

### A. Kontrak & Skema Deklaratif Domain
1. **[`src/lib/domain/coach/schema/sportCoachUiSchema.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/schema/sportCoachUiSchema.ts) (137 baris)**:
   - Mendefinisikan tipe input lapangan: `number`, `text`, `select`, `slider`, dan `boolean`.
   - Mengelompokkan field ke dalam kategori `workload`, `technique`, dan `safety`.
   - Menyediakan spesifikasi default 6 kluster fisiologis (`CLUSTER_DEFAULTS`).
   - Menyediakan fungsi pabrik `createDynamicSportCoachSchema()` untuk menyintesis skema cabor baru secara instan.
2. **[`src/lib/domain/coach/index.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/index.ts) (17 baris)**:
   - Mengekspor barrel skema UI coach ke seluruh lapisan aplikasi.

### B. Komponen Generator Antarmuka Dinamis (`src/components/coach/dynamic/`)
1. **[`DynamicTelemetryForm.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/dynamic/DynamicTelemetryForm.tsx) (162 baris)**:
   - Mesin form deklaratif yang membaca array `fields` dari skema cabor dan merender input angka ber-satuan, range slider taktil, selector dropdown, atau sakelar boolean peringatan keselamatan.
   - Merender pil metrik ringkasan instan di bagian atas form.
2. **[`DynamicCoachDebriefCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/dynamic/DynamicCoachDebriefCard.tsx) (114 baris)**:
   - Komponen HUD pelatih AI yang menghitung estimasi beban internal *Foster Session-RPE* secara live dan menguji alarm keamanan klinis (*Circuit Breaker Trip* jika atlet mengindikasikan nyeri sendi atau benturan kepala).
3. **[`DynamicSportCoachControl.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/dynamic/DynamicSportCoachControl.tsx) (288 baris)**:
   - Kontrol utama interaktif: menyajikan selektor carousel cabor terdaftar, kotak pencarian, form inline pendaftaran cabor baru (`+ Daftarkan Cabor Coach Baru`), pengatur durasi & RPE, serta langsung memicu generasi form telemetri dan kartu debrief.
4. **[`CoachHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/coach/CoachHub.tsx) (114 baris)**:
   - Mengintegrasikan `DynamicSportCoachControl` ke halaman utama `/coach` di bawah grafik performa PMC dan panduan harian.

---

## 3. Rangkaian Pengujian Otomatis & Verifikasi Mutu

- **Suite Pengujian Baru**: [`scripts/tests/test_dynamic_coach_ui_generator.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/tests/test_dynamic_coach_ui_generator.js) (68 baris).
  - Memvalidasi generasi skema 6 kluster fisiologis.
  - Memvalidasi pembentukan instan cabor kustom (Padel Tennis) dengan field spesifik.
  - Memvalidasi kalkulasi metrik instan (Tonase, HSR, Durasi tempur).
  - **Hasil**: **22 Passed, 0 Failed**.
- **Kompilasi Produksi Next.js Turbopack (`npm run build`)**:
  - Berhasil mengompilasi **35/35 rute** aplikasi dalam 7.7s (TypeScript 9.4s) dengan status bersih tanpa kesalahan.
- **Disiplin Batas Baris Kode (`< 300 lines`)**:
  - `sportCoachUiSchema.ts`: 137 baris
  - `DynamicTelemetryForm.tsx`: 162 baris
  - `DynamicCoachDebriefCard.tsx`: 114 baris
  - `DynamicSportCoachControl.tsx`: 288 baris
  - `CoachHub.tsx`: 114 baris
  - **100% berkas berada di bawah batas 300 baris**.
