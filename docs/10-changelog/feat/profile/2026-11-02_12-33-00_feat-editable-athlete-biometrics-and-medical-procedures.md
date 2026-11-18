# Changelog: Interaktifitas Edit Profil Biometrik Atlet & Pencatatan Prosedur Medis (`feat/profile`)

- **Tanggal & Waktu**: 2026-11-02 12:33:00 WIB
- **Tipe**: `feat(profile)` / `feat(health)` / `feat(ui)` / `feat(api)` / `feat(db)`
- **Commit Message**: `feat(profile): implement editable biometric profile badge, medical assessment procedures, and return-to-run clearance gateway`
- **Branch**: `feat/training`

---

## 1. Latar Belakang & Kebutuhan Atlet

Sebelum implementasi ini, bilah indikator profil biometrik atlet pada bilah navigasi atas dashboard (`68 bpm RHR | 170 cm | 65 kg | BMI 22.5 • Apex Athlete`) ditampilkan secara statis sebagai teks penanda baca-saja (*read-only*). Dalam siklus latihan dinamis seorang atlet, terdapat kebutuhan mendesak untuk mengubah dan mencatat data secara langsung:
1. **Fluktuasi Biometrik Harian**: Atlet mengalami perubahan berat badan aktif ($kg$), perbaikan detak jantung istirahat bangun pagi (*Resting Heart Rate* / RHR), serta penyesuaian ketersediaan jadwal hari latihan per minggu yang memerlukan antarmuka kalibrasi langsung tanpa harus merubah kode atau database secara manual.
2. **Pencatatan Prosedur Kesehatan & Tindakan Fisioterapi Tambahan**: Atlet dengan riwayat cedera pergelangan kaki kanan (*sprain*) dan keluhan nyeri lutut anterior bilateral memerlukan sarana formal untuk mendokumentasikan prosedur klinis atau terapi fisik yang telah dijalani (seperti sesi fisioterapi ultrasound, TENS, terapi kompres es/POLICE, mobilisasi sendi, dan protokol penguatan isometrik VMO/eksentrik betis).
3. **Pembaruan Status Evaluasi Klinis Sendi**: Status evaluasi sendi yang sebelumnya berada pada status `PENDING_CLINICAL_ASSESSMENT` perlu dapat diperbarui menjadi `SCHEDULED`, `CLINICALLY_ASSESSED`, `UNDER_TREATMENT`, atau `DISCHARGED_CLEARED` ketika atlet telah berkonsultasi dengan fisioterapis olahraga atau dokter spesialis.
4. **Pembukaan Izin Medis Kembali Berlari (*Return-to-Run Medical Clearance*)**: Jika tenaga medis terlisensi telah memberikan persetujuan formal, atlet dapat mengaktifkan sakelar *clearance* medis yang secara deterministik memperbarui kesiapan lari atlet dari `ON_HOLD` menjadi `CAUTIOUS_RETURN`, membuka gembok progresi beban latihan lari bertahap (*Walk/Jog Micro-Dosing*).

---

## 2. Rincian Implementasi & Rekayasa Sistem

### A. Komponen Interaktif Modal Edit Profil Atlet (`src/components/health/EditAthleteProfileModal.tsx`)
1. **Transformasi Badge Biometrik Menjadi Pemicu Interaktif:**
   - Elemen bilah biometrik pada header dashboard diubah menjadi tombol pemicu interaktif dengan *hover state* responsif, animasi denyut RHR, ikon pensil edit, dan tooltip panduan.
   - Mendukung dua varian pemicu: `variant="badge"` (untuk bilah navigasi utama) dan `variant="button"` (tombol aksi formal di halaman `/health`).
2. **Arsitektur Formulir Dual-Tab:**
   - **Tab 1: 📊 Biometrik & Profil Atlet:**
     - Input nama lengkap atlet (`name`), usia (`age`), detak jantung istirahat (`resting_heart_rate`), tinggi badan (`height_cm`), dan bobot badan (`weight_kg`).
     - **Kalkulator BMI Dinamis Live:** Menghitung otomatis $\text{BMI} = \text{BB} / (\text{TB}/100)^2$ dengan label status instan (*Normal / Ideal*, *Kurus*, atau *Kelebihan Bobot*).
     - **Selektor Ketersediaan Latihan Mingguan:** Tombol pilihan 2, 3, 4, atau 5 sesi per minggu dengan penegasan proteksi puasa sunnah Senin & Kamis.
   - **Tab 2: 🏥 Prosedur & Catatan Medis:**
     - **Selektor Status Evaluasi Sendi:** Mengubah status klinis pergelangan kaki kanan dan kedua lutut secara terpisah (`PENDING_CLINICAL_ASSESSMENT`, `CLINICALLY_ASSESSED`, `UNDER_TREATMENT`, `DISCHARGED_CLEARED`).
     - **Formulir Pencatatan Prosedur / Tindakan Baru:** Input tanggal tindakan, jenis tenaga medis (*Physiotherapist*, *Sports Medicine Physician - Sp.KO*, *Orthopedic Surgeon - Sp.OT*, *General Practitioner*), nama dokter/klinik, rincian tindakan terapi, dan temuan klinis.
     - **Toggle Izin Medis Kembali Berlari (*Medical Clearance Switch*):** Sakelar persetujuan resmi medis yang secara deterministik memperbarui kesiapan lari atlet.
     - **Daftar Riwayat Asesmen Klinis:** Menampilkan histori prosedur dan asesmen medis yang pernah dicatat sebelumnya.

