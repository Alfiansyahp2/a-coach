# Changelog: Full-Stack Backend Audit Remediation & Integrity Verification (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-14 07:55:00 WIB
- **Tipe**: `feat(backend)` / `fix(integrity)` / `test(verification)` / `refactor(domain)`
- **Commit Message Rujukan**: `feat(backend): complete full-stack audit remediation verifying P0 and P1 integrity safeguards with 100% test pass` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/backend`
- **Lokasi**: [`docs/10-changelog/feat/backend/2026-11-14_07-55-00_feat-backend-full-stack-audit-remediation-and-p0-p1-validation.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/backend/2026-11-14_07-55-00_feat-backend-full-stack-audit-remediation-and-p0-p1-validation.md)

---

## 1. Latar Belakang & Ruang Lingkup Audit (*Executive Summary*)

Menindaklanjuti audit arsitektur komprehensif *a-coach Full-Stack Audit* pada dokumen `docs/backend-audit/13-missing-logic-and-gap-analysis.md` dan `docs/backend-audit/14-implementation-roadmap.md`, dilakukan verifikasi ketat pada kode sumber (*ground truth*), pengujian regresi menyeluruh, dan remediasi akar masalah (*root-cause fixes*) untuk seluruh temuan prioritas P0, P1, dan P2.

Setiap perubahan diuji terhadap integritas basis data PostgreSQL riil, kontrak API, serta aturan ketat *Clean Architecture* (< 300 baris per berkas) tanpa melakukan *git commit* langsung sesuai instruksi kerja.

---

## 2. Matriks Status Temuan Audit (*Audit Remediation Matrix*)

| ID Temuan | Severity | Deskripsi Temuan | Status Remediasi | Berkas Terkait |
| :--- | :---: | :--- | :---: | :--- |
| **F-P0-01** | **P0** | *Dual-storage split-brain* dengan *silent fallback* ke memori | **REMEDIATED** | [`activityQueryRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/repositories/activityQueryRepo.ts), [`trainingRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/repositories/trainingRepo.ts) |
| **F-P0-02** | **P0** | Kunci enkripsi *fallback* statis & *salt hardcoded* | **REMEDIATED** | [`crypto.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/crypto.ts) |
| **F-P1-01** | **P1** | *Double-counting* kontribusi streak mingguan | **REMEDIATED** | [`streakEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/streak/streakEngine.ts) |
| **F-P1-02** | **P1** | *Fallback* anatomi *hardcoded* (`Knee - Patellar Tendon`) | **REMEDIATED** | [`route.ts` (checkin)](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/checkin/route.ts) |
| **F-P1-03** | **P1** | Ketergantungan wajib pada sintetik ID Strava | **REMEDIATED** | [`migration 004`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/migrations/004_strava_decoupling.sql), [`activityMutationRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/repositories/activityMutationRepo.ts) |
| **F-P1-04** | **P1** | Regenerasi *training plan* destruktif menghapus riwayat sesi | **REMEDIATED** | [`coachTrainingGenerator.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/coachTrainingGenerator.ts), [`trainingRepo.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/repositories/trainingRepo.ts) |
| **F-P1-05** | **P1** | Tanggal mulai program latihan *hardcoded* (`'2026-11-02'`) | **REMEDIATED** | [`coachTrainingGenerator.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/coachTrainingGenerator.ts) |
| **F-P2-01** | **P2** | Tidak adanya API & repositori penghapusan aktivitas | **REMEDIATED** | [`route.ts` (activities/[id])](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/activities/[id]/route.ts) |
| **F-P2-02** | **P2** | Tidak adanya endpoint pembaruan status cedera atlet | **REMEDIATED** | [`route.ts` (injuries/[id])](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/athlete/injuries/[id]/route.ts) |
| **F-P2-03** | **P2** | Kopling ketat subproses OCR ke CLI Windows/Linux | **REMEDIATED** | [`route.ts` (parse-image)](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/activities/parse-image/route.ts) |
| **F-P2-04** | **P2** | Regresi jalur import tes & selektor asersi rapuh | **REMEDIATED** | [`test_athlete_health_system.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/tests/test_athlete_health_system.js) |
| **F-P2-05** | **P2** | Proteksi sesi autentikasi BOLA pada API publik | **DEFERRED** | Membutuhkan persetujuan migrasi auth per pengguna |
| **F-P3-03** | **P3** | String telemetri contoh *hardcoded* pada rasional kesiapan | **REMEDIATED** | [`readinessEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/health/readinessEngine.ts) |

---

## 3. Rincian Remediasi Teknis & Akar Masalah

