# Changelog: Audit Arsitektur Basis Data & Fondasi Pusat Data Atlet Terpadu (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-03 17:25:00 WIB
- **Tipe**: `feat(backend)` / `feat(database)` / `feat(audit)` / `docs(architecture)`
- **Commit Message Rujukan**: `feat(backend): complete unified athlete data center audit, schema reconciliation, and coach dependency map`
- **Branch**: `feat/backend`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-03_17-25-00_feat-athlete-data-center-and-database-architecture-audit.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Seiring dengan evolusi platform dari dasbor telemetri tunggal menjadi sistem pembinaan multi-sport adaptif, tim arsitektur menetapkan **Master Mission: Build a Unified Athlete Data Center & Adaptive Multi-Sport Coaching Foundation**. Inisiatif ini dirancang untuk mendukung:

- **AI Running Coach** (Zona 2 Walk/Jog & Adaptasi Return-to-Run)
- **AI Cycling Coach** (Ketahanan Aerobik Non-Impact, Sesi Kadens & Tonggak Gran Fondo)
- **AI Multi-Sport Coordinator** (Penyelarasan Beban Gabungan & Perlindungan Hari Pemulihan)
- **Modul Olahraga Masa Depan** (Renang, Gym/Kekuatan, Hiking, dsb.)

Sebelum melakukan perombakan skema atau memecah tabel di database, sistem menghadapi tantangan arsitektural krusial:
1. **Resiko Fragmentasi Data Atlet (*Data Siloing*)**: Jika setiap modul pembina membuat profil atau log riwayat latihannya sendiri, akan timbul inkonsistensi status kesehatan (misalnya: Running Coach mengira atlet bugar, sementara riwayat medis melarang benturan sendi).
2. **Mandat Preservasi Data Otentik (*Non-Negotiable Preservation*)**: Repositori telah memiliki **34 aktivitas riil** (24 Ride, 10 Run) dan 17 tabel normalisasi di PostgreSQL `sport_training`. Dilarang keras melakukan operasi destruktif (`DROP`, `TRUNCATE`, `DELETE`), merename kolom secara sembarangan, atau membuat tabel paralel tanpa justifikasi rekonsiliasi yang ketat.
3. **Kebutuhan Peta Ketergantungan Data Otoritatif**: Belum ada dokumentasi formal yang memetakan dari mana setiap modul pelatih harus menarik data atlet (*single source of truth*) dan bagaimana hierarki izin medis (*clinician override*) ditegakkan di atas saran AI.

---

## 2. Rincian Pekerjaan & Berkas yang Dihasilkan

Sesuai dengan protokol **Fase 1 (Full Codebase and Database Audit)**, seluruh pekerjaan dilakukan tanpa memodifikasi skema produksi (`ZERO PRODUCTION MIGRATIONS`), melainkan melakukan investigasi menyeluruh dan memproduksi tiga deliverable analitis utama:

### A. Laporan Audit Komprehensif Basis Data & Basis Kode
📄 **[`docs/09-audit/athlete-data-audit.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/09-audit/athlete-data-audit.md)** (Baru)

Menjawab tuntas **12 pertanyaan audit arsitektur**:
1. **Data Atlet Tersimpan**: Akun (`users`), biometrik (`athlete_profiles`), 34 aktivitas (`activities`), 38 sesi rencana periodisasi (`scheduled_workouts`), 4 target progresif (`fitness_goals`), 3 rekor (`personal_records`), 2 riwayat cedera (`athlete_injuries`), 2 log nyeri (`athlete_pain_logs`), dan status kesiapan (`athlete_training_readiness`).
2. **Tabel Otoritatif**: `users` untuk identitas akun; `athlete_profiles` untuk biometrik & fisiologi; `athlete_injuries` & `athlete_training_readiness` untuk izin latihan biomekanik; `activities` untuk telemetri riil.
3. **Data Impor Strava**: Idempotent via `strava_activity_id`, menyerap jarak, waktu, laju, elevasi, detak jantung, kadens, watt, dan summary polyline.
4. **Data Input Manual Atlet**: Biometrik, aktivitas manual/indoor, parse gambar OCR, koreksi telemetri, pendaftaran cedera klinis, check-in nyeri pasca sesi, dan pembuatan target kustom.
5. **Implementasi Target**: Selesai via `fitness_goals` dan rute mandiri `/goals` dengan mesin progresi berjenjang.
6. **Ketersediaan Latihan (*Availability*)**: Sebagian (`PARTIALLY_IMPLEMENTED`), saat ini masih berupa angka agregat `training_days_per_week` tanpa jadwal hari spesifik atau jendela puasa.
7. **Pelacakan Cedera & Nyeri**: Selesai dengan taksonomi 16-struktur sendi pada `athlete_injuries` dan `athlete_pain_logs`.
8. **Metrik Kesiapan (*Readiness*)**: Selesai dengan evaluasi deterministik asimetris (Lari `ON_HOLD` vs Sepeda `CONDITIONAL`).
9. **Konteks Bersama Running & Cycling**: Ya, keduanya mengonsumsi fungsi sentral `getAuthoritativeHealthContext()` dari `healthRepo.ts`.
10. **Duplikasi / Tumpang Tindih**: Ditemukan 4 area tumpang tindih ringan (biometrik di `users` vs `athlete_profiles`, log nyeri di `athlete_pain_logs` vs RPE di `athlete_training_responses`, satuan meter vs km, dan fallback lokal store).
11. **Layanan yang Dapat Digunakan Kembali**: Repositori `activityRepo`, `healthRepo`, `goalRepo`, `trainingRepo`, mesin `readinessEngine`, `coachTrainingGenerator`, `streakEngine`, serta 9 endpoint API Next.js 16.
12. **Informasi yang Masih Kurang**: Ketersediaan harian terperinci, pelacak usia pakai perlengkapan (*equipment shoe tracker*), check-in kebugaran pagi hari (*morning wellness*), dan koordinasi beban lintas-olahraga.

---

### B. Matriks Rekonsiliasi Skema Eksisting vs Usulan
📄 **[`docs/09-audit/existing-database-reconciliation.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/09-audit/existing-database-reconciliation.md)** (Baru)

