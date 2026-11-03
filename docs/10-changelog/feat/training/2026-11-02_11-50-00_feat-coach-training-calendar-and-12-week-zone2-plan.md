# Changelog: Coach Training System, 12-Week Zone 2 Endurance Plan & Fasting-Aware Calendar Matrix (`feat/training`)

- **Tanggal & Waktu**: 2026-11-02 11:50:00 WIB
- **Tipe**: `feat(training)` / `feat(domain)` / `feat(ui)` / `feat(db)` / `feat(ai)`
- **Commit Message**: `feat(training): implement 12-week zone 2 endurance roadmap, fasting-aware athletic calendar matrix, and macro goals telemetry`
- **Branch**: `feat/training`

---

## 1. Latar Belakang & Kebutuhan Atlet

Sistem latihan sebelumnya hanya menampilkan daftar vertikal sesi statis tanpa memadukan konteks personalisasi atlet, kondisi kesehatan fisik, dan target jangka menengah. Atlet memiliki profil fisik dan preferensi nyata sebagai berikut:
1. **Target Jangka Menengah:**
   - **Cycling:** Menyelesaikan jarak 100 km (First Century Ride) pada intensitas dominan **Zone 2** menggunakan sepeda gunung (**MTB**).
   - **Running:** Mampu berlari 10 km pada intensitas dominan **Zone 2**, dengan target lanjutan bertahap menuju 15–20 km.
2. **Keterbatasan Alat & Pacing:** Atlet tidak menggunakan smartwatch/heart-rate monitor (`none`), sehingga intensitas Zone 2 harus dikunci menggunakan patokan fisiologis praktis: **RPE 3–4 / 10** dan **The Talk Test** (mampu berbicara dalam kalimat lengkap tanpa terputus).
3. **Karakteristik Sepeda MTB:** Menggunakan sepeda gunung dengan ban tapak lebar dan *rolling resistance* tinggi; durasi kayuhan kontinu menjadi metrik utama keberhasilan, bukan kecepatan rata-rata.
4. **Rutinitas Ibadah Puasa Sunnah:** Setiap **Senin dan Kamis atlet berpuasa**, sehingga kedua hari tersebut wajib dialokasikan sebagai **Istirahat Penuh & Pemulihan Total** tanpa beban latihan berat demi mencegah deplesi glikogen, dehidrasi, dan katabolisme.
5. **Ketersediaan Hari Latihan:** 3 sesi utama per minggu di hari non-puasa (**Selasa/Rabu**, **Jumat**, **Minggu**) dengan **Sabtu** sebagai slot *buffer* opsional untuk memenuhi target minimal jarak mingguan.
6. **Proteksi Klinis Sendi:** Riwayat cedera pergelangan kaki kanan (*sprain*) dan keluhan nyeri kedua lutut pasca lari jarak jauh mengharuskan pemisahan kesiapan: progresi lari dikunci (*gated return-to-run*) hingga ada evaluasi klinis formal, sementara sepeda aerobik putaran tertutup dijadikan motor utama.

---

## 2. Rincian Implementasi & Rekayasa Sistem

### A. Skema Basis Data Relasional & Penanganan Zona Waktu (`src/lib/db.ts` & `src/types/index.ts`)
1. **Model `TrainingPlan` & Relasi Sesi:**
   - Menambahkan tipe `TrainingPlan` dengan atribut `id`, `user_id`, `title`, `description`, `start_date`, `end_date`, `is_active`, dan timestamps.
   - Mengimplementasikan fungsi CRUD: `getTrainingPlans`, `getActiveTrainingPlan`, `createTrainingPlan`, `deleteTrainingPlansByUserId`, `deleteScheduledWorkoutsByUserId`, dan `upsertFitnessGoal`.
