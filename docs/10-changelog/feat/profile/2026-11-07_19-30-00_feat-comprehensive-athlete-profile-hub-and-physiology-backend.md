# Changelog: Comprehensive Athlete Profile Hub, Karvonen HR Zones, and Gear Telemetry Backend (`feat/profile`)

- **Tanggal & Waktu**: 2026-11-07 19:30:00 WIB
- **Tipe**: `feat(profile)` / `feat(backend)` / `feat(ui)` / `feat(domain)`
- **Commit Message Rujukan**: `feat(profile): implement dedicated athlete profile hub, karvonen heart rate zones, gear telemetry, and enhanced profile api`
- **Branch**: `feat/profile`
- **Lokasi**: `docs/10-changelog/feat/profile/2026-11-07_19-30-00_feat-comprehensive-athlete-profile-hub-and-physiology-backend.md`

---

## 1. Latar Belakang & Akar Masalah

Sebelum pembaruan ini, platform *Endurance Performance Lab* memiliki keterbatasan pada manajemen profil atlet:
1. **Tidak Ada Halaman Khusus Profil Atlet (`/profile`)**:
   - Pengguna hanya dapat melihat ringkasan metrik biometrik secara terbatas melalui badge kecil di header atau modal popup terpisah.
   - Tidak ada pusat komando terpadu untuk melihat data identitas biologis, riwayat atletik, kapasitas aerobik, dan alokasi peralatan.
2. **Keterbatasan API Profil Terdahulu**:
   - Fungsi `updateUserProfile` di `userRepo.ts` dan rute `/api/athlete/profile` hanya menyimpan nama dan metrik dasar (usia, tinggi, berat, RHR, dan hari latihan).
   - Bidang krusial seperti sasaran musim (`performance_objectives`), tingkat pengalaman (`training_experience`), cabang olahraga pilihan (`preferred_sports`), foto avatar (`avatar_url`), serta nilai kapasitas fisiologis (`physiological_measurements` seperti FTP watts dan estimasi VO2max) tidak terlayani dengan optimal.
3. **Data Peralatan (*Athlete Equipment*) Belum Memiliki Antarmuka**:
   - Tabel `athlete_equipment` di PostgreSQL telah menyimpan data sepeda (Trek Marlin 7) dan sepatu lari (Nike Pegasus Trail 4), namun belum pernah ditampilkan atau dapat dikelola oleh pengguna melalui antarmuka visual.
4. **Ketiadaan Spektrum Zona Denyut Jantung Mandiri**:
   - Atlet tidak memiliki visualisasi zona latihan kardio (*Zone 1 - Zone 5*) yang dikalkulasi secara presisi berdasarkan formula cadangan denyut jantung (*Heart Rate Reserve* / Karvonen).

---

## 2. Rincian Solusi & Implementasi Teknis

### A. Modul Domain Fisiologi Kardiovaskular (`src/lib/domain/physiology/heartRateZones.ts`)
Menerapkan modul *Clean Architecture Domain* murni tanpa dependensi eksternal untuk kalkulasi fisiologis atlet:
1. **Formula Karvonen HRR (*Heart Rate Reserve*)**:
   - $\text{HRR} = \text{HRmax} - \text{RHR}$
   - Menghasilkan 5 zona latihan:
     - **Zone 1 (Pemulihan Aktif)**: 50% – 60% HRR (128 – 140 bpm).
     - **Zone 2 (Fondasi Aerobik / Target Utama)**: 60% – 70% HRR (140 – 152 bpm).
     - **Zone 3 (Tempo & Ritme Terjaga)**: 70% – 80% HRR (152 – 164 bpm).
     - **Zone 4 (Ambang Laktat / Threshold)**: 80% – 90% HRR (164 – 176 bpm).
     - **Zone 5 (Kapasitas Anaerobik)**: 90% – 100% HRR (176 – 188 bpm).
2. **Kategori BMI & Formula Tanaka HRmax**:
   - Perhitungan BMI otomatis: $\text{BMI} = \text{weight} / (\text{height}/100)^2$.
   - Estimasi HRmax usia Tanaka: $208 - (0.7 \times \text{age})$.
3. **Rasio Daya Bersepeda (*Power-to-Weight Ratio*)**:
   - Kalkulasi $\text{W/kg} = \text{FTP Watts} / \text{Weight (kg)}$ beserta klasifikasi performa atletik.

---

### B. Ekspansi Backend & API Endpoints
1. **Penyempurnaan `updateUserProfile` (`src/lib/db/userRepo.ts`)**:
   - Memperluas interface `UpdateUserProfileParams` untuk mendukung `avatar_url`, `preferred_sports`, `training_experience`, `performance_objectives`, dan `physiological_measurements`.
   - Melakukan sinkronisasi data pada tabel `users` dan `athlete_profiles` secara transaksional dengan rekonsiliasi audit trail `logHealthAuditTrail`.
2. **Penyempurnaan API Profil (`src/app/api/athlete/profile/route.ts`)**:
   - Metode `GET` kini mengembalikan payload lengkap: `user`, `profile`, `healthContext`, `equipment`, dan `capacities` (hasil komputasi zona & BMI real-time).
   - Metode `POST`/`PUT` menerima pembaruan profil atlet komprehensif dan secara otomatis merevalidasi cache halaman Next.js (`/profile`, `/health`, `/training`, `/activities`, `/`).