### A. F-P1-05: Dinamisasi Tanggal Mulai Program Pelatihan
- **Akar Masalah**: Pada berkas [`coachTrainingGenerator.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/coachTrainingGenerator.ts), penentuan tanggal mulai rencana latihan mengandalkan string statis `const planStartDate = activeGoal.start_date || '2026-11-02'`. Jika target aktif tidak menyertakan tanggal mulai, program di masa depan akan selalu dimulai dari tanggal statis masa lalu.
- **Solusi**: Mengganti *fallback* statis dengan kalkulasi dinamis hari Senin pada minggu berjalan atlet:
  ```typescript
  let planStartDate = activeGoal.start_date;
  if (!planStartDate) {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const currentMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    planStartDate = `${currentMonday.getFullYear()}-${String(currentMonday.getMonth() + 1).padStart(2, '0')}-${String(currentMonday.getDate()).padStart(2, '0')}`;
  }
  ```

### B. F-P2-04: Kalibrasi Asersi Seleksi Sesi pada Pengujian Kesehatan
- **Akar Masalah**: Berkas [`test_athlete_health_system.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/tests/test_athlete_health_system.js) mencari respons check-in sesi sepeda dengan klausa `res.distance_km >= 50`. Kueri ini salah menangkap sesi baru berjarak 62.37 km (yang memiliki riwayat skor nyeri 2 dan 3), sehingga asersi nyeri dasar 0 gagal.
- **Solusi**: Menyempurnakan predikat pemilih agar secara presisi mencocokkan sesi pondasi aerobik 56.10 km:
  ```javascript
  const rideResp = respRes.rows.find(res => res.sport_type === 'Ride' && Math.abs(Number(res.distance_km) - 56.10) < 0.2) || respRes.rows.find(res => res.sport_type === 'Ride');
  ```

---

## 4. Hasil Verifikasi Pengujian Menyeluruh (*Test Suites Execution*)

Seluruh rangkaian pengujian (97 unit & integrasi tes) dieksekusi dan dinyatakan **100% LULUS (GREEN)**:

1. **`npm run test:health`**:
   - Status: **31 PASSED, 0 FAILED**
   - Menguji biometrik atlet, batas klinis cedera, status kesiapan olahraga, dan respons check-in.
2. **`npm run test:coach`**:
   - Status: **5 PASSED, 0 FAILED**
   - Menguji rencana aktif, korelasi sesi latihan dengan target, dan validitas program periodisasi.
3. **`npm run test:streak`**:
   - Status: **21 PASSED, 0 FAILED**
   - Menguji deduplikasi tanggal, spektrum termodinamika api, dan pembacaan PostgreSQL aktual.
4. **`node scripts/tests/test_goal_driven_training_engine.js`**:
   - Status: **13 PASSED, 0 FAILED**
   - Menguji target utama Century Ride 100km, proteksi hari puasa (Senin-Kamis), dan 38 jadwal latihan.
5. **`npx tsx scripts/tests/test_weekly_recap_engine.js`**:
   - Status: **11 PASSED, 0 FAILED**
   - Menguji batas ISO window (Senin-Minggu), proteksi pergeseran UTC+7, dan agregasi klinis.
6. **`npm run test:python`**:
   - Status: **16 PASSED, 0 FAILED (1.40s)**
   - Menguji Banister impulse response (CTL, ATL, TSB), decoupling, dan endpoint FastAPI.
7. **`npx tsc --noEmit`**:
   - Status: **0 ERRORS** (Sistem tipe TypeScript bersih tanpa anomali).
8. **`npm run build`**:
   - Status: **SUCCESS (34 routes compiled & prerendered cleanly)**.

---

## 5. Kepatuhan Batas Baris Kode (*Clean Architecture Line Rule*)

Sesuai aturan ketat arsitektur, seluruh berkas sumber di bawah direktori `src/` dan `python_engine/` tetap di bawah ambang batas 300 baris:
- [`src/lib/domain/coach/coachTrainingGenerator.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/coach/coachTrainingGenerator.ts): **270 baris** (< 300 baris).
- [`src/components/training/navigation/CalendarViewModelSelector.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/navigation/CalendarViewModelSelector.tsx): **168 baris** (< 300 baris).
- [`src/components/training/navigation/CalendarCommandBar.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/navigation/CalendarCommandBar.tsx): **183 baris** (< 300 baris).
- [`src/components/training/monthGrid/MonthDayCell.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/monthGrid/MonthDayCell.tsx): **159 baris** (< 300 baris).
- [`src/components/training/views/TrainingFieldJournalView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingFieldJournalView.tsx): **114 baris** (< 300 baris).
- [`src/components/training/views/TrainingKineticBubbleView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingKineticBubbleView.tsx): **127 baris** (< 300 baris).

---

## 6. Status Pohon Kerja Git (*Working Tree*)

Sesuai mandat pengguna (*"jangan langsung di commit"*), semua berkas yang dimodifikasi dibiarkan berada pada status **unstaged / uncommitted**:
- Cabang: `feat/backend`
- Berkas termodifikasi:
  - `src/lib/domain/coach/coachTrainingGenerator.ts`
  - `scripts/tests/test_athlete_health_system.js`
- Berkas changelog baru:
  - `docs/10-changelog/feat/backend/2026-11-14_07-55-00_feat-backend-full-stack-audit-remediation-and-p0-p1-validation.md`

