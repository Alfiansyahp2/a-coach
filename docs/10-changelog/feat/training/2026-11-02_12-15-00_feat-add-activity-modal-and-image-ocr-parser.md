
# Changelog: Manual Activity Entry Modal, Image Telemetry OCR Parser & Workout Auto-Correlation (`feat/training`)

- **Tanggal & Waktu**: 2026-11-02 12:15:00 WIB
- **Tipe**: `feat(training)` / `feat(activity)` / `feat(ocr)` / `feat(ui)` / `feat(api)`
- **Commit Message**: `feat(training): implement dual-mode add activity modal with image telemetry ocr parser and scheduled workout correlation`
- **Branch**: `feat/training`

---


## 1. Latar Belakang & Kebutuhan Atlet

Sebelumnya, platform mengandalkan sinkronisasi sepihak dari Strava OAuth API v3 untuk mengimpor aktivitas olahraga. Namun, dalam ekosistem latihan harian seorang atlet, terdapat kebutuhan nyata untuk mencatat aktivitas baru secara fleksibel tanpa harus bergantung secara eksklusif pada sinkronisasi Strava:

1. **Pencatatan Aktivitas Berbasis Gambar (Screenshot Telemetry Parser):** Atlet sering kali menyelesaikan sesi latihan di luar ruangan atau di atas *trainer* dan memiliki tangkapan layar (*screenshot*) dari aplikasi seperti Strava, Garmin Connect, Coros, Apple Watch, atau foto speedometer/odometer sepeda dan konsol treadmill. Atlet menginginkan sistem yang mampu membaca gambar tersebut secara otomatis dan mengekstrak metrik kunci (*distance*, *moving time*, *elevation gain*, *speed/pace*, dan *sport type*) tanpa perlu mengetik ulang secara manual.
2. **Entri Formulir Manual Terkalibrasi Kinematika:** Diperlukan antarmuka pencatatan manual cepat jika atlet tidak memiliki gambar, lengkap dengan penghitungan otomatis kecepatan rata-rata (km/jam) dan *pace* lari (menit/km) secara *real-time* saat pengguna memasukkan angka jarak dan durasi.
3. **Penyelarasan Intensitas Zone 2 & The Talk Test:** Sesuai rencana latihan 12-Minggu Zone 2 tanpa *heart-rate monitor*, setiap pencatatan sesi wajib memfasilitasi penilaian subjektif **RPE (Rate of Perceived Exertion) 1–10** dengan indikator visual *Talk Test* (RPE 3–4: nafas stabil, mampu berbicara kalimat lengkap tanpa jeda terengah-engah).
4. **Protokol Keselamatan Sendi Pasca-Latihan (Engkel & Kedua Lutut):** Atlet memiliki riwayat cedera pergelangan kaki kanan (*sprain*) dan keluhan nyeri lutut anterior bilateral pasca lari jarak jauh. Oleh karena itu, formulir entri wajib menyertakan *check-in* respon fisik (skala nyeri 0–10, konfirmasi ada/tidaknya pembengkakan dan instabilitas sendi) yang langsung disimpan ke tabel kesehatan `athlete_training_responses`.
5. **Korelasi Otomatis dengan Sesi Terjadwal (Auto-Matching):** Aktivitas baru yang dicatat pada hari yang sama dengan jadwal rencana latihan (`scheduled_workouts`) harus secara cerdas dikorelasikan, menandai status sesi dari `PLANNED` menjadi `COMPLETED`, menghitung persentase pemenuhan target (*completion percentage*), serta menghitung delta jarak dan durasi.

---


## 2. Rincian Implementasi & Rekayasa Sistem


### A. Komponen Modal Input Interaktif Dual-Mode (`src/components/AddActivityModal.tsx`)

