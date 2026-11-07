# Changelog: Dynamic Sport Type Extensibility & Telemetry Engine (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-02 19:30:00 WIB
- **Tipe**: `feat(backend)` / `feat(domain)` / `feat(telemetry)` / `feat(sports)`
- **Commit Message Rujukan**: `feat(backend): implement dynamic sport extensibility engine, multi-discipline kinematics, and adaptive activity registry`
- **Branch**: `refactor`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-02_19-30-00_feat-dynamic-sport-extensibility-and-telemetry-engine.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Sebelum implementasi ini, arsitektur data dan logika presentasi aktivitas platform terikat secara ketat (*tightly coupled*) pada dua cabang olahraga utama (*Ride* dan *Run*):

1. **Enum Kaku & Pembatasan Tipe Data**:
   - Seluruh kalkulasi telemetri di lapisan visual dan repositori mengasumsikan hanya ada dua cabang olahraga. Aktivitas di luar sepeda atau lari (misalnya *Renang*, *Jalan Kaki*, *Latihan Beban / Gym*, atau *Trail Run*) tidak memiliki representasi metrik visual, format kinematika (*pace vs speed*), atau kartu KPI ringkasan yang sesuai.
2. **Ketiadaan Mekanisme Penambahan Cabang Olahraga Dinamis**:
   - Pengguna tidak memiliki cara untuk mendaftarkan atau mencatat sesi latihan dari cabang olahraga kustom baru tanpa memodifikasi kode sumber atau skema basis data secara manual.
3. **Penyimpangan Format Kinematika (*Kinematics Misalignment*)**:
   - Olahraga yang mengukur performa berbasis waktu per kilometer (*Running Pace: mm:ss /km*, seperti lari, jalan kaki, dan hiking) memerlukan format yang berbeda dengan olahraga yang mengukur kecepatan linear (*km/h*, seperti sepeda dan selancar), maupun olahraga renang (*pace per 100m*).

Pembaruan ini menghadirkan **Dynamic Sport Extensibility Engine** yang membuat domain model, repositori basis data, API endpoint, dan antarmuka analitik terbuka (*open for extension, closed for modification*) terhadap cabang olahraga baru apa pun.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Modul Extensibilitas Cabang Olahraga Terpusat (`src/lib/sportUtils.ts`)

File baru berukuran 183 baris yang menjadi otoritas tunggal metadata cabang olahraga di seluruh aplikasi:

1. **Interface `SportMeta`**:
   ```typescript
   export interface SportMeta {
     id: string;
     name: string;
     label: string;
     iconName: "bike" | "footprints" | "waves" | "dumbbell" | "compass" | "activity";
     colorKey: "cyan" | "volt" | "sky" | "amber" | "rose" | "emerald";
     accentHex: string;
     badgeClass: string;
     isPaceFormat: boolean; // true = mm:ss /km, false = km/h
   }
   ```
2. **Preset Registry `PRESET_SPORTS`**:
   - Menyediakan 7 profil standar terkalibrasi lengkap:
     - `Ride`: Sepeda (Aksen Cyan `#00F0FF`, icon `bike`, format `km/h`).
     - `Run`: Lari (Aksen Volt `#D4FF00`, icon `footprints`, format `/km`).
     - `Swim`: Renang (Aksen Sky Blue `#38BDF8`, icon `waves`, format `km/h`).
     - `Walk`: Jalan Kaki (Aksen Amber `#F59E0B`, icon `compass`, format `/km`).
     - `Hike`: Hiking (Aksen Amber `#F59E0B`, icon `compass`, format `/km`).
     - `WeightTraining`: Gym / Beban (Aksen Rose `#FF2A6D`, icon `dumbbell`, format `km/h`).
     - `Workout`: Latihan Umum / Kondisioning (Aksen Emerald `#10B981`, icon `activity`).
