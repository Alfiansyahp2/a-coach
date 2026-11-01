# Changelog: Standardisasi README Profesional Enterprise, Penambahan Otomasi Seeding Database, dan Konfigurasi Database `sport_training`

- **Tanggal & Waktu**: 2026-11-01 20:12:00 WIB
- **Tipe**: `docs(readme)` / `feat(db-seed)` / `chore(scripts)`
- **Commit Message**: `docs(readme): standardize enterprise documentation, add database seed script, and configure sport_training database`

---

## 1. Latar Belakang & Masalah

1. **Berkas README Default Boilerplate**:
   - Berkas [`README.md`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/README.md) utama repositori sebelumnya masih menggunakan teks bawaan dari scaffolding `create-next-app` (36 baris sederhana) yang tidak merefleksikan identitas, kemampuan teknis, arsitektur sistem, maupun panduan penggunaan platform pelatihan atletik APEX.
   - Diperlukan dokumentasi repositori berstandar profesional *enterprise* dengan diagram arsitektur, spesifikasi fitur lengkap, panduan setup lokal yang mudah dipahami, serta pemetaan ke 10 modul dokumentasi teknis di `/docs`.

2. **Kepatuhan Privasi & Keamanan (Zero Credential Leakage)**:
   - Berkas dokumentasi publik tidak boleh membocorkan rahasia kredensial apa pun (seperti kunci enkripsi `ENCRYPTION_SECRET`, kredensial Strava `STRAVA_CLIENT_SECRET`, maupun kata sandi asli database lokal `DATABASE_URL`).
   - Panduan konfigurasi lingkungan harus menggunakan *placeholder* generik standar industri (`your_db_password`, `your_strava_client_secret_here`) disertai peringatan mitigasi risiko kebocoran data.

3. **Ketiadaan Skrip Inisialisasi Data Cepat (*Database Seeding*)**:
   - Setelah database PostgreSQL `sport_training` dibuat, tabel-tabel relasional masih dalam keadaan kosong.
   - Pengembang yang baru meng-clone proyek membutuhkan cara instan untuk mengisi profil atlet awal (*Apex Athlete*), rencana jadwal kalender mingguan, target kebugaran bulanan, riwayat telemetri lari/sepeda, dan rekor pribadi (*Personal Record*) tanpa harus memasukkan data manual melalui CLI database.

4. **Kebutuhan Perintah npm Standar (`npm run seed`)**:
   - Belum ada pintasan perintah npm di [`package.json`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/package.json) untuk mengeksekusi proses pengisian data awal database secara terstandarisasi.

---

## 2. Solusi & Perubahan yang Diterapkan

### A. Transformasi Master README Repositori ([`README.md`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/README.md))
Merombak total berkas [`README.md`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/README.md) menjadi dokumentasi profesional setebal 319 baris yang mencakup:
- **Badge Bar Status**: Integrasi badge teknologi resmi (Next.js 16.4.3, React 19, TypeScript 5, Tailwind CSS v4, PostgreSQL 16, Strava API v3, AES-256-GCM).
- **Ringkasan Eksekutif & Nilai Tambah**: Membedakan platform APEX dari pelacak kebugaran biasa melalui rekonsiliasi varians Planned vs Actual dan bimbingan kepelatihan ilmiah.
- **Sorotan 6 Kemampuan Utama**:
  1. *Official Strava API v3 Synchronization* (OAuth 2.0 PKCE, auto-refresh token proaktif, pemantauan kuota rate-limit).
  2. *Planned vs. Actual Reconciliation Engine* (pemetaan semantik olahraga dan formula delta matematis).
  3. *Grounded Scientific AI Coach* (ACWR, aturan volume 10%, efisiensi pace, dan polarisasi latihan 80/20).
  4. *Enterprise-Grade Cryptographic Security* (AES-256-GCM authenticated cipher).
  5. *Dual-Mode Data Persistence Layer* (PostgreSQL 16 pool + Local JSON fallback).
  6. *Obsidian Telemetry Design System* (anti-AI-slop manifesto dan tipografi angka tabular `font-tabular`).
- **Diagram Arsitektur Sistem ASCII & Matriks Teknologi**: Menggambarkan jalur komunikasi antara sensor, Strava API, Next.js App Router, lapisan kripto, dan PostgreSQL/Local Store.
- **Pohon Struktur Direktori Repositori**: Menampilkan hierarki direktori `src/`, `scripts/`, dan `docs/`.
- **Panduan Memulai Cepat (*Getting Started*)**:
  - Langkah kloning dan instalasi dependensi.
  - Setup `.env.local` dengan *placeholder* rahasia generik yang aman.
  - Perintah eksekusi inisialisasi skema & seed data.
  - Menjalankan server dev (`npm run dev`) dan build produksi (`npm run build`).
- **Diagram Relasi Tabel Database**: Visualisasi relasi 10 tabel inti telemetri olahraga.
- **Indeks Navigasi 10 Modul Dokumentasi Teknis**: Menautkan langsung ke seluruh dokumen di direktori [`docs/`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/README.md).
- **Kebijakan Keamanan & Lisensi Kepemilikan (*Proprietary & Confidential*)**.