### B. REST API Gateway (`src/app/api/athlete/profile/route.ts`)
- **`GET /api/athlete/profile`**: Mengambil profil pengguna, profil atlet, dan konteks kesehatan otoritatif.
- **`POST /api/athlete/profile`**:
  - Menerima mutasi data biometrik dasar dan memanggil `updateUserProfile`.
  - Jika terdapat data prosedur medis baru, memanggil `recordMedicalProcedureAndAssessment`.
  - Melakukan revalidasi cache Next.js (`/`, `/health`, `/training`, `/activities`) sehingga perubahan langsung tercermin di seluruh tampilan tanpa me-reload paksa.

### C. Persistensi Basis Data PostgreSQL 16 & Audit Trail (`src/lib/db.ts`)
1. **Fungsi `updateUserProfile(userId, params)`:**
   - Memperbarui tabel `users` (`name`, `height_cm`, `weight_kg`, `resting_heart_rate`, `max_heart_rate`).
   - Memperbarui tabel `athlete_profiles` (`age`, `height_cm`, `weight_kg`, `resting_heart_rate`, `training_days_per_week`). Kolom `bmi` dihitung otomatis oleh PostgreSQL melalui *STORED GENERATED COLUMN*.
   - Mencatat rekaman jejak audit ke tabel `health_audit_trail` (`entity_type: 'ATHLETE_PROFILE'`, `action: 'UPDATE'`).
2. **Fungsi `recordMedicalProcedureAndAssessment(userId, params)`:**
   - Memasukkan data ke tabel `athlete_medical_assessments`.
   - Memperbarui status klinis di tabel `athlete_injuries` untuk engkel dan/atau lutut.
   - Menjalankan deterministik `evaluateTrainingReadiness` untuk menyelaraskan status kesiapan latihan dan menyimpan hasilnya ke `athlete_training_readiness`.
   - Mencatat rekaman jejak audit ke tabel `health_audit_trail` (`entity_type: 'ATHLETE_MEDICAL_ASSESSMENT'`, `action: 'CREATE'`).

### D. Integrasi Antarmuka Navigasi & Hub Kesehatan (`src/app/page.tsx` & `AthleteHealthHub.tsx`)
- Menggantikan kode statis badge biometrik di header [`src/app/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/page.tsx) dengan `<EditAthleteProfileModal variant="badge" ... />`.
- Menambahkan tombol aksi `<EditAthleteProfileModal variant="button" ... />` di dalam Tab 5 (*Clinical Assessments & Return-to-Sport*) pada [`src/components/health/AthleteHealthHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/health/AthleteHealthHub.tsx).

---

## 3. Rincian File yang Dimodifikasi & Ditambahkan

```
modified:   src/app/page.tsx                  (Integrasi EditAthleteProfileModal varian badge interaktif di header)
modified:   src/components/health/AthleteHealthHub.tsx (Integrasi tombol EditAthleteProfileModal di Tab Asesmen Klinis)
modified:   src/lib/db.ts                     (updateUserProfile, recordMedicalProcedureAndAssessment, audit trail)
untracked:  docs/10-changelog/feat/profile/   (Berkas changelog baru pada subdirektori feat/profile)
untracked:  src/app/api/athlete/profile/route.ts (Endpoint GET & POST mutasi biometrik dan prosedur kesehatan)
untracked:  src/components/health/EditAthleteProfileModal.tsx (Komponen modal dual-tab biometrik & tindakan medis)
```

---

## 4. Hasil Pengujian & Verifikasi Kualitas

1. **Uji HTTP API Mutasi Biometrik (`POST /api/athlete/profile`)**:
   - Status response: **`200 OK`**.
   - Berhasil memperbarui nilai RHR, tinggi badan, berat badan, dan usia atlet.
   - Kolom `bmi` dihitung secara deterministik oleh PostgreSQL dan terverifikasi konsisten.
2. **Uji HTTP API Pencatatan Prosedur Medis (`POST /api/athlete/profile`)**:
   - Status response: **`200 OK`**.
   - Berhasil mencatat data tindakan fisioterapi ke `athlete_medical_assessments`.
   - Berhasil memperbarui status evaluasi klinis pada `athlete_injuries` dan mencatat audit log.
3. **Uji Regresi Sistem Kesehatan (`scripts/test_athlete_health_system.js`)**:
   - **32 Passed, 0 Failed**.
   - Terverifikasi konsistensi baseline biometrik, 2 dossier cedera aktif, serta status kesiapan latihan atlet.
4. **Uji Regresi Sistem Training (`scripts/test_coach_training_system.js`)**:
   - **5 Passed, 0 Failed**.
   - Terverifikasi integritas 38 sesi kalender latihan 12-minggu.
5. **Kompilasi TypeScript**:
   - `npx tsc --noEmit` sukses tanpa error (**exit code 0**).

