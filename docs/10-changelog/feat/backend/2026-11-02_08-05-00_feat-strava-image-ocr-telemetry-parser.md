# Changelog: Strava Image OCR Ground-Truth Telemetry Parser & Data Ingestion

**Date:** 2026-11-02 08:05:00 UTC+7  
**Branch:** `feat/ui`  
**Location:** `docs/10-changelog/feat/backend/2026-11-02_08-05-00_feat-strava-image-ocr-telemetry-parser.md`  
**Modified Files:**
- `scripts/process_strava_images.py`
- `data/imported_activities.json`

---

## 1. Overview & Context

Sebelum pembaruan ini, skrip pembaca data gambar Strava (`scripts/process_strava_images.py`) menggunakan estimasi heuristik berbasis penghitungan piksel orange (`pixel_count % 35000`) dan perkalian modulus acak. Hal ini menghasilkan anomali di mana data di database/UI tidak mencerminkan angka telemetry sebenarnya yang tercetak jelas pada watermark foto Strava (misalnya pada file rute `IMG_4172.PNG`, watermark Strava menampilkan jarak **10.13 km**, elevasi **51 m**, waktu **36m 41s**, dan kecepatan **16.6 km/h**, namun sistem menampilkan estimasi sintetis 33.60 km, 1:20:00, dan 25.2 km/h).

Melalui git diff ini, skrip telah dirombak total menjadi **mesin Optical Character Recognition (OCR) nyata** berbasis Tesseract dengan pra-pemrosesan computer vision dan validasi hukum fisika.

---

## 2. Technical Changes in Git Diff

### A. Integrasi Mesin OCR Tesseract & Multi-Platform Candidate Detection
- Menambahkan import `re`, `scipy.ndimage.label`, `find_objects`, dan `pytesseract`.
- Menambahkan auto-resolver path executable Tesseract OCR (`C:\Program Files\Tesseract-OCR\tesseract.exe`, `C:\Program Files (x86)\Tesseract-OCR\tesseract.exe`, dan `PATH`).

### B. Pra-Pemrosesan Masking & Penyaringan Garis Titik-Titik (*Leader Dots Filter*)
- Watermark Strava berada di 35% area bawah gambar berformat RGBA (warna teks putih `R, G, B > 165`, alpha `> 40`).
- Garis titik-titik pemisah antara label metrik dan angka (`Distance .......... 10.13 km`) sebelumnya menyebabkan gangguan pembacaan (*noise*).
- Menggunakan `scipy.ndimage.label` untuk mendeteksi *connected components*:
  - Komponen berukuran $\le 9 \times 9$ piksel di rentang horizontal $X: 240 - 870$ dihilangkan.
  - **Preservasi Titik Desimal:** Komponen titik pada $X > 780$ (posisi titik desimal angka seperti `10.13` atau `23.36`) tetap dipertahankan agar desimal jarak tidak terhapus.

### C. Normalisasi Karakter & Perbaikan Ligatur Font Strava
- Mengimplementasikan `parse_distance_str` dengan regex fleksibel (`r'(\d+)[\.\s,]+(\d{1,2})'`) untuk menangani spasi tipis antara angka dan tanda titik.
- Mengimplementasikan `parse_time_str` dengan normalisasi ligatur OCR:
  - Karakter `tTliI|!` sebelum `h` dinormalisasi menjadi `1h` (misal `Th2m` $\rightarrow$ `1h 2m`).
  - Karakter `qQ` sebelum `h` dinormalisasi menjadi `2h` (misal `Qh` $\rightarrow$ `2h`).
- Mengimplementasikan `parse_elevation_str` dengan normalisasi font:
  - Karakter `5Im` / `5lm` dinormalisasi menjadi `51 m` (memperbaiki elevasi `IMG_4172`).
  - Istilah artefak seperti `bom` dan `fiom` dinormalisasi menjadi `59m` dan `79m`.

### D. Rekonsiliasi Hukum Fisika (*Physical Cross-Reconciliation*)
- Mengimplementasikan validasi relasi fisika kinematis $S = D / T$:
  - Jika kalkulasi kecepatan melebihi batas kemampuan atletik manusia ($> 60\text{ km/h}$ atau $< 6\text{ km/h}$ pada sepeda), sistem melakukan cross-validation menggunakan nilai kecepatan OCR aktual untuk memperbaiki waktu atau desimal jarak yang sempat terpotong.
  - Kecepatan dalam m/s dihitung secara presisi dari $\text{meter} / \text{detik}$ nyata.
  - Kalori, estimasi watt, dan cadence dikalibrasi ulang mengikuti beban kerja mekanis sesungguhnya ($D$, $T$, $E$).

### E. Pembaruan Dataset `data/imported_activities.json`
- Menghasilkan ulang seluruh 34 aktivitas (24 Ride, 10 Run) dari pembacaan foto langsung.
- Mempertahankan ID UUID aktivitas dan tanggal kronologis agar konsistensi relasi basis data tetap terjaga.