### B. Otomasi Pengisian Data Awal Database ([`scripts/seed.js`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/seed.js))
Membuat skrip mandiri menggunakan klien `pg` yang otomatis membaca `DATABASE_URL` dari `.env.local` dan menyuntikkan data realistis:
1. **Entitas Atlet**: Menyisipkan akun `Apex Athlete` (`athlete@protraining.internal`, UUID: `00000000-0000-0000-0000-000000000001`).
2. **Kalender Latihan Terjadwal**: Menyuntikkan 4 sesi latihan terstruktur:
   - *Tempo Run* (10 km, target pace 5:00/km, status `COMPLETED`).
   - *Easy Run* (8 km, target pace 5:37/km, Zone 2, status `PLANNED`).
   - *Interval Training* (8 km, 6x800m repeats VO2max, status `PLANNED`).
   - *Long Run* (18 km, target pace 5:33/km, Zone 2-3, status `PLANNED`).
3. **Target Kebugaran (*Fitness Goals*)**:
   - Target volume bulanan 120 km (kemajuan saat ini: 48.2 km).
   - Target frekuensi mingguan 4 sesi (kemajuan saat ini: 3 sesi).
4. **Riwayat Aktivitas Telemetri**:
   - *Morning Aerobic Threshold Run* (10.42 km, pace 4:59/km, 154 bpm, 176 spm).
   - *Zone 2 Aerobic Base Builder* (8.2 km, pace 5:27/km, 142 bpm, 172 spm).
   - *Recovery Spin & Mobility* (22.4 km cycling, 126 bpm, 82 rpm).
5. **Rekor Pribadi (*Personal Records*)**:
   - Rekor 5K (20:30), 10K (42:30), dan Half Marathon (1:36:00).
- Skrip menggunakan klausa `ON CONFLICT DO NOTHING` atau `ON CONFLICT DO UPDATE` sehingga aman dieksekusi berulang kali (*idempotent*).

### C. Penambahan Perintah Seeding pada Package Scripts ([`package.json`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/package.json))
- Menambahkan skrip `"seed": "node scripts/seed.js"` pada blok `"scripts"` di [`package.json`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/package.json) dengan penempatan koma pemisah yang valid untuk mendukung eksekusi cepat via `npm run seed`.

---

## 3. Matriks Berkas yang Dimodifikasi

| Kategori | Berkas | Status | Ringkasan Modifikasi |
| --- | --- | :---: | --- |
| **Documentation** | [`README.md`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/README.md) | `MODIFY` | Merombak total dari boilerplate Next.js menjadi README profesional 319 baris tanpa membocorkan API key/rahasia apa pun. |
| **Scripts & Tooling**| [`scripts/seed.js`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/seed.js) | `NEW` | Skrip otomasi pengisian data awal atlet, kalender latihan, target kebugaran, telemetri aktivitas, dan PR ke database PostgreSQL `sport_training`. |
| **Project Config** | [`package.json`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/package.json) | `MODIFY` | Menambahkan skrip `"seed": "node scripts/seed.js"` dengan pemisah koma valid pada blok `"scripts"`. |
| **Documentation** | [`docs/10-changelog/2026-11-01_20-12-00_docs-enterprise-readme-and-database-seeding.md`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/2026-11-01_20-12-00_docs-enterprise-readme-and-database-seeding.md) | `NEW` | Berkas changelog historis untuk perubahan git diff saat ini. |

---

## 4. Hasil Verifikasi & Pengujian

1. **Eksekusi Seeding Database (`node scripts/seed.js`)**:
   - Status: **SUCCESS**.
   - Terhubung ke database PostgreSQL lokal: `postgresql://postgres:admin123@localhost:5432/sport_training`.
   - Berhasil menyisipkan:
     - 1 Akun Atlet Utama (`Apex Athlete`).
     - 4 Jadwal Sesi Latihan Kalender.
     - 2 Target Kebugaran Bulanan & Mingguan.
     - 3 Riwayat Aktivitas Telemetri.
     - 3 Catatan Rekor Pribadi (PR).

2. **Audit Pencegahan Kebocoran Kredensial pada [`README.md`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/README.md)**:
   - Pencarian pola (*regex audit*) untuk kata sandi riil, API secret, atau token hash menghasilkan **0 temuan sensitif**.
   - Seluruh contoh instruksi menggunakan *placeholder* aman (`your_db_password`, `your_strava_client_secret_here`, `your_32_byte_hex_secret_key_here`).

3. **Validasi Sintaks JSON ([`package.json`](file:///C:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/package.json))**:
   - Pengujian `JSON.parse` berhasil tanpa error `json(514)` (*Expected comma*).

4. **Production Build Compilation (`npm run build`)**:
   - Compiler: **Next.js 16.4.3 (Turbopack)**.
   - Status: **SUCCESS (Exit code 0)**.
   - Pengecekan TypeScript Strict: Lulus dalam 3.9 detik (0 diagnostic errors).
   - Generasi rute statis (`/`, `/_not-found`) dan dinamis (`/api/auth/strava/*`) selesai sempurna.