3. **Fungsi Resolusi Otomatis `getSportMeta(sportType: string)`**:
   - Menormalkan string input secara *case-insensitive*.
   - Jika cabang olahraga cocok dengan variasi preset (misal: "cycling", "mtb", "jogging", "renang", "gym", "beban"), sistem mengembalikan preset yang sesuai.
   - **Dukungan Cabang Kustom Penuh (*Dynamic Fallback*)**: Jika pengguna memasukkan cabang baru yang belum terdaftar (misal: *Padel*, *Rowing*, *Badminton*, *Yoga*), sistem secara instan menghasilkan objek `SportMeta` adaptif dengan lencana emerald Obsidian dan label kustom otomatis tanpa terjadi *runtime crash*.
4. **Fungsi Agregasi Dinamis `getDistinctSports(activities: Activity[])`**:
   - Mengekstraksi seluruh `sport_type` unik yang ada di dalam database/array aktivitas.
   - Menerapkan *precedence sorting* cerdas: cabang utama (Ride dan Run) selalu berada di depan, disusul oleh cabang olahraga lainnya secara alfabetis.

---

### B. Kompatibilitas Layer Database & REST API

1. **Penanganan `sport_type` Fleksibel pada Repositori (`src/lib/db/activityRepo.ts`)**:
   - Kolom `sport_type` pada tabel PostgreSQL `activities` berukuran `VARCHAR(50)` dan bertipe `SportType` (yang meng-extend `string` di TypeScript).
   - Fungsi `createManualActivity` dan `updateActivity` memproses `sport_type.trim()` secara aman tanpa restriksi enum kaku, mendukung penyimpanan cabang apa pun ke PostgreSQL 16 maupun `.data/store.json`.
2. **Endpoint `POST /api/activities`**:
   - Menerima payload `sport_type` dinamis dari pengguna.
   - Menghitung nilai `average_speed_mps` secara presisi dari rasio jarak dan waktu bergerak:
     $$\text{average\_speed\_mps} = \frac{\text{distance\_meters}}{\text{moving\_time\_seconds}}$$
3. **Endpoint `PATCH /api/activities/[id]`**:
   - Memungkinkan pembaruan cabang olahraga sesi eksisting secara tunggal maupun melalui operasi massal (*batch update*).

---

### C. Pengelompokan & Kinematika Otomatis (`src/components/activity/deck/activityGroupUtils.ts`)

1. **Pengelompokan Otomatis (*Grouping by Sport*)**:
   - Saat atlet memilih opsi grouping "Cabang Olahraga", fungsi `groupActivities` menggunakan `getSportMeta(act.sport_type)` untuk menghasilkan judul grup terformat (`CABANG OLAHRAGA: SEPEDA`, `CABANG OLAHRAGA: RENANG`, dst.) serta warna lencana dinamis (*Volt*, *Cyan*, *Amber*, *Emerald*).
2. **Resolusi Format Kecepatan Dinamis**:
   - Menggantikan logika kaku `isRun` dengan `meta.isPaceFormat`:
     ```typescript
     const meta = getSportMeta(key);
     g.avgPaceOrSpeed = meta.isPaceFormat
       ? speedMpsToPace(avgSpeed)
       : speedMpsToKmh(avgSpeed);
     ```

---

### D. Integrasi Komponen Frontend & Input Pengguna

1. **`ActivityManualFormFields.tsx`**:
   - Menambahkan tombol pilihan cepat untuk 6 cabang olahraga preset berikon SVG.
   - Menambahkan tombol interaktif **`+ Cabang Kustom Baru`** yang memunculkan *input text field* untuk memasukkan nama cabang olahraga apa pun secara langsung.
2. **`EditActivityModal.tsx`**:
   - Memungkinkan pengubahan cabang aktivitas lama ke preset baru (*Swim, Walk, Hike, WeightTraining*) maupun ke cabang kustom melalui mode input teks bebas.