2. **Penyelesaian Permanen Bug Pergeseran Tanggal (Timezone Shift Bug):**
   - Sebelumnya, driver `node-postgres` secara default mengonversi tipe kolom `DATE` menjadi objek `Date` JavaScript tengah malam lokal (GMT+7), yang ketika di-serialize via `.toISOString()` mundur satu hari ke UTC (contoh: Selasa 3 Nov bergeser menjadi Senin 2 Nov).
   - Menambahkan `types.setTypeParser(1082, (val) => val)` dan utilitas `formatDateOnly(val)` yang mengekstrak `YYYY-MM-DD` secara deterministik tanpa pergeseran zona waktu.

### B. Mesin Generator Program Latihan 12-Minggu (`src/lib/coachTrainingGenerator.ts`)
Menyusun program periodisasi 12 minggu (3 bulan / 84 hari) dari 2 November 2026 hingga 24 Januari 2027:
- **Fase 1: Adaptasi Fondasi Awal (Minggu 1–4):**
  - Sesi MTB 20–35 menit, RPE 2–4, jalur datar stabil dengan gear ringan (85+ RPM).
  - Sesi tubuh atas (*upper body*) dan mobilitas panggul pada hari Jumat untuk melindungi engkel dan lutut.
  - Minggu ke-4 difokuskan untuk evaluasi respons sendi 24 jam dan persiapan pemeriksaan klinis.
- **Fase 2: Pembangunan Endurance (Minggu 5–8):**
  - Peningkatan durasi MTB menuju 30–45 menit.
  - Pengenalan kembali jalan-lari bertahap (*walk/jog micro-dosing* 2.5–3.5 km) dengan kadens langkah tinggi (170+ spm) jika dinyatakan aman.
  - **Deload Week 1 (Minggu 8):** Pengurangan beban volume terencana untuk superkompensasi jaringan ikat dan sendi.
- **Fase 3: Spesifisitas Zone 2 & Konsolidasi (Minggu 9–12):**
  - Sesi MTB 40–60 menit, mencapai puncak fondasi 1 jam penuh Zone 2 pada Minggu ke-11.
  - Uji coba lari santai 5.0–6.0 km terkalibrasi.
  - **Deload Week 2 (Minggu 12):** Konsolidasi adaptasi dan audit kesiapan menuju persiapan 100 km Century Ride.

### C. REST API Endpoints (`src/app/api/training/*`)
- **`POST /api/training/generate`**: Endpoint kalibrasi ulang on-demand yang membaca riwayat Strava, profil fisik, dan dossier kesehatan atlet, lalu meregenerasi rencana latihan dan menyinkronkan target ke PostgreSQL.

### D. Antarmuka Kalender Interaktif Multi-Sport (`src/components/training/ScheduleTrainingHub.tsx` & `/training`)
1. **Tampilan Kalender Grid 7 Hari (Senin – Minggu):**
   - Menggantikan tampilan daftar vertikal lama dengan matriks periodisasi modern bertema obsidian telemetry.
   - **Kartu Khusus Puasa Sunnah:** Setiap hari Senin dan Kamis ditandai dengan kartu bertema ungu `🌙 Puasa Sunnah • Istirahat Penuh & Pemulihan Glikogen`.
   - **Kartu Khusus Sabtu Buffer:** Hari Sabtu menampilkan penanda `SABTU BUFFER` sebagai jaring pengaman jika target jarak minimal mingguan membutuhkan tambahan volume ringan (*recovery spin* 10–12 km).
   - **Pewarnaan Kategori Atletik:**
     - Sepeda MTB: Electric Cyan (`#00F0FF`).
     - Lari Bertahap: Volt Green (`#D4FF00`).
     - Rehab & Tubuh Atas: Warm Amber (`#FF9500`).
     - Terverifikasi Strava: Emerald Green (`#10B981`).
2. **Pemilih Fase 12-Minggu (Phase Switcher):**
   - Tab filter: `Semua (12 Minggu)`, `Fase 1 (M1–4)`, `Fase 2 (M5–8)`, dan `Fase 3 (M9–12)`.
