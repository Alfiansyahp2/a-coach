# Changelog: Modernisasi UI/UX Dashboard Beranda & Tactical Command Deck (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-02 18:45:00 WIB
- **Tipe**: `feat(ui)` / `feat(ux)` / `feat(dashboard)` / `feat(telemetry)`
- **Commit Message Rujukan**: `feat(ui): modernize dashboard ui/ux with interactive tactical deck, sub-tabbed load gate, and balanced 2-column layout`
- **Branch**: `refactor`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit tangkapan layar langsung pada antarmuka dashboard beranda (`/`), teridentifikasi beberapa friksi visual dan kelemahan pengalaman pengguna (*UI/UX friction points*):

1. **Beban Vertikal Berlebih (*Dashboard Vertical Overload*)**:
   - Terdapat 7 seksi besar yang ditumpuk secara vertikal tanpa pengelompokan modular yang adaptif.
   - Halaman memerlukan scroll berkali-kali untuk menjangkau informasi penting di bagian bawah.
2. **Kelebihan Beban Kognitif pada `AthleteHealthDeck`**:
   - Seksi perlindungan cedera sendi memakan tinggi layar hingga ~400px secara statis dengan paragraf teks yang sangat padat. Hal ini menghalangi pandangan awal atlet terhadap telemetri latihan mingguan.
3. **Ketidakseimbangan Asimetris Kolom (Kiri vs Kanan)**:
   - Kolom kiri (Feed Aktivitas) hanya berisi daftar sesi, sementara kolom kanan menumpuk 3 kartu sangat panjang sekaligus: *Scheduled Training Calendar*, *Personal Records Deck*, dan *Active Target Objectives*.
   - Akibatnya, kolom kanan 3 kali lebih panjang daripada kolom kiri, menyisakan area kosong yang canggung di kolom kiri saat melakukan scroll ke bawah.
4. **Kekosongan Metrik Awal Minggu (*Stark Zero State*)**:
   - Pada hari Senin atau awal siklus latihan baru ketika belum ada aktivitas yang dicatat, metrik volume menampilkan angka `0.0 km` dengan delta `-0%`, terkesan seolah sistem kosong atau rusak padahal grafik di sebelahnya menampilkan riwayat volume 631.6 km.
5. **Dossier AI Coach yang Asimetris**:
   - 7 kartu analisis bertumpuk di grid 2 kolom, meninggalkan 1 kartu ganjil (*orphan card*) di baris terbawah.

---

## 2. Rincian Perubahan Berdasarkan Git Diff

### A. Komponen Baru

#### 1. `src/components/dashboard/DashboardTacticalDeck.tsx` (114 baris)
- Menyatukan 3 modul operasional di kolom kanan dashboard ke dalam satu **Tactical Command Deck** terpadu berbasis tab:
  - **Tab 1: 📅 Sesi Terjadwal** (`ScheduledWorkouts`): Menampilkan 5 sesi terjadwal terdekat dari rencana latihan aktif 12 minggu beserta status kepatuhannya (`COMPLETED` / `ACTIVE`).
  - **Tab 2: 🎯 Sasaran Makro** (`MacroGoals`): Menampilkan bilah progres capaian sasaran makro (Road to 100km Century, Jalur Maraton 10–20km, dan Target Frekuensi Mingguan).
  - **Tab 3: 🏆 Rekor Personal** (`PersonalRecords`): Menampilkan capaian *all-time bests* (5K run, max ride, max elevation).
- **Mode Toggle "Lihat Semua / Mode Tab"**:
  - Memberikan fleksibilitas bagi pengguna yang ingin melihat ketiga seksi ditumpuk sekaligus (*stacked view*) atau terorganisir rapi dalam tab (*tabbed view*).
  - **Dampak UX**: Menyeimbangkan tinggi kolom kiri dan kanan secara presisi serta mengeliminasi scroll vertikal yang tidak proporsional.

---

### B. Pembaruan Komponen Eksisting

#### 1. `src/components/health/AthleteHealthDeck.tsx`
- Mentransformasi kartu indikator kesiapan klinis menjadi **Executive Clinical Readiness Hub**:
  - **Sistem 3 Sub-Tab Interaktif**:
    - **Tab 1: Kapasitas Lari vs Sepeda**: Dua meteran kapasitas beban (*Running 0% ON_HOLD* vs *Cycling 60% CONDITIONAL*) dengan parameter batas jarak, rekomendasi kadens 85–95 RPM, dan catatan toleransi empiris bebas nyeri 56.10 km.
    - **Tab 2: Panduan Taktis Hari Ini**: Menampilkan panduan taktis terarah (*Aktivitas Diizinkan & Disarankan* vs *Kontraindikasi Dilarang*) dalam kartu yang terisolasi.
    - **Tab 3: Matriks Risiko Sendi**: Evaluasi 3 pilar risiko biomekanika (Beban Benturan Sendi, Beban Geser Torsi, Kapasitas Kardiovaskular).
  - **Tombol Lipat / Buka (*Collapse / Expand*)**: Atlet dapat melipat rincian untuk menghemat ruang vertikal layar dan langsung memfokuskan pandangan pada telemetri mingguan.