3. **`ActivityBatchActionBar.tsx`**:
   - Dropdown "Ubah Cabang Massal" kini mencakup `Run`, `Ride`, `Swim`, `Walk`, `Hike`, `WeightTraining`, `Workout`, dan `CrossTraining`.
4. **`ActivityDeckHeader.tsx` & `ActivityFilterToolbar.tsx`**:
   - Menggunakan `getDistinctSports` untuk merender kartu KPI dan pil filter secara dinamis sesuai cabang olahraga yang ada di basis data.

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/lib/sportUtils.ts` | Baru | +183 | 0 | Mesin extensibilitas metadata cabang olahraga, resolusi kustom, & ekstraksi unik |
| `src/components/activity/modal/ActivityManualFormFields.tsx` | Modifikasi | +115 | -35 | Preset grid 6 olahraga, tombol & input teks pembuatan cabang kustom baru |
| `src/components/EditActivityModal.tsx` | Modifikasi | +57 | -31 | Dukungan pemilihan preset baru & toggle input cabang kustom |
| `src/components/activity/deck/ActivityBatchActionBar.tsx` | Modifikasi | +6 | -3 | Penambahan opsi cabang olahraga massal (*Swim, WeightTraining, Walk, dll.*) |
| `src/components/activity/deck/activityGroupUtils.ts` | Modifikasi | +13 | -4 | Integrasi `getSportMeta`, label grup terformat, & kinematika pace/speed dinamis |
| `src/components/activity/deck/ActivityDeckHeader.tsx` | Modifikasi | +110 | -45 | Rendering grid kartu KPI dinamis untuk seluruh cabang olahraga terdata |
| `src/components/activity/deck/ActivityFilterToolbar.tsx` | Modifikasi | +45 | -20 | Pil filter dinamis berbasis `availableSports` dengan penghitung sesi |
| `src/components/activity/deck/ActivityGroupCard.tsx` | Modifikasi | +55 | -25 | Lencana visual berikon dinamis (*Bike, Footprints, Waves, Dumbbell, Compass*) |
| `src/components/ActivityManagementDeck.tsx` | Modifikasi | +20 | -8 | Sinkronisasi `distinctSports` & `availableSports` ke header dan filter |

**Total Perubahan**: 9 file termodifikasi/dibuat, **+604 baris ditambahkan**, **-171 baris dihapus**.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Uji Coba Penambahan Cabang Riil (End-to-End API Test)**:
   - Mengirimkan request `POST /api/activities` dengan payload:
     ```json
     {
       "name": "Uji Coba Latihan Renang 1500m",
       "sport_type": "Swim",
       "distance_meters": 1500,
       "moving_time_seconds": 2100
     }
     ```
   - **Hasil**: Respons status `200 OK`, `success: true`.
   - Aktivitas `Swim` otomatis tersimpan di PostgreSQL 16, langsung muncul sebagai kartu KPI baru di header `/activities`, memiliki tombol filter tersendiri, dan dikelompokkan dengan ikon ombak (`Waves`) beraksen Sky Blue.
2. **Pemeriksaan Kompilasi TypeScript**:
   - `npx tsc --noEmit` $\to$ **Exit code 0 (0 Error, 100% Type-Safe)**.
3. **Suite Verifikasi Kesehatan & Kesiapan Cedera**:
   - `node scripts/test_athlete_health_system.js` $\to$ **32 PASSED, 0 FAILED (100%)**.
4. **Suite Verifikasi Sistem Pelatihan & Rekor**:
   - `node scripts/test_coach_training_system.js` $\to$ **5 PASSED, 0 FAILED (100%)**.
5. **Verifikasi HTTP Endpoint Langsung**:
   - `http://localhost:3000/activities` $\to$ **HTTP 200 OK**.
   - `http://localhost:3000/health` $\to$ **HTTP 200 OK**.
   - `http://localhost:3000/training` $\to$ **HTTP 200 OK**.
   - `http://localhost:3000/` $\to$ **HTTP 200 OK**.

