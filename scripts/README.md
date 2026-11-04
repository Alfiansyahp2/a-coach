# Indeks Skrip Operasional & Pemeliharaan (Scripts Directory)

Direktori ini menampung seluruh skrip otomasi backend, migrasi basis data, pengujian sistem, dan pemrosesan gambar OCR untuk platform pelatih performa endurance.

Seluruh skrip dikelompokkan ke dalam subdirektori modular agar rapi, mudah dipelihara, dan aman dari eksekusi yang tidak disengaja.

---

## Struktur Direktori

```
scripts/
├── migrations/             # Skrip DDL SQL & eksekusi migrasi skema PostgreSQL
├── maintenance/            # Utilitas audit skema, sinkronisasi record & data integrity
├── tests/                  # Skrip verifikasi & test suite sistem otomatis
├── parsers/                # Parser Python untuk OCR gambar Strava & ekstraksi telemetri
├── seed/                   # Dataset seeder awal (demo sintetis & personal baseline)
└── archive/                # Skrip arsip migrasi satu-kali (one-off transformers)
```

---

## 1. Migrasi Basis Data (`scripts/migrations/`)

Direktori ini berisi skrip SQL DDL dan runner migrasi aman dengan pengecekan pra-kondisi (*pre-flight*) dan transaksi ACID.

| Berkas | Deskripsi | Cara Menjalankan |
|---|---|---|
| `001_athlete_data_center.sql` | DDL migrasi non-destruktif untuk `athlete_availability`, `athlete_equipment`, `athlete_daily_wellness`, ekstensi kolom `fitness_goals`, dan relasi `pain_log_id`. | Dieksekusi otomatis oleh `run_migration_001.cjs`. |
| `run_migration_001.cjs` | Transaction runner migrasi 001 dengan validasi 34 aktivitas PostgreSQL utuh dan verifikasi pasca-migrasi. | `node scripts/migrations/run_migration_001.cjs` |
| `002_goal_driven_training.sql` | DDL migrasi penambahan `goal_id` pada `training_plans` dan flag `is_key_session`, `milestone_target_km` pada `scheduled_workouts`. | Dieksekusi otomatis oleh `run_migration_002.cjs`. |
| `run_migration_002.cjs` | Transaction runner migrasi 002 menghubungkan relasi tujuan ke kalender latihan periodisasi adaptif. | `node scripts/migrations/run_migration_002.cjs` |
| `003_primary_goal_logic.sql` | DDL migrasi penambahan `is_primary` pada `fitness_goals` dan pembuatan indeks unik/pencarian performa sasaran utama. | Dieksekusi otomatis oleh `run_migration_003.cjs`. |
| `run_migration_003.cjs` | Transaction runner migrasi 003 untuk menegakkan integritas 1 sasaran utama otoritatif per atlet. | `node scripts/migrations/run_migration_003.cjs` |
| `migrate_health_schema.js` | DDL pembuat skema kesehatan atlet, tabel cedera, dan log nyeri. | `node scripts/migrations/migrate_health_schema.js` |
| `migrate_biometrics_and_clean_dummy.js` | Migrasi biometrik fisik ke `athlete_profiles` dan pembersihan dummy. | `node scripts/migrations/migrate_biometrics_and_clean_dummy.js` |

---

## 2. Pemeliharaan & Audit (`scripts/maintenance/`)

Utilitas pemeliharaan harian, sinkronisasi data personal record, dan audit skema PostgreSQL riil.

| Berkas | Deskripsi | Perintah Singkat |
|---|---|---|
| `audit_database_schema.cjs` | Melakukan inspeksi mendalam terhadap seluruh 20 tabel PostgreSQL, kolom, constraint, dan jumlah baris riil. | `npm run db:audit` |
| `sync_personal_records.js` | Menghitung ulang dan menyinkronkan rekor jarak terjauh, laju terbaik (5K, 10K), dan elevasi tertinggi dari 34 aktivitas Strava. | `node scripts/maintenance/sync_personal_records.js` |
| `align_repos_with_db.cjs` | Memverifikasi sinkronisasi antara repositori TypeScript dan kolom basis data PostgreSQL. | `node scripts/maintenance/align_repos_with_db.cjs` |
| `update_schema_sql.cjs` | Mensinkronkan berkas master `schema.sql` dengan skema live PostgreSQL. | `node scripts/maintenance/update_schema_sql.cjs` |
| `add_get_db_status.cjs` | Helper pengecekan konektivitas pool PostgreSQL vs Local Store. | `node scripts/maintenance/add_get_db_status.cjs` |

