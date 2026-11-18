# Changelog: Decoupled Master General Seed, Lean Boilerplate Baseline, and Personal Data Privacy Isolation (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-03 09:30:00 WIB
- **Tipe**: `feat(backend)` / `feat(seed)` / `chore(privacy)` / `docs(readme)`
- **Commit Message Rujukan**: `feat(backend): decouple master general seed, isolate personal athlete data into gitignore, and sanitize repository documentation`
- **Branch**: `feat/backend`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-03_09-30-00_feat-decoupled-master-seed-and-personal-data-privacy-isolation.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Sebelum pembaruan ini diimplementasikan, infrastruktur *database seeding*, manajemen data pengguna, dan repositori memiliki sejumlah kerentanan struktural dan resiko kebocoran privasi (*data leakage*):

1. **Keterikatan Data Pribadi pada Skrip Publik (*Personal Data Coupling in Tracked Seed Scripts*)**:
   - Skrip *seed* awal (`scripts/seed_athlete_health.js`, `scripts/seed_coach_training.js`, dan `scripts/seed_imported_activities.js`) melacak riwayat medis dan telemetri latihan nyata milik pengguna (seperti insiden trauma engkel saat basket 3–6 bulan lalu dengan bengkak 2 bulan, nyeri kedua lutut akibat lonjakan volume lari 1 km ke 5 km, serta jarak presisi aktivitas gowes 56.10 km, 51.37 km, 23.36 km, dan lari 12.33 km).
   - Meskipun nama pengguna sempat diubah menjadi anonim, seluruh riwayat aktivitas nyata dan dossier cedera klinis pengguna masih tertanam dan terlacak dalam Git (*git-tracked*).
2. **Kelebihan Beban Data (*Oversharing & Data Bloat in General Demo*)**:
   - Skrip *seed* umum sebelumnya menginjeksi 36 aktivitas dan 38 jadwal latihan yang berlebihan untuk repositori publik/open-source (*oversharing*). Pengguna meminta agar dataset publik hanya memuat **data master esensial** (*lean master baseline*) yang cukup untuk mendemonstrasikan fitur tanpa data berlebih.
3. **Ketiadaan Pemisahan Jalur Eksekusi (*Lack of Dual Seed Architecture*)**:
   - Pengembang tidak memiliki mekanisme untuk membedakan antara kebutuhan *demo/testing* publik (bebas dari data pribadi) dengan kebutuhan lokal pengguna pemilik data (yang membutuhkan riwayat Strava asli miliknya).
