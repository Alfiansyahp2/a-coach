# Changelog: Modernisasi UI/UX Activity Registry (`/activities`) & Kontrol Kerapatan Tampilan (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-02 19:15:00 WIB
- **Tipe**: `feat(ui)` / `feat(ux)` / `feat(activity)` / `feat(telemetry)`
- **Commit Message Rujukan**: `feat(ui): modernize activity registry with interactive kpi cards, density toggle, group batch selection, and neon sport badges`
- **Branch**: `refactor`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit antarmuka visual langsung pada tangkapan layar rute `/activities` (*Activity Registry & Grouping Management*), ditemukan sejumlah friksi visual dan kelemahan pengalaman pengguna (*UI/UX friction points*):

1. **Kelelahan Visual & Gulir Vertikal Monoton (*Endless Scrolling Fatigue*)**:
   - Seluruh 34 sesi (24 sesi sepeda dan 10 sesi lari) dirender dalam bentuk daftar panjang bertingkat penuh tanpa jeda visual yang dinamis. Atlet harus menggulir layar berulang kali hanya untuk melihat sesi di kategori bawah.
2. **Kotak Hitam Mati pada Thumbnail (*Dead Black Squares*)**:
   - Elemen gambar rute menggunakan tag `<img src={act.raw_summary_polyline} />`. Karena sebagian besar data *polyline* tersimpan sebagai string ringkasan terenkripsi (*encoded polyline*) dan bukan URL gambar, peramban menampilkan kotak hitam kosong atau ikon gambar rusak di setiap baris aktivitas.
3. **Metrik Header yang Pasif & Terpencil**:
   - Penghitung sesi (`TOTAL SESI: 34`, `RUNNING: 10`, `CYCLING: 24`) diletakkan di kotak kecil pasif di sebelah tombol aksi tanpa menampilkan akumulasi jarak atau kecepatan, serta tidak dapat diklik untuk menyaring aktivitas.
4. **Ketiadaan Kontrol Kerapatan Baris (*No View Density Controls*)**:
   - Tidak tersedia opsi untuk beralih antara tampilan rinci (*detailed telemetry*) dan tampilan padat (*compact single-line*), menyulitkan atlet yang ingin memindai puluhan sesi secara cepat.
5. **Inefisiensi Seleksi Massal**:
   - Checkbox di setiap baris aktivitas tidak memiliki mekanisme "Pilih Semua dalam Grup", mengharuskan atlet mencentang 24 sesi satu per satu jika ingin mengubah cabang olahraga secara massal.
6. **Kurangnya Kontrol Pelipatan Global**:
   - Atlet tidak dapat melipat atau membuka seluruh grup secara serentak, sehingga harus mengklik tanda panah setiap grup satu demi satu.

---

## 2. Rincian Perubahan Berdasarkan Git Diff

### A. Kartu Ringkasan Telemetri Interaktif (*Click-to-Filter*)

#### 1. `src/components/activity/deck/ActivityDeckHeader.tsx`
- **3 Kartu Ringkasan Telemetri Interaktif**:
  - Menggantikan kotak teks pasif dengan kartu ringkasan visual berlatar Obsidian dengan aksen neon:
    - **Semua Aktivitas**: `34 Sesi • 667.62 km • 30j 08m • ▲ 3428m`.
    - **Sepeda MTB (Ride)**: `24 Sesi • 569.41 km • 20j 56m • Avg 28.1 km/h • ▲ 3407m` (Aksen Cyan `#00F0FF`).
    - **Lari Bertahap (Run)**: `10 Sesi • 98.21 km • 9j 12m • Avg 7:22 /km • ▲ 21m` (Aksen Volt `#D4FF00`).
- **Penyaringan Sekali Klik (*Click-to-Filter*)**:
  - Mengklik kartu sepeda atau lari akan langsung menyaring daftar sesi dan memperbarui status aktif kartu dengan *border glow* dan *ring* aksen neon, menghapus kebutuhan menyetel filter secara manual.

---

### B. Penyempurnaan Bilah Alat & Kontrol Navigasi

#### 2. `src/components/activity/deck/ActivityFilterToolbar.tsx`
- **Kontrol Kerapatan Tampilan (*Density Toggle: Rinci vs Padat*)**:
  - Menambahkan pengatur mode kerapatan (*Detailed* vs *Compact*) dengan ikon `LayoutList` dan `AlignJustify`.
- **Tombol Ciutkan / Buka Semua Grup Global**:
  - Menambahkan tombol serbaguna untuk melipat atau membuka seluruh grup dalam satu klik (`Buka Semua Grup` / `Ciutkan Semua Grup`), memungkinkan peninjauan total agregat jarak dan elevasi per kategori secara instan.
- **Pencarian Cepat dengan Tombol Reset `✕`**:
  - Kolom pencarian real-time dilengkapi tombol pembersih cepat ketika terdapat input teks.
- **Pil Filter Olahraga dengan Penghitung Sesi Nyata**:
  - Menampilkan jumlah sesi riil pada setiap tombol filter: `Semua (34)`, `🚴 Sepeda (24)`, dan `🏃 Lari (10)`.