---

## 3. Rangkaian Pengujian Sistem (`scripts/tests/`)

Rangkaian pengujian terotomasi untuk memverifikasi logika coaching, kesiapan sendi, dan streak telemetri mingguan.

| Berkas | Lingkup Pengujian | Perintah Singkat |
|---|---|---|
| `test_athlete_health_system.js` | Menguji 31 asersi kesehatan: profil biometrik fisik, isolasi diagnosa AI (tidak mendiagnosa patellofemoral tanpa dokter), sirkuit rem darurat sendi, dan audit trail. | `npm run test:health` |
| `test_coach_training_system.js` | Menguji keselarasan rencana latihan 12-minggu, preskripsi sesi MTB/lari, dan integrasi target. | `npm run test:coach` |
| `test_goal_driven_training_engine.js` | Menguji generator adaptif berbasis tujuan (Century 100K vs Maraton 42.2K), integritas 12 tonggak mingguan, dan proteksi hari puasa Senin & Kamis. | `node scripts/tests/test_goal_driven_training_engine.js` |
| `test_weekly_streak_system.js` | Menguji mesin konsistensi mingguan, kalender Senin–Minggu, dan progresi api konsistensi (*flame streak*). | `npm run test:streak` |
| `test_add_activity_flow.js` | Menguji alur manual penambahan aktivitas dan pipeline OCR. | `node scripts/tests/test_add_activity_flow.js` |

---

## 4. Ekstraksi & OCR Telemetri (`scripts/parsers/`)

Skrip berbasis Python untuk membaca tangkapan layar Strava dan mengekstraksi jarak, durasi, elevasi, dan laju.

| Berkas | Deskripsi | Cara Menjalankan |
|---|---|---|
| `parse_activity_image.py` | Parser OCR standalone yang menerima argumen path gambar dan mengembalikan output JSON telemetri. Digunakan oleh API endpoint `/api/activities/parse-image`. | `python scripts/parsers/parse_activity_image.py "<path_gambar>"` |
| `process_strava_images.py` | Batch processor untuk membaca tangkapan layar dalam folder `data/from_strava/` secara massal. | `npm run import:strava` |

---

## 5. Dataset Seeder (`scripts/seed/`)

Skrip pengisian data awal untuk inisialisasi lingkungan lokal dan demonstrasi.

> [!CAUTION]
> Skrip `seed.js` akan menghapus data default demo untuk keperluan reset pengujian demo. **JANGAN jalankan pada basis data produksi yang berisi 34 aktivitas nyata.**

| Berkas | Deskripsi | Perintah Singkat |
|---|---|---|
| `seed.js` | Seeder sintetis minimalis untuk keperluan demo publik. | `npm run seed` |
| `seed_athlete_health.js` | Seeder baseline profil kesehatan atlet dan riwayat cedera klinis. | `npm run seed:personal` |
| `seed_coach_training.js` | Seeder generator program latihan 12 minggu. | `node scripts/seed/seed_coach_training.js` |
| `seed_imported_activities.js` | Pengimpor aktivitas Strava hasil ekstraksi gambar ke tabel `activities`. | `node scripts/seed/seed_imported_activities.js` |

---

## 6. Arsip Transformasi (`scripts/archive/`)

Menyimpan skrip utilitas transformasi kode satu-kali (*one-off scripts*) yang telah selesai dijalankan. Berkas di folder ini disimpan semata-mata sebagai catatan audit jejak rekayasa (*engineering audit trail*).

