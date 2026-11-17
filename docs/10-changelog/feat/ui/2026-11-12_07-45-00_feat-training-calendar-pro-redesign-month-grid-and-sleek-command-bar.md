# Changelog: Training Calendar Professional Redesign — True Month Grid, Sleek Command Bar & Multi-View (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-12 07:45:00 WIB
- **Tipe**: `feat(ui)` / `feat(training)` / `refactor(design-system)` / `style(anti-ai-slop)`
- **Commit Message Rujukan**: `feat(ui): implement pro athletic calendar with true 8-column month grid, sleek command bar, and week agenda view strictly under 300 lines` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui` / `main`
- **Lokasi**: `docs/10-changelog/feat/ui/2026-11-12_07-45-00_feat-training-calendar-pro-redesign-month-grid-and-sleek-command-bar.md`

---

## 1. Latar Belakang & Evaluasi Pengguna

Pengguna memberikan evaluasi kritis yang sangat tajam dan tepat mengenai antarmuka kalender latihan sebelumnya:
> *"kenapa menurtu saya masih tidak terlalu bagus untuk ui kalendar"*
> *"coba inplemetnasikan"*

### Akar Masalah pada Kalender Sebelumnya:
1. **Bukan Kalender Sejati, Melainkan "Tumpukan 12 Kotak Mingguan" (*Box-in-a-Box Syndrome*)**:
   - Struktur sebelumnya memaksakan 12 kontainer baris mingguan terpisah yang ditumpuk secara vertikal. Di dalam kontainer minggu terdapat 7 kotak hari, di dalam kotak hari terdapat kotak rencana latihan, di dalam rencana terdapat badge kotak kategori, dan di bawahnya terdapat kotak aktivitas. Hal ini menimbulkan *visual claustrophobia* (rasa sesak) akibat ratusan garis pembatas (*borders*) tebal yang saling bertabrakan.
2. **Kalender Utama Tenggelam di Bawah Layar (*Buried Hero Content*)**:
   - Atlet dipaksa menggulir (*scrolling*) melewati 5 panel kontrol berukuran besar (Header Program, Macro Objectives, Zone 2 Guidelines Banner, Filter Toolbar, dan Clinical Readiness) sebelum bisa melihat hari Senin. Kalender kehilangan statusnya sebagai pahlawan utama (*The Hero*) halaman.
3. **Ketiadaan Tampilan Bulanan Kalender Sejati (*True Month Grid*)**:
   - Atlet olahraga ketahanan berpikir dalam siklus bulan kalender (November 2026, Desember 2026, Januari 2027), bukan daftar 12 minggu buatan yang terputus.
4. **Polusi Badge & Saturasi Warna Berlebih (*Visual Noise*)**:
   - Header setiap minggu mengulang lebih dari 10 badge, teks, dan progress bar secara seragam sebanyak 12 kali berturut-turut, memicu kelelahan kognitif (*cognitive fatigue*).

---

## 2. Rincian Rekayasa & Implementasi Arsitektur UI Baru

### A. Bilah Kendali Ramping Terpadu ([`CalendarCommandBar.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/navigation/CalendarCommandBar.tsx) - 197 baris)
- **Konsolidasi 5 Panel Menjadi 1 Bilah Modern**:
  - Menggantikan tumpukan banner sebelumnya dengan satu bilah kontrol ramping di bagian atas halaman.
- **Peralihan Mode Tampilan Tiga Lensa**:
  - `Bulan`: Menampilkan kalender grid bulanan 8-kolom standar industri.
  - `Minggu`: Menampilkan 7 kolom vertikal yang lapang untuk perencanaan mingguan mendalam.
  - `Agenda`: Menampilkan daftar sesi kronologis linier.
- **Laci Lipat Target Makro (*Collapsible Guidelines Drawer*)**:
  - Sasaran 100km Century Ride dan panduan pacing Zone 2 kini tersimpan rapi di dalam drawer lipat yang dapat dibuka/tutup dengan tombol *"Target Makro ▾"*, menjaga layar tetap bersih secara default.
- **Pill Status Klinis Ringkas**:
  - Menampilkan badge proteksi sendi atletik (`Lari: HOLD (ATFL)` / `Clear: MTB Zone 2`) langsung di bilah kontrol.

---

### B. Grid Kalender Bulanan Sejati 8-Kolom ([`TrainingMonthGridView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingMonthGridView.tsx) - 164 baris)
- **Navigasi Bulan Mulus**:
  - Kontrol navigasi `< November 2026 >`, `Desember 2026`, dan `Januari 2027` dengan tombol cepat *"Hari Ini"*.
- **Grid Kalender Kontigu**:
  - 7 kolom hari (Senin – Minggu) dengan pembatas tipis 1px (`border-[var(--color-border)]/50`). Hari di luar bulan aktif dirender dengan opasitas tenang (35%).