---

### C. Modernisasi Baris Aktivitas & Eliminasi Kotak Hitam Mati

#### 3. `src/components/activity/deck/ActivityGroupCard.tsx`
- **Lencana Olahraga Telemetri Presisi**:
  - Menggantikan kotak hitam kosong dengan lencana visual berikon:
    - **Sepeda (Ride)**: Lencana kotak berlatar Cyan transparan (`#00F0FF/10`) dengan ikon `Bike`.
    - **Lari (Run)**: Lencana kotak berlatar Volt transparan (`#D4FF00/10`) dengan ikon `Footprints`.
    - Menjaga dukungan untuk menampilkan gambar asli jika terdapat URL peta rute yang valid (`http` / `data:image`).
- **Pilih Semua dalam Grup (*Select All in Group*)**:
  - Checkbox interaktif di header grup memungkinkan atlet memilih seluruh sesi dalam kategori tersebut secara serentak (misal: 24 sesi sepeda) untuk aksi massal.
- **Mode Baris Padat (*Compact Row Mode*)**:
  - Menyediakan tampilan baris ramping satu baris berdensitas tinggi setinggi ~38px dengan metrik esensial (nama, tanggal, durasi, jarak, kecepatan, modal edit, dan tautan detail), mengeliminasi *scroll fatigue*.
- **Integrasi Lencana Verifikasi OCR**:
  - Aktivitas hasil impor foto/dokumen Strava kini memiliki lencana halus `Strava OCR Terverifikasi` berwarna hijau emerald, menggantikan tampilan teks mentah yang membebani baris.

---

### D. Peningkatan Bilah Aksi Massal & Orkestrasi State

#### 4. `src/components/activity/deck/ActivityBatchActionBar.tsx`
- **Bilah Aksi Massal Bergradien Cyan**:
  - Menampilkan jumlah sesi terpilih, opsi `Pilih semua X sesi yang tampil`, *dropdown* perubahan cabang olahraga (*Run*, *Ride*, *Walk*, *Hike*, *Workout*), dan tombol pembatalan cepat.

#### 5. `src/components/ActivityManagementDeck.tsx`
- **Manajemen State Terpusat**:
  - Mengelola *state* terpadu untuk kerapatan tampilan (`density`), status pelipatan grup global (`collapsedGroups`), sinkronisasi filter kartu KPI (`sportFilter`), serta logika seleksi massal per grup maupun seleksi seluruh aktivitas hasil penyaringan.

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/components/activity/deck/ActivityDeckHeader.tsx` | Modifikasi | +206 | -35 | 3 Kartu KPI telemetri interaktif (*click-to-filter*) & penataan header |
| `src/components/activity/deck/ActivityFilterToolbar.tsx` | Modifikasi | +205 | -45 | Kontrol mode kerapatan (Rinci/Padat), tombol Ciutkan Semua, pencarian `✕` |
| `src/components/activity/deck/ActivityGroupCard.tsx` | Modifikasi | +245 | -55 | Lencana olahraga neon, mode baris kompak, seleksi grup, lencana OCR |
| `src/components/activity/deck/ActivityBatchActionBar.tsx` | Modifikasi | +55 | -20 | Bilah aksi massal bergradien neon & opsi pilih semua sesi tersaring |
| `src/components/ActivityManagementDeck.tsx` | Modifikasi | +73 | -15 | Orkestrasi state kerapatan, filter sinkron, dan seleksi massal |

**Total Perubahan**: 5 file termodifikasi, **+784 baris ditambahkan**, **-170 baris dihapus**.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Pemeriksaan Tipe TypeScript**:
   - `npx tsc --noEmit` $\to$ **Exit code 0 (0 Error, 100% Type-Safe)**.
2. **Suite Verifikasi Kesehatan & Kesiapan Cedera**:
   - `node scripts/test_athlete_health_system.js` $\to$ **32 PASSED, 0 FAILED (100%)**.
3. **Suite Verifikasi Sistem Pelatihan & Rekor**:
   - `node scripts/test_coach_training_system.js` $\to$ **5 PASSED, 0 FAILED (100%)**.
4. **Verifikasi HTTP Endpoint Langsung**:
   - `http://localhost:3000/activities` $\to$ **HTTP 200 OK**.
   - `http://localhost:3000/health` $\to$ **HTTP 200 OK**.
   - `http://localhost:3000/training` $\to$ **HTTP 200 OK**.
   - `http://localhost:3000/` $\to$ **HTTP 200 OK**.
5. **Konsistensi Desain Obsidian Telemetry**:
   - Latar belakang gelap presisi (`#090A0F`, `#12151D`, `#161922`), aksen neon (*Cyan* `#00F0FF`, *Volt* `#D4FF00`, *Emerald* `#10B981`, *Amber* `#FF9500`), tipografi monospaced tabular, dan radius sudut tajam (`rounded-sm` 4px) konsisten di seluruh elemen antarmuka.

