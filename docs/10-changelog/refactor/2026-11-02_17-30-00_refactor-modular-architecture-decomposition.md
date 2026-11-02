# Changelog: Architectural Codebase Audit & Bulk Line Modular Decomposition (`refactor`)

- **Tanggal & Waktu**: 2026-11-02 17:30:00 WIB
- **Tipe**: `refactor(db)` / `refactor(ui)` / `refactor(training)` / `refactor(health)` / `refactor(architecture)`
- **Commit Message**: `refactor(core): decompose monolithic database and large UI hubs into domain-driven modular subcomponents`
- **Branch**: `refactor`

---

## 1. Latar Belakang & Tujuan Refactoring

Sesuai audit menyeluruh terhadap arsitektur kode di direktori `src/`, ditemukan beberapa file dengan baris kode yang sangat masif (*bulk line / God-objects*) yang melanggar prinsip *Single Responsibility* dan menghambat skalabilitas pemeliharaan sistem:

1. **`src/lib/db.ts` (2,174 baris):** Berfungsi sebagai *God Object* monolitik yang menggabungkan pg pool connection, local JSON store fallback atomic engine, User & Biometric repository, Strava OAuth & Token repository, Activities CRUD & Normalizer, Training Plans & Scheduled Workouts repository, Fitness Goals & Personal Records repository, serta Athlete Health, Injuries, Pain Logs, Medical Procedures, dan Readiness Access Layer dalam satu file raksasa.
2. **`src/components/training/ScheduleTrainingHub.tsx` (1,148 baris):** Menggabungkan visualisasi kalender 12 minggu, strip 4 macro objectives, panel pedoman pelatih Zone 2, kartu interaktif hari kalender (dengan status puasa sunnah dan buffer Sabtu), filter multi-fase & multi-olahraga, linear list view, serta workout detail prescription dossier modal.
3. **`src/components/health/AthleteHealthHub.tsx` (763 baris):** Menggabungkan 5 tab klinis kompleks (overview profil fisik, anatomical body map & injury dossier, longitudinal pain logs, strava responses, clinical assessments & return-to-sport criteria) serta form pendaftaran cedera baru dalam satu file monolitik.
4. **`src/components/health/EditAthleteProfileModal.tsx` (733 baris):** Menggabungkan formulir biometrik atlet (nama, umur, RHR, TB, BB, kalkulasi dinamis BMI, ketersediaan latihan mingguan) dengan formulir pencatatan prosedur medis dan tindakan fisioterapi dalam satu komponen besar.

**Prinsip & Sasaran Refactoring:**
- **Zero Behavior Regression:** Seluruh fungsionalitas, alur navigasi, dan antarmuka visual tetap 100% identik.
- **100% Backward Compatibility:** Menggunakan pola *facade barrel re-export* sehingga seluruh import lawas (`import { ... } from '@/lib/db'`) tetap berfungsi mulus tanpa satu pun impor yang rusak di 20+ file konsumen.
- **Clean Domain-Driven Decomposition:** Memecah komponen besar menjadi subkomponen fokus, modular, dan terisolasi dengan batas domain yang jelas.
- **Zero Compilation Errors & Full Test Coverage:** Memastikan `npx tsc --noEmit` lolos 0 error dan seluruh test suite (`test_coach_training_system.js`, `test_athlete_health_system.js`) lulus 100%.

---

## 2. Rincian Dekomposisi & Arsitektur Baru

### A. Modularisasi Lapisan Data: `src/lib/db/` & Facade `src/lib/db.ts`

File `src/lib/db.ts` yang awalnya berisi 2,174 baris direduksi menjadi **16 baris** sebagai facade barrel re-export:
```typescript
export * from './db/index';
export { default } from './db/index';
```

Seluruh logika akses data didekomposisi ke direktori `src/lib/db/`:
1. **`src/lib/db/client.ts` (248 baris):**
   - Inisialisasi PostgreSQL Connection Pool (`pg.Pool`) dengan TLS/SSL fleksibel.
   - Atomic file-backed fallback store (`.data/store.json`) dengan proteksi direktori otomatis.
   - Parser konfigurasi tipe data DATE PostgreSQL (OID 1082) untuk mencegah pergeseran timezone lokal.
   - Konstanta dasar `DEFAULT_USER_ID` dan helper `formatDateOnly()`.
2. **`src/lib/db/userRepo.ts` (145 baris):**
   - `getUser()`: Mengambil profil pengguna dan biometrik dasar.
   - `updateUserProfile()`: Memperbarui data pengguna dan biometrik atlet secara terkoordinasi (dengan penanganan aman kolom *PostgreSQL GENERATED ALWAYS AS* untuk BMI).
3. **`src/lib/db/stravaRepo.ts` (189 baris):**
   - Manajemen koneksi Strava OAuth: `getStravaConnection()`, `saveStravaConnection()`, `disconnectStrava()`.
   - Token & sinkronisasi: `saveStravaTokens()`, `getStravaToken()`, `getLastSyncLog()`, `createSyncLog()`.
