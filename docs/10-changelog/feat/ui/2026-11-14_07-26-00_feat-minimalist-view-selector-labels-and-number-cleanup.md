# Changelog: Minimalist Calendar View Selector & Label Clutter Elimination (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-14 07:26:00 WIB
- **Tipe**: `feat(ui)` / `feat(training)` / `refactor(ergonomics)` / `style(anti-ai-slop)`
- **Commit Message Rujukan**: `feat(ui): streamline calendar view model selector eliminating numbers, badge clouds, and truncated labels strictly under 300 lines` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `feat/ui` / `main`
- **Lokasi**: [`docs/10-changelog/feat/ui/2026-11-14_07-26-00_feat-minimalist-view-selector-labels-and-number-cleanup.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/feat/ui/2026-11-14_07-26-00_feat-minimalist-view-selector-labels-and-number-cleanup.md)

---

## 1. Latar Belakang & Evaluasi Visual Pengguna

Berdasarkan tangkapan layar langsung dari antarmuka menu pemilih model (*view selector popover*), pengguna memberikan instruksi penyederhanaan yang spesifik:
> *"hapus angka dan buat label menjadi sedikit jangan terlalu banyak"*

### Akar Masalah pada Tampilan Sebelumnya:
1. **Polusi Angka Awalan (*Numeric Prefix Noise*)**:
   - Keberadaan angka `"01."`, `"02."`, `"03."`, dst. di depan setiap nama model menimbulkan kesan teknis yang kaku dan memakan ruang horizontal yang berharga di tombol pemicu (*trigger*) maupun di daftar popover.
2. **Kelebihan Beban Label (*Badge & Label Overload*)**:
   - Setiap baris menu menumpuk 3 tingkatan informasi sekaligus:
     - Nomor & Judul (`03. Gelembung Kinet...`)
     - Badge Pill Kategori (`[Strava Flow]`, `[Garmin Cockpit]`, `[WKO / Peaks]`)
     - Paragraf Deskripsi yang terpotong elipsis (`Visualisasi volume sirkular dinamis...`)
   - Tumpukan badge ini menyebabkan judul utama terpotong canggung (*truncated text*) di layar standar.
3. **Lebar Kontainer Terlalu Gemuk**:
   - Menu mengambang berukuran 310px terasa terlalu lebar dan menutupi terlalu banyak area kalender di bawahnya.

---

## 2. Rincian Rekayasa & Penyederhanaan Minimalis

### A. Refaktorisasi Selektor Model ([`CalendarViewModelSelector.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/navigation/CalendarViewModelSelector.tsx) - 157 baris)
- **Penghapusan Total Nomor Urut**:
  - Menghapus properti `num` dari struktur data `ModelItem`.
  - Tombol pemicu (*trigger button*) kini hanya menampilkan ikon dan label bersih:
    - Contoh: `[ ☉ Gelembung Kinetik ▾ ]` *(sebelumnya `[ ☉ 03. Gelembung Kinetik ▾ ]`)*.
- **Penyederhanaan Label Menjadi Elegan & Bersih**:
  - Menghilangkan badge pill dan deskripsi multi-baris yang terpotong.
  - Setiap baris kini mengadopsi format satu baris (*single-line action row*) layaknya antarmuka modern di Linear dan Raycast:
    - `⊞ Grid Bulan`
    - `▥ Agenda Minggu`
    - `◉ Gelembung Kinetik`
    - `📖 Jurnal Lapangan`
    - `☷ Garis Waktu`
    - `⌨ Micro-HUD`
    - `☰ Daftar Sesi`
- **Pengecilan Dimensi Popover (310px $\rightarrow$ 210px)**:
  - Lebar kartu mengambang dipangkas dari `w-[310px]` menjadi `w-[210px] sm:w-[220px]`, menjadikannya sangat ramping, ringan, dan proporsional.
- **Indikator Aktif Tetap Presisi**:
  - Tetap menyajikan ikon centang `✓` hijau/cyan di sisi kanan item yang sedang aktif serta transisi hover yang mulus.

---

## 3. Matriks Kepatuhan Batas Ukuran Berkas (*Clean Architecture Audit*)

| Berkas / Modul | Jumlah Baris | Ambang Batas | Status |
| :--- | :---: | :---: | :---: |
| `src/components/training/navigation/CalendarViewModelSelector.tsx` | **157** | < 300 | ✅ Patuh (Aman) |

*Penurunan bersih sebesar 32 baris kode, menghasilkan modularitas yang jauh lebih bersih dan efisien.*

---

## 4. Hasil Verifikasi Sistem

1. **TypeScript Typecheck (`npx tsc --noEmit`)**:
   - Status: **0 Error** (Lolos 100%).
2. **Kompilasi & Rendering UI**:
   - Judul model kalender tidak ada lagi yang terpotong elipsis (`...`).
3. **Status Kontrol Versi (*Git Safety*)**:
   - Mematuhi instruksi pengguna (*"jangan langsung di commit"*), perubahan tetap berada di *uncommitted working tree*.

