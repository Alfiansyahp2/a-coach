# Changelog: Integrasi Aktivitas Selesai ke Kalender Latihan & Perbaikan Zona Waktu Tanggal (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-04 14:05:00 WIB
- **Tipe**: `feat(ui)` / `feat(training)` / `fix(timezone)`
- **Commit Message Rujukan**: `feat(training): render completed strava activities on calendar days and fix local timezone date parsing`
- **Branch**: `feat/ui`
- **Lokasi Berkas**: `docs/10-changelog/feat/ui/2026-11-04_14-05-00_feat-render-completed-activities-on-training-calendar-and-timezone-fix.md`

---

## 1. Latar Belakang & Pernyataan Masalah

Saat atlet menambahkan aktivitas baru melalui modal tambah aktivitas atau sinkronisasi Strava (misalnya: *Zone 2 Ride Session 26.91 km* pada **Rabu, 4 Nov 2026**):
1. **Aktivitas Muncul di Daftar Aktivitas (*Ingested Telemetry Stream*), tetapi Hilang di Kalender Latihan**:
   - Komponen kalender [`ScheduleTrainingHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/ScheduleTrainingHub.tsx) sebelumnya **hanya** mengambil dan merender `ScheduledWorkout` dari rencana latihan awal.
   - Tidak ada penggabungan dengan data `activities` riil di [`src/app/training/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/training/page.tsx).
   - Akibatnya, pada hari Rabu (4 Nov) yang semula terjadwal sebagai hari istirahat, kalender tetap menampilkan *"Jeda Pemulihan • Proteksi Sendi • Istirahat"* seolah-olah atlet belum berolahraga sama sekali.
2. **Bug Pembacaan Tanggal UTC vs Waktu Lokal (*Timezone Date Shift*)**:
   - Di [`src/lib/shared/formatters.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/shared/formatters.ts) dan [`src/lib/db/client.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/client.ts), fungsi `formatDateOnly` sebelumnya menggunakan `val.split('T')[0]`.
   - Aktivitas yang dicatat pada Rabu pagi jam 05:00 WIB tersimpan dengan timestamp UTC `2026-11-03T22:00:00.000Z`.
   - Karena di-split secara mentah (`split('T')[0]`), tanggal terpotong menjadi `"2026-11-03"` (hari Selasa waktu UTC), sehingga mesin korelasi keliru mencocokkan sesi Rabu ke jadwal hari Selasa.

---

## 2. Rincian Perubahan Berdasarkan Git Diff

### A. Perbaikan Logika Format Tanggal & Zona Waktu Lokal

#### 1. [`src/lib/shared/formatters.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/shared/formatters.ts) & [`src/lib/db/client.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/db/client.ts)
- Memperbaiki `formatDateOnly`: jika nilai masukan berupa string ISO datetime (`T`), string tersebut diparse ke objek `Date` dan diekstrak menjadi tanggal kalender lokal atlet (`YYYY-MM-DD` sesuai zona waktu sistem):
  ```ts
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return val.split('T')[0];
  }
  ```
- Dengan perubahan ini, `2026-11-03T22:00:00.000Z` (+07:00) secara konsisten dan benar dievaluasi sebagai `"2026-11-04"`.

#### 2. [`src/lib/domain/matching/matchingEngine.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/lib/domain/matching/matchingEngine.ts)
- Menggunakan `formatDateOnly` yang telah diperbaiki untuk membandingkan tanggal sesi aktivitas dengan rencana latihan.

---

### B. Integrasi Aktivitas Riil ke Kalender Latihan

#### 1. [`src/app/training/page.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/training/page.tsx)
- Menambahkan pemanggilan `getActivities(DEFAULT_USER_ID, { limit: 100 })` ke dalam agregasi data server.
- Meneruskan `initialActivities={activities}` ke `<ScheduleTrainingHub />`.

#### 2. [`src/components/training/calendarBuilder.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/calendarBuilder.ts)
- Memperluas antarmuka `CalendarDay` dengan properti `activities: Activity[]`.
- Pada setiap sel hari (`d`), sistem memfilter aktivitas yang dilakukan pada `dateStr` tersebut:
  ```ts
  const dayActivities = activities.filter((act) => {
    return formatDateOnly(act.start_date) === dateStr;
  });
  ```
- **Kalkulasi Akumulasi Jarak Mingguan**:
  - `completedDistanceMeters`: Menghitung total jarak dari seluruh aktivitas yang telah diselesaikan di minggu tersebut.
  - Jika atlet bersepeda 26.91 km di hari Rabu, progres mingguan otomatis melonjak menjadi `26.9 / 18 km` (**149% - TARGET TERCAPAI**).

#### 3. [`src/components/training/CalendarDayCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/CalendarDayCard.tsx)
- Menampilkan kartu khusus **Aktivitas Tercatat / Terverifikasi** pada hari terkait:
  - Chip kategori: `[ RIDE ]` (hijau cycling) atau `[ LARI ]` (oranye running).
  - Lencana: `[ TERCATAT ]` + ikon centang `CheckCircle2`.
  - Telemetri nyata: `26.91 km • 1:20:00`.
  - Judul sesi: `Zone 2 Ride Session (26.9 km)`.
  - Bagian kaki kartu: `✓ Terverifikasi (1 Sesi)`.
- Kartu fallback puasa/istirahat kini **hanya** muncul jika hari tersebut benar-benar tidak memiliki jadwal latihan maupun aktivitas riil (`!hasWorkouts && !hasActivities`).

---

## 3. Hasil Pengujian & Verifikasi

- **Database Check**: Aktivitas *Zone 2 Ride Session (26.9 km)* kini terpetakan dengan tepat ke hari **Rabu, 4 Nov 2026**, dan jadwal latihan hari **Selasa, 3 Nov 2026** kembali berstatus `PLANNED`.
- **TypeScript Compilation (`npx tsc --noEmit`)**: ✅ 0 Errors.
- **Weekly Streak & Flame Suite (`npm run test:streak`)**: ✅ 21/21 Tests Passed.
- **Production Build (`npm run build`)**: ✅ 24/24 Routes terkompilasi optimal.
