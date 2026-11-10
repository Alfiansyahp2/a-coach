# Changelog: Codebase Alignment with Design System & Anti-AI-Slop Standards (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-10 12:38:00 WIB
- **Tipe**: `feat(ui)` / `refactor(design-system)` / `style(anti-slop)` / `perf(clean-architecture)`
- **Commit Message Rujukan**: `feat(ui): harmonize codebase components with docs/02-design, eliminate hardcoded colors, enforce tabular typography, and modularize files under 300 lines`
- **Branch**: `feat/ui`
- **Lokasi**: `docs/10-changelog/feat/ui/2026-11-10_12-38-00_feat-codebase-alignment-with-design-system-and-anti-ai-slop.md`

---

## 1. Latar Belakang & Permintaan Pengguna

Setelah dilakukan pemutakhiran menyeluruh terhadap seluruh 13 dokumen spesifikasi sistem desain pada direktori [`docs/02-design`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/02-design), pengguna meminta:
> *"apakah kau bisa coba merubah seseuai dengan C:\Users\MyBook Hype AMD\OneDrive\Documents\kerja\_code\project_strava\docs\02-design"*

Berdasarkan audit komparasi antara kode sumber aktif dengan standar pada `ANTI_AI_SLOP.md` dan `DESIGN_SYSTEM.md`, teridentifikasi sejumlah inkonsistensi yang perlu diselaraskan:
1. **Warna Hardcoded & Inkonsistensi Dual-Theme pada Kartu Streak**:
   - Pada [`WeeklyStreakCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/dashboard/WeeklyStreakCard.tsx), latar belakang ring api termodinamika menggunakan kode warna heksadesimal mati (`#0D1017`) dan teks putih (`#F8FAFC`). Saat pengguna berada pada mode terang (*Chalk Lab*), elemen ini tetap berwarna hitam gelap dan merusak harmoni visual.
2. **Penggunaan Warna Non-Semantik (*Purple Cliché*) pada Kalender Latihan**:
   - Pada [`CalendarDayCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/CalendarDayCard.tsx), penanda hari puasa/pemulihan menggunakan `bg-purple-500/10` dan `text-purple-600` yang tergolong pola generik tanpa nilai fisiologis. Penanda sesi terlewat menggunakan `red-500` mentah alih-alih token `--color-alert-red`.
3. **Pelanggaran Batas Ukuran Berkas Clean Architecture (> 300 Baris)**:
   - Beberapa komponen kunci melampaui ambang batas 300 baris:
     - `WeeklyRecapCard.tsx`: **316 baris**
     - `ActivityManualFormFields.tsx`: **324 baris**
     - `CalendarDayCard.tsx`: **326 baris**
     - `StravaConnectCard.tsx`: **334 baris**
4. **Sudut Membulat Berlebih (*Bubble Radii*)**:
   - Sejumlah kartu data analitik masih menggunakan `rounded-2xl` (16px), yang menurut `DESIGN_SYSTEM.md` dan `ANTI_AI_SLOP.md` seharusnya dikhususkan untuk sampul fisik buku jurnal, sedangkan data chrome dibatasi maksimal $\le 8\text{px}$ (`rounded-lg` atau `rounded-xl`).

---

## 2. Rincian Perubahan Teknis Berdasarkan Git Diff

### A. Harmonisasi Dual-Theme & Penegakan Token Semantik (`src/components/dashboard/WeeklyStreakCard.tsx`)

- Mengganti seluruh warna heksadesimal mati (`#0D1017`, `#F8FAFC`, `#F97316`) dengan token semantik dinamis:
  - `bg-[#0D1017]` -> `bg-[var(--color-surface-card)]` & `bg-[var(--color-surface-muted)]`.
  - Teks idle -> `var(--color-text-primary)` (otomatis adaptif terhadap mode *Chalk Lab* maupun *Graphite Obsidian*).
  - Status resiko -> `var(--color-alert-amber)`.
- Mengubah radius kontainer kartu dari `rounded-2xl` menjadi `rounded-xl` (12px) dengan radius sumur metrik `rounded-lg` (8px).
- Memastikan seluruh angka metrik dan rentang tanggal menggunakan `font-mono font-tabular`.

---

### B. Pembersihan Pola Warna Non-Semantik pada Kalender (`src/components/training/CalendarDayCard.tsx`)

- Menghapus warna ungu (`purple-500`, `purple-600`) dan merah mentah (`red-500`):
  - Hari istirahat & puasa kini menggunakan gaya pemulihan netral: `bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] text-[var(--color-text-secondary)]`.
  - Sesi terlewat menggunakan token klinis resmi: `var(--color-alert-red)`.
- Merampingkan blok kondisional sehingga ukuran berkas menyusut dari **326 baris** menjadi **289 baris** (< 300).
- Memastikan badge `HARI INI`, durasi waktu, dan jarak tempuh menggunakan `font-mono font-tabular`.

---

### C. Modularisasi Rekap Telemetri Mingguan (`src/components/analytics/`)

- Mengekstrak seksi beban kerja fisik dan rincian cabang olahraga ke komponen baru berukuran 78 baris:
  - [`WeeklyRecapWorkloadSection.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/analytics/WeeklyRecapWorkloadSection.tsx)
- Hasilnya, [`WeeklyRecapCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/analytics/WeeklyRecapCard.tsx) terpangkas dari **316 baris** menjadi **251 baris** (< 300) dengan keterbacaan yang jauh lebih tinggi.

---

### D. Modularisasi Formulir Input Parameter Manual (`src/components/activity/modal/`)

- Mengekstrak logika pemilihan cabang olahraga dan input cabang kustom ke komponen baru berukuran 110 baris:
  - [`SportTypeSelector.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/SportTypeSelector.tsx)
- Hasilnya, [`ActivityManualFormFields.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/ActivityManualFormFields.tsx) menyusut dari **324 baris** menjadi **198 baris** (< 300).

---

### E. Modularisasi Integrasi Strava API v3 (`src/components/strava/`)

- Mengekstrak logika komunikasi API Strava (`fetchStatus`, `handleSync`, `handleDisconnect`) ke custom hook berukuran 141 baris:
  - [`useStravaConnect.ts`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/strava/useStravaConnect.ts)
- Mengganti radius kartu pada [`StravaConnectCard.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/strava/StravaConnectCard.tsx) dari `rounded-2xl` menjadi `rounded-xl`, memangkas ukurannya dari **334 baris** menjadi **165 baris** (< 300).

---

## 3. Hasil Pengujian & Verifikasi Kualitas

1. **Pemeriksaan Tipe Data TypeScript**:
   - Perintah: `npx tsc --noEmit`
   - Hasil: **0 error (100% Type-Safe)**.
2. **Next.js Production Build**:
   - Perintah: `npm run build`
   - Hasil: **Exit Code 0 (Sukses Penuh)**. Seluruh **32/32 rute Next.js** berhasil dikompilasi secara optimal.
3. **Automated Unit Test Suite**:
   - Perintah: `npx tsx scripts/tests/test_weekly_recap_engine.js`
   - Hasil: **11/11 PASSED (100% Lulus)**.
4. **Audit Kepatuhan Batas Ukuran Berkas (< 300 Baris)**:

| Berkas yang Dimodifikasi / Dibuat | Jumlah Baris | Status Clean Architecture |
| :--- | :---: | :---: |
| `WeeklyRecapWorkloadSection.tsx` | **78 baris** | ✅ Lolos (< 300) |
| `SportTypeSelector.tsx` | **110 baris** | ✅ Lolos (< 300) |
| `useStravaConnect.ts` | **141 baris** | ✅ Lolos (< 300) |
| `WeeklyStreakCard.tsx` | **141 baris** | ✅ Lolos (< 300) |
| `StravaConnectCard.tsx` | **165 baris** | ✅ Lolos (< 300) |
| `ActivityManualFormFields.tsx` | **198 baris** | ✅ Lolos (< 300) |
| `WeeklyRecapCard.tsx` | **251 baris** | ✅ Lolos (< 300) |
| `CalendarDayCard.tsx` | **289 baris** | ✅ Lolos (< 300) |

