# Changelog: Weekly Recap Engine Audit & Timezone Remediation (`feat/backend`)

- **Tanggal & Waktu**: 2026-11-09 20:45:00 WIB
- **Tipe**: `feat(backend)` / `fix(analytics)` / `fix(timezone)` / `refactor(domain)`
- **Commit Message Rujukan**: `feat(backend): audit and remediate weekly recap engine, eliminate utc timezone shift, and harmonize temporal navigation`
- **Branch**: `feat/backend`
- **Lokasi**: `docs/10-changelog/feat/backend/2026-11-09_20-45-00_feat-weekly-recap-engine-audit-and-timezone-remediation.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Berdasarkan audit fungsional menyeluruh terhadap subsistem analitik rekapan mingguan (*Weekly Activity & Injury Recap*), teridentifikasi beberapa cacat arsitektur dan inkonsistensi matematis yang memicu ketidaksesuaian data antara kartu ringkasan dashboard, rincian harian, dan kontrol navigasi waktu:

1. **Bug Kritis Pergeseran Zona Waktu (-1 Hari) pada *Daily Activity Breakdown***:
   - Pada [`weeklyRecapActivity.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapActivity.ts), pembentukan tanggal 7 hari dalam sepekan (Senin s.d. Minggu) sebelumnya menggunakan pemanggilan `.toISOString().slice(0, 10)` terhadap objek `currentD` yang diinisialisasi pada jam 00:00:00 waktu lokal (WIB, UTC+7).
   - Di zona waktu Indonesia (WIB = UTC+7), jam 00:00:00 lokal setara dengan jam 17:00:00 UTC hari sebelumnya.
   - Pemotongan string ISO UTC tersebut menyebabkan seluruh tanggal mundur 1 hari kalender:
     - Hari Senin (02 Nov) tergeser menjadi tanggal `2026-11-01` (hari Minggu kalender).
     - Hari Minggu (08 Nov) tergeser menjadi tanggal `2026-11-07` (hari Sabtu kalender).
     - **Hari Minggu sebenarnya (`2026-11-08`) hilang sama sekali dari array 7 hari!**
   - **Dampak Fatal**: Sesi latihan yang diselesaikan pada hari Minggu (misal `Zone 2 Ride Session 31.4 km` pada 08 Nov) gagal dicocokkan dengan hari manapun di rincian harian. Total sesi di header menampilkan **3 Sesi (88.35 km)**, namun di rincian harian hanya ada **2 Sesi (56.91 km)** dan metrik aktif menampilkan *"2 Hari Aktif / 5 Hari Istirahat"*.
