# Changelog: Pusat Intelijen Kesehatan Atlet, Dedicated Health Hub & Indikator Beban Biomekanis (`feat/health`)

- **Tanggal & Waktu**: 2026-11-02 11:05:00 WIB
- **Tipe**: `feat(health)` / `feat(domain)` / `feat(ui)` / `feat(db)` / `feat(ai)`
- **Commit Message**: `feat(health): implement athlete health hub, injury tracking, and biomechanical load readiness indicator`
- **Branch**: `feat/health`

---

## 1. Latar Belakang & Kebutuhan Atlet

Sebelum implementasi ini, platform merekomendasikan program latihan (seperti sesi lari tempo dan lari jarak jauh) murni berdasarkan histori jarak dan kecepatan Strava tanpa mempertimbangkan kondisi fisik riil atlet, riwayat cedera, dan gejala nyeri subjektif pasca latihan.

Karakteristik & profil klinis atlet nyata:
- **Profil Fisik Terverifikasi**: Usia 22 tahun, TB 170 cm, BB 65 kg, BMI 22.5 (eutrofik), RHR 68 bpm, ketersediaan latihan 2–3 hari/minggu, cabang olahraga utama lari dan sepeda.
- **Asimetri Toleransi Beban Biomekanis (*Sport-Specific Tolerance*)**: Atlet berhasil menuntaskan sesi bersepeda 56.10 km (durasi 2 jam 37 menit) tanpa rasa sakit selama atau setelah sesi, serta nihil pembengkakan. Sebaliknya, benturan hentakan (*impact shock*) pada sesi lari memicu ketidaknyamanan pada persendian.
- **Dossier Cedera Aktif**:
  1. **Engkel Kanan (*Right Ankle*)**: Akibat salah mendarat saat bermain basket (3–6 bulan lalu) dengan riwayat pembengkakan akut ~2 bulan. Status: `PENDING_CLINICAL_ASSESSMENT`.
  2. **Lutut Anterior Bilateral (*Bilateral Anterior Knees*)**: Rasa tidak nyaman ringan di bagian depan kedua lutut di sekitar tempurung yang timbul pasca lari jarak jauh. Status: `PENDING_CLINICAL_ASSESSMENT`.

Kebutuhan antarmuka & rekayasa sistem:
1. **Pemisahan Peran Antarmuka (Separation of Concerns)**:
   - Dashboard utama (`/`) tidak boleh menimbun teks medis statis, melainkan harus berfungsi sebagai **Indikator Beban Biomekanis & Kesiapan Latihan Harian (*Biomechanical Load Gate*)** yang aktif dan memandu keputusan latihan saat ini.
   - Detail riwayat cedera, biomekanika, pemantauan nyeri longitudinal, dan rekam jejak klinis dipindahkan ke **Halaman Khusus Profil Kesehatan Atlet (`/health`)**.
2. **Kepatuhan Terhadap Kebijakan Keselamatan & Batas Hukum**:
   - Sistem berfungsi murni sebagai pendukung keputusan latihan keolahragaan (*sports decision-support*), bukan alat diagnosis medis atau pemberi izin mandiri bertanding (*return-to-sport clearance*).
   - Menolak keras mendiagnosis mandiri (misal: patellofemoral pain syndrome).
   - Kebijakan anti-fabrikasi data: metrik fisiologis laboratorium yang belum teruji (`hr_max`, `lthr`, `ftp_watts`, `vo2_max`) disimpan eksplisit sebagai `null`.

---

## 2. Rincian Implementasi & Rekayasa Sistem

### A. Skema Basis Data Relasional PostgreSQL 16 (`schema.sql` & `scripts/migrate_health_schema.js`)
Menambahkan 7 tabel relasional terkelola dengan UUID Primary Keys, Foreign Key constraints, dan indeks optimasi kueri:
1. **`athlete_profiles`**: Menyimpan profil fisik dasar dan metrik fisiologis yang divalidasi.
2. **`athlete_injuries`**: Menyimpan rekam jejak cedera mendalam (area tubuh, sisi, mekanisme trauma, rentang waktu, keparahan awal, riwayat pembengkakan, keterbatasan fungsional, dan status klinis).
3. **`athlete_pain_logs`**: Pencatatan longitudinal gejala nyeri (saat sesi, segera sesudah sesi, dan 24 jam pasca beban, serta pemantauan bengkak/instabilitas).
4. **`athlete_training_responses`**: Check-in subjektif atlet pasca aktivitas yang terhubung dengan data sesi Strava.
5. **`athlete_medical_assessments`**: Catatan penilaian klinis formal dari tenaga fisioterapis/dokter spesialis.
6. **`athlete_training_readiness`**: Catatan kesiapan latihan multi-sport hasil evaluasi mesin kesiapan deterministik.
7. **`health_audit_trail`**: Jejak audit tidak terhapuskan (*immutable audit log*) untuk setiap transisi status kesehatan dan izin latihan.

### B. Mesin Kesiapan Deterministik & Safety Gatekeeper (`src/lib/readinessEngine.ts`)
- **Pemisahan Kesiapan Berdasarkan Olahraga**:
  - **Running Readiness**: Berstatus **`ON_HOLD`** karena adanya gejala aktif pada engkel dan lutut yang belum dievaluasi secara klinis. Progresi volume otomatis dikunci (`automatic_progression_allowed = false`).
  - **Cycling Readiness**: Berstatus **`CONDITIONAL`** karena beban putaran tertutup tanpa benturan (*closed-chain low impact*) terbukti ditoleransi dengan sangat baik pada sesi 56.10 km (0 nyeri, tanpa pembengkakan).
