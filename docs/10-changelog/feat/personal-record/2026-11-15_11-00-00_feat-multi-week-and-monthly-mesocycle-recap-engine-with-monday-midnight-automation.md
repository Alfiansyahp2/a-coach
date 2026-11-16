# Changelog: Multi-Week & Monthly Mesocycle Recap Engine with Monday 00:00 Automation (`feat/personal-record`)

- **Tanggal & Waktu**: 2026-11-15 11:00:00 WIB
- **Tipe**: `feat(analytics)` / `feat(recap)` / `feat(domain-logic)` / `feat(ui)`
- **Commit Message Rujukan**: `feat(recap): implement multi-week and monthly mesocycle recap engine with automatic monday midnight completed-week transition` *(Uncommitted Working Tree)*
- **Branch**: `feat/personal-record`
- **Lokasi**: [`docs/10-changelog/feat/personal-record/2026-11-15_11-00-00_feat-multi-week-and-monthly-mesocycle-recap-engine-with-monday-midnight-automation.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/personal-record/2026-11-15_11-00-00_feat-multi-week-and-monthly-mesocycle-recap-engine-with-monday-midnight-automation.md)

---

## 1. Latar Belakang & Kebutuhan Pengguna

Pengguna meminta peningkatan kecerdasan logika rekapitulasi latihan:
> *"buatkan logic rekap menjadi lebih bagus lagi, karena menurut saya masih kurang. dibagian pertama pada bagian otomatis ketika 00.00 di hari senin dari minggu agar rekap seminggu dan rekap dari sebelum nya juga jika memang ada 2 minggu aktivitas sebelumnya ataupun ada sebulan aktivitas sebelumnya. apakah bisa?"*

### Keterbatasan Sistem Sebelumnya:
1. **Layar Kosong di Hari Senin 00:00**:
   - Begitu jam bergeser ke hari Senin pukul 00:00:00, siklus kalender baru dimulai dengan 0 sesi tercatat. Pengguna disambut layar kosong *"Belum ada aktivitas minggu ini"*, padahal atlet baru saja menuntaskan seluruh blok latihan 7-hari penuh pada hari Minggu malam.
2. **Ketiadaan Tinjauan Multi-Minggu (Blok 14-Hari) & Mesosiklus Bulanan (4-Minggu)**:
   - Rekap hanya menyajikan evaluasi 7-hari secara terisolasi. Atlet tidak memiliki cara untuk melihat akumulasi total volume 2 minggu atau 1 bulan ke belakang secara terpadu.
3. **Navigasi Histori Tidak Efisien**:
   - Atlet harus menekan tombol panah mundur berulang-ulang tanpa mengetahui minggu-minggu mana saja yang sebenarnya memiliki data riil di database.

---

## 2. Rincian Rekayasa & Solusi Arsitektur

### A. Otomatisasi Transisi Siklus Tuntas (Senin 00:00:00)
- **Modul**: [`src/lib/domain/analytics/multiWeekRecapEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/multiWeekRecapEngine.ts)
- **Aturan Evaluasi**: `shouldDefaultToCompletedWeek(currentDate, currentWeekSessionsCount)`
  - Jika hari adalah Senin (`currentDate.getDay() === 1`) ATAU minggu berjalan belum memiliki sesi (`currentWeekSessionsCount === 0`), sistem secara **otomatis memuat rekap evaluasi minggu penuh yang baru saja selesai** sebagai tinjauan utama (*Authoritative Completed Week Debrief*).
  - Menandai properti `isMondayAutoCompleted = true` dan memunculkan banner informatif yang mempermudah atlet mengevaluasi minggu lalu sebelum melompat ke minggu berjalan.

### B. Mesin Agregasi Multi-Minggu & Mesosiklus Bulanan (`computeMultiWeekRollup`)
- **Dukungan Tiga Cakupan (*Scopes*)**:
  - `1_WEEK`: Tinjauan fokus 7 hari.
  - `2_WEEKS`: Agregasi blok 14 hari (komparasi Minggu 1 vs Minggu 2, perubahan tren volume WoW, total km).
  - `4_WEEKS`: Mesosiklus 1 bulan (28 hari: total volume bulanan, rata-rata km/minggu, kurva progresi 4 minggu, skor konsistensi, deteksi fase periodisasi, dan sintesis pelatih).

