# Changelog: Clean Architecture Bulk Line Remediation & Full Domain-Driven Decomposition (`refactor`)

- **Tanggal & Waktu**: 2026-11-11 06:15:00 WIB
- **Tipe**: `refactor(architecture)` / `refactor(domain)` / `refactor(db)` / `refactor(components)`
- **Commit Message Rujukan**: `refactor(architecture): enforce 300-line limit across production codebase, decompose god components, extract sub-repositories and pure domain utilities` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `refactor`
- **Lokasi**: `docs/10-changelog/refactor/2026-11-11_06-15-00_refactor-bulk-line-remediation-and-clean-architecture-decomposition.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Menindaklanjuti mandat audit menyeluruh terhadap arsitektur codebase (*Clean Architecture*) dan kepatuhan batas ambang *bulk line* (maksimal **300 baris** per file produksi untuk menjaga prinsip *Single Responsibility Principle* dan meminimalisir kompleksitas kognitif), dilakukan pemindaian mendalam terhadap **265 file** di repository `project_strava` (`src/`, `python_engine/`, dan `scripts/`).

Dari hasil audit tersebut, ditemukan **12 file kode produksi** yang melanggar batas 300 baris (berkisar antara 302 hingga 520 baris) dengan permasalahan struktural berikut:

1. **Form Modal Monolitik (*God Components*)**:
   - [`src/components/profile/EditProfileModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/profile/EditProfileModal.tsx) mencapai **520 baris**, mencampuradukkan penanganan 3 tab formulir (*Identitas & Akun*, *Biometrik Fisik*, *Target & Fisiologi Kardiovaskular*) beserta validasi state di satu komponen raksasa.
   - [`src/components/health/hub/NewInjuryForm.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/NewInjuryForm.tsx) mencapai **470 baris**, menggabungkan selektor hierarkis anatomi tubuh, visualisasi biomekanika sendi, input skala nyeri VAS, dan mutasi API cedera.
   - [`src/components/health/PostActivityCheckinModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/PostActivityCheckinModal.tsx) mencapai **465 baris**, menyatukan seleksi aktivitas, formulir telemetri nyeri sendi, checklist gejala patofisiologi, dan logika pengiriman formulir.
   - [`src/components/activity/modal/EditActivityModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/EditActivityModal.tsx) mencapai **417 baris**, mencampuradukkan layout modal buku terbuka (*open-book*) dengan formulir detail input aktivitas manual, slider RPE, serta kalkulasi tempo/kecepatan.
   - [`src/components/training/ScheduleTrainingHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/ScheduleTrainingHub.tsx) mencapai **349 baris**, menggabungkan header ringkasan metrik volume periodisasi dengan manajemen jadwal kalender.

