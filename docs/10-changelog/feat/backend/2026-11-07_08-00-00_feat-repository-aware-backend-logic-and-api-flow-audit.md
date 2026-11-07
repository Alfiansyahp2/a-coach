# Changelog: Repository-Aware Backend Logic & API Flow Audit (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-07 08:00:00 WIB
- **Tipe**: `feat(backend)` / `audit(backend)` / `feat(domain)` / `feat(api)`
- **Commit Message Rujukan**: `feat(backend): complete comprehensive repository-aware backend logic and api flow audit across 15 core technical specifications`
- **Branch**: `feat/backend`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-07_08-00-00_feat-repository-aware-backend-logic-and-api-flow-audit.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Platform **a-coach — High-Performance Athletic Telemetry, Injury-Aware Coaching & Adaptive Training Platform** telah berevolusi pesat mencakup modul kesehatan atlet berbasis klinis, kalender periodisasi 12-minggu, sistem streak mingguan termodinamika api, registri multi-sport, dan pembacaan telemetri OCR.

Namun, sebelum audit ini dilakukan, terdapat beberapa ketidakpastian arsitektural dan operasional yang kritis:

1. **Diskrepansi Klaim README vs Realitas Repositori**:
   - `README.md` bertindak sebagai spesifikasi awal produk, namun banyak klaim (seperti status sinkronisasi aktif Strava API v3, jumlah uji lulus 58/58, dan dependensi Tesseract.js) belum diverifikasi kesesuaiannya dengan kode sumber riil dan skema basis data terkini.
2. **Konteks Operasional Aktual: Manual-First Tanpa Strava Aktif**:
   - Platform saat ini beroperasi penuh secara *manual-first* tanpa koneksi aktif ke Strava API (`strava_connections` = 0 baris, `strava_tokens` = 0 baris). Meskipun demikian, model data aktivitas masih terikat secara artifisial pada kolom `strava_activity_id BIGINT UNIQUE NOT NULL` sehingga memicu pembuatan ID sintetis palsu.
3. **Bahaya Desinkronisasi Dual-Storage (*Split-Brain*)**:
   - Terdapat mekanisme penyimpanan ganda (PostgreSQL 16 dan `.data/store.json`). Database PostgreSQL memuat 35 aktivitas dan riwayat klinis lengkap, sementara `.data/store.json` memuat **0 aktivitas**. Lapisan repositori memiliki *catch block* yang secara senyap (*silent failover*) mengalihkan query ke JSON lokal jika koneksi database terputus sekejap, berisiko menghilangkan seluruh tampilan riwayat atlet secara tiba-tiba tanpa pesan error.
4. **Kebutuhan Standarisasi & Penelusuran Logika Bisnis (*End-to-End*)**:
   - Diperlukan audit menyeluruh baris demi baris pada seluruh 16 rute API di `src/app/api/`, 7 domain engine di `src/lib/domain/`, 20 tabel database PostgreSQL, dan suite pengujian otomatis untuk memetakan celah logika, keamanan kunci enkripsi, dan merumuskan roadmap perbaikan bertahap tanpa merusak stabilitas aplikasi eksisting.

---

## 2. Rincian Hasil Audit & Penerbitan 15 Dokumen Spesifikasi Teknis