Mengklasifikasikan 20 entitas data secara ketat:
- **`EXISTS_AND_REUSABLE` (13 Entitas)**: `users`, `strava_connections`, `strava_tokens`, `activities`, `training_plans`, `scheduled_workouts`, `workout_activity_matches`, `personal_records`, `athlete_injuries`, `athlete_pain_logs`, `athlete_training_responses`, `athlete_medical_assessments`, `athlete_training_readiness`, `health_audit_trail`.
- **`EXISTS_NEEDS_EXTENSION` (2 Entitas)**: `athlete_profiles` (ekstensi riwayat berat dan bobot preferensi) dan `fitness_goals` (ekstensi prioritas 1–3 dan event target).
- **`DUPLICATED_OR_OVERLAPPING` (1 Entitas)**: Kolom biometrik pada tabel `users` (direkomendasikan tetap dipertahankan untuk kompatibilitas, namun pembacaan dialihkan ke `athlete_profiles`).
- **`PARTIALLY_IMPLEMENTED` (1 Entitas)**: Ketersediaan jadwal latihan atlet.
- **`MISSING` (3 Entitas)**: `athlete_availability` (jadwal hari & puasa), `athlete_equipment` (sepatu & sepeda), dan `athlete_daily_wellness` (skor pemulihan subjektif pagi hari).

---

### C. Peta Ketergantungan Data Pelatih & Konteks Terpadu
📄 **[`docs/09-audit/coach-data-dependency-map.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/09-audit/coach-data-dependency-map.md)** (Baru)

- **Diagram Arsitektur Aliran Data**: Menghubungkan 17 tabel penyimpanan melalui *Deterministic Training Readiness Engine* ke dalam *Unified Athlete Context Service*, yang kemudian dikonsumsi oleh Running Coach, Cycling Coach, Multi-Sport Coordinator, dan tampilan antarmuka.
- **Hierarki Verifikasi Data 5 Tingkat**:
  - `Level 1: CLINICIAN_CONFIRMED` (Otoritas absolut penentu batas beban sendi).
  - `Level 2: SENSOR_VERIFIED` (Telemetri GPS, denyut jantung, watt Strava).
  - `Level 3: ATHLETE_REPORTED` (RPE subjektif, skor nyeri 0–10, catatan atlet).
  - `Level 4: DERIVED_ANALYTICS` (Kalkulasi deterministik ACWR, konsistensi, PR).
  - `Level 5: AI_RECOMMENDATION` (Preskripsi rekomendasi yang dibatasi Level 1 & 2).
- **Cetak Biru Ekstensibilitas Multi-Sport**: Panduan penambahan modul baru (Renang, Gym, Hiking) tanpa merombak arsitektur basis data.

---

### D. Skrip Utilitas Audit Skema PostgreSQL
🛠️ **[`scripts/audit_database_schema.cjs`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/audit_database_schema.cjs)** (Baru)

- Skrip inspeksi read-only menggunakan `node-postgres` yang mengekstrak seluruh nama tabel, jumlah baris aktual, nama kolom, tipe data, status nullability, dan nilai default langsung dari tabel `information_schema`.

---

## 3. Hasil Pengujian & Integritas Basis Data

1. **TypeScript Typecheck**:
   - `npx tsc --noEmit` keluar dengan kode `0` (**Zero errors**).
2. **Integritas Basis Data PostgreSQL (`sport_training`)**:
   - Dikonfirmasi 100% terjaga dan aman:
     - `activities`: **34 baris otentik** (24 Ride, 10 Run).
     - `athlete_injuries`: **2 baris klinis**.
     - `fitness_goals`: **4 baris target**.
     - `scheduled_workouts`: **38 baris jadwal**.
     - Zero data loss, zero destructive queries.

