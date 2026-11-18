# Changelog: Visual Sesi Terlewat (Merah & Silang) dan Interaktivitas Detail Sesi Aktivitas (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-04 14:25:00 WIB
- **Tipe**: `feat(ui)` / `feat(training)` / `fix(compliance)`
- **Commit Message Rujukan**: `feat(training): display missed workouts in red with X icon and enable interactive session details for completed activities`
- **Branch**: `feat/ui`
- **Lokasi Berkas**: `docs/10-changelog/feat/ui/2026-11-04_14-25-00_feat-missed-workout-visuals-and-activity-dossier-interactivity.md`

---

## 1. Latar Belakang & Pernyataan Masalah (Validasi Logika Atletik)

Atlet menanyakan kepatutan logika sistem pelatihan:
> *"misalnya hari kemarin kan selasa tidak terlaksana, seharusnya memilki silang dan berwarna merah bukan hijau dan karena rabu adalah istirahat walaupun diganti aktifitas tetap bisa ada detail sesi nya. apakah saya salah untuk logic pada gambar ini?"*

### Validasi Logika: Logika Atlet 100% TEPAT & BENAR
1. **Sesi Masa Lalu yang Tidak Dilakukan Adalah Sesi Terlewat (*Missed Workout*)**:
   - Jika suatu sesi dijadwalkan pada hari yang telah berlalu (`dateStr < todayStr`) dan tidak ada aktivitas yang diverifikasi, status sesi tersebut adalah **TERLEWAT / TIDAK TERLAKSANA**.
   - Menampilkan sesi kemarin (Selasa, 3 Nov 2026) dalam warna hijau atau centang keliru secara psikologis dan analitis, karena hijau mengindikasikan keberhasilan (*compliance*). Sesi tersebut wajib ditampilkan dalam warna **merah peringatan**, ikon silang (`XCircle`), lencana `[ TERLEWAT ]`, dan coretan teks (*line-through*).
2. **Aktivitas Nyata di Hari Istirahat Tetap Membutuhkan Akses Detail Sesi**:
   - Meskipun Rabu secara periodisasi adalah hari jeda pemulihan (*rest day*), atlet tetap mencatatkan aktivitas *Zone 2 Ride Session 26.91 km*.
   - Kalender sebelumnya menampilkan teks *"Terverifikasi (1 Sesi)"* yang statis tanpa tombol `Detail Sesi ↗` dan tanpa kartu yang dapat diklik. Atlet berhak menginspeksi dossier sesi dan membuka analisis telemetri penuh atas latihan yang telah diselesaikan.

---

## 2. Rincian Perubahan Berdasarkan Git Diff

### A. Kartu Kalender Harian (`CalendarDayCard.tsx`)
1. **Deteksi Sesi Terlewat (`isMissed`)**:
   - Memperkenalkan komparasi `isPastDay = Boolean(todayStr && day.dateStr < todayStr && !day.isToday)`.
   - Menghitung `isMissed = !isCompleted && (w.status === "MISSED" || isPastDay)`.
   - Mengubah kartu sesi terlewat menjadi palet merah: `bg-red-500/10 border-red-500/30 hover:border-red-500/60`, lencana merah `bg-red-500/20 text-red-500`, ikon `<XCircle className="w-3.5 h-3.5 text-red-500" />`, label `[ TERLEWAT ]`, dan target metrik dicoret (`line-through text-red-400`).
2. **Interaktivitas Aktivitas Nyata**:
   - Mengubah elemen aktivitas dari `<div>` statis menjadi `<button>` interaktif dengan styling hover (`hover:border-[var(--color-cycling)] hover:-translate-y-0.5 cursor-pointer`).
   - Meneruskan handler `onSelectActivity?.(act)` saat kartu diklik.
3. **Penyempurnaan Footer Sel Kalender**:
   - Pada hari dengan aktivitas (seperti Rabu 4 Nov): menampilkan status `✓ {activities.length} Sesi` di sisi kiri dan tombol interaktif **`Detail Sesi ↗`** di sisi kanan (`onClick={() => onSelectActivity(activities[0])}`).
   - Pada hari dengan sesi terlewat (seperti Selasa 3 Nov): menampilkan tautan `Detail Sesi ↗` bernuansa merah (`text-red-500 dark:text-red-400 hover:text-red-300`).