#### 2. `src/components/MetricCard.tsx`
- Menambahkan properti opsional `targetProgress` (`current`, `target`, `label`).
- Mengintegrasikan bilah progres target mingguan dinamis: Ketika volume awal minggu adalah `0.0 km`, kartu secara cerdas menampilkan `Target Minggu 1: 18.0 km (MTB Zone 2)` dengan progress bar adaptif.
- Menambahkan efek border hover bercahaya (*accent glow*), sudut tajam presisi `rounded-sm`, dan tipografi tabular mono.

#### 3. `src/components/dashboard/DashboardAiInsightsDeck.tsx`
- Mengubah tata letak 2 kolom menjadi **3-Column Responsive Grid** yang simetris dan rapi untuk menampung seluruh kartu tanpa kartu ganjil di baris bawah.
- Menambahkan **Filter Kategori Cepat**:
  - `Semua (7)` | `⚠️ Peringatan (2)` | `✅ Rekomendasi (4)`
- Desain kartu glassmorphic dengan aksen warna sisi kiri (*Rose* `#FF2A6D` untuk peringatan cedera, *Emerald* `#10B981` untuk rekomendasi latihan, *Cyan* `#00F0FF` untuk koordinasi multi-sport).
- Menambahkan tombol toggle untuk menutup/membuka dossier analitik.

#### 4. `src/components/dashboard/DashboardTopNavbar.tsx` & `DashboardIntegrityStrip.tsx`
- Logo `AC` pada navbar kini memiliki tautan interaktif kembali ke beranda (`/`) dan aksen hover glow.
- Strip telemetri atas diperbarui dengan latar gradien gelap halus (`bg-gradient-to-r from-[#12151D] via-[#161B26] to-[#12151D]`).
- Status basis data dilengkapi indikator LED hijau berdenyut untuk PostgreSQL Online, lencana enkripsi AES-256-GCM, dan tombol aksi utama `+ TAMBAH AKTIVITAS`.

#### 5. `src/components/ActivityFeed.tsx`
- Menambahkan ikon olahraga spesifik: `Bike` untuk sesi sepeda, `Footprints` untuk lari, dan `ActivityIcon` untuk lainnya.
- Mengintegrasikan metrik elevasi pendakian (`▲ 35m`) dan sensor denyut jantung dengan aksen merah berdenyut.
- Menambahkan border hover aktif dan navigasi chevron yang responsif.

#### 6. `src/app/page.tsx`
- Mengorkestrasi ulang layout beranda utama dengan memanfaatkan `DashboardTacticalDeck` untuk kolom kanan.
- Menghubungkan kalkulasi target mingguan adaptif pada `MetricCard` sehingga atlet selalu memiliki panduan target volume yang jelas.

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/components/dashboard/DashboardTacticalDeck.tsx` | Baru | +114 | 0 | Tabbed command deck (Jadwal, Sasaran, Rekor) |
| `src/components/health/AthleteHealthDeck.tsx` | Modifikasi | +250 | -196 | Sub-tabs interaktif & tombol collapse |
| `src/components/dashboard/DashboardAiInsightsDeck.tsx` | Modifikasi | +140 | -74 | 3-column grid, severity filter pills, & toggle |
| `src/components/MetricCard.tsx` | Modifikasi | +45 | -20 | Target progress bar & hover glow |
| `src/components/ActivityFeed.tsx` | Modifikasi | +45 | -30 | Ikon olahraga spesifik & metrik elevasi |
| `src/components/dashboard/DashboardIntegrityStrip.tsx` | Modifikasi | +20 | -11 | Cockpit telemetry HUD bergradien & LED status |
| `src/components/dashboard/DashboardTopNavbar.tsx` | Modifikasi | +12 | -7 | Logo interaktif link `/` & hover shadow |
| `src/app/page.tsx` | Modifikasi | +45 | -60 | Integrasi seimbang 2 kolom & target progress |

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **TypeScript Type Safety**:
   - `npx tsc --noEmit` $\to$ **0 ERRORS**.
2. **Athlete Health & Injury-Aware Verification Suite**:
   - `node scripts/test_athlete_health_system.js` $\to$ **32 PASSED, 0 FAILED**.
3. **Coach Training & Indicators Verification Suite**:
   - `node scripts/test_coach_training_system.js` $\to$ **5 PASSED, 0 FAILED**.
4. **Live End-to-End Route Verification**:
   - `http://localhost:3000/` $\to$ **200 OK**.
5. **Konsistensi Visual & Filosofi Obsidian**:
   - Seluruh token warna Obsidian (`#090A0F`, `#12151D`, `#161922`), Volt (`#D4FF00`), Cyan (`#00F0FF`), Emerald (`#10B981`), dan Crimson (`#FF2A6D`) terjaga konsisten dengan radius sudut presisi (`rounded-sm` 4px).