- **Kolom ke-8: Ringkasan Beban Mingguan ([`MonthWeekSummaryColumn.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/monthGrid/MonthWeekSummaryColumn.tsx) - 92 baris)**:
  - Mengadopsi standar emas **TrainingPeaks** dan **Strava Training Log**: kolom paling kanan di setiap baris minggu menyajikan ringkasan kumulatif:
    - Jarak tercapai vs target (`26.2 / 22.0 km • 119%`)
    - Bar progres visual kapasitas minggu
    - Estimasi akumulasi beban stres (`~135 TSS`)
    - Sesi selesai (`3 Sesi Selesai`)
    - Badge status fase (`BASE BUILD`, `DELOAD`)

---

### C. Desain Sel Hari Minimalis Presisi ([`MonthDayCell.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/monthGrid/MonthDayCell.tsx) - 156 baris)
- **Pembersihan Nested Boxes**:
  - Mengganti kotak tebal bertingkat dengan **baris telemetri ramping beraksen garis vertikal di sisi kiri (2px left border accent)**:
    - Sepeda MTB: Aksen Emerald/Cyan (`border-[var(--color-cycling)]`)
    - Lari Bertahap: Aksen Terracotta/Amber (`border-[var(--color-running)]`)
    - Selesai / Tercatat: Badge hijau dengan tanda centang `✓` dan angka tabular.
    - Terlewat: Garis aksen merah tenang tanpa coretan teks yang merusak keterbacaan.
- **Hari Aktif (*Today Highlighter*)**:
  - `HARI INI` ditandai dengan *inner ring highlight* cyan dan *pulsing indicator* yang jelas tanpa memecah keselarasan visual grid.
- **Aksi Cepat Tanggal Langsung ([`CalendarDayQuickAction.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/cards/CalendarDayQuickAction.tsx) - 26 baris)**:
  - Tombol hover `+` di setiap sel tanggal memungkinkan pencatatan aktivitas langsung untuk hari tersebut via `AddActivityModal`.

---

### D. Tampilan Agenda Mingguan Terfokus ([`TrainingWeekAgendaView.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/views/TrainingWeekAgendaView.tsx) - 275 baris)
- **7 Kolom Vertikal Luas**:
  - Menampilkan hari Senin hingga Minggu untuk minggu yang dipilih dalam kartu vertikal tinggi ($\ge 300\text{px}$).
- **Komparasi Prescribed vs Executed**:
  - Menjajarkan kartu target latihan terencana dengan sesi nyata dari Strava secara lapang dan berjarak lega.

---

### E. Generator Struktur Kalender Bulanan ([`monthCalendarBuilder.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/monthGrid/monthCalendarBuilder.ts) - 171 baris)
- Menghitung irisan minggu-minggu aktif dari rencana periodisasi 12 minggu terhadap batas bulan kalender ISO (November 2026, Desember 2026, Januari 2027).
- Menghitung akumulasi metrik jarak mingguan, durasi, estimasi TSS, dan status harian (`COMPLETED`, `TODAY`, `MISSED`, `PLANNED`, `FASTING`, `BUFFER`, `REST`).

---

## 3. Kepatuhan Batas Baris Kode (*Clean Architecture Rule*)

Semua berkas yang dibuat dan dimodifikasi memenuhi batas maksimal **< 300 baris**:

| File / Modul | Baris Kode | Status Batas 300 Baris |
| :--- | :---: | :---: |
| `src/components/training/cards/CalendarDayQuickAction.tsx` | **26** | ✅ Sangat Aman (<300 baris) |
| `src/components/training/cards/CalendarActivityItem.tsx` | **69** | ✅ Sangat Aman (<300 baris) |
| `src/components/training/cards/CalendarRestCard.tsx` | **83** | ✅ Sangat Aman (<300 baris) |
| `src/components/training/cards/CalendarWorkoutItem.tsx` | **96** | ✅ Sangat Aman (<300 baris) |
| `src/components/training/monthGrid/MonthWeekSummaryColumn.tsx` | **92** | ✅ Sangat Aman (<300 baris) |
| `src/components/training/monthGrid/MonthDayCell.tsx` | **156** | ✅ Sangat Aman (<300 baris) |
| `src/components/training/views/TrainingMonthGridView.tsx` | **164** | ✅ Sangat Aman (<300 baris) |
| `src/components/training/monthGrid/monthCalendarBuilder.ts` | **171** | ✅ Sangat Aman (<300 baris) |
| `src/components/training/navigation/CalendarCommandBar.tsx` | **197** | ✅ Sangat Aman (<300 baris) |
| `src/components/training/CalendarDayCard.tsx` | **197** | ✅ Sangat Aman (<300 baris) |
| `src/components/training/calendarBuilder.ts` | **214** | ✅ Sangat Aman (<300 baris) |
| `src/components/training/ScheduleTrainingHub.tsx` | **237** | ✅ Sangat Aman (<300 baris) |
| `src/components/training/views/TrainingWeekAgendaView.tsx` | **275** | ✅ Memenuhi (<300 baris) |

---

## 4. Hasil Verifikasi & Jaminan Kualitas

1. **TypeScript Typecheck**:
   ```bash
   npx tsc --noEmit
   # Exit code: 0 (Nol error, seluruh kontrak props & viewMode sinkron 100%)
   ```
2. **Python Test Suite**:
   ```bash
   npm run test:python
   # 16 passed in 1.28s (Streak, Banister, Debrief, dan Pro Weekly Recap)
   ```
3. **Weekly Streak System Suite**:
   ```bash
   node scripts/tests/test_weekly_streak_system.js
   # 21 PASSED, 0 FAILED
   ```
4. **Next.js Production Build (Turbopack)**:
   ```bash
   npm run build
   # Compiled successfully in 4.7s
   # 34/34 routes (termasuk /training, /recap, /coach) lolos kompilasi & prerender
   ```

---

## 5. Kepatuhan Ketat Status Git

Sesuai instruksi mutlak pengguna (*"jangan langsung di commit, paham?!"*):
- **TIDAK ADA git commit** yang dieksekusi.
- Seluruh 15 berkas yang dibuat dan dimodifikasi tetap berada dalam status **unstaged working tree** untuk ditinjau langsung oleh pengguna.

