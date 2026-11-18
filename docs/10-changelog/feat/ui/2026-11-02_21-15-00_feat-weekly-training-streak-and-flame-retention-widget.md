# Changelog: Widget Rentetan Latihan Mingguan & Protokol Retensi Api (*Weekly Streak & Flame Retention*) (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-02 21:15:00 WIB
- **Tipe**: `feat(ui)` / `feat(ux)` / `feat(dashboard)` / `feat(telemetry)` / `feat(streak)`
- **Commit Message Rujukan**: `feat(ui): implement weekly training streak card with flame retention engine below tactical deck`
- **Branch**: `refactor`

---

## 1. Latar Belakang & Kebutuhan Pengguna

Pengguna meminta penambahan visualisasi metrik rentetan (*streak widget*) yang terinspirasi dari antarmuka kontribusi/rentetan (Gambar 1), diletakkan tepat di bawah kartu kalender latihan terjadwal (*Scheduled Training Calendar* pada Komando Taktis / Gambar 2), dengan aturan khusus:
> *"tambahkan seperti ini di bawah gambar 2 tapi buat streak nya adalah setiap minggu untuk mempertahankan api nya"*

### Mengapa Berbasis Mingguan (*Weekly Streak Cadence*)?
Dalam konteks pemulihan cedera atlet (seperti keluhan kekakuan bilateral lutut anterior dan riwayat pembengkakan sendi engkel kanan), memaksakan rentetan harian (*daily streak*) sangat berisiko memicu beban benturan berlebih (*overuse injury / tissue breakdown*). Protokol mingguan (*weekly streak*) menuntut atlet mempertahankan konsistensi dengan menyelesaikan minimal **1 sesi latihan terverifikasi setiap minggu kalender (Senin 00:00:00 s.d. Minggu 23:59:59)** guna mempertahankan nyala api (*maintain the flame*).

---

## 2. Arsitektur & Logika Mesin Rentetan (*Streak Engine*)

### A. Mesin Perhitungan Deterministik ([`src/lib/streakEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/streakEngine.ts))
Mesin menghitung seluruh siklus minggu berbasis kalender ISO (Senin ke Minggu):
1. **Total Contributions / Total Sesi**:
   - Menghitung akumulasi seluruh sesi riil dari aktivitas Strava dan jadwal latihan yang telah berstatus `COMPLETED` (saat ini: **35 sesi**).
   - Menampilkan rentang waktu total: misalnya `Feb 25, 2026 - Present`.
2. **Current Streak (Rentetan Minggu Aktif)**:
   - Dihitung secara berurutan minggu-demi-minggu ke belakang (*consecutive active weeks*).
   - Saat ini terhitung **8 minggu berturut-turut** aktif (dari 14 September 2026 hingga 2 November 2026).
3. **Longest Streak (Rentetan Terpanjang)**:
   - Memindai seluruh riwayat minggu aktif sejak sesi pertama untuk menemukan deret minggu berturut-turut terpanjang (saat ini: **8 minggu**).
4. **Siklus Spektrum Suhu Api Termodinamika (*Thermodynamic Flame Heat Progression*)**:
   - Warna api dan cincin melingkar berevolusi dinamis mengikuti tahapan rentetan mingguan berbasis fisika suhu api sesungguhnya (dari suhu paling rendah ke suhu paling panas):
     - **Tahap 1 (1–9 Minggu)**: `Api Merah` (`#EF4444`, ~800°C) — *Suhu awal / paling tidak panas*.
     - **Tahap 2 (10–19 Minggu)**: `Api Oranye` (`#F97316`, ~1,100°C) — *Membara (Mencapai kelipatan 10 minggu pertama)*.
     - **Tahap 3 (20–29 Minggu)**: `Api Kuning Emas` (`#EAB308`, ~1,300°C) — *Panas tinggi konsisten*.
     - **Tahap 4 (30–39 Minggu)**: `Api Putih Terang` (`#F8FAFC`, ~1,500°C) — *Sangat panas / White hot*.
     - **Tahap 5 (40–49 Minggu)**: `Api Biru Cyan` (`#00F0FF`, ~1,800°C) — *Api pembakaran gas murni terpanas*.
     - **Tahap 6 (50+ Minggu / 1 Tahun+)**: `Api Ungu Plasma` (`#C084FC`, >2,200°C) — *Puncak energi suhu kosmik legendaris*.
   - **Estetika Murni Tanpa Badge Teks Berlebih**: Warna api, lingkaran cincin, dan tanggal langsung memancarkan suhu warna termodinamika secara elegan tanpa menyisipkan badge teks tambahan di bawahnya, menjaga kartu tetap bersih dan 100% presisi sesuai desain referensi. Informasi suhu tetap tersedia via tooltip native saat kursor diarahkan ke area rentetan.