### C. Penemuan Histori Otomatis (*Historical Week Discovery*)
- **Fungsi**: `discoverAvailableRecapWeeks(activities, referenceDate)`
- Memindai riwayat aktivitas riil di PostgreSQL hingga 12 minggu ke belakang, mengelompokkannya secara deterministik per minggu kalender (Senin–Minggu), dan menghasilkan daftar opsi navigasi cepat (*pills*):
  - `[Minggu Berjalan]`
  - `[1 Mgg Lalu (Tuntas)]`
  - `[2 Mgg Lalu (X sesi)]`
  - `[3 Mgg Lalu (Y sesi)]`
  - `[4 Mgg Lalu / 1 Bulan]`

### D. Komponen Antarmuka Pengguna Modular
1. [`src/components/recap/MultiWeekMesocycleDeck.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/recap/MultiWeekMesocycleDeck.tsx) (139 baris):
   - Dek visual agregasi multi-minggu dengan perbandingan visual bar volume, tren persentase, konsistensi siklus, elevasi, kalori, dan sintesis periodisasi pelatih.
2. [`src/components/recap/WeeklyRecapHeroCards.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/recap/WeeklyRecapHeroCards.tsx) (67 baris):
   - 4 kartu metrik utama (Total Jarak, Durasi & Kalori, Telemetri Nyeri, dan Toleransi Beban).
3. [`src/components/recap/WeeklyRecapHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/recap/WeeklyRecapHub.tsx) (287 baris):
   - Menghadirkan *scope switcher* (`1 Minggu`, `2 Minggu`, `1 Bulan`), *quick historical pills*, dan banner otomatisasi Senin 00:00.
4. [`src/components/analytics/WeeklyRecapCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/analytics/WeeklyRecapCard.tsx) (289 baris):
   - Membawa navigasi pil histori cepat dan banner cerdas Senin 00:00 langsung ke kartu rekap pada dashboard taktis (`MODUL TAKTIS`).

---

## 3. Matriks Kepatuhan Batas Ukuran Berkas (*Clean Architecture*)

| Berkas / Komponen | Baris Kode | Batas Maksimum | Status |
| :--- | :---: | :---: | :---: |
| `src/lib/domain/analytics/multiWeekRecapEngine.ts` | **219** | < 300 | ✅ Patuh (Aman) |
| `src/lib/domain/analytics/weeklyRecapEngine.ts` | **175** | < 300 | ✅ Patuh (Aman) |
| `src/lib/domain/analytics/weeklyRecapTypes.ts` | **223** | < 300 | ✅ Patuh (Aman) |
| `src/components/recap/WeeklyRecapHub.tsx` | **287** | < 300 | ✅ Patuh (Aman) |
| `src/components/recap/WeeklyRecapHeroCards.tsx` | **67** | < 300 | ✅ Patuh (Aman) |
| `src/components/recap/MultiWeekMesocycleDeck.tsx` | **139** | < 300 | ✅ Patuh (Aman) |
| `src/components/analytics/WeeklyRecapCard.tsx` | **289** | < 300 | ✅ Patuh (Aman) |
| `src/app/api/athlete/weekly-recap/route.ts` | **58** | < 300 | ✅ Patuh (Aman) |

---

## 4. Hasil Verifikasi Sistem

1. **Uji Otomatis Baru (`scripts/tests/test_multi_week_recap_system.js`)**:
   - Status: **7/7 PASSED (100% Green)**.
2. **Seluruh Rangkaian Uji Regresi (`npm run test:all`)**:
   - Status: **109/109 PASSED (100% Green)**:
     - Health & Clinical Suite: 31/31 PASSED
     - Coach & Training Progression: 5/5 PASSED
     - Weekly Streak Thermodynamics: 21/21 PASSED
     - BOLA Authorization Security: 5/5 PASSED
     - Multi-Week & Monday Automation: 7/7 PASSED
     - Python Sports Science Pytest: 16/16 PASSED
3. **TypeScript Typecheck (`npx tsc --noEmit`)**:
   - Status: **0 Error**.
4. **Next.js Production Build (`npm run build`)**:
   - Status: **34/34 rute berhasil dikompilasi**.
5. **Kontrol Versi**:
   - Seluruh perubahan berada di *unstaged working tree* tanpa commit git langsung (`NO DIRECT COMMITS`).
