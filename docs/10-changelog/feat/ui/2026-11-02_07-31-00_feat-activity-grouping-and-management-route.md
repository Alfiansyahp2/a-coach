# Changelog: Route Manajemen & Pengelompokan Aktivitas (`feat/activity-grouping-and-management-route`)

- **Tanggal & Waktu**: 2026-11-02 07:31:00 WIB
- **Tipe**: `feat(ui)` / `feat(route)` / `feat(management)` / `feat(batch-actions)`
- **Commit Message Rujukan**: `feat(ui): implement activity registry and grouping management route (/activities)`
- **Branch**: `feat/ui`

---

## 1. Latar Belakang & Kebutuhan Pengguna

Dengan semakin banyaknya sesi latihan atlet yang tersimpan (saat ini 34 sesi terverifikasi), pengguna memerlukan antarmuka terpusat yang memudahkan pemeliharaan (*maintenance*), penataan, dan pengelompokan aktivitas tanpa harus memeriksa sesi satu per satu dari dashboard utama.

Kebutuhan utama:
1. **Route Baru Terdedikasi (`/activities`)**: Satu rute khusus untuk melihat seluruh registri aktivitas lengkap dengan analitik sub-total per kelompok.
2. **Fleksibilitas Pengelompokan (Multi-Dimensional Grouping)**:
   - **Berdasarkan Cabang Olahraga**: Pengelompokan Run vs. Ride dengan metrik terpisah.
   - **Berdasarkan Kategori Sesi**: Membedakan Long Run, Tempo/Threshold, Interval/Speed, Recovery/Easy, dan Aerobic Base.
   - **Berdasarkan Siklus Bulan / Waktu**: Mengorganisir sesi berdasarkan bulan kalender latihan (misal: Oktober 2026, September 2026).
   - **Berdasarkan Rentang Volume**: Short (<5 km), Medium (5–15 km), Long (15–30 km), dan Ultra (>30 km).
3. **Kemudahan Maintenance Massal (*Batch Operations*)**:
   - Kemampuan memilih (*checkbox*) beberapa sesi sekaligus untuk memperbarui cabang olahraga secara massal (*batch reclassification*).
4. **Pencarian, Pengurutan & Edit Instan**:
   - Pencarian seketika berdasarkan nama aktivitas, catatan/deskripsi, dan ID.
   - Pengurutan tanggal terbaru/terlama dan jarak terjauh/terpendek.
   - Tombol integrasi edit langsung yang membuka modal telemetri (`EditActivityModal`).

---

## 2. Rincian Implementasi

### A. Route Halaman Baru (`src/app/activities/page.tsx`)
- Server Component Next.js 16 dengan Partial Prerendering (`connection()`).
- Mengambil seluruh aktivitas tersimpan melalui `getActivities(DEFAULT_USER_ID, { limit: 200 })` dan membungkusnya dalam fallback `<ActivityManagementSkeleton />`.
- Header presisi dengan navigasi cepat kembali ke Dashboard (`/`) dan status sinkronisasi PostgreSQL.

---

### B. Komponen Manajemen Interaktif (`src/components/ActivityManagementDeck.tsx`)
- Komponen Client React yang mengimplementasikan arsitektur **Obsidian Telemetry**:
  - **Toolbar Ringkasan KPI**: Menampilkan total 34 sesi, jumlah running (10), dan jumlah cycling (24).
  - **Selector Pengelompokan Dinamis**: Tab tombol untuk beralih antara pengelompokan *Sport*, *Kategori*, *Bulan*, dan *Volume Jarak*.
  - **Sub-total Telemetri Grup**: Setiap blok grup menampilkan total jarak, total durasi, total elevasi akumulatif, dan rata-rata kecepatan/pace kelompok.
  - **Fitur Collapse/Expand Grup**: Setiap grup dapat dilipat atau diperluas dengan tombol panah chevron.
  - **Batch Selection Toolbar**: Muncul otomatis saat satu atau lebih sesi dipilih dengan checkbox. Menyediakan opsi perubahan cabang olahraga massal secara instan ke API.
  - **Aksi Cepat per Baris**: Tombol modal edit sesi (`EditActivityModal` varian ikon) dan tautan langsung ke halaman detail `/activities/[id]`.

---

### C. Pembaruan Navigasi Global
1. **Header Dashboard Utama (`src/app/page.tsx`)**:
   - Menambahkan tombol navigasi langsung `"Manajemen Aktivitas"` yang mengarahkan atlet ke `/activities`.
2. **Header Halaman Detail (`src/app/activities/[id]/page.tsx`)**:
   - Menambahkan tombol `"Registry"` di samping tombol `"Dashboard"` untuk navigasi kembali ke hub manajemen pengelompokan.

---

## 3. Daftar File yang Dibuat & Diperbarui

| File | Status | Keterangan |
| :--- | :--- | :--- |
| `src/app/activities/page.tsx` | `Added` | Route halaman baru manajemen dan registri aktivitas (`/activities`) |
| `src/components/ActivityManagementDeck.tsx` | `Added` | Komponen interaktif pengelompokan, filter, aksi massal, dan tabel telemetri |
| `src/app/page.tsx` | `Modified` | Penambahan link navigasi Manajemen Aktivitas di top bar |
| `src/app/activities/[id]/page.tsx` | `Modified` | Penambahan link navigasi Registry di header detail aktivitas |

---

## 4. Hasil Verifikasi & Pengujian Mutu

1. **Turbopack Build**:
   ```powershell
   npm run build
   ```
   - Hasil: **Exit Code 0** (Kompilasi 100% sukses).
   - Rute terdaftar: `◐ /activities` (Partial Prerender).
2. **Runtime Verification**:
   - `http://localhost:3000/activities` merespons dengan HTTP Status **200 OK**.
   - Pengelompokan Cabang Olahraga, Kategori, Bulan, dan Rentang Volume berjalan reaktif tanpa reload.
   - Fitur batch update dan edit modal bekerja mulus dan langsung memperbarui database lokal & PostgreSQL 16.