2. **Desinkronisasi *Default Reference Date* (SSR vs Navigasi Client)**:
   - Pada [`weeklyRecapEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapEngine.ts), jika `referenceDate` tidak diberikan, mesin sebelumnya mengambil `latestTime` dari aktivitas terakhir (08 Nov 2026, minggu lalu).
   - Di sisi peramban (client), kontrol navigasi `Minggu Ini` meminta data berdasarkan `new Date()` (Senin, 09 Nov 2026, minggu berjalan baru).
   - Akibatnya: Saat halaman dimuat pertama kali melalui SSR, atlet melihat data minggu lalu (88.35 km) dengan badge bertuliskan "Minggu Ini". Namun saat atlet menekan tombol "Minggu Ini", client memanggil tanggal hari ini (09 Nov) sehingga seluruh metrik mendadak menjadi **0 km / 0 sesi**!
3. **Anomali Logika Kontrol Navigasi Waktu (*"Minggu Depan >"*)**:
   - Kontrol navigasi sebelumnya menyajikan tombol statis: `< Minggu Lalu` | `Minggu Ini` | `Minggu Depan >`.
   - Rekapitulasi (*Recap*) pada hakikatnya adalah tinjauan ke belakang (*retrospective review*) atas aktivitas yang sudah diselesaikan. Masa depan belum terjadi dan tidak pernah memiliki rekapitulasi data. Tombol "Minggu Depan" yang aktif memungkinkan pengguna memanggil rekap masa depan yang kosong.
   - Selain itu, saat pengguna mundur ke histori masa lampau (misal 2 minggu lalu), tombol maju tetap bertuliskan "Minggu Depan", padahal melangkah maju dari 2 minggu lalu membawanya ke 1 minggu lalu, bukan ke masa depan.

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Perbaikan Timezone-Safe pada Agregasi Aktivitas Harian (`src/lib/domain/analytics/weeklyRecapActivity.ts`)

Menghapus fungsi manual `getIsoDateOnly` dan beralih penuh ke format tanggal kalender lokal atlet menggunakan [`formatDateOnly`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/formatters.ts):

```typescript
// Sebelum (Bermasalah pada timezone UTC+7):
const dateStr = currentD.toISOString().slice(0, 10);
const dayActs = weekActivities.filter((a) => getIsoDateOnly(a.start_date) === dateStr);

// Sesudah (Akurat & Timezone-Safe):
const dateStr = formatDateOnly(currentD);
const dayActs = weekActivities.filter((a) => formatDateOnly(a.start_date) === dateStr);
```

- **Hasil Pemetaan Data Kalender**:
  - `Senin` dipetakan tepat ke `2026-11-02` (0 km).
  - `Selasa` dipetakan tepat ke `2026-11-03` (0 km).
  - `Rabu` dipetakan tepat ke `2026-11-04` (1 sesi, 26.91 km).
  - `Kamis` dipetakan tepat ke `2026-11-05` (0 km).
  - `Jumat` dipetakan tepat ke `2026-11-06` (0 km).
  - `Sabtu` dipetakan tepat ke `2026-11-07` (1 sesi, 30.00 km).
  - `Minggu` dipetakan tepat ke `2026-11-08` (1 sesi, 31.44 km).
- Seluruh 3 sesi terekam 100% utuh dengan status **3 Hari Aktif / 4 Hari Istirahat** (88.35 km).

---

### B. Standardisasi Baseline Minggu & Indikator Otoritatif Server (`src/lib/domain/analytics/weeklyRecapEngine.ts`)

1. Mengeliminasi *silent fallback* `latestTime` yang tidak sinkron, menggantinya dengan penentuan waktu kalender otoritatif:
```typescript
// 1. Tentukan Rentang Waktu Minggu (Senin 00:00:00 - Minggu 23:59:59)
const ref = referenceDate || new Date();
const { start, end } = getWeekBounds(ref);

const now = new Date();
const currentWeekMonday = getWeekBounds(now).start;
const isCurrentWeek = formatDateOnly(start) === formatDateOnly(currentWeekMonday);
const weeksAgo = Math.max(
  0,
  Math.round((currentWeekMonday.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
);
```

2. Memperluas kontrak antarmuka `WeeklyRecapTimeframe` pada [`weeklyRecapTypes.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/analytics/weeklyRecapTypes.ts):
```typescript
export interface WeeklyRecapTimeframe {
  startDate: string;
  endDate: string;
  startDateFormatted: string;
  endDateFormatted: string;
  label: string;
  daysCount: number;
  isCurrentWeek?: boolean;
  weeksAgo?: number;
}
```
Komponen antarmuka kini mengetahui secara pasti apakah siklus yang sedang ditampilkan merupakan minggu berjalan saat ini atau arsip lampau tanpa bergantung pada state offset relatif sisi client.

---

### C. Refaktorisasi Kontrol Navigasi Waktu UI (`WeeklyRecapHub.tsx` & `WeeklyRecapCard.tsx`)

1. **Eliminasi Total Tombol "Minggu Depan"**:
   - Tombol mundur: `< Sebelumnya` (mengambil `startDate - 7 hari`).
   - Indikator tengah dinamis:
     - Jika `isCurrentWeek === true`: Ditampilkan badge aktif `● Minggu Berjalan`.
     - Jika `isCurrentWeek === false`: Menampilkan tombol cepat `↺ ${weeksAgo} Mgg Lalu (Reset)` untuk melompat instan ke minggu saat ini.
   - Tombol maju: `Berikutnya >` — **DITONAKTIFKAN MUTLAK** (`disabled={loading || timeframe.isCurrentWeek}`) saat berada di minggu berjalan dengan *cursor-not-allowed* dan tooltip *"Masa depan belum memiliki data rekapitulasi"*. Tombol ini hanya aktif saat atlet sedang meninjau arsip minggu-minggu lampau untuk melangkah maju mendekati masa kini.
2. **Banner Informatif Awal Siklus**:
   Jika minggu berjalan baru dimulai dan belum ada aktivitas (0 sesi), antarmuka menampilkan panduan ramah dengan tombol pintas: *"Siklus minggu berjalan baru dimulai ({label}). Belum ada aktivitas yang dicatat minggu ini. [Lihat Rekap Minggu Sebelumnya →]"*.

---

## 3. Hasil Pengujian & Verifikasi Kualitas

1. **Automated Test Suite Expansion** ([`scripts/tests/test_weekly_recap_engine.js`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/scripts/tests/test_weekly_recap_engine.js)):
   - Menambahkan pengujian khusus `Accurately matches weekend/Sunday activities without UTC timezone shift drop`.
   - **Hasil**: **11/11 PASSED (100% lulus)**.
2. **Pemeriksaan Tipe Data TypeScript**:
   - `npx tsc --noEmit` -> **0 error**.
3. **Build Produksi Next.js**:
   - `npm run build` -> Sukses mengompilasi **32/32 rute** termasuk rute dinamis `/recap` dan endpoint `/api/athlete/weekly-recap`.
4. **Audit Batasan Baris Berkas (Maksimal 300 Baris)**:
   - `weeklyRecapEngine.ts`: 129 baris (< 300)
   - `weeklyRecapActivity.ts`: 152 baris (< 300)
   - `weeklyRecapTypes.ts`: 144 baris (< 300)
   - `WeeklyRecapHub.tsx`: 239 baris (< 300)
   - `WeeklyRecapCard.tsx`: 294 baris (< 300)