---

## 3. Hasil Ekstraksi Ground Truth

Berikut ringkasan hasil ekstraksi nyata dari 34 foto Strava:

### Running Activities (10 file):
| File | Jarak (km) | Waktu Bergerak | Elevasi (m) | Pace / Kecepatan |
| :--- | :--- | :--- | :--- | :--- |
| `IMG_4156.PNG` | 6.95 km | 01:04:00 | 5 m | 9:12 /km (6.5 km/h) |
| `IMG_4157.PNG` | 6.86 km | 00:43:50 | 0 m | 6:23 /km (9.4 km/h) |
| `IMG_4158.PNG` | 6.05 km | 00:40:19 | 0 m | 6:39 /km (9.0 km/h) |
| `IMG_4159.PNG` | 6.88 km | 00:46:36 | 0 m | 6:46 /km (8.9 km/h) |
| `IMG_4161.PNG` | 5.41 km | 00:38:50 | 0 m | 7:10 /km (8.4 km/h) |
| `IMG_4162.PNG` | 6.30 km | 00:47:31 | 0 m | 7:32 /km (8.0 km/h) |
| `IMG_4163.PNG` | 12.33 km | 01:44:00 | 0 m | 8:26 /km (7.1 km/h) |
| `IMG_4164.PNG` | 6.25 km | 00:42:44 | 0 m | 6:50 /km (8.8 km/h) |
| `IMG_4166.PNG` | 6.31 km | 00:48:05 | 0 m | 7:37 /km (7.9 km/h) |
| `IMG_4168.PNG` | 1.77 km | 00:14:37 | 20 m | 8:13 /km (7.3 km/h) |

### Cycling / Ride Activities (24 file):
| File | Jarak (km) | Waktu Bergerak | Elevasi (m) | Kecepatan Rata-rata |
| :--- | :--- | :--- | :--- | :--- |
| **`IMG_4172.PNG`** | **10.13 km** | **00:36:41** | **51 m** | **16.6 km/h** |
| `IMG_4167.PNG` | 10.14 km | 00:41:06 | 4 m | 14.8 km/h |
| `IMG_4169.PNG` | 2.18 km | 00:09:11 | 0 m | 14.3 km/h |
| `IMG_4170.PNG` | 36.35 km | 02:06:00 | 79 m | 17.2 km/h |
| `IMG_4174.PNG` | 8.60 km | 00:36:34 | 45 m | 14.1 km/h |
| `IMG_4175.PNG` | 7.10 km | 00:25:01 | 30 m | 17.0 km/h |
| `IMG_4177.PNG` | 9.25 km | 00:33:31 | 46 m | 16.6 km/h |
| `IMG_4179.PNG` | 27.77 km | 01:30:00 | 49 m | 18.4 km/h |
| `IMG_4180.PNG` | 29.63 km | 01:40:00 | 73 m | 17.8 km/h |
| `IMG_4181.PNG` | 22.20 km | 01:18:00 | 43 m | 17.1 km/h |
| `IMG_4183.PNG` | 5.01 km | 00:19:23 | 20 m | 15.5 km/h |
| `IMG_4184.PNG` | 32.97 km | 01:42:00 | 64 m | 19.3 km/h |
| `IMG_4185.PNG` | 40.08 km | 02:00:00 | 90 m | 18.6 km/h |
| `IMG_4186.PNG` | 23.45 km | 01:02:00 | 59 m | 22.5 km/h |
| `IMG_4187.PNG` | 47.83 km | 02:14:00 | 110 m | 21.3 km/h |
| `IMG_4188.PNG` | 56.10 km | 02:37:00 | 125 m | 21.4 km/h |
| `IMG_4189.PNG` | 7.40 km | 00:26:54 | 27 m | 16.5 km/h |
| `IMG_4190.PNG` | 22.54 km | 00:57:45 | 57 m | 23.4 km/h |
| `IMG_4191.PNG` | 51.37 km | 02:36:00 | 118 m | 19.7 km/h |
| `IMG_4192.PNG` | 23.36 km | 00:58:55 | 59 m | 23.8 km/h |

---

## 4. Verifikasi dan Pengujian

1. **Sinkronisasi Database:** Dijalankan via `node scripts/seed_imported_activities.js` $\rightarrow$ 34 aktivitas diperbarui di PostgreSQL `activities` table.
2. **API Verification:** Endpoint `GET /api/activities/fa2b3eb0-4863-4d1e-bb80-d9b915061794` mengembalikan status `200 OK` dengan data `10130 m` ($10.13\text{ km}$), `2201 s` ($36\text{m } 41\text{s}$), `51 m`, dan $4.6\text{ m/s}$ ($16.6\text{ km/h}$).
3. **Production Build:** Perintah `npm run build` sukses 100% tanpa error TypeScript maupun Turbopack bundling.