1. **Arsitektur Antarmuka Dual-Tab:**
   - **Tab 📸 Scan Screenshot / Foto Telemetri:**
     - Mendukung *file dropzone* drag-and-drop dan pratinjau thumbnail gambar instan.
     - Terhubung secara asinkron ke endpoint `/api/activities/parse-image`.
     - Menampilkan indikator animasi pemindaian (*OCR loader*) dan *badge* ringkasan hasil deteksi hijau neon (`✓ 10.14 km • 41m 6s • 14.8 km/j • Elev 58m`).
     - Mengisi seluruh field input formulir secara otomatis saat pembacaan selesai.
   - **Tab ✍️ Isi Formulir Manual:**
     - Pemilihan jenis olahraga: `Ride` (Sepeda MTB/Road), `Run` (Lari), `Walk` (Jalan), `CrossTraining` (Rehab Sendi), `WeightTraining`, dan `Workout`.
     - Input waktu & tanggal mulai (`datetime-local`).
     - Input jarak tempuh (km) dan rincian durasi bergerak (Jam, Menit, Detik).
     - Pratinjau strip kinematika dinamis: kecepatan rata-rata ($km/jam$) dan pace ($mm:ss /km$).
2. **Kalibrasi Intensitas Zone 2 & Skala RPE (1–10):**
   - Selector 10 tombol interaktif dengan kode warna fisiologis (RPE 1–2: Biru Pemulihan; RPE 3–4: Volt Green Zone 2; RPE 5–6: Amber Sedang; RPE 7–10: Merah Anaerobik).
   - Panduan cerdas: memberikan konfirmasi ketercapaian Zone 2 (*Talk Test OK*) atau peringatan jika intensitas melampaui ambang aerobik.
3. **Check-in Keselamatan Sendi Atlet:**
   - Slider skala nyeri 0–10 (0: Bebas Nyeri, 1–3: Ringan/Aman, 4–5: Mengganggu, 6+: Nyeri Akut).
   - Kotak centang (*checkbox*) untuk observasi pembengkakan sendi dan rasa goyang/tidak stabil (*instability*).
   - Area teks catatan atlet untuk dokumentasi sensasi kayuhan, rasio gigi, cuaca, dan permukaan jalan.
4. **Varian Pemicu Fleksibel:**
   - `variant="button"`: Tombol utama beraksen Volt `#D4FF00` dengan ikon plus tebal.
   - `variant="outline"`: Tombol border Cyan `#00F0FF` untuk penempatan di toolbar sekunder.
   - `variant="compact"`: Tombol mikro untuk integrasi per sesi kalender.

### B. Mesin Ekstraksi Telemetri Gambar OCR (`scripts/parse_activity_image.py`)

1. **Multi-Pass Computer Vision Pipeline:**
   - **Pass 1 (Strava Map Watermark Alpha Masking):**
     - Watermark telemetri rute Strava berada pada area 35–40% bagian bawah gambar berformat RGBA.
     - Menerapkan thresholding warna putih bersih: `(crop_arr[:, :, 3] > 40) & (crop_arr[:, :, 0] > 160) & (crop_arr[:, :, 1] > 160) & (crop_arr[:, :, 2] > 160)`.
     - Menggunakan `scipy.ndimage.label` dan `find_objects` untuk menyaring garis titik-titik pemisah (*leader dots*) berukuran $\le 9 \times 9$ piksel di rentang $X: 240 - 870$, dengan tetap memproteksi titik desimal pada $X > 780$.
     - Konversi ke binary mask dengan perbesaran resolusi 2x Lanczos untuk ketajaman karakter optimal pada PSM 6 Tesseract.
   - **Pass 2 (Standard Contrast Enhancement Fallback):**
     - Konversi grayscale dengan penguatan kontras 2.0x untuk screenshot standar dari Garmin, Apple Watch, atau foto odometer.
2. **Normalisasi Karakter & Rekonsiliasi Kinematika:**
   - Regex cerdas untuk konversi format durasi: `1h 25m 30s`, `41m6s`, maupun `00:41:06`.
   - Validasi hukum fisika $v = d / t$: memastikan kecepatan masuk akal atletik manusia ($6 - 60\text{ km/jam}$); jika desimal jarak sempat salah baca, waktu dan kecepatan OCR digunakan untuk merekonsiliasi nilai jarak sebenarnya.

### C. REST API Gateway (`src/app/api/activities/*`)

