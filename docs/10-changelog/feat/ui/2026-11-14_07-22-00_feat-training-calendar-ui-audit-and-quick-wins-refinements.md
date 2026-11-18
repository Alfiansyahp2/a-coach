# Changelog: Training Calendar UI Holistic Audit & Quick-Wins Polish (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-14 07:22:00 WIB
- **Tipe**: `feat(ui)` / `feat(training)` / `refactor(ergonomics)` / `style(anti-ai-slop)`
- **Commit Message Rujukan**: `feat(ui): apply holistic audit quick-wins for training calendar eliminating redundant text and optimizing layout strictly under 300 lines` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui` / `main`
- **Lokasi**: [`docs/10-changelog/feat/ui/2026-11-14_07-22-00_feat-training-calendar-ui-audit-and-quick-wins-refinements.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-14_07-22-00_feat-training-calendar-ui-audit-and-quick-wins-refinements.md)

---

## 1. Latar Belakang & Instruksi Audit Pengguna

Pengguna meminta evaluasi dan audit menyeluruh terhadap antarmuka kalender multi-model yang baru diimplementasikan dengan kriteria utama:
> *"audit semua hal yang ada di ui baru agar bisa pas dan tidak berlebihan dan ui nya modern. apakah kau bisa audit semuanya?"*
> *"implemetnasikan 💡 4 Tindakan Penyempurnaan Konkret (Quick-Wins agar Sempurna & Pas)"*

Tujuan utama dari fase penyempurnaan ini adalah memastikan antarmuka kalender:
1. **Pas**: Memiliki proporsi visual yang seimbang, ergonomis, dan tidak memicu pergeseran elemen (*layout shift*) pada berbagai ukuran layar.
2. **Tidak Berlebihan**: Mengeliminasi teks instruksi yang bertele-tele dan label footer redundan yang memakan ruang vertikal secara sia-sia (*anti-cognitive clutter*).
3. **Modern & Berwibawa**: Mengedepankan gaya komunikasi teknikal atletik presisi (*Obsidian Avionics*) tanpa gaya bahasa klise.

---

## 2. Rincian Implementasi 4 Tindakan Penyempurnaan Konkret

### A. Eliminasi Teks Footer Redundan pada Sel Grid Bulan
- **Berkas**: [`MonthDayCell.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/monthGrid/MonthDayCell.tsx) (148 baris)
- **Masalah**: Sebelumnya, dasar sel tanggal memuat teks statis `"Terjadwal"` atau `"1 sesi dicatat"`. Karena di dalam sel sudah terdapat baris kartu latihan yang jelas (dengan aksen border kiri berwarna Cyan/Amber), teks "Terjadwal" menjadi redundan dan mempersempit ruang vertikal sel tanggal.
- **Solusi Rekayasa**:
  Menghilangkan teks statis `"Terjadwal"`. Footer kini bersifat adaptif bersyarat (`day.activities.length > 1`) dan hanya muncul saat hari tersebut memiliki aktivitas ganda (`2+ sesi dicatat`), memberikan ruang nafas visual yang jauh lebih lega bagi rencana latihan harian.

---

### B. Perampingan Label Tombol Navigasi Lembar Jurnal Lapangan
- **Berkas**: [`TrainingFieldJournalView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingFieldJournalView.tsx) (102 baris)
- **Masalah**: Tombol pergantian lembar menggunakan label yang terlalu panjang (`"Balik Lembar Sebelumnya"` dan `"Lembar Selanjutnya"`), sehingga memakan ruang horizontal secara berlebihan dan berisiko terpotong pada layar tablet.
- **Solusi Rekayasa**:
  Memadatkan label menjadi lebih ringkas dan modern:
  - `"Balik Lembar Sebelumnya"` $\rightarrow$ `← Lembar Lalu`
  - `"Lembar Selanjutnya"` $\rightarrow$ `Lembar Lanjut →`
  Menyesuaikan padding horizontal tombol dari `px-3` menjadi `px-2.5` agar proporsional dengan tombol kompas *"Hari Ini"*.

---

### C. Optimasi Copywriting Legend Gelembung Kinetik
- **Berkas**: [`TrainingKineticBubbleView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingKineticBubbleView.tsx) (117 baris)
- **Masalah**: Teks penjelasan di bawah judul sub-header terlalu deskriptif dan terkesan tutorial dasar (*"Diameter lingkaran sebanding dengan durasi latihan. Hover gelembung untuk melihat rincian telemetri."*).
- **Solusi Rekayasa**:
  Mengubah teks menjadi kalimat teknis atletik yang lugas, padat, dan berwibawa:
  > *"Matriks ritme volume 12-minggu. Skala radius sebanding durasi sesi latihan."*

---

### D. Proteksi Lebar Judul Makrosiklus pada Bilah Kendali Utama
- **Berkas**: [`CalendarCommandBar.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/navigation/CalendarCommandBar.tsx) (169 baris)
- **Masalah**: Pada resolusi layar laptop sedang (1280px) atau tablet horizontal, judul program yang panjang seperti `"12-WEEK ZONE 2 ENDURANCE PROGRAM (ROAD TO 100KM CENTURY RIDE MTB)"` berpotensi mendesak kontrol pemilih model (`CalendarViewModelSelector`) atau tombol aksi ke baris baru.
- **Solusi Rekayasa**:
  - Memberikan batas lebar maksimal pada kontainer branding kiri: `max-w-full lg:max-w-[480px] xl:max-w-[580px]`.
  - Menerapkan batasan pemotongan teks adaptif pada judul: `truncate max-w-[260px] sm:max-w-[340px] md:max-w-[400px]` dengan atribut `title` lengkap untuk aksesibilitas hover.

---

## 3. Matriks Kepatuhan Batas Ukuran Berkas (*Clean Architecture Audit*)

Semua berkas yang dimodifikasi mematuhi batas **< 300 baris kode per berkas**:

| Berkas / Modul | Jumlah Baris | Ambang Batas | Status |
| :--- | :---: | :---: | :---: |
| `src/components/training/navigation/CalendarCommandBar.tsx` | **169** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/monthGrid/MonthDayCell.tsx` | **148** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/views/TrainingKineticBubbleView.tsx` | **117** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/views/TrainingFieldJournalView.tsx` | **102** | < 300 | ✅ Patuh (Aman) |

---

## 4. Hasil Verifikasi Sistem

1. **TypeScript Compiler (`npx tsc --noEmit`)**:
   - Status: **0 Error** (Lolos sempurna tanpa peringatan).
2. **Uji Validasi Responsif**:
   - Tampilan bilah kendali stabil pada resolusi desktop besar (1440px+), laptop (1280px), dan tablet (768px).
3. **Status Kontrol Versi (*Git Safety*)**:
   - Sesuai prinsip ketat pengguna (*"jangan langsung di commit"*), seluruh berkas tetap tersimpan rapi di *uncommitted working tree* siap untuk inspeksi langsung.