Audit ini membedah kode sumber secara mendalam dan menerbitkan **15 dokumen audit formal** di bawah direktori [`docs/backend-audit/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/backend-audit/):

### A. Ringkasan Eksekutif & Penilaian Sistem (`00-executive-summary.md`)
- Mengonfirmasi status operasional sistem: `OPERATIONAL (MANUAL-FIRST) WITH CRITICAL ARCHITECTURAL HAZARDS`.
- Menetapkan matriks risiko eksekutif: **2 temuan P0 (Kritis)**, **5 temuan P1 (Tinggi)**, **5 temuan P2 (Sedang)**, dan **3 temuan P3 (Rendah)**.
- Menyoroti 5 prioritas mitigasi darurat: penutupan *silent fallback* dual-storage, pengetatan kunci kriptografi, pelepasan ketergantungan kolom vendor Strava, deduplikasi kalkulasi streak, dan perbaikan regresi test script.

### B. Rekonsiliasi Klaim README vs Implementasi Riil (`01-readme-vs-implementation.md`)
- Memeriksa 18 klaim fitur utama README terhadap basis data riil dan source code.
- Mengidentifikasi status:
  - *Strava API v3 & OAuth*: `IMPLEMENTED_BUT_NOT_CONNECTED` (kode lengkap, namun tabel kosong dan kredensial `.env.local` belum diaktifkan).
  - *PostgreSQL 16*: `IMPLEMENTED_AND_VERIFIED` (20 tabel aktif dan berelasi).
  - *Dual-Storage Fallback*: `IMPLEMENTED_BUT_INCOMPLETE` (terjadi *split-brain* data loss risk).
  - *Badge Uji Otomatis*: Klaim 58/58 terbukti selisih 1 (riil: 57 uji lulus dari 3 suite aktif, plus 2 test script terpisah yang mengalami kegagalan).

### C. Pemetaan Arsitektur Backend & Topologi Domain (`02-backend-architecture-map.md`)
- Memetakan arsitektur konsentris empat lapis:
  1. *Presentation Layer* (Server Components Next.js SSR & Client Modals).
  2. *API Route Handlers* ([`src/app/api/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/api/)).
  3. *Pure Domain Engines* ([`src/lib/domain/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/)).
  4. *Modular Repositories Layer* ([`src/lib/db/`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/)).
- Menguraikan peran fasad kompatibilitas mundur (*backward-compatibility facades*) di `src/lib/` (`db.ts`, `readinessEngine.ts`, `streakEngine.ts`, `matching.ts`, `personalRecords.ts`, `sportUtils.ts`, `coachTrainingGenerator.ts`, `ai-coach.ts`).

### D. Inventarisasi API, Kontrak & Spesifikasi Endpoint (`03-api-inventory-and-contracts.md`)
- Mengaudit seluruh 16 berkas rute API (21 HTTP handler).
- Mendokumentasikan skema input JSON, parameter URL, format respons, dan kode status HTTP.
- Menemukan ketiadaan endpoint `DELETE /api/activities/[id]`, ketiadaan `PATCH /api/athlete/injuries/[id]`, serta ketiadaan rute massal `POST /api/activities/batch`.

### E. Mesin Kesehatan Atlet, Taksonomi Anatomi & Circuit Breaker (`04-athlete-health-and-injury-logic.md`)
- Memvalidasi kepatuhan prinsip *zero-hallucination* pada profil atlet: nilai `HRmax`, `LTHR`, `FTP`, dan `VO2max` berstatus *strictly unknown/uncalibrated* tanpa fabrikasi tebakan usia.
- Memverifikasi taksonomi 9 regio anatomi tubuh di `src/lib/anatomy/regions/` yang membedakan beban kinetik ekstremitas bawah (*weight-bearing impact*) dengan struktur aksial dan tubuh atas.
- Mengonfirmasi aktivasi rem biologis (*Biological Circuit Breakers*): 2 dossier cedera aktif (Engkel Kanan & Lutut Bilateral) mengunci olahraga lari ke status `ON_HOLD` dan membatasi bersepeda ke status `CONDITIONAL` Zone 2.

### F. Pipeline Telemetri Manual & Ekstensibilitas Multi-Sport (`05-activity-and-telemetry-pipeline.md`)
- Memvalidasi formula matematis kinematika kecepatan dan *pace*:
  $$\text{average\_speed\_mps} = \frac{\text{distance\_meters}}{\text{moving\_time\_seconds}}, \quad \text{Pace (s/km)} = \frac{1000}{\text{average\_speed\_mps}}$$
- Mengkritisi mekanisme pembuatan ID Strava sintetis (`Date.now() * 1000 + rand`) akibat batasan kolom basis data `strava_activity_id BIGINT UNIQUE NOT NULL`.
- Menjelaskan klasifikasi multi-sport dinamis di [`src/lib/domain/sports/sportUtils.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/sports/sportUtils.ts) yang mengelola format `km/h` vs `/km` secara dinamis.

### G. Kalender Periodisasi, Mesin Coach & Heuristic Matching (`06-periodization-and-coach-logic.md`)
- Mengaudit siklus periodisasi 12-minggu (*Road to 100km Century Ride MTB*) dengan rasio beban 3:1 (*3 loading weeks : 1 deload week*).
- Memverifikasi proteksi ketat hari Senin & Kamis (Puasa Sunnah) dengan tepat 0 jadwal sesi.
- Mengidentifikasi cacat destruktif pada generator: eksekusi `generateCoachTrainingFromDatabase` memanggil `deleteScheduledWorkoutsByUserId`, yang menghapus seluruh jadwal lampau termasuk sesi yang telah selesai dikerjakan (`COMPLETED`).

### H. Mesin Streak Mingguan & Spektrum Termodinamika Api (`07-streak-and-flame-engine.md`)
- Mengaudit aturan streak mingguan berbasis kalender ISO (Senin 00:00:00 s.d. Minggu 23:59:59.999).
- Memvalidasi 6 tingkatan panas termodinamika pembakaran fisik (Stage 1 Api Merah ~800°C s.d. Stage 6 Api Ungu Plasma >2.200°C).
- Menemukan **bug double-counting (P1)**: saat sesi manual cocok dengan jadwal, tanggal aktivitas dan tanggal jadwal sama-sama dimasukkan ke array kontribusi tanpa deduplikasi, melipatgandakan hitungan `totalContributions`.
- Menemukan **fabrikasi data pada error handler (P1)**: blok `catch` pada `/api/athlete/streak` mengembalikan data palsu (streak 9 minggu, 34 kontribusi) jika terjadi kendala basis data.

### I. Integritas Basis Data & Analisis Split-Brain (`08-database-and-storage-integrity.md`)
- Melakukan inventarisasi 20 tabel di PostgreSQL 16:
  `activities` (35), `scheduled_workouts` (38), `fitness_goals` (4), `personal_records` (3), `athlete_injuries` (2), `athlete_profiles` (1), `users` (1), dll.
- Membuktikan secara empiris bahwa `.data/store.json` tertinggal jauh (0 aktivitas vs 35 di PostgreSQL), membuktikan bahwa *silent fallback* di `activityRepo.ts` membahayakan keutuhan data atlet.

### J. Keamanan, Kriptografi & Postur Autorisasi (`09-security-audit.md`)
- Memvalidasi penggunaan cipher `aes-256-gcm` dengan IV acak 16-byte dan verifikasi authentication tag.
- Menemukan celah **P0 Kritis**: string secret fallback hardcoded `'e4f9b8c3d2e1a0f9e8d7c6b5a4938271e0d9c8b7a69584736251403928172635'` dan salt statis pada [`src/lib/crypto.ts#L8`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/crypto.ts#L8).
- Menemukan ketiadaan middleware autentikasi/sesi pada endpoint API (*Broken Object Level Authorization / BOLA*).

### K. Pipeline Ingesti Telemetri OCR Gambar (`10-ocr-ingestion-audit.md`)
- Meneliti alur kerja `POST /api/activities/parse-image` yang mengeksekusi skrip Python [`scripts/parsers/parse_activity_image.py`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/parsers/parse_activity_image.py) melalui `child_process.execFile`.
- Menemukan bahwa paket `"tesseract.js": "^7.0.0"` di `package.json` merupakan *ghost dependency* (tidak diimpor sama sekali di aplikasi).
- Mengidentifikasi ketergantungan biner host Windows (`C:\Program Files\Tesseract-OCR\tesseract.exe`) yang akan gagal jika dideploy ke Vercel/serverless Linux standar.

### L. Penelusuran End-to-End Aliran API (`11-end-to-end-api-flow.md`)
- Melacak secara mendalam 11 perjalanan pengguna (*user workflows*) dari interaksi UI, pemanggilan rute Next.js, evaluasi logika domain, mutasi repositori, hingga persistensi tabel SQL:
  1. *Profil Atlet & Biometrik*.
  2. *Manajemen Dossier Cedera & Status Kesiapan*.
  3. *Pencatatan Aktivitas Manual & Auto-Matching*.
  4. *Pengubahan & Upaya Penghapusan Aktivitas*.
  5. *Check-In Kesehatan Pasca-Latihan*.
  6. *Pemilihan Sasaran & Kalibrasi Periodisasi*.
  7. *Penyelesaian & Pencocokan Jadwal Latihan*.
  8. *Pembaruan Rentetan Streak & Nyala Api*.
  9. *Kalkulasi Rekor Personal (PR)*.
  10. *Ingesti Pembacaan Tangkapan Layar OCR*.
  11. *Koordinasi Insight Pelatih AI Multi-Sport*.

### M. Verifikasi Cakupan & Kualitas Pengujian (`12-test-coverage-and-verification.md`)
- Menguji 5 script pengujian otomatis:
  - `test_athlete_health_system.js` $\to$ **31 Passed, 0 Failed**.
  - `test_coach_training_system.js` $\to$ **5 Passed, 0 Failed**.
  - `test_weekly_streak_system.js` $\to$ **21 Passed, 0 Failed**.
  - `test_add_activity_flow.js` $\to$ **FAILED** (karena memanggil path usang `scripts/parse_activity_image.py`).
  - `test_goal_driven_training_engine.js` $\to$ **FAILED** (karena assertion baris kaku `totalActivities === 34` saat ada 35 aktivitas riil di DB).
- Mendokumentasikan akar masalah dan perbaikan yang diperlukan untuk CI/CD.

### N. Katalog Gap & Analisis Celah Berprioritas (`13-missing-logic-and-gap-analysis.md`)
- Menyusun katalog terstruktur untuk seluruh 15 temuan teknis:
  - **P0-01**: *Dual-Storage Split-Brain Silent Data Loss Fallback*.
  - **P0-02**: *Hardcoded Fallback Cryptographic Secret & Static Salt*.
  - **P1-01**: *Weekly Streak Contribution Double-Counting Bug*.
  - **P1-02**: *Hardcoded Anatomical Region Fallback in Check-In API*.
  - **P1-03**: *Mandatory Synthetic Strava ID Dependency*.
  - **P1-04**: *Destructive Plan Regeneration Wiping Completed Workouts*.
  - **P1-05**: *Hardcoded Plan Dates & Static Fallback Baseline Values*.
  - **P2-01**: *Missing Activity Deletion API & Repository Method*.
  - **P2-02**: *Missing Injury Dossier Status Modification Endpoint*.
  - **P2-03**: *Host OS & Python Subprocess Coupling for OCR Ingestion*.
  - **P2-04**: *Automated Test Path Regression & Brittle Assertions*.
  - **P2-05**: *Unauthenticated API Routes with BOLA Vulnerability*.
  - **P3-01**: *Ghost Dependency `tesseract.js` in `package.json`*.
  - **P3-02**: *Unpersisted Dynamic Sport Configuration*.
  - **P3-03**: *Hardcoded Telemetry Example in Clinical Rationale Copy*.

### O. Roadmap Remediasi & Rencana Aksi Terstruktur (`14-implementation-roadmap.md`)
- Merumuskan rencana eksekusi bertahap tanpa *breaking changes*:
  - **Fase 1 (P0)**: Penutupan *silent fallback* penyimpanan ganda & pengetatan kunci enkripsi.
  - **Fase 2 (P1)**: Perbaikan perhitungan kontribusi streak, validasi ketat regio anatomi check-in, migrasi `strava_activity_id` menjadi `NULLABLE` + kolom `is_manual`, dan regenerasi jadwal non-destruktif.
  - **Fase 3 (P2)**: Implementasi endpoint `DELETE /api/activities/[id]`, endpoint `PATCH /api/athlete/injuries/[id]`, perbaikan path suite pengujian, dan portabilitas OCR.
  - **Fase 4 (P3)**: Pembersihan dependensi tak terpakai dan sinkronisasi dokumentasi README.

---

## 3. Matriks Perbandingan Git Diff

| Berkas Audit Dihasilkan | Kategori | Ukuran Berkas | Fokus Utama |
| :--- | :---: | :---: | :--- |
| `docs/backend-audit/00-executive-summary.md` | Baru | 12.5 KB | Ringkasan eksekutif, status sistem, scorecard risiko P0–P3, 5 rekomendasi darurat |
| `docs/backend-audit/01-readme-vs-implementation.md` | Baru | 14.1 KB | Matriks rekonsiliasi komparatif 18 klaim README vs kode sumber & basis data |
| `docs/backend-audit/02-backend-architecture-map.md` | Baru | 11.1 KB | Diagram topologi 4 lapis, fasad Clean Architecture, coupling analysis |
| `docs/backend-audit/03-api-inventory-and-contracts.md` | Baru | 11.0 KB | Spesifikasi lengkap 16 rute API, validasi skema, respons, dan katalog endpoint hilang |
| `docs/backend-audit/04-athlete-health-and-injury-logic.md` | Baru | 8.3 KB | Profil biometrik, perlindungan unknown, taksonomi anatomi, circuit breaker biologis |
| `docs/backend-audit/05-activity-and-telemetry-pipeline.md` | Baru | 7.7 KB | Pipeline manual, formula kinematika kecepatan/pace, analisis ID Strava sintetis |
| `docs/backend-audit/06-periodization-and-coach-logic.md` | Baru | 8.0 KB | Siklus periodisasi 12-minggu, proteksi puasa sunnah, matching heuristik, rekor personal |
| `docs/backend-audit/07-streak-and-flame-engine.md` | Baru | 6.7 KB | Kalender minggu ISO, 6 tahap termodinamika api, investigasi bug double-counting |
| `docs/backend-audit/08-database-and-storage-integrity.md` | Baru | 7.5 KB | Audit 20 tabel PostgreSQL 16, investigasi split-brain dual storage, bahaya failover senyap |
| `docs/backend-audit/09-security-audit.md` | Baru | 5.8 KB | Enkripsi AES-256-GCM, audit secret bocor, postur autorisasi BOLA, sanitasi SQL |
| `docs/backend-audit/10-ocr-ingestion-audit.md` | Baru | 6.4 KB | Alur visi Python child process, ghost dependency tesseract.js, regex telemetri, uji rusak |
| `docs/backend-audit/11-end-to-end-api-flow.md` | Baru | 7.7 KB | Penelusuran baris kode 11 alur kerja pengguna (UI -> API -> Domain -> Repo -> DB) |
| `docs/backend-audit/12-test-coverage-and-verification.md` | Baru | 6.0 KB | Hasil uji 5 script, diskrepansi jumlah klaim (57 vs 58), assertion kaku, celah uji |
| `docs/backend-audit/13-missing-logic-and-gap-analysis.md` | Baru | 15.4 KB | Katalog 15 temuan teknis (P0–P3), bukti kode, akar masalah, skenario uji reproduksi |
| `docs/backend-audit/14-implementation-roadmap.md` | Baru | 8.7 KB | Jadwal mitigasi 4 fase, tugas perbaikan, kriteria penerimaan, pedoman keselamatan |

**Total Dokumentasi Baru**: **15 berkas Markdown komprehensif diterbitkan** (~129.5 KB konten analisis teknis terstruktur).

---

## 4. Hasil Pengujian & Jaminan Mutu

Seluruh pernyataan dan analisis dalam audit ini diverifikasi melalui eksekusi pengujian langsung pada repositori lokal:

1. **Uji Validasi Skema Basis Data PostgreSQL 16**:
   - Skrip: `scripts/maintenance/audit_database_schema.cjs`
   - **Hasil**: Terverifikasi **20 tabel basis data** dengan struktur kolom, relasi, dan baris data aktual (35 aktivitas, 1 profil atlet, 2 dossier cedera, 38 jadwal latihan, 4 target sasaran, 0 koneksi Strava).
2. **Suite Verifikasi Kesehatan & Kesiapan Cedera**:
   - `node scripts/tests/test_athlete_health_system.js` $\to$ **31 PASSED, 0 FAILED**.
   - Terverifikasi: batas proteksi fisiologis terjaga (*HRmax/FTP unknown*), taksonomi bilateral engkel dan lutut aktif, olahraga lari berada pada status `ON_HOLD`.
3. **Suite Verifikasi Periodisasi & Pelatihan**:
   - `node scripts/tests/test_coach_training_system.js` $\to$ **5 PASSED, 0 FAILED**.
   - Terverifikasi: rencana latihan aktif terhubung ke sasaran utama, jadwal latihan mencakup sesi terencana dan selesai, proteksi puasa sunnah terjaga.
4. **Suite Verifikasi Rentetan Latihan & Spektrum Api**:
   - `node scripts/tests/test_weekly_streak_system.js` $\to$ **21 PASSED, 0 FAILED**.
   - Terverifikasi: 6 tahapan termodinamika api (Stage 0–6) lulus uji kalkulasi, streak basis data riil (10 minggu) terpetakan tepat pada *Stage 2: Api Oranye (~1.100°C)*.
5. **Integritas Repositori & Disiplin Audit**:
   - Tidak ada modifikasi kode pada berkas aplikasi (`src/app/`, `src/lib/`, `src/components/`).
   - Tidak ada operasi `git commit` otomatis.
   - Tidak ada penghapusan atau perubahan data produksi pada PostgreSQL 16.
   - Pohon kerja Git bersih dengan hanya penambahan berkas dokumentasi audit baru di bawah `docs/backend-audit/` dan berkas changelog ini.