4. **`src/lib/db/activityRepo.ts` (395 baris):**
   - `normalizeActivityRow()`: Penyeragaman tipe data baris aktivitas SQL/JSON.
   - CRUD & Pagination aktivitas: `getActivityById()`, `getAdjacentActivities()`, `updateActivity()`, `getActivities()`, `upsertActivity()`, `getLatestActivityDate()`.
   - `createManualActivity()`: Pencatatan aktivitas manual atau berbasis OCR, korelasi otomatis (*auto-matching*) dengan sesi terjadwal, dan pencatatan respon pasca-latihan atlet.
5. **`src/lib/db/trainingRepo.ts` (325 baris):**
   - Program latihan: `getTrainingPlans()`, `getActiveTrainingPlan()`, `createTrainingPlan()`, `deleteTrainingPlansByUserId()`.
   - Sesi terjadwal: `getScheduledWorkouts()`, `createScheduledWorkout()`, `updateScheduledWorkout()`, `deleteScheduledWorkout()`, `deleteScheduledWorkoutsByUserId()`.
   - Korelasi sesi & aktivitas nyata: `getWorkoutActivityMatches()`, `saveWorkoutActivityMatch()`.
6. **`src/lib/db/goalRepo.ts` (140 baris):**
   - Target kebugaran: `getFitnessGoals()`, `createFitnessGoal()`, `upsertFitnessGoal()`.
   - Rekor personal: `getPersonalRecords()`.
   - Diagnostik koneksi basis data: `getDatabaseStatus()`.
7. **`src/lib/db/healthRepo.ts` (405 baris):**
   - Profil kesehatan: `getAthleteProfile()`, `upsertAthleteProfile()`.
   - Dossier cedera: `getAthleteInjuries()`, `createAthleteInjury()`.
   - Log gejala & nyeri longitudinal: `getAthletePainLogs()`, `createAthletePainLog()`.
   - Telemetri latihan: `getAthleteTrainingResponses()`, `upsertAthleteTrainingResponse()`.
   - Asesmen klinis & prosedur medis: `getAthleteMedicalAssessments()`, `createAthleteMedicalAssessment()`, `recordMedicalProcedureAndAssessment()`.
   - Kesiapan & audit data: `getLatestAthleteReadiness()`, `saveAthleteReadiness()`, `logHealthAuditTrail()`, `getAuthoritativeHealthContext()`.
8. **`src/lib/db/index.ts` (28 baris):**
   - Barrel export terpusat yang menggabungkan seluruh repositori domain.

---

### B. Dekomposisi Komponen Jadwal Latihan: `src/components/training/`

File `src/components/training/ScheduleTrainingHub.tsx` didekomposisi dari 1,148 baris menjadi **~350 baris** sebagai koordinator kontainer yang bersih, dengan 4 subkomponen terisolasi:

1. **`src/components/training/MacroObjectivesStrip.tsx` (76 baris):**
   - Strip 4 kartu progres makro: *Road to 100 km Century Ride* (56.1%), *Jalur Maraton 10–20K Return-to-Run* (29.2%), *Intensitas Zone 2 Talk Test* (100%), dan *Jadwal Puasa Sunnah* (100% Selaras).
2. **`src/components/training/Zone2PacingGuidelinePanel.tsx` (55 baris):**
   - Panel panduan SOP resmi pelatih untuk latihan Zone 2 tanpa HRM pada sepeda MTB (Patokan RPE 3–4, Kunci Talk Test, Teknis Kadens MTB 85+ RPM, Proteksi Cedera & Puasa).
3. **`src/components/training/CalendarDayCard.tsx` (160 baris):**
   - Render spesifik per hari kalender: Kartu Puasa Sunnah (Senin & Kamis), Kartu Buffer Mingguan (Sabtu), Sesi Latihan Terjadwal (Lari Bertahap, Easy MTB, Upper Body/Rehab) dengan status badge terverifikasi Strava, serta Jeda Pemulihan.
4. **`src/components/training/WorkoutDossierModal.tsx` (137 baris):**
   - Pop-up modal resep presisi latihan: metrik terjadwal (durasi, estimasi jarak), arahan intensitas & talk test, panduan pacing zone 2 tanpa sensor denyut nadi, peringatan keselamatan sendi, status pencocokan sesi Strava, dan tombol pencatatan hasil aktivitas.

---

### C. Dekomposisi Pusat Kesehatan Atlet: `src/components/health/hub/`

File `src/components/health/AthleteHealthHub.tsx` direduksi dari 763 baris menjadi **~140 baris**, dengan memindahkan tab-tab independen ke dalam direktori `src/components/health/hub/`:

1. **`src/components/health/hub/ClinicalOverviewTab.tsx` (105 baris):**
   - Menampilkan matriks parameter fisik dasar terverifikasi (Usia, TB, BB, BMI, RHR 68 bpm) dan panel kebijakan anti-halusinasi ambang sensorik laboratorium (HRmax, LTHR, FTP, VO2max strictly unmeasured).
