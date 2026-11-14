# Changelog: Training Calendar Command Deck Modernization & Popover View Selector (`main`)

- **Tanggal & Waktu**: 2026-11-13 18:55:00 WIB
- **Tipe**: `feat(ui)` / `feat(training)` / `refactor(navigation)` / `style(anti-ai-slop)`
- **Commit Message Rujukan**: `feat(ui): modernize calendar command deck with custom popover view selector and whitespace wrapping fixes strictly under 300 lines` *(Uncommitted / Unstaged Working Tree)*
- **Branch**: `main`
- **Lokasi**: [`docs/10-changelog/main/2026-11-13_18-55-00_feat-calendar-command-deck-popover-selector-and-ui-modernization.md`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/docs/10-changelog/main/2026-11-13_18-55-00_feat-calendar-command-deck-popover-selector-and-ui-modernization.md)

---

## 1. Latar Belakang & Analisis Masalah UI

Pengguna mengunggah tangkapan layar antarmuka bilah kendali kalender (*Calendar Command Bar*) dengan instruksi:
> *"perbaiki tampilan ini agar bagus untk ui nya"*
> *"apakah susah?"*

### Evaluasi Visual Masalah pada UI Sebelumnya:
1. **Dropdown HTML Native yang Kaku & Kurang Estetik**:
   - Penggunaan tag bawaan `<select>` memicu render native peramban Windows dengan *focus outline* hijau neon tebal dan panah default yang merusak harmoni estetika gelap (*Obsidian Telemetry*).
   - Karakter simbol Unicode (`⊞`, `▥`, `◉`, dsb.) pada beberapa mesin font monospace merender artefak kotak rusak (`HH`).
   - Elemen label `MODEL UI:` terjepit canggung di antara judul program dan tombol aksi.
2. **Tombol "+ TAMBAH AKTIVITAS" Terlipat Dua Baris (*Line-Wrapping Clutter*)**:
   - Ketiadaan properti `whitespace-nowrap shrink-0` pada trigger modal membuat teks tombol terlipat menjadi dua baris canggung (`+ TAMBAH` di baris atas dan `AKTIVITAS` di baris bawah).
   - Ikon buku dan tombol rekap berhimpitan tanpa spasi yang proporsional.
3. **Keseimbangan Visual Header (*Visual Balance*)**:
   - Badge `ACTIVE MACROCYCLE` bersaing tajam dengan teks judul di baris yang sama.

---

## 2. Rekayasa & Solusi Antarmuka Baru

### A. Modul Pemilih Model Kustom ([`CalendarViewModelSelector.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/navigation/CalendarViewModelSelector.tsx) - 187 baris)
Dibuat sebagai komponen navigasi terpisah yang modular dan elegan:
- **Trigger Button Bergaya Avionik**:
  - Menggantikan elemen `<select>` native dengan tombol pemicu monospaced (`font-mono text-xs`) berkontur halus: ikon aktif di dalam badge mini, nomor model, nama model, dan ikon chevron rotasi halus `rotate-180`.
- **Popover Dropdown Interaktif**:
  - Menampilkan daftar 7 model kalender yang tersusun rapi dalam kartu mengambang (*floating card* dengan bayangan mendalam `shadow-2xl` dan border obsidian).
  - Setiap item dilengkapi dengan:
    - Ikon Lucide SVG resmi (bukan karakter unicode rentan pecah).
    - Nomor urut dan judul model.
    - Badge kategori (`WKO / Peaks`, `Garmin Cockpit`, `Strava Flow`, `Field Journal`, `Gantt & PMC`, `Avionics HUD`, `Agenda`).
    - Deskripsi singkat fungsi taktis dari model tersebut.
    - Indikator centang aktif (`Check`) berwarna aksen cyan/hijau.
- **Deteksi Klik di Luar (*Click-Outside Listener*)**:
  - Menggunakan `useRef` dan event listener mouse untuk menutup popover secara otomatis saat atlet mengklik area lain di layar.
- **Penyimpanan Preferensi Otomatis**:
  - Pilihan model langsung disimpan ke `localStorage ('athlete_calendar_view_preference')`.

---

### B. Penyempurnaan Bilah Kendali Utama ([`CalendarCommandBar.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/training/navigation/CalendarCommandBar.tsx) - 166 baris)
- **Tata Letak Baris Pertama Terstruktur**:
  - **Sisi Kiri**: Judul makrosiklus dengan pembatasan overflow (`truncate`), badge status `ACTIVE MACROCYCLE` yang lebih proporsional, dan ringkasan jadwal Zone 2 / Puasa.
  - **Sisi Kanan**: Modul `CalendarViewModelSelector` dipadukan secara selaras dengan pembatas vertikal tipis 1px (`h-4 w-px bg-[var(--color-border)]`) menuju tombol aksi.
- **Ukuran Baris Kode**:
  - Penurunan ukuran berkas dari 193 baris menjadi **166 baris**, meningkatkan keterbacaan kode (*code readability*).

---

### C. Perbaikan Bungkus Teks Tombol Aksi ([`AddActivityModal.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/OneDrive/Documents/kerja/_code/project_strava/src/components/activity/modal/AddActivityModal.tsx) - 240 baris)
- Menambahkan kelas `whitespace-nowrap shrink-0` pada elemen `<button>` varian `"button"` serta `shrink-0` pada komponen ikon `BookOpen`.
- Tombol `+ TAMBAH AKTIVITAS` kini tetap kokoh berada dalam satu baris horizontal yang rapi di berbagai resolusi layar.

---

## 3. Matriks Kepatuhan Batas Baris Kode (*Clean Architecture*)

Semua berkas yang dimodifikasi dan ditambahkan строго mematuhi batas **< 300 baris**:

| Berkas / Modul | Jumlah Baris | Ambang Batas | Status |
| :--- | :---: | :---: | :---: |
| `src/components/activity/modal/AddActivityModal.tsx` | **240** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/navigation/CalendarViewModelSelector.tsx` | **187** | < 300 | ✅ Patuh (Aman) |
| `src/components/training/navigation/CalendarCommandBar.tsx` | **166** | < 300 | ✅ Patuh (Aman) |

---

## 4. Hasil Verifikasi Sistem

1. **TypeScript Typecheck (`npx tsc --noEmit`)**:
   - Status: **0 Error** (Lolos sempurna tanpa peringatan).
2. **Kompilasi Antarmuka Next.js 16 Turbopack**:
   - Komponen terintegrasi bersih tanpa adanya siklus re-render.
3. **Status Kontrol Versi (*Git Safety*)**:
   - Seluruh berkas berada dalam *uncommitted working tree* sesuai instruksi pengguna (*"jangan langsung di commit"*).

