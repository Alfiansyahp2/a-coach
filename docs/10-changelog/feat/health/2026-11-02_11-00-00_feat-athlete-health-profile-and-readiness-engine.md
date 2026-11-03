# Changelog: Athlete Health Profile, Injury History & Training Readiness Intelligence System (`feat/health`)

- **Tanggal & Waktu**: 2026-11-02 11:00:00 WIB
- **Tipe**: `feat(health)` / `feat(domain)` / `feat(ai)` / `feat(ui)` / `feat(db)`
- **Commit Message**: `feat(health): implement athlete health profile, injury tracking, and deterministic readiness engine`
- **Branch**: `feat/health`

---

## 1. Latar Belakang & Masalah Sistem

Sebelum implementasi ini, platform merekomendasikan program latihan (misalnya sesi lari tempo dan lari jarak jauh) murni berdasarkan histori jarak dan kecepatan Strava tanpa mempertimbangkan:
1. Riwayat cedera fisik nyata atlet.
2. Gejala nyeri subjektif (*pain logs*) saat dan sesudah latihan.
3. Asimetri toleransi beban olahraga (*sport-specific tolerance*): kemampuan bersepeda 56.10 km tanpa nyeri berbanding terbalik dengan dampak benturan lari yang memicu ketidaknyamanan.
4. Ketiadaan *Safety Validation Gate* yang memblokir rencana latihan berbahaya sebelum dipublikasikan.

---

## 2. Rincian Implementasi & Rekayasa Sistem

### A. Skema Basis Data Relasional PostgreSQL 16 (`schema.sql` & `scripts/migrate_health_schema.js`)
Menambahkan 7 tabel relasional terkelola dengan UUID Primary Keys dan Foreign Key constraints:
1. **`athlete_profiles`**: Menyimpan profil fisik dasar (Usia 22, TB 170cm, BB 65kg, BMI 22.5, RHR 68 bpm, Ketersediaan 2–3 hari/minggu) serta menyimpan metrik fisiologis yang belum terukur (`hr_max`, `lthr`, `ftp_watts`, `vo2_max`) secara eksplisit sebagai `null`.
2. **`athlete_injuries`**: Menyimpan riwayat cedera engkel kanan (akibat pendaratan basket 3–6 bulan lalu, bengkak ~2 bulan, status `PENDING_CLINICAL_ASSESSMENT`) dan nyeri lutut anterior bilateral pasca lari jarak jauh (status `PENDING_CLINICAL_ASSESSMENT`).
3. **`athlete_pain_logs`**: Pelacakan longitudinal nyeri (saat, segera sesudah, dan 24 jam setelah sesi, serta pemantauan bengkak/ketidakstabilan sendi).
4. **`athlete_training_responses`**: Check-in subjektif atlet pasca latihan yang tertaut langsung ke entitas aktivitas Strava.
5. **`athlete_medical_assessments`**: Catatan penilaian klinis formal dari tenaga medis profesional.
6. **`athlete_training_readiness`**: Catatan kesiapan latihan multi-sport hasil evaluasi mesin kesiapan deterministik.
7. **`health_audit_trail`**: Pencatatan audit trail menyeluruh untuk setiap perubahan status kesehatan atlet.

### B. Mesin Kesiapan Latihan Deterministik (`src/lib/readinessEngine.ts`)
- Memisahkan kesiapan lari (*Running Readiness*) dan sepeda (*Cycling Readiness*) secara mandiri:
  - **Running Readiness**: Ditetapkan secara deterministik pada status **`ON_HOLD`** karena adanya gejala engkel dan lutut aktif yang belum dievaluasi klinis. Progresi beban bertahap (*progressive overload*) dikunci (`automatic_progression_allowed = false`).
  - **Cycling Readiness**: Ditetapkan pada status **`CONDITIONAL`** karena beban putaran tertutup tanpa benturan terbukti ditoleransi dengan baik pada sesi 56.10 km (0 nyeri, tanpa bengkak).
- Menerapkan fungsi *gatekeeper* `validateWorkoutSafety`:
  - Memvalidasi setiap proposal sesi latihan dari AI Coach.
  - Memblokir latihan lari intensitas tinggi saat status masih `ON_HOLD`.
  - Menggantikan latihan yang diblokir dengan rekomendasi istirahat aktif atau latihan mobilitas.

### C. Integrasi AI Coaching Core (`src/lib/ai-coach.ts`)
- Memperbarui fungsi `generateTrainingInsights` untuk menyerap `AuthoritativeAthleteHealthContext`.
- Menginjeksi perspektif spesialis:
  - **Running Coach**: Menghentikan sesi lari dan menjelaskan dasar keselamatan (*safety gate notice*).
  - **Cycling Coach**: Memberikan panduan sesi sepeda aerobik Zona 1–2 ($\le 30\text{ km}$, $\le 60\text{ menit}$) dan melarang tanjakan terjal/sprint bertorsi tinggi.
  - **Multi-Sport Coordinator**: Menyeimbangkan pemeliharaan kebugaran kardiovaskular melalui sepeda saat pemulihan engkel/lutut berlangsung.

### D. REST API Endpoints (`src/app/api/athlete/*`)
1. **`GET /api/athlete/health-context`**: Mengembalikan konteks kesehatan otoritatif terpadu.
2. **`POST /api/athlete/checkin`**: Menerima respons pasca sesi (nyeri 0–10, bengkak, instabilitas, RPE Borg CR10) dan memicu kalkulasi ulang status kesiapan secara otomatis.
3. **`POST /api/athlete/injuries`**: Mendaftarkan atau memperbarui rekam jejak cedera dengan pencatatan audit.

### E. Antarmuka Dashboard Telemetri (`src/components/health/*`)
1. **`AthleteHealthDeck.tsx`**:
   - Kartu ganda kesiapan olahraga: Running (`ON_HOLD` Volt/Red) dan Cycling (`CONDITIONAL` Cyan).
   - Strip kalibrasi fisik dan penanda jelas bahwa metrik laboratorium (FTP, VO2max, HRmax) berstatus *Unmeasured* (bebas fabrikasi fiktif).
   - Dossier klinis aktif untuk cedera engkel kanan dan lutut anterior bilateral.
   - Peringatan hukum dan batas klinis: sistem sebagai pendukung keputusan latihan, bukan diagnosis medis.
2. **`PostActivityCheckinModal.tsx`**:
   - Modal interaktif untuk pelaporan gejala pasca latihan dengan slider skala nyeri, sakelar bengkak/instabilitas, dan skor RPE.

---

## 3. Hasil Pengujian & Verifikasi

1. **Test Suite Otomatis (`scripts/test_athlete_health_system.js`)**:
   - **32 Passed, 0 Failed**.
   - Terverifikasi pemisahan kesiapan: Running `ON_HOLD` dan Cycling `CONDITIONAL`.
   - Terverifikasi ketiadaan diagnosis buatan AI (tidak mendiagnosis patellofemoral pain syndrome).
   - Terverifikasi penguncian progresi volume (`automatic_progression_allowed = false`).
2. **Verifikasi Kompilasi TypeScript**:
   - `npx tsc --noEmit` sukses dengan exit code 0 tanpa error.
3. **Verifikasi SSR & API**:
   - Respon stream `http://localhost:3000/` berhasil merender `Athlete Health Profile`, `Running Readiness Gate (ON_HOLD)`, dan `Cycling Readiness Gate (CONDITIONAL)`.
   - Endpoint `GET /api/athlete/health-context` merespons `200 OK` dengan data otoritatif.