2. **Fat Data Access Repositories**:
   - [`src/lib/db/activity/activityMutationRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activity/activityMutationRepo.ts) mencapai **396 baris**, menggabungkan mutasi aktivitas umum, pembuatan manual journal entry, dan korelasi penautan jadwal latihan (*workout matching*).
   - [`src/lib/db/trainingRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/trainingRepo.ts) mencapai **358 baris**, menggabungkan query dan mutasi jadwal latihan umum dengan algoritma pencarian korelasi latihan berdasar rentang tanggal.
   - [`src/lib/db/goalRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/goalRepo.ts) mencapai **343 baris**, mencampur manajemen target atlet mingguan/tahunan dengan query dan mutasi *Personal Records (PR)*.

3. **Domain Engine Bloat & Logika Terapan Campuran**:
   - [`src/lib/domain/streak/streakEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/streak/streakEngine.ts) mencapai **421 baris**, menggabungkan utilitas kalender ISO-8601, pemetaan spektrum termodinamika api 6-tahap, dan algoritma utama rantai rentetan mingguan.
   - [`python_engine/domain/streak/streak_engine.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/streak/streak_engine.py) mencapai **356 baris**, memadukan pemformatan tanggal, kalkulasi rentetan mingguan, dan konfigurasi tier termodinamika dalam modul Python tunggal.
   - [`src/lib/domain/coach/aiCoachEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/aiCoachEngine.ts) mencapai **339 baris**, menyatukan evaluasi kesiapan fisiologis atlet dengan analisis progres target spesifik (*Century Ride 100K* dan *Marathon 42K*).
   - [`src/lib/domain/readiness/readinessEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/readiness/readinessEngine.ts) mencapai **302 baris**, mencampuradukkan scoring readiness atlet harian dengan aturan gerbang keselamatan klinis (*clinical safety gatekeeper*).

---

## 2. Rincian Dekomposisi Modular & Refaktorisasi

### A. Layer Presentasi & Modal Formulir (*UI Modals*)

1. **Dekomposisi `EditProfileModal.tsx` (520 $\rightarrow$ 290 baris)**:
   - Mengekstrak tab form identitas atlet ke [`src/components/profile/tabs/EditProfileIdentityTab.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/profile/tabs/EditProfileIdentityTab.tsx) (117 baris).
   - Mengekstrak tab biometrik fisik ke [`src/components/profile/tabs/EditProfileBiometricsTab.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/profile/tabs/EditProfileBiometricsTab.tsx) (142 baris).
   - Mengekstrak tab target fisiologi kardiovaskular ke [`src/components/profile/tabs/EditProfilePhysiologyTab.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/profile/tabs/EditProfilePhysiologyTab.tsx) (91 baris).
   - `EditProfileModal.tsx` kini hanya bertindak sebagai orkestrator modal, manajemen state utama, dan tab navigation switch.

2. **Dekomposisi `NewInjuryForm.tsx` (470 $\rightarrow$ 248 baris)**:
   - Mengekstrak picker anatomi hierarkis (Kepala, Torso, Ekstremitas Bawah, dll.) ke [`src/components/health/hub/injury-form/AnatomicalRegionPicker.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/injury-form/AnatomicalRegionPicker.tsx) (156 baris).
   - Mengekstrak isian detail cedera, status klinis, dan skala nyeri ke [`src/components/health/hub/injury-form/InjuryDetailFields.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/injury-form/InjuryDetailFields.tsx) (161 baris).
   - Mengekstrak banner informasi biomekanika sendi ke [`src/components/health/hub/injury-form/InjuryBiomechanicalBanner.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/hub/injury-form/InjuryBiomechanicalBanner.tsx) (48 baris).

3. **Dekomposisi `PostActivityCheckinModal.tsx` (465 $\rightarrow$ 291 baris)**:
   - Mengekstrak selektor kartu aktivitas adjacent ke [`src/components/health/checkin/PostCheckinActivitySelector.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/checkin/PostCheckinActivitySelector.tsx) (109 baris).
   - Mengekstrak slider telemetri nyeri sendi & RPE ke [`src/components/health/checkin/PostCheckinPainTelemetry.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/checkin/PostCheckinPainTelemetry.tsx) (99 baris).
   - Mengekstrak checklist gejala klinis pasca latihan ke [`src/components/health/checkin/PostCheckinSymptomChecklist.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/checkin/PostCheckinSymptomChecklist.tsx) (52 baris).

4. **Dekomposisi `EditActivityModal.tsx` (417 $\rightarrow$ 272 baris)**:
   - Mengekstrak formulir input field isian aktivitas ke [`src/components/activity/modal/EditActivityFormFields.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/EditActivityFormFields.tsx) (226 baris).

5. **Dekomposisi `ScheduleTrainingHub.tsx` (349 $\rightarrow$ 288 baris)**:
   - Mengekstrak header navigasi tanggal dan metrik volume mingguan ke [`src/components/training/ScheduleTrainingHeader.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/ScheduleTrainingHeader.tsx) (103 baris).

---

### B. Layer Akses Data & Repositori (*Data Access Repositories*)