- **Safety Validation Gatekeeper (`validateWorkoutSafety`)**:
  - Mengevaluasi setiap rencana latihan sebelum diterbitkan ke dashboard.
  - Memblokir proposal lari intensitas tinggi, interval, dan lari jarak jauh selama status lari `ON_HOLD`.
  - Mengizinkan latihan bersepeda aerobik di Zona 1–2 dengan durasi terkendali ($\le 60\text{ menit}$, jarak $\le 30\text{ km}$, medan datar, kadens lancar $\ge 85\text{ RPM}$).

### C. Halaman Khusus Profil & Dossier Kesehatan Atlet (`/health`)
- File rute: `src/app/health/page.tsx`
- Komponen interaktif: `src/components/health/AthleteHealthHub.tsx`
- Terdiri atas 5 Tab Segmented Telemetri:
  1. **1. Profil Fisik & Kalibrasi**: Matriks parameter antropometri (Usia 22, TB 170 cm, BB 65 kg, BMI 22.5, RHR 68 bpm) dan penanda jelas *Unmeasured* untuk ambang sensor laboratorium.
  2. **2. Peta Anatomi & Dossier Cedera**: Selektor interaktif area tubuh (lutut anterior bilateral & engkel kanan) dengan tampilan detail dossier klinis dan formulir interaktif pendaftaran riwayat cedera baru.
  3. **3. Log Gejala Nyeri**: Pemantauan longitudinal skala nyeri 0–10 (saat latihan, segera usai, dan respons fase laten 24 jam).
  4. **4. Respons Strava**: Korelasi empiris antara aktivitas Strava aktual dan laporan subjektif toleransi sendi.
  5. **5. Catatan Medis & Return-to-Sport**: Standar objektif pemulihan (*single-leg calf raises*, *balance test*, dan persetujuan klinisi).

### D. Indikator Beban Biomekanis di Dashboard Utama (`src/components/health/AthleteHealthDeck.tsx`)
- Menggantikan tampilan teks medis lama dengan **Indikator Beban Biomekanis Aktif (*Biomechanical Load Gate*)**:
  - **Gauge Kapasitas Lari (0% / ON_HOLD)**: Indikator merah/volt yang memperingatkan penghentian sementara latihan benturan.
  - **Gauge Kapasitas Sepeda (60% / CONDITIONAL)**: Indikator cyan untuk zona pemeliharaan kebugaran kardiovaskular putaran tertutup.
  - **Direktif Harian Terarah**: Daftar tindakan yang dilarang (*Blocked*) dan diizinkan (*Permitted*).
  - **Tombol Check-In Pasca Latihan**: Membuka modal pelaporan gejala (`PostActivityCheckinModal.tsx`).
  - **Tautan Navigasi**: Akses cepat menuju halaman `/health`.

### E. Integrasi AI Coach Core & API Endpoints (`src/lib/ai-coach.ts` & `src/app/api/athlete/*`)
- Mengintegrasikan konteks kesehatan otoritatif ke dalam `generateTrainingInsights`:
  - **Running Coach**: Menerapkan penghentian sesi lari dan mengarahkan fokus ke pemulihan struktural.
  - **Cycling Coach**: Memberikan panduan sesi sepeda aerobik Zona 1–2 dan melarang tanjakan terjal bertorsi tinggi.
  - **Multi-Sport Coordinator**: Mengorkestrasi pemeliharaan kebugaran kardiovaskular melalui sepeda selama pemulihan engkel/lutut.
- REST API Endpoints:
  - `GET /api/athlete/health-context`: Mengambil status kesehatan otoritatif atlet.
  - `POST /api/athlete/checkin`: Menerima laporan gejala pasca latihan dan menghitung ulang kesiapan secara otomatis.
  - `POST /api/athlete/injuries`: Menyimpan dossier cedera baru dengan pencatatan jejak audit.

---

## 3. Hasil Pengujian & Verifikasi

- **Test Suite Otomatis (`scripts/test_athlete_health_system.js`)**:
  - **32 Passed, 0 Failed**.
  - Terverifikasi pemisahan kesiapan: Running `ON_HOLD` dan Cycling `CONDITIONAL`.
  - Terverifikasi ketiadaan fabrikasi diagnosis dan metrik sensorik lab.
  - Terverifikasi penguncian progresi beban (*automatic progression locked*).
- **Kompilasi TypeScript**: `npx tsc --noEmit` sukses dengan exit code 0 tanpa error.
- **Verifikasi SSR & Streaming**:
  - `http://localhost:3000/`: Berhasil merender Indikator Beban Biomekanis dan tautan ke `/health` (HTTP 200 OK).
  - `http://localhost:3000/health`: Berhasil merender Pusat Intelijen Kesehatan Atlet, Peta Anatomi, dan 5 Tab Interaktif (HTTP 200 OK).
- **Rute yang Dihasilkan**:
  - `◐ /` (Partial Prerender with Biomechanical Load Indicator)
  - `◐ /health` (Partial Prerender with Interactive Athlete Health Hub)
  - `◐ /activities/[id]` (Telemetry Activity Detail View)

