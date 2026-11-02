# Changelog: Fitur Edit Sesi Telemetri Aktivitas & Penyesuaian Waktu (`feat/activity-telemetry-editing`)

- **Tanggal & Waktu**: 2026-11-02 07:25:00 WIB
- **Tipe**: `feat(ui)` / `feat(activity)` / `feat(api)` / `feat(db)`
- **Commit Message Rujukan**: `feat(ui): add activity telemetry and timestamp editing modal with real-time cache revalidation`
- **Branch**: `feat/ui`

---

## 1. Latar Belakang & Kebutuhan Atlet

Data aktivitas yang disinkronkan dari Strava atau diimpor melalui file GPS track terkadang memerlukan kalibrasi manual dari atlet, seperti:
1. **Koreksi Tanggal & Jam Latihan (`start_date`)**: Menyesuaikan waktu riil dimulainya sesi jika perangkat jam GPS terlambat mengunci satelit atau terdapat perbedaan zona waktu.
2. **Kustomisasi Judul Aktivitas (`name`)**: Mengganti nama generik (misal: *"Sunday Endurance Long Run"*) menjadi judul spesifik program latihan (misal: *"Aerobic Base Threshold 10K"*).
3. **Pilihan Kategori Cabang Olahraga (`sport_type`)**: Mengubah klasifikasi cabang olahraga (Run, Ride, Walk, Hike, WeightTraining, Workout).
4. **Catatan Evaluasi Latihan (`description`)**: Mencatat data kualitatif seperti sensasi RPE, kondisi hidrasi, cuaca, atau sepatu/gear yang digunakan.
5. **Kalibrasi Metrik Kinematik (Opsional)**: Menyesuaikan jarak (km), durasi bergerak (menit), dan elevasi (m) bila sensor GPS mengalami glitch.

---

## 2. Rincian Implementasi

### A. Komponen Modal Edit Telemetri (`src/components/EditActivityModal.tsx`)
- Komponen Client React berdesain **Obsidian Telemetry** dengan batas hairline 1px `#1F2430`, latar `#12151D`, dan sudut teknis `rounded-sm` (4px).
- **Form Input Terstruktur**:
  - **Nama Aktivitas**: Input teks monospaced untuk judul sesi.
  - **Tanggal & Jam Sesi Latihan**: Input `datetime-local` dengan tema gelap terintegrasi (`[color-scheme:dark]`) yang otomatis terisi dengan timestamp aktivitas saat ini.
  - **Kategori Olahraga**: Segmented button options dengan indikator visual warna semantik (**Volt Lime** `#D4FF00` untuk Run dan **Electric Cyan** `#00F0FF` untuk Ride).
  - **Catatan & Evaluasi Latihan**: Textarea monospaced untuk deskripsi dan observasi atlet.
  - **Kalibrasi Kinematik (Jarak, Durasi, Elevasi)**: Input numerik tabular untuk penyesuaian metrik fisik.
- **Dukungan Varian Pemicu**:
  - `variant="button"`: Tombol aksi utama `"Edit Sesi"` di samping judul halaman.
  - `variant="inline"`: Tombol teks kecil bergaris bawah `"Ubah Waktu"` tepat di sebelah tanggal dan jam aktivitas.

---

### B. Integrasi Halaman Detail Aktivitas (`src/app/activities/[id]/page.tsx`)
- Menempatkan tombol utama `<EditActivityModal activity={activity} variant="button" />` di samping judul aktivitas level hero (`h1`).
- Menempatkan pemicu inline `<EditActivityModal activity={activity} variant="inline" />` di samping indikator penanggalan kalender dan jam sesi.

---

### C. REST API Endpoint (`src/app/api/activities/[id]/route.ts`)
- **Method `GET`**: Mengembalikan payload telemetri aktivitas berdasarkan ID.
- **Method `PATCH`**:
  - Menerima dan memvalidasi `name`, `sport_type`, `start_date`, `description`, `distance_meters`, `moving_time_seconds`, dan `elevation_gain_meters`.
  - Memanggil fungsi data layer `updateActivity(id, userId, updates)`.
  - Menjalankan revalidasi cache instan:
    ```typescript
    revalidatePath(`/activities/${id}`);
    revalidatePath("/");
    ```
    sehingga data terupdate seketika terefleksi di halaman detail maupun di feed dashboard tanpa perlu hard-reload.

---

### D. Data Layer & Database Updates (`src/lib/db.ts`)
- Menambahkan fungsi `updateActivity`:
  - **PostgreSQL 16**: Eksekusi parameterized query `UPDATE activities SET ... WHERE id = $X AND user_id = $Y RETURNING *`.
  - **Fallback Atomic Store**: Pembaruan aman pada `.data/store.json`.
  - **Otomasi Kecepatan**: Jika jarak atau durasi bergerak disesuaikan, sistem otomatis menghitung ulang kecepatan rata-rata (`average_speed_mps = distance / duration`).

---

## 3. Daftar File yang Dibuat & Diperbarui

| File | Status | Keterangan |
| :--- | :--- | :--- |
| `src/components/EditActivityModal.tsx` | `Added` | Komponen dialog modal pengeditan telemetri aktivitas dan waktu |
| `src/app/api/activities/[id]/route.ts` | `Added` | API route GET & PATCH dengan validasi payload dan revalidasi cache |
| `src/lib/db.ts` | `Modified` | Menambahkan fungsi `updateActivity` untuk PostgreSQL dan store atomik |
| `src/app/activities/[id]/page.tsx` | `Modified` | Integrasi tombol Edit Sesi dan pemicu inline Ubah Waktu |

---

## 4. Hasil Verifikasi & Pengujian Mutu

1. **Turbopack Build**:
   ```powershell
   npm run build
   ```
   - Hasil: **Exit Code 0** (Kompilasi sukses tanpa peringatan TypeScript).
   - Rute API terdaftar sebagai server-rendered on demand (`ƒ /api/activities/[id]`).
2. **Runtime Verification**:
   - `http://localhost:3000/activities/035dfa10-9104-4395-a94d-6fc545efb57f` (Status **200 OK**).
   - Tombol **"Edit Sesi"** dan **"Ubah Waktu"** membuka modal dengan data awal yang akurat.
   - Perubahan tanggal, jam, nama, dan catatan tersimpan ke database dan langsung memperbarui tampilan antarmuka.