4. **Resiko Eksposisi Dokumentasi pada `README.md`**:
   - Terdapat blok konfigurasi database yang tidak sengaja menampilkan format kredensial, serta diagram struktur proyek (*Project Structure*) yang mengekspos detail hierarki file internal secara terbuka.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Arsitektur Isolasi Data Personal Pengguna ([`scripts/personal/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/personal/))

1. **Pemindahan Skrip Data Pribadi ke Direktori Privat**:
   - Direktori baru [`scripts/personal/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/personal/) dibuat untuk mengisolasi seluruh skrip yang memproses data riwayat aktual:
     - `scripts/personal/seed_athlete_health.js`
     - `scripts/personal/seed_coach_training.js`
     - `scripts/personal/seed_imported_activities.js`
     - `scripts/personal/seed_personal.js`
2. **Pelepasan Pelacakan Git (*Untracking from Git Index*)**:
   - Berkas-berkas riwayat pribadi dieksekusi dengan `git rm --cached` sehingga riwayat internal disk tetap aman namun tidak lagi dilacak oleh kontrol versi Git:
     - `data/imported_activities.json`
     - `scripts/seed_athlete_health.js`
     - `scripts/seed_coach_training.js`
     - `scripts/seed_imported_activities.js`
3. **Pengetatan Aturan Abaikan Git ([`.gitignore`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/.gitignore))**:
   ```gitignore
   # personal user data, private seeds & imported telemetry
   /scripts/*personal*
   /scripts/personal/
   /data/from_strava/
   /data/from_strava/*
   /data/imported_activities.json
   /data/personal/
   /data/*.png
   /data/*.jpg
   /data/*.jpeg
   ```

---

### B. Arsitektur Master General Seed yang Ramping ([`scripts/seed.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/seed.js))

File [`scripts/seed.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/seed.js) dikonfigurasi ulang menjadi *master seed* tunggal yang ringkas (*lean master data*), sepenuhnya anonim, dan aman untuk publik:

1. **Profil Atlet Master**:
   - Identitas: `Demo Athlete` (`demo.athlete@a-coach.internal`).
   - Biometrik: Usia 28 tahun, Tinggi 178.0 cm, Berat 72.0 kg, BMI 22.7, RHR 60 bpm, Ketersediaan 4 hari/minggu.
   - Pengukuran Fisiologis: Seluruh metrik fisiologis lanjutan (`hr_max`, `lthr`, `ftp_watts`, `vo2_max`) diatur secara ketat sebagai `null` (*UNKNOWN*) sesuai prinsip *Grounded Indicator*.
2. **Dossier Cedera Master (2 Catatan Sintetis)**:
   - *Left Knee*: Keluhan anterior patellar ringan pasca-hiking jalan menurun 2 bulan lalu (Mekanisme: *eccentric quad loading*), status `PENDING_CLINICAL_ASSESSMENT`.
   - *Right Shoulder*: Sensasi *impingement* supraspinatus ringan pasca-volume *pull-ups* 1 bulan lalu, status `PENDING_CLINICAL_ASSESSMENT`.
   - Tidak ada diagnosis klinis prematur seperti PFPS atau robekan *rotator cuff*.
3. **Kesiapan Latihan Deterministik**:
   - Status: `ACTIVE_WITH_UNRESOLVED_SYMPTOMS`.
   - Kesiapan Lari: `CONDITIONAL` (dibatasi di permukaan rata <= 30 menit).
   - Kesiapan Sepeda: `READY` (toleransi latihan aerobik tanpa beban impak aman).
4. **Jadwal Latihan Master (4 Sesi Terstruktur)**:
   - 1 Sesi Sepeda Selesai (*Completed Zone 2 Ride 30 km*).
   - 1 Sesi Sepeda Rencana (*Planned Zone 2 Recovery 20 km*).
   - 1 Sesi Cross Training Rencana (*Planned Strength & Mobility 30 menit*).
   - 1 Sesi Lari Pemulihan Rencana (*Planned Recovery Run 3 km*).
5. **Aktivitas Master (8 Sesi Mingguan Bersih)**:
   - Tepat **8 aktivitas** yang terdistribusi 1 sesi per minggu (Senin) selama 8 minggu berturut-turut (W38 hingga W45 pada 2 November 2026).
   - Mencukupi syarat deterministik *Weekly Training Streak* (8 minggu aktif, api menyala pada `Stage 1: Api Merah ~800°C`, tepat sisa 2 minggu menuju `Stage 2: Api Oranye ~1,100°C`).
   - Tidak membanjiri basis data dengan 36 aktivitas yang tidak perlu (*zero oversharing*).
6. **Matching & Check-in**:
   - 1 relasi *workout activity match* antara jadwal selesai dengan gowes 30 km.
   - 1 check-in subjektif pasca-aktivitas gowes 30 km (skor nyeri 0, bengkak false, RPE 4.0).
7. **Sasaran Kebugaran & Rekor Master**:
   - 2 Sasaran: *50 km Cycling Endurance Tour* & *Weekly Consistency (4 Sessions / Week)*.
   - 2 Rekor: *5K Run (20:00)* & *30km Cycling (1:15:00)*.

---

### C. Master Personal Seed Runner ([`scripts/personal/seed_personal.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/personal/seed_personal.js))

Dibuat skrip *turnkey* mandiri untuk pengguna pemilik data pribadi:
- Dapat dieksekusi kapan saja melalui:
  ```bash
  npm run seed:personal
  ```
