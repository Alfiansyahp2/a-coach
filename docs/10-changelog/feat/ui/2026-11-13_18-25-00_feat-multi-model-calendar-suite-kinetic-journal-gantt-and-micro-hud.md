# Changelog: Multi-Model Calendar Suite Implementation & Persistence (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-13 18:25:00 WIB
- **Tipe**: `feat(ui)` / `feat(training)` / `refactor(calendar-suite)` / `style(anti-ai-slop)`
- **Commit Message Rujukan**: `feat(ui): implement multi-model training calendar suite with kinetic bubbles, field journal, gantt pmc, and micro-hud strictly under 300 lines` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui` / `main`
- **Lokasi**: [`docs/10-changelog/feat/ui/2026-11-13_18-25-00_feat-multi-model-calendar-suite-kinetic-journal-gantt-and-micro-hud.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-13_18-25-00_feat-multi-model-calendar-suite-kinetic-journal-gantt-and-micro-hud.md)

---

## 1. Ringkasan Eksekutif (*Executive Summary*)

Changelog ini mencatat secara menyeluruh seluruh perubahan pada `git diff` dan berkas baru (*untracked*) di repositori terkait implementasi penuh **Multi-Model Training Calendar Suite**. 

Menjawab kebutuhan personalisasi atlet tanpa membebani antarmuka (*anti-cognitive clutter*), platform kini menyediakan **7 model kalender yang dapat dipilih bebas oleh atlet** melalui bilah kendali terpadu (*Command Bar*). Preferensi model antarmuka disimpan secara otomatis ke dalam `localStorage` peramban atlet (`athlete_calendar_view_preference`), sehingga atlet selalu kembali ke model visual yang paling sesuai dengan gaya latihan mereka.

Seluruh kode sumber dirancang dengan modularitas tinggi, mematuhi standar *Clean Architecture*, dan secara ketat memenuhi aturan batas ukuran berkas **< 300 baris kode per berkas**.

---

## 2. Rincian Modifikasi Berkas (*Git Diff Breakdown*)

### A. Modifikasi Berkas Utama (`src/components/training/`)

#### 1. [`ScheduleTrainingHub.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/ScheduleTrainingHub.tsx) (253 baris)
- **Ekspansi Tipe Model Kalender**:
  Mengubah tipe `viewMode` dari 3 opsi dasar (`"month" | "week" | "list"`) menjadi tipe union `CalendarViewModel`:
  ```typescript
  export type CalendarViewModel = 
    | "month_grid"      // 1. Grid Bulan Sejati (WKO / TrainingPeaks)
    | "week_agenda"     // 2. Agenda Minggu 7-Kolom (Garmin Cockpit)
    | "kinetic_bubbles" // 3. Gelembung Kinetik (Strava Flow)
    | "field_journal"   // 4. Buku Jurnal Lapangan Vintage Dua Halaman
    | "periodization"   // 5. Garis Waktu Makro & Banister PMC Curve
    | "micro_hud"       // 6. Micro-HUD Keyboard Minimalist
    | "list";           // 7. Daftar Kronologis Sesi
  ```
- **Sinkronisasi Preferensi Pengguna (*Persistence*)**:
  Menambahkan hook `useEffect` untuk memulihkan preferensi terakhir atlet dari `localStorage.getItem("athlete_calendar_view_preference")` saat pertama kali dimuat.
- **Orkestrasi Rendering Dinamis**:
  Mendelegasikan rendering secara modular ke masing-masing komponen tampilan berdasarkan model aktif tanpa adanya kebocoran logika ataupun duplikasi kode.

#### 2. [`CalendarCommandBar.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/navigation/CalendarCommandBar.tsx) (180 baris)
- **Dropdown Pemilih Model Kalender Terpadu**:
  Menggantikan deretan tombol statis sebelumnya dengan kontrol *select dropdown* bergaya avionik monospaced (`font-mono text-xs`) yang rapi dan hemat ruang layar horizontal.
- **Penyimpanan Otomatis (*Auto-save Handler*)**:
  Fungsi `handleSelectViewMode(mode)` langsung menulis preferensi baru ke `localStorage.setItem("athlete_calendar_view_preference", mode)` saat atlet mengganti pilihan model di bilah navigasi.
- **Pill Status Klinis & Aksi Cepat**:
  Mempertahankan indikator status kesiapan klinis lari/sepeda serta tombol pintas pencatatan aktivitas langsung (`AddActivityModal`) dan navigasi ke rekap mingguan.

---

### B. Berkas Komponen Baru (*New Modules / Untracked Files*)

#### 1. Model 3: Gelembung Kinetik (*Strava Kinetic Bubble Matrix*)
- [`TrainingKineticBubbleView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingKineticBubbleView.tsx) (117 baris):
  Mengubah matriks kalender menjadi visualisasi gelembung sirkular berbasis volume durasi/jarak. Dilengkapi dengan navigasi fokus minggu dan filter status.
- [`KineticDayBubble.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/kinetic/KineticDayBubble.tsx) (102 baris):
  Sub-komponen gelembung dinamis. Menghitung radius lingkaran secara proporsional sesuai durasi latihan (30 menit $\rightarrow$ 48px, 180+ menit $\rightarrow$ 88px) dengan aksen cincin status (*Completed: Ring Hijau*, *Missed: Ring Merah Dash*, *Planned: Glow Cyan*).