---

## 3. Komponen Antarmuka Visual ([`src/components/dashboard/WeeklyStreakCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/WeeklyStreakCard.tsx))

Komponen ini mereplikasi tata letak visual 3-kolom pada Gambar 1 dengan palet Obsidian & aksen neon:
1. **Header Taktis**: Menampilkan ikon api `Flame` dan badge penanda aturan `SETIAP MINGGU`.
2. **Kolom Kiri (Total Contributions)**:
   - Angka besar tebal `35` berwarna biru langit (`#38BDF8`).
   - Label `Total Contributions`.
   - Subjudul rentang tanggal `Feb 25, 2026 - Present`.
3. **Kolom Tengah (Hero: Ring Melingkar & Api di Puncak)**:
   - Ikon api `Flame` diletakkan tepat di puncak lingkaran (posisi jam 12) dengan latar belakang lingkaran gelap dan border bercahaya (*glow shadow*).
   - Lingkaran cincin (*circular ring*) `w-20 h-20` dengan angka rentetan `8` berwarna ungu muda (*soft purple* `#C084FC`).
   - Label `Current Streak` dan subjudul rentang waktu aktif `Sep 17 - Nov 2`.
4. **Kolom Kanan (Longest Streak)**:
   - Angka besar `8` berwarna biru langit (`#38BDF8`).
   - Label `Longest Streak` dan subjudul rentang waktu `Sep 17 - Nov 2`.
5. **Garis Pemisah Vertikal**: Dua garis vertikal halus memisahkan ketiga kolom secara presisi (`divide-x divide-[#1F2430]`).
6. **Desain Minimalis & Murni**: Menghapus bilah teks status berlebih di bagian bawah kartu agar tampilan kartu tetap ringkas, bersih, dan 100% presisi sesuai desain referensi (Gambar 1).

---

## 4. Integrasi Dashboard ([`src/components/dashboard/DashboardTacticalDeck.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/DashboardTacticalDeck.tsx) & [`src/app/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/page.tsx))

- **Posisi Paling Atas (*Above Image 2*)**: Diletakkan tepat di bagian paling atas kolom taktis beranda, sebelum bilah *mode switcher* `TAKTIS:` dan kartu *Scheduled Training Calendar* (Gambar 2).
- Penempatan di posisi teratas memberikan motivasi visual langsung (*hero metric retention*) saat atlet membuka dashboard sebelum meninjau detail jadwal harian atau sasaran makro.
- Data telemetri seluruh aktivitas dioper dari server component `src/app/page.tsx` ke dalam `DashboardTacticalDeck`.

---

## 5. Hasil Pengujian & Verifikasi

1. **Suite Pengujian Baru ([`scripts/test_weekly_streak_system.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/test_weekly_streak_system.js))**:
   - 22/22 skenario pengujian lulus 100% (kondisi kosong, sesi aktif minggu ini, api siaga, pemutusan rentetan akibat minggu kosong, dan telemetri database riil).
2. **Kompilasi TypeScript**:
   - `npx tsc --noEmit` lolos tanpa error (**0 error**).
3. **Suite Regresi Kesehatan Atlet**:
   - `node scripts/test_athlete_health_system.js`: **32/32 PASSED**.
4. **Suite Regresi Pelatih**:
   - `node scripts/test_coach_training_system.js`: **5/5 PASSED**.
5. **Verifikasi Server Lokal**:
   - Permintaan HTTP GET `http://localhost:3000/` menghasilkan status `200 OK` dan merender seluruh teks elemen rentetan.