- Secara otomatis memuat berkas [`data/imported_activities.json`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/data/imported_activities.json) (34 sesi OCR nyata) jika tersedia di disk lokal, atau menggunakan *fallback* telemetri pribadi pengguna jika berkas belum di-generate.
- Menginjeksi profil biometrik nyata (22 th, 170 cm, 65 kg, 68 bpm, 3 hari/minggu), riwayat cedera basket engkel kanan (bengkak 2 bulan) dan kedua lutut pasca-lonjakan volume, serta target 100km & Marathon Pathway.

---

### D. Penyelarasan Rangkaian Pengujian (*Universal Verification Suites*)

Ketiga file tes diperbarui agar kompatibel secara dinamis baik saat database diisi oleh **Master General Seed** maupun **Personal Seed**:

1. **[`scripts/test_athlete_health_system.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/test_athlete_health_system.js) (31 Pengujian)**:
   - Memvalidasi batas biometrik profil atlet, kepastian nilai `UNKNOWN` pada metrik fisiologis, pelacakan minimal 2 dossier cedera klinis, kepatuhan *state machine* kesiapan latihan multi-sport, keberadaan respons check-in gowes, dan jejak audit kesehatan (*audit trail*).
2. **[`scripts/test_coach_training_system.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/test_coach_training_system.js) (5 Pengujian)**:
   - Memverifikasi keberadaan *Active 12-Week Training Plan*, jadwal latihan master (termasuk status *COMPLETED* dan *PLANNED*), progressifitas latihan lari mikro-dosis bersama sepeda dan *cross training*, matching otomatis aktivitas, serta keterikatan sasaran makro ke milestone jarak.
3. **[`scripts/test_weekly_streak_system.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/test_weekly_streak_system.js) (21 Pengujian)**:
   - Menguji kondisi batas (stream kosong), kalkulasi sesi tunggal, spektrum 6 tingkatan termodinamika api (Merah, Oranye, Kuning, Putih, Biru, Ungu Plasma), dan integrasi telemetri streak aktual dari database.

---

### E. Sanitasi Dokumentasi [`README.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/README.md) & [`package.json`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/package.json)

1. **Pembersihan `README.md`**:
   - Menghapus blok kredensial sensitif pada langkah inisialisasi basis data.
   - Menghapus diagram `Project Structure` agar struktur internal file dan nama-nama skrip pengujian internal tidak terekspos keluar.
   - Menambahkan panduan instruksi yang jelas:
     - `npm run seed`: Menjalankan Master General Seed (aman publik/demo).
     - `npm run seed:personal`: Menjalankan Private Personal Seed (data pribadi pengguna).
2. **Pembaruan `package.json`**:
   - Menambahkan perintah `"seed:personal": "node scripts/personal/seed_personal.js"`.
   - Mengarahkan `"import:strava"` ke direktori privat `scripts/personal/seed_imported_activities.js`.

---

## 3. Matriks Perbandingan Arsitektur (*Before vs After*)

| Aspek | Kondisi Sebelum Pembaruan | Kondisi Sesudah Pembaruan |
| :--- | :--- | :--- |
| **Lokasi Skrip Personal** | Tersebar di `scripts/` publik dan terlacak oleh Git | Terisolasi di `scripts/personal/` dan diabaikan Git ([`.gitignore`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/.gitignore)) |
| **Pelacakan Data Strava** | `data/imported_activities.json` ter-track di Git | Di-untrack sepenuhnya (`git rm --cached`) |
| **Ukuran Dataset General** | 36 aktivitas & 38 jadwal latihan (*oversharing*) | 8 aktivitas master (1/minggu) & 4 jadwal master (*lean master data*) |
| **Data Pribadi pada Seed Umum**| Mengandung jarak 56.1km, cedera basket, dsb. | 100% sintetis murni (*Demo Athlete*, cedera hiking/pull-up) |
| **Perintah Seed Personal** | Tidak ada perintah formal | Tersedia perintah resmi: `npm run seed:personal` |
| **Diagram Struktur di README**| Ditampilkan lengkap di `README.md` | Dihapus sepenuhnya dari `README.md` |
| **Kompatibilitas Test Suite** | Hanya lolos pada satu konfigurasi tertentu | Kompatibel 100% pada kedua mode seed (General & Personal) |