2. **`src/components/health/hub/InjuryDossierTab.tsx` (125 baris):**
   - Selector visual peta anatomis area gejala dan dossier terperinci untuk area tubuh terpilih (Engkel Kanan & Kedua Tempurung Lutut) lengkap dengan mekanisme cedera, durasi, dan catatan klinis.
3. **`src/components/health/hub/PainLogsTab.tsx` (55 baris):**
   - Pemantauan skala nyeri longitudinal (saat sesi, segera usai sesi, dan 24 jam setelah sesi).
4. **`src/components/health/hub/TrainingResponsesTab.tsx` (55 baris):**
   - Korelasi respon fisik terhadap aktivitas nyata Strava (skala nyeri, RPE, deteksi pembengkakan, instabilitas sendi, dan tingkat kelelahan).
5. **`src/components/health/hub/ClinicalAssessmentsTab.tsx` (55 baris):**
   - Status penilaian fisioterapi, kriteria formal *Return-to-Run*, dan pemicu modal tindakan medis.
6. **`src/components/health/hub/NewInjuryForm.tsx` (135 baris):**
   - Formulir terisolasi untuk pendaftaran riwayat atau gejala cedera baru atlet.

---

### D. Dekomposisi Modal Profil Atlet: `src/components/health/profile/`

File `src/components/health/EditAthleteProfileModal.tsx` direduksi dari 733 baris menjadi **~230 baris**, dengan ekstraksi subkomponen ke `src/components/health/profile/`:

1. **`src/components/health/profile/ProfileBiometricsTab.tsx` (140 baris):**
   - Pengaturan nama atlet, usia, detak jantung istirahat (RHR), tinggi badan, berat badan, visualisasi kartu BMI dinamis, dan pemilihan ketersediaan hari latihan mingguan.
2. **`src/components/health/profile/ProfileMedicalProceduresTab.tsx` (185 baris):**
   - Status pemeriksaan klinis sendi (ankle & knee evaluation status), formulir pencatatan tindakan fisioterapi baru, dan toggle persetujuan medis *Return-to-Run Medical Clearance*.

---

## 3. Hasil Pengujian & Verifikasi

Semua pengujian dan pengecekan tipe data dijalankan dan menunjukkan hasil 100% lulus tanpa kegagalan:

```bash
# 1. TypeScript Static Typecheck
npx tsc --noEmit
# Output: Exit code 0 (0 errors)

# 2. Coach Training & Grounded Indicators Test Suite
node scripts/test_coach_training_system.js
# Output:
# [PASS] Active Training Plan exists in DB
# [PASS] Scheduled workouts exist and include planned and completed sessions
# [PASS] Workouts include safe running return-to-run progression alongside cycling and rehab
# [PASS] Workout activity matching correlates real Strava sessions with prescribed workouts
# [PASS] Fitness goals grounded in real 100km Century & Marathon milestones
# Test Summary: 5 passed, 0 failed

# 3. Athlete Health & Readiness Verification Suite
node scripts/test_athlete_health_system.js
# Output:
# ✅ 11/11 Physical baseline & physiological unknowns passed
# ✅ 8/8 Injury history & diagnostic boundaries passed
# ✅ 6/6 Sport-specific readiness engine passed
# ✅ 5/5 Empirical activity response telemetry passed
# ✅ 2/2 Health data audit trail passed
# Test Summary: 32 passed, 0 failed

# 4. HTTP Server Endpoints Verification
# GET /training -> HTTP 200 OK
# GET /health -> HTTP 200 OK
# GET / -> HTTP 200 OK
# GET /api/athlete/health-context -> HTTP 200 (Success: true)
# GET /api/athlete/profile -> HTTP 200 (Success: true)
```

---

## 4. Ringkasan Pengurangan Baris Kode

| File / Modul Asal | Baris Awal | Baris Akhir | Subkomponen Hasil Dekomposisi |
|---|:---:|:---:|---|
| `src/lib/db.ts` | 2,174 | 16 | `client.ts` (248), `userRepo.ts` (145), `stravaRepo.ts` (189), `activityRepo.ts` (395), `trainingRepo.ts` (325), `goalRepo.ts` (140), `healthRepo.ts` (405), `index.ts` (28) |
| `src/components/training/ScheduleTrainingHub.tsx` | 1,148 | 350 | `MacroObjectivesStrip.tsx` (76), `Zone2PacingGuidelinePanel.tsx` (55), `CalendarDayCard.tsx` (160), `WorkoutDossierModal.tsx` (137) |
| `src/components/health/AthleteHealthHub.tsx` | 763 | 140 | `ClinicalOverviewTab.tsx` (105), `InjuryDossierTab.tsx` (125), `PainLogsTab.tsx` (55), `TrainingResponsesTab.tsx` (55), `ClinicalAssessmentsTab.tsx` (55), `NewInjuryForm.tsx` (135) |
| `src/components/health/EditAthleteProfileModal.tsx` | 733 | 230 | `ProfileBiometricsTab.tsx` (140), `ProfileMedicalProceduresTab.tsx` (185) |