1. **Dekomposisi `activityMutationRepo.ts` (396 $\rightarrow$ 257 baris)**:
   - Mengekstrak mutasi pencatatan aktivitas manual (`createManualActivity`) ke [`src/lib/db/activity/manualActivityRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activity/manualActivityRepo.ts) (98 baris).
   - Mengekstrak logika korelasi pencocokan workout schedule (`correlateActivityWithWorkout`) ke [`src/lib/db/activity/activityWorkoutCorrelator.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/activity/activityWorkoutCorrelator.ts) (78 baris).
   - Re-ekspor fungsi melalui `activityMutationRepo.ts` untuk menjaga kompatibilitas impor 100%.

2. **Dekomposisi `trainingRepo.ts` (358 $\rightarrow$ 263 baris)**:
   - Mengekstrak query pencocokan latihan berdasar rentang waktu (`findMatchingWorkout`) ke [`src/lib/db/workoutMatchRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/workoutMatchRepo.ts) (102 baris).
   - Re-ekspor fungsi melalui `trainingRepo.ts`.

3. **Dekomposisi `goalRepo.ts` (343 $\rightarrow$ 268 baris)**:
   - Mengekstrak operasi tabel `personal_records` (`getPersonalRecords`, `upsertPersonalRecord`, `deletePersonalRecord`) ke [`src/lib/db/prRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/prRepo.ts) (81 baris).
   - Re-ekspor fungsi melalui `goalRepo.ts`.

---

### C. Layer Domain Engines & Python Scientific Core

1. **Dekomposisi `streakEngine.ts` (421 $\rightarrow$ 258 baris)**:
   - Mengekstrak utilitas tanggal dan kalender kalibrasi ISO-8601 (`getMondayOfWeek`, `getSundayOfWeek`, format tanggal) ke [`src/lib/domain/streak/streakDateUtils.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/streak/streakDateUtils.ts) (47 baris).
   - Mengekstrak konfigurasi 6 tahap spektrum termodinamika api fisik (`FLAME_HEAT_SPECTRUM_TIERS`, `getFlameHeatTier`) ke [`src/lib/domain/streak/flameHeatTiers.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/streak/flameHeatTiers.ts) (137 baris).
   - Re-ekspor penuh di `streakEngine.ts`.

2. **Dekomposisi `streak_engine.py` (356 $\rightarrow$ 225 baris)**:
   - Mengekstrak fungsi manipulasi tanggal (`parse_date`, `get_monday_of_week`, `format_local_date_key`, dll.) ke [`python_engine/domain/streak/date_utils.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/streak/date_utils.py) (48 baris).
   - Mengekstrak model hierarki tier termodinamika (`get_flame_heat_tier`, `FLAME_HEAT_SPECTRUM_TIERS`) ke [`python_engine/domain/streak/tiers.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/python_engine/domain/streak/tiers.py) (107 baris).
   - Re-ekspor di `python_engine/domain/streak/streak_engine.py`.

3. **Dekomposisi `aiCoachEngine.ts` (339 $\rightarrow$ 268 baris)**:
   - Mengekstrak insight target atlet (`generateCenturyRideInsight`, `generateMarathonInsight`) ke [`src/lib/domain/coach/coachGoalInsights.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/coachGoalInsights.ts) (111 baris).
   - Re-ekspor di `aiCoachEngine.ts`.

4. **Dekomposisi `readinessEngine.ts` (302 $\rightarrow$ 207 baris)**:
   - Mengekstrak protokol gerbang keselamatan klinis (`evaluateSafetyGatekeeper`) ke [`src/lib/domain/readiness/safetyGatekeeper.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/readiness/safetyGatekeeper.ts) (104 baris).
   - Re-ekspor di `readinessEngine.ts`.

---

## 3. Ringkasan Perbandingan Baris Kode (Before vs After)