3. **Endpoint Baru Perlengkapan Atlet (`src/app/api/athlete/equipment/route.ts`)**:
   - Mendukung `GET` untuk mengambil daftar gear aktif.
   - Mendukung `POST` untuk menambah gear baru (sepatu lari atau sepeda) dengan batas akumulasi jarak aman.

---

### C. Pusat Antarmuka Profil Atlet (`/profile`)
1. **Halaman Khusus (`src/app/profile/page.tsx`)**:
   - Server Component berperforma tinggi dengan Partial Prerendering dan fallback skeleton.
2. **Komponen Inti Profil (`src/components/profile/`)**:
   - `AthleteProfileHeader.tsx`: Kartu identitas atlet berhias ring status kalibrasi, email, badge streak mingguan, objektif musim, dan tombol edit profil.
   - `BiometricsCardGrid.tsx`: 6 kartu biometrik presisi (Tinggi Badan, Berat Badan, BMI dengan progress bar, Resting HR beranimasi denyut nadi, HRmax, dan Hari Ketersediaan Latihan).
   - `HeartRateZonesCard.tsx`: Spektrum 5 zona denyut jantung interaktif dengan penyorotan khusus Zona 2 sebagai target utama.
   - `PhysiologicalTelemetryCard.tsx`: Dasbor daya fungsional FTP, rasio W/kg, estimasi VO2max, dan tag cabang olahraga favorit.
   - `AthleteEquipmentCard.tsx`: Loker perlengkapan sepeda dan sepatu lari dengan indikator persentase keausan terhadap batas aman pabrikan, serta formulir penambahan gear baru.
   - `KinematicGateSummaryCard.tsx`: Jembatan pengaman gerbang kesehatan sendi menuju Dossier Klinis (`/health`).
   - `EditProfileModal.tsx`: Modal kalibrasi multi-tab (*Identitas*, *Biometrik*, *Fisiologi*) dengan kalkulasi BMI dan rasio W/kg langsung saat mengetik (*live calculation*).

---

### D. Integrasi Navigasi Platform
1. **Sidebar (`src/components/layout/AppSidebar.tsx`)**:
   - Menambahkan menu navigasi baru: `Profil Atlet` (`/profile`) dengan ikon `UserCircle` dan badge `PRO`.
2. **Header (`src/components/layout/AppHeader.tsx`)**:
   - Menjadikan avatar dan nama atlet di sudut kanan atas sebagai tombol navigasi langsung ke `/profile`.
   - Menambahkan judul bagian dinamis: *"Profil Atlet & Kalibrasi Biometrik"* saat pengguna berada di halaman profil.

---

## 3. Matriks Berkas yang Dimodifikasi & Ditambahkan

| Kategori | Lokasi Berkas | Keterangan |
|---|---|---|
| **Domain** | `src/lib/domain/physiology/heartRateZones.ts` | Logika murni zona Karvonen, BMI, dan rasio W/kg |
| **Backend** | `src/lib/db/userRepo.ts` | Ekspansi fungsi `updateUserProfile` dan tipe data |
| **Backend** | `src/app/api/athlete/profile/route.ts` | Integrasi kapasitas fisiologis dan revalidasi `/profile` |
| **Backend** | `src/app/api/athlete/equipment/route.ts` | API CRUD perlengkapan sepatu dan sepeda |
| **Halaman** | `src/app/profile/page.tsx` | Rute halaman baru `/profile` |
| **UI** | `src/components/profile/AthleteProfileHub.tsx` | Komponen orkestrator profil atlet |
| **UI** | `src/components/profile/AthleteProfileHeader.tsx` | Header profil dan status kalibrasi |
| **UI** | `src/components/profile/BiometricsCardGrid.tsx` | Grid 6 kartu biometrik presisi |
| **UI** | `src/components/profile/HeartRateZonesCard.tsx` | Visualisasi 5 zona denyut jantung Karvonen |
| **UI** | `src/components/profile/PhysiologicalTelemetryCard.tsx` | Kartu FTP, W/kg, VO2max, dan disiplin olahraga |
| **UI** | `src/components/profile/AthleteEquipmentCard.tsx` | Loker perlengkapan dan pelacak jarak gear |
| **UI** | `src/components/profile/KinematicGateSummaryCard.tsx` | Ringkasan gerbang pemantauan sendi |
| **UI** | `src/components/profile/EditProfileModal.tsx` | Modal formulir kalibrasi multi-tab |
| **Navigasi**| `src/components/layout/AppSidebar.tsx` | Penambahan link menu `/profile` |
| **Navigasi**| `src/components/layout/AppHeader.tsx` | Avatar & nama atlet dapat diklik menuju `/profile` |

---

## 4. Verifikasi & Pengujian Mutu

1. **TypeScript Type Safety**:
   ```bash
   npx tsc --noEmit
   ```
   **Hasil**: `0 errors` (100% type-safe).
2. **Kompilasi Produksi Next.js**:
   ```bash
   npm run build
   ```
   **Hasil**: 30/30 rute berhasil dikompilasi (termasuk rute baru `◐ /profile` dan `ƒ /api/athlete/equipment`).
3. **Unit & System Tests**:
   - `test_weekly_streak_system.js`: 21/21 passed.
   - `test_athlete_health_system.js`: 31/31 passed.
   - `test_coach_training_system.js`: 5/5 passed.
   **Total**: 57/57 assertions lulus tanpa regresi.

