# Changelog: Penyelarasan Pemilih Cabor dengan 33 Cabor Resmi Sistem (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-20 13:20:00 WIB
- **Tipe**: `feat(ui)` / `refactor(domain)` / `fix(ux)` / `test(registry)`
- **Commit Message Rujukan**: `feat(ui): align sport type selector with 33 decoupled system sports, add cluster filter tabs, live search, and fix visual truncation` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui`
- **Lokasi**: [`docs/10-changelog/feat/ui/2026-11-20_13-20-00_feat-system-sports-selector-alignment-and-33-cabor-registry.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-20_13-20-00_feat-system-sports-selector-alignment-and-33-cabor-registry.md)

---

## 1. Latar Belakang & Rasional Perubahan

Sebelumnya, komponen pemilih cabor [`SportTypeSelector.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/SportTypeSelector.tsx) pada modal pencatatan aktivitas masih menampilkan 6 preset generik lama (*Sepeda, Lari, Renang, Jalan, Beban, Umum*) dan tombol penambahan cabor kustom yang mengalami bug visual (`+ + Cabang Kustom Baru` dan teks terpotong `Gym / Beb...`).

Hal ini **tidak selaras dengan 33 agen cabor spesifik dunia** yang telah dibangun secara lengkap pada domain arsitektur (*Phase 1 hingga Phase 7*). Pengguna yang ingin mencatat sesi untuk cabor spesifik yang ada di sistem (seperti *Bulu Tangkis, Brazilian Jiu-Jitsu, Angkat Besi, Panjat Tebing, Futsal, atau Dayung*) tidak dapat memilihnya secara langsung.

Oleh karena itu, dilakukan rekayasa ulang antarmuka pemilih cabor agar **100% selaras dengan 33 cabor yang ada di sistem** sekaligus memperbaiki seluruh kekurangan visual.

---

## 2. Rincian Perubahan Modul & Komponen

### A. Registri Tunggal Cabor Sistem (`src/lib/domain/sports/`)
1. **[`systemSportsRegistry.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/sports/systemSportsRegistry.ts) (85 baris)**:
   - Dibuat sebagai *single source of truth* untuk 33 cabor resmi sistem yang terbagi ke dalam 6 kluster fisiologis:
     - **Daya Tahan Siklik (6 Cabor)**: Lari Jarak Jauh & Maraton, Balap Sepeda Jalan Raya, Sepeda Gunung MTB XC, Renang, Dayung, Triathlon.
     - **Kekuatan & Daya Maksimal (5 Cabor)**: Powerlifting (SBD), Angkat Besi Olimpiade, Kalistenik, Strongman, Binaraga.
     - **Bela Diri & Kontak (6 Cabor)**: Tinju, MMA, Brazilian Jiu-Jitsu (BJJ), Pencak Silat, Judo, Muay Thai.
     - **Olahraga Beregu & Lapangan (6 Cabor)**: Sepak Bola, Bola Basket, Bola Voli, Futsal, Rugbi, Hoki Lapangan.
     - **Raket & Presisi (5 Cabor)**: Bulu Tangkis, Tenis Lapangan, Tenis Meja, Panahan, Menembak Presisi.
     - **Kebugaran Fungsional & Ekstrem (5 Cabor)**: Kebugaran Fungsional (CrossFit/Hyrox), Panjat Tebing, Senam Artistik, Selancar Ombak, Skateboard.
   - Menyediakan fungsi pencarian cepat `findSystemSport(query)` yang memetakan kode cabor, nama Indonesia, singkatan, dan alias.

### B. Antarmuka Pemilih Cabor Baru (`src/components/activity/modal/`)
1. **[`SportTypeSelector.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/SportTypeSelector.tsx) (217 baris)**:
   - **Remediasi Bug Visual**:
     - Memperbaiki duplikasi ikon & teks: `<Plus />` tidak lagi diikuti string `+`, sehingga tidak ada lagi tampilan ganda `+ +`.
     - Mengeliminasi teks terpotong (`Gym / Beb...`) menjadi representasi kartu responsif yang rapi.
   - **Tab Filter Kluster**:
     - Menyediakan navigasi tab instan: `Semua (33)`, `Endurance (6)`, `Strength (5)`, `Combat (6)`, `Team (6)`, `Racquet (5)`, dan `Extreme (5)`.
   - **Pencarian Cepat (*Live Search*)**:
     - Input pencarian real-time untuk menyaring 33 cabor berdasarkan nama, cabor alias, atau kluster.
   - **Grid Cabor Terintegrasi**:
     - Menampilkan kartu cabor dengan ikon kluster, nama singkat, nama lengkap, serta indikator seleksi aktif (*checkmark* & *highlight border*).
   - **Mode Cabor Kustom di Luar Sistem**:
     - Tetap menyediakan opsi fleksibel `+ Cabor Kustom Baru` jika atlet ingin mendaftarkan cabor langka di luar 33 cabor resmi sistem.

2. **[`SportSpecificTelemetryFields.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/SportSpecificTelemetryFields.tsx) (152 baris)**:
   - Terkoneksi dengan cabor yang dipilih. Begitu salah satu dari 33 cabor dipilih, field telemetri terkait (beban, repetisi, ronde, HSR, split time, TUT, dsb.) **langsung ter-generate secara otomatis tanpa ada yang mengembalikan nilai kosong**.

---

## 3. Rangkaian Pengujian Otomatis & Verifikasi

- **Suite Pengujian Baru**: [`scripts/tests/test_system_sports_registry.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/tests/test_system_sports_registry.js) (72 baris).
  - Memvalidasi keselarasan 1-ke-1 antara 33 agen cabor pada `SportCoordinatorRouter` dengan registri UI.
  - Memvalidasi kuota kluster (6 Endurance, 5 Strength, 6 Combat, 6 Team, 5 Racquet, 5 Extreme).
  - Memvalidasi pencarian alias (BJJ, Lari, Tinju).
  - **Hasil**: **44 Passed, 0 Failed**.
- **Hasil Pengujian Terpadu (`npm run test:all`)**:
  - Lulus **16 dari 16 test suite** (**419+ pengujian lulus, 0 gagal**).
- **Next.js Turbopack Build**: `npm run build` sukses mengompilasi **35/35 rute** aplikasi dalam 4.8s (TypeScript 7.8s) dengan **0 kesalahan**.
- **Disiplin Batas Baris Kode (`< 300 lines`)**:
  - `systemSportsRegistry.ts`: 85 baris
  - `SportTypeSelector.tsx`: 217 baris
  - `SportSpecificTelemetryFields.tsx`: 152 baris
  - **100% berkas berada di bawah batas 300 baris**.