#### 2. Model 4: Buku Jurnal Lapangan (*Vintage Dual-Page Open Book Field Journal*)
- [`TrainingFieldJournalView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingFieldJournalView.tsx) (102 baris):
  Antarmuka dua halaman terbuka yang mensimulasikan buku catatan fisik atletik klasik (*classic athletic field journal*) dengan garis-garis tipis, tekstur kertas tenang, dan navigasi tanggal hari per hari.
- [`JournalBookLeftPage.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/journal/JournalBookLeftPage.tsx) (109 baris):
  Halaman kiri: Berisi *Prescribed Workout Intent*, petunjuk target pacing Zone 2, fase latihan makro, dan proteksi klinis sendi.
- [`JournalBookRightPage.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/journal/JournalBookRightPage.tsx) (127 baris):
  Halaman kanan: Berisi *Executed Activity Log* dari sinkronisasi Strava, deviasi durasi vs rencana, serta catatan pengamatan pelatih (*Coach Observations*).

#### 3. Model 5: Garis Waktu Makro (*Meso-Periodization Gantt Horizon & Banister PMC Curve*)
- [`TrainingPeriodizationGanttView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingPeriodizationGanttView.tsx) (135 baris):
  Tampilan lanskap horizontal 12 minggu blok mesosiklus yang memetakan perkembangan fase latihan (*Foundation Build*, *Deload Recovery*, *Peak Taper*) serta densitas volume latihan.
- [`GanttMiniPMCSparkline.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/gantt/GanttMiniPMCSparkline.tsx) (60 baris):
  Visualisasi grafik garis mini (*sparkline SVG*) yang menghitung kurva beban impuls Banister (Fitness CTL, Fatigue ATL, dan Form TSB) secara visual sepanjang siklus latihan.

#### 4. Model 6: Konsol Minimalis (*Keyboard-Navigable Micro-HUD*)
- [`TrainingMicroHUDView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingMicroHUDView.tsx) (154 baris):
  Tampilan avionik ultra-minimalis dengan densitas data maksimum. Mendukung navigasi keyboard penuh (`←`/`→` untuk tanggal, `T` untuk kembali ke hari ini) tanpa distraksi animasi berat.

---

## 3. Matriks Kepatuhan Batas Ukuran Berkas (*Clean Architecture Audit*)

Semua berkas yang terlibat dalam perubahan `git diff` dan berkas baru memenuhi batas wajib **< 300 baris kode**:

| Berkas / Modul | Jumlah Baris | Ambang Batas | Status |
| :--- | :---: | :---: | :---: |
| `src/components/training/ScheduleTrainingHub.tsx` | **253** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/views/TrainingWeekAgendaView.tsx` | **253** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/navigation/CalendarCommandBar.tsx` | **180** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/views/TrainingMicroHUDView.tsx` | **154** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/views/TrainingMonthGridView.tsx` | **151** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/monthGrid/MonthDayCell.tsx` | **146** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/views/TrainingPeriodizationGanttView.tsx` | **135** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/journal/JournalBookRightPage.tsx` | **127** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/views/TrainingWorkoutListView.tsx` | **125** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/views/TrainingKineticBubbleView.tsx` | **117** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/journal/JournalBookLeftPage.tsx` | **109** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/kinetic/KineticDayBubble.tsx` | **102** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/views/TrainingFieldJournalView.tsx` | **102** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/monthGrid/MonthWeekSummaryColumn.tsx` | **83** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/gantt/GanttMiniPMCSparkline.tsx` | **60** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/cards/CalendarDayQuickAction.tsx` | **22** | < 300 | ✅ Patuh (Aman) |

---

## 4. Hasil Verifikasi Sistem & Pengujian

1. **TypeScript Typecheck (`npx tsc --noEmit`)**:
   - Status: **0 Error** (Lolos sempurna tanpa peringatan tipe).
2. **Pengujian Domain Logic Python (`npm run test:python`)**:
   - Status: **16/16 Passed** (Lolos 100% dalam 1.79 detik).
3. **Pengujian Algoritma Weekly Streak (`node scripts/tests/test_weekly_streak_system.js`)**:
   - Status: **21/21 Passed** (Lolos 100%).
4. **Kompilasi Produksi Next.js (`npm run build`)**:
   - Status: **34/34 Rute Berhasil Dikompilasi** (Turbopack, App Router, SSG & dynamic routes).

---

## 5. Status Kontrol Versi (*Git Tree Status*)

> [!IMPORTANT]
> Sesuai instruksi ketat pengguna (*"jangan langsung di commit, paham?!"*), **TIDAK ADA git commit yang dijalankan**. Seluruh perubahan saat ini tetap berada dalam status unstaged working tree agar pengguna dapat memeriksa, menelaah kode (*code review*), dan mengujinya secara langsung di lingkungan lokal sebelum proses staging/commit dilakukan.