---

### B. Modal Dossier Sesi (`WorkoutDossierModal.tsx`)
1. **Dukungan Objek Aktivitas Riil (`activity?: Activity | null`)**:
   - Menampilkan kartu telemetri terverifikasi berlatar emerald dengan metrik presisi: Jarak Aktual (km), Waktu Gerak (`HH:MM:SS`), dan Kecepatan Rata-rata (`km/h`).
   - Menyediakan tautan langsung **`Buka Analisis Sesi Penuh ↗`** yang mengarahkan atlet ke halaman detail mendalam [`/activities/[id]`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/app/activities/[id]/page.tsx).
2. **Peringatan Visual Sesi Terlewat (`isMissed?: boolean`)**:
   - Menampilkan banner peringatan merah: *"Status: Sesi Terlewat (Tidak Terlaksana) — Sesi latihan ini dijadwalkan pada hari yang telah lewat dan belum tercatat aktivitas fisik nyata"*.
   - Menyediakan opsi pencatatan aktivitas susulan melalui modal tambah aktivitas.

---

### C. Hub Pelatihan & Grid View (`ScheduleTrainingHub.tsx` & Views)
1. **Penerusan Handler Aktivitas**:
   - Mengimplementasikan `handleSelectWorkout` dan `handleSelectActivity` di [`ScheduleTrainingHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/ScheduleTrainingHub.tsx).
   - Mengaitkan aktivitas tanpa jadwal resmi (seperti pada hari istirahat) ke dalam sesi sintetis dan kecocokan instan (`syntheticMatch`), sehingga atlet dapat membuka dossier sesi secara mulus.
2. **Sinkronisasi Grid & List View**:
   - Memperbarui [`TrainingCalendarGridView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingCalendarGridView.tsx) dan [`TrainingWorkoutListView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingWorkoutListView.tsx) untuk menerima `todayStr` dan menampilkan status `TERLEWAT` secara konsisten di kedua mode tampilan.

---

## 3. Matriks Berkas yang Dimodifikasi

| Berkas | Tipe | Perubahan | Deskripsi Singkat |
|---|---|---|---|
| [`src/components/training/CalendarDayCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/CalendarDayCard.tsx) | Modifikasi | +135, -29 | Indikator merah & `XCircle` sesi terlewat, tombol `Detail Sesi ↗` pada aktivitas |
| [`src/components/training/WorkoutDossierModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/WorkoutDossierModal.tsx) | Modifikasi | +126, -30 | Telemetri aktivitas terverifikasi, banner sesi terlewat, tautan analisis penuh |
| [`src/components/training/ScheduleTrainingHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/ScheduleTrainingHub.tsx) | Modifikasi | +103, -15 | Handler `handleSelectActivity` & resolusi sesi terlewat |
| [`src/components/training/views/TrainingCalendarGridView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingCalendarGridView.tsx) | Modifikasi | +6, -3 | Penerusan `onSelectActivity` dan `todayStr` ke `CalendarDayCard` |
| [`src/components/training/views/TrainingWorkoutListView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingWorkoutListView.tsx) | Modifikasi | +37, -15 | Sinkronisasi status dan visualisasi merah pada tampilan linear |

---

## 4. Hasil Verifikasi & Pengujian

1. **Pemeriksaan Tipe TypeScript (`npx tsc --noEmit`)**:
   - `0 errors`. Seluruh antarmuka `WorkoutCategory`, `WorkoutActivityMatch`, dan properti komponen valid secara ketat.
2. **Suite Uji Streak Mingguan & Kalorimetri (`npm run test:streak`)**:
   - `21/21 passed` (0 failed). Integrasi streak dan database tetap 100% stabil.
3. **Optimized Production Build (`npm run build`)**:
   - Berhasil mengompilasi 24/24 rute halaman tanpa galat (termasuk rute dinamis `/activities/[id]`, `/training`, `/health`, dan API endpoints).