3. **Indikator Target Jarak Mingguan (Weekly Mileage Targets):**
   - Setiap header baris minggu menampilkan target minimal mingguan, total kilometer terjadwal, rincian per cabang olahraga (Sepeda vs Lari), dan *progress bar* volume.
4. **Pedoman Pacing Zone 2 (Tanpa HRM):**
   - Panel khusus yang merangkum RPE 3–4, kriteria Talk Test, karakteristik kayuhan gigi MTB, dan proteksi keselamatan cedera.
5. **Dossier Sesi Interaktif (Modal Popup):**
   - Memberikan rincian durasi preskripsi, jarak estimasi, target intensitas, panduan Talk Test, serta *safety alert* sendi saat kartu sesi diklik.

### E. Integrasi Navigasi & Dashboard Utama (`src/app/page.tsx`, `src/app/health/page.tsx`, `src/app/activities/page.tsx`)
- Menambahkan tautan navigasi global `Jadwal Latihan` (`/training`) dengan ikon kalender Volt di seluruh bilah navigasi header.
- Menghubungkan kartu *Scheduled Training Calendar* di dashboard utama dengan rencana aktif, menampilkan 5 sesi terdekat, dan menyematkan target makro (Road to 100km Century Ride di 56.1% dan Jalur Maraton 42.2K di 29.2%).

---

## 3. Rincian File yang Dimodifikasi & Ditambahkan

```
modified:   src/app/activities/page.tsx       (Menambahkan nav link Jadwal Latihan /training)
modified:   src/app/health/page.tsx           (Menambahkan nav link Jadwal Latihan /training)
modified:   src/app/page.tsx                  (Integrasi header /training, active plan card, macro goals telemetry)
modified:   src/lib/ai-coach.ts               (Rekomendasi coach berbasis 100K Century, Marathon Pathway, dan Puasa)
modified:   src/lib/db.ts                     (TrainingPlan CRUD, formatDateOnly, pg.types.setTypeParser(1082))
modified:   src/types/index.ts                (Tipe TrainingPlan)
untracked:  scripts/seed_coach_training.js    (Seeder 12-week plan, 38 workouts, dan fitness goals ke PostgreSQL)
untracked:  scripts/test_coach_training_system.js (Automated test suite untuk sistem training)
untracked:  src/app/api/training/generate/    (API route POST untuk sinkronisasi latihan)
untracked:  src/app/training/page.tsx         (Halaman rute server-side dedicated /training)
untracked:  src/components/training/          (Komponen ScheduleTrainingHub.tsx)
untracked:  src/lib/coachTrainingGenerator.ts (Mesin generator 12-minggu Zone 2)
```

---

## 4. Hasil Pengujian & Verifikasi Kualitas

1. **Test Suite Sistem Training (`scripts/test_coach_training_system.js`)**:
   - **5 Passed, 0 Failed**.
   - Terverifikasi keberadaan *Active Training Plan* 12-Minggu di database PostgreSQL.
   - Terverifikasi 38 sesi latihan (36 sesi terencana + 2 sesi riwayat terverifikasi Strava).
   - Terverifikasi kepatuhan terhadap proteksi puasa Senin & Kamis dan keselamatan lari bertahap.
   - Terverifikasi pencocokan otomatis sesi historis Strava (*workout activity matching*).
   - Terverifikasi target makro berbasis data nyata (100 km Century Ride & 42.2K Marathon Pathway).
2. **Test Suite Sistem Kesehatan Atlet (`scripts/test_athlete_health_system.js`)**:
   - **32 Passed, 0 Failed**.
   - Terverifikasi status Running `ON_HOLD` dan Cycling `CONDITIONAL`.
3. **Kompilasi TypeScript**:
   - `npx tsc --noEmit` sukses tanpa error (exit code 0).
4. **Verifikasi SSR (Server-Side Rendering)**:
   - Request stream ke `http://localhost:3000/training` sukses menghasilkan response 200 OK (>200 KB) dengan elemen kalender grid, kartu puasa, kartu sabtu buffer, dan tab fase 12 minggu.