1. **`POST /api/activities/parse-image` (`src/app/api/activities/parse-image/route.ts`):**
   - Menerima payload `multipart/form-data` dengan field file `image` atau `file`.
   - Menyimpan buffer gambar ke direktori temporer `.data/tmp_uploads/`.
   - Menjalankan `scripts/parse_activity_image.py` melalui `child_process.execFile` secara aman dengan batas *timeout* 30 detik.
   - Mengembalikan telemetri terstruktur JSON dan menjamin pembersihan file temporer pada blok `finally`.
2. **`POST /api/activities` (`src/app/api/activities/route.ts`):**
   - Menerima payload data aktivitas lengkap, memvalidasi keberadaan nama dan jenis olahraga.
   - Memanggil fungsi database `createManualActivity`.
   - Memicu `revalidatePath` untuk `/`, `/activities`, dan `/training` agar seluruh halaman menampilkan pembaruan tanpa *hard refresh*.
3. **`GET /api/activities` (`src/app/api/activities/route.ts`):**
   - Menyediakan antarmuka pembacaan daftar aktivitas terfilter berdasarkan `sport_type` dan `limit`.

### D. Integrasi Persistensi Basis Data & Auto-Korelasi Sesi (`src/lib/db.ts`)

1. **Fungsi `createManualActivity(userId, params)`:**
   - **Generasi ID Sintetis 64-bit BigInt Safe:** Menghasilkan `strava_activity_id` unik berbasis waktu numerik: `Date.now() * 1000 + Math.floor(Math.random() * 1000)`, aman terhadap batasan tipe PostgreSQL `BIGINT`.
   - **Persistensi Aktivitas:** Memanggil `upsertActivity` untuk menyimpan ke tabel `activities`.
   - **Algoritma Auto-Korelasi Sesi Kalender:**
     - Mencari sesi terjadwal (`scheduled_workouts`) pada tanggal yang sama (`formatDateOnly(start_date)`) yang masih berstatus `PLANNED` atau `MISSED`.
     - Mencocokkan keselarasan cabang olahraga (misal `Ride` $\leftrightarrow$ `Cycling`, `Run` $\leftrightarrow$ `Running`).
     - Jika ditemukan, menghitung persentase pencapaian target jarak/durasi: $\text{completion} = \min(200, \text{round}((\text{actual} / \text{target}) \times 100))$.
     - Memperbarui status sesi menjadi **`COMPLETED`** via `updateScheduledWorkout`.
     - Mencatat relasi korelasi ke tabel `workout_activity_matches`.
   - **Pencatatan Respon Fisiologis Atlet:**
     - Jika terdapat metrik RPE, skala nyeri, pembengkakan, atau catatan pemulihan, sistem otomatis memanggil `upsertAthleteTrainingResponse` untuk mencatat respon latihan ke tabel `athlete_training_responses`.

### E. Integrasi Antarmuka Navigasi Global (`ScheduleTrainingHub.tsx`, `ActivityManagementDeck.tsx`, `page.tsx`)

1. **Kalender Jadwal Latihan (`src/components/training/ScheduleTrainingHub.tsx`):**
   - Menambahkan tombol utama `+ TAMBAH AKTIVITAS` di bilah kontrol atas bersebelahan dengan tombol kalibrasi ulang.
   - Menambahkan tombol `Tambah Aktivitas Manual / Foto` di dalam **Dossier Sesi Terjadwal Modal** (`selectedWorkout`), yang secara otomatis memuat tanggal preskripsi dan cabang olahraga sesi tersebut.
2. **Manajemen Registri Aktivitas (`src/components/ActivityManagementDeck.tsx`):**
   - Menempatkan tombol `+ TAMBAH AKTIVITAS` pada *toolbar* header di samping ringkasan KPI total sesi.
3. **Dashboard Utama Telemetri (`src/app/page.tsx`):**
   - Menyematkan tombol `+ TAMBAH AKTIVITAS` di bilah navigasi integritas telemetri atas agar dapat diakses seketika saat pertama kali membuka aplikasi.