---

## 4. Hasil Verifikasi & Pengujian Sistem

### A. Eksekusi Master General Seed
```bash
npm run seed
```
**Output Verifikasi:**
```text
======================================================================
🌱 EXECUTING LEAN MASTER GENERAL SEED (MINIMAL DEMO BASELINE)
======================================================================
Database URL: postgresql://postgres:admin123@localhost:5432/sport_training
1. Cleaning previous records for default user...
2. Seeding master users table...
3. Seeding master athlete_profiles table...
4. Seeding master athlete_injuries table...
5. Seeding master athlete_training_readiness table...
6. Seeding master training_plans table...
7. Seeding master scheduled_workouts table...
8. Seeding master activities table (8 weekly baseline sessions)...
9. Seeding master workout_activity_matches table...
10. Seeding master fitness_goals table...
11. Seeding master personal_records table...
12. Seeding master athlete_training_responses table...
13. Seeding master health_audit_trail table...

======================================================================
✅ LEAN MASTER GENERAL SEED COMPLETED SUCCESSFULLY!
======================================================================
• User: Demo Athlete (demo.athlete@a-coach.internal)
• Profile: Age 28 • 178 cm • 72 kg • BMI 22.7 • RHR 60 bpm • 4 days/wk
• Activities: 8 sessions (lean: 1 session/week across 8 weeks)
• Workouts: 4 scheduled master sessions
• Injuries: 2 generic clinical dossiers (Left Knee & Right Shoulder)
• Zero personal data, no oversharing, clean boilerplate demo.
```

### B. Eksekusi Private Personal Seed
```bash
npm run seed:personal
```
**Output Verifikasi:**
```text
======================================================================
🔒 EXECUTING PRIVATE PERSONAL ATHLETE SEEDING (USER DATA)
======================================================================
• User: Personal Athlete
• Profile: Age 22 • 170 cm • 65 kg • BMI 22.5 • RHR 68 bpm • 3 days/wk
• Activities: 34 sessions loaded from imported_activities.json
• Goals: 100km Century (56.1 km) & Marathon Pathway (12.33 km)
• Private user data isolated in scripts/personal/ and ignored by git.
```

### C. Eksekusi Seluruh Rangkaian Tes Otomatis (57 / 57 Lolos)
- **Athlete Health System Suite ([`scripts/test_athlete_health_system.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/test_athlete_health_system.js))**: **31 PASSED, 0 FAILED**
- **Coach Training System Suite ([`scripts/test_coach_training_system.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/test_coach_training_system.js))**: **5 PASSED, 0 FAILED**
- **Weekly Streak & Flame Progression Suite ([`scripts/test_weekly_streak_system.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/test_weekly_streak_system.js))**: **21 PASSED, 0 FAILED**
- **TypeScript Static Verification (`npx tsc --noEmit`)**: **0 Errors / Clean Compilation**

### D. Status Bersih Repositori Git
```text
Changes to be committed:
	deleted:    data/imported_activities.json
	deleted:    scripts/seed_athlete_health.js
	deleted:    scripts/seed_coach_training.js
	deleted:    scripts/seed_imported_activities.js

Changes not staged for commit:
	modified:   .gitignore
	modified:   README.md
	modified:   package.json
	modified:   scripts/seed.js
	modified:   scripts/test_athlete_health_system.js
	modified:   scripts/test_coach_training_system.js
	modified:   scripts/test_weekly_streak_system.js
```
*Seluruh berkas yang memuat data pribadi telah berhasil dihapus dari tracking Git dan terlindungi di dalam `.gitignore`.*