| File Asal (God File / Monolith) | Baris Awal | Baris Akhir | % Penurunan | Modul Modular Baru yang Dihasilkan |
| :--- | :---: | :---: | :---: | :--- |
| `src/components/profile/EditProfileModal.tsx` | **520** | **290** | ⬇️ **-44.2%** | `EditProfileIdentityTab.tsx` (117), `EditProfileBiometricsTab.tsx` (142), `EditProfilePhysiologyTab.tsx` (91) |
| `src/components/health/hub/NewInjuryForm.tsx` | **470** | **248** | ⬇️ **-47.2%** | `AnatomicalRegionPicker.tsx` (156), `InjuryDetailFields.tsx` (161), `InjuryBiomechanicalBanner.tsx` (48) |
| `src/components/health/PostActivityCheckinModal.tsx` | **465** | **291** | ⬇️ **-37.4%** | `PostCheckinActivitySelector.tsx` (109), `PostCheckinPainTelemetry.tsx` (99), `PostCheckinSymptomChecklist.tsx` (52) |
| `src/lib/domain/streak/streakEngine.ts` | **421** | **258** | ⬇️ **-38.7%** | `streakDateUtils.ts` (47), `flameHeatTiers.ts` (137) |
| `src/components/activity/modal/EditActivityModal.tsx` | **417** | **272** | ⬇️ **-34.8%** | `EditActivityFormFields.tsx` (226) |
| `src/lib/db/activity/activityMutationRepo.ts` | **396** | **257** | ⬇️ **-35.1%** | `manualActivityRepo.ts` (98), `activityWorkoutCorrelator.ts` (78) |
| `src/lib/db/trainingRepo.ts` | **358** | **263** | ⬇️ **-26.5%** | `workoutMatchRepo.ts` (102) |
| `python_engine/domain/streak/streak_engine.py` | **356** | **225** | ⬇️ **-36.8%** | `date_utils.py` (48), `tiers.py` (107) |
| `src/components/training/ScheduleTrainingHub.tsx` | **349** | **288** | ⬇️ **-17.5%** | `ScheduleTrainingHeader.tsx` (103) |
| `src/lib/db/goalRepo.ts` | **343** | **268** | ⬇️ **-21.9%** | `prRepo.ts` (81) |
| `src/lib/domain/coach/aiCoachEngine.ts` | **339** | **268** | ⬇️ **-20.9%** | `coachGoalInsights.ts` (111) |
| `src/lib/domain/readiness/readinessEngine.ts` | **302** | **207** | ⬇️ **-31.5%** | `safetyGatekeeper.ts` (104) |
| **Total File Produksi > 300 Baris** | **12 File** | **0 File** | ✅ **100% Bebas Pelanggaran (<300 baris)** | **17 File Modular Baru Terisolasi** |

---

## 4. Hasil Verifikasi & Jaminan Integritas Sistem

1. **Pemeriksaan Kompilasi TypeScript**:
   ```bash
   npx tsc --noEmit
   # Exit code: 0 (Nol type error, nol broken import)
   ```

2. **Pengujian Unit Test Python Engine**:
   ```bash
   npm run test:python
   # 6 passed in 0.76s (FastAPI streak router & domain logic diverifikasi)
   ```

3. **Pengujian Sistem Rentetan Mingguan & Spektrum Termodinamika**:
   ```bash
   node scripts/tests/test_weekly_streak_system.js
   # 21 PASSED, 0 FAILED (Seluruh stage api 1-6 dan boundary case tervalidasi)
   ```

4. **Kompilasi Produksi Next.js (Turbopack)**:
   ```bash
   npm run build
   # Compiled successfully in 4.2s
   # 32/32 routes berhasil dibuat (Static & Partial Prerender)
   ```

---

## 5. Kepatuhan Ketat Status Git

Sesuai instruksi eksplisit pengguna (*"jangan langsung di commit, paham?!"*):
- **TIDAK ADA git commit** yang dieksekusi.
- Seluruh 22 file yang dimodifikasi dan 17 file baru tetap berada dalam status **unstaged working tree**, siap untuk ditinjau langsung oleh pengguna.