4. **Utilitas Tanggal Aman Client Component (`src/lib/formatters.ts`):**
   - Mengekspor `formatDateOnly(val)` di `src/lib/formatters.ts` agar dapat diimpor langsung oleh komponen interaktif (`use client`) tanpa memicu pemuatan pustaka backend Node.js (`pg`, `fs`).

---


## 3. Rincian File yang Dimodifikasi & Ditambahkan

```
modified:   package.json                      (Menambahkan dependensi tesseract.js)
modified:   package-lock.json                 (Lockfile dependency tree)
modified:   src/app/page.tsx                  (Integrasi tombol Add Activity di baris navigasi atas dashboard)
modified:   src/components/ActivityManagementDeck.tsx (Integrasi tombol Add Activity di toolbar header registri)
modified:   src/components/training/ScheduleTrainingHub.tsx (Integrasi tombol Add Activity & modal logging per sesi)
modified:   src/lib/db.ts                     (createManualActivity, korelasi workout otomatis, athlete responses)
modified:   src/lib/formatters.ts             (Fungsi formatDateOnly yang aman untuk Client Component)
untracked:  scripts/parse_activity_image.py   (Engine OCR Python Tesseract dengan masking watermark rute Strava)
untracked:  scripts/test_add_activity_flow.js (Automated test runner untuk alur OCR & create manual activity)
untracked:  src/app/api/activities/parse-image/route.ts (Endpoint POST untuk upload multipart & ekstraksi OCR)
untracked:  src/app/api/activities/route.ts   (Endpoint POST create manual activity & GET activities)
untracked:  src/components/AddActivityModal.tsx (Komponen modal interaktif dual-mode OCR & Manual Entry)
```

---

## 4. Hasil Pengujian & Verifikasi Kualitas

1. **Uji Ekstraksi OCR Gambar Riil (`scripts/parse_activity_image.py`)**:
   - Berkas Uji: `data/from_strava/ride/IMG_4167.PNG` (Screenshot rute Strava dengan watermark teks transparan).
   - Ekstraksi Jarak: **`10.14 km`** (Akurasi 100%).
   - Ekstraksi Durasi: **`41m 6s`** / 2466 detik (Akurasi 100%).
   - Ekstraksi Kecepatan: **`14.8 km/jam`** (Akurasi 100%).
   - Ekstraksi Elevasi: **`58 m`** (Akurasi 100%).
   - Ekstraksi Jenis Olahraga: **`Ride`** (Akurasi 100%).
2. **Uji HTTP API Ekstraksi Gambar (`POST /api/activities/parse-image`)**:
   - Mengirimkan `multipart/form-data` melalui fetch Node.js ke server lokal `http://localhost:3000`.
   - Response status: **`200 OK`**.
   - Payload: mengembalikan objek telemetri lengkap (`distance_km: 10.14`, `formatted_duration: "41m 6s"`, `elevation_gain_meters: 58`, `average_speed_kmh: 14.8`).
3. **Uji HTTP API Penyimpanan Manual & Auto-Korelasi (`POST /api/activities`)**:
   - Mengirimkan data aktivitas dengan tanggal jadwal `2026-11-03`, jarak 10.14 km, RPE 3/10, nyeri 0/10, dan pembengkakan `false`.
   - Response status: **`200 OK`**.
   - Auto-Matching: berhasil mendeteksi sesi Selasa 3 Nov 2026 ("Easy MTB 20 menit"), memperbarui status menjadi **`COMPLETED`**, menghitung completion percentage **`127%`**, dan mencatat respons atlet ke tabel `athlete_training_responses`.
4. **Test Suite Sistem Training (`scripts/test_coach_training_system.js`)**:
   - **5 Passed, 0 Failed**.
   - Memastikan relasi data dan konsistensi status kalender tetap terjaga.
5. **Test Suite Sistem Kesehatan Atlet (`scripts/test_athlete_health_system.js`)**:
   - **32 Passed, 0 Failed**.
   - Memastikan audit log dan proteksi kesiapan latihan tetap utuh.
6. **Kompilasi TypeScript**:
   - `npx tsc --noEmit` sukses tanpa error (**exit code 0**).
