# Changelog: Open Book Modal Light/Dark Theme Synchronization & Tailwind v4 Dark Variant Fix (`feat/ui`)

- **Tanggal & Waktu**: 2026-11-06 07:30:00 WIB
- **Tipe**: `feat(ui)` / `feat(theme)` / `fix(tailwind-v4)` / `feat(design-system)` / `fix(modal)`
- **Commit Message Rujukan**: `feat(ui): synchronize open book modal with light/dark themes and configure tailwind v4 class-based dark variant`
- **Branch**: `feat/ui`
- **Lokasi**: `docs/10-changelog/feat/ui/2026-11-06_07-30-00_feat-open-book-modal-dual-theme-and-tailwind-v4-fix.md`

---

## 1. Latar Belakang & Akar Masalah

Sebelum pembaruan ini, terdapat dua permasalahan mendasar pada modal pencatatan aktivitas buku terbuka (*Open Book Add Activity Modal*):

1. **Inkonsistensi Tema (*Theme Disconnect*) Saat Beralih ke Light Mode**:
   - Platform *Endurance Performance Lab* mendukung tema ganda: **Light Theme (Chalk Lab)** dan **Dark Theme (Graphite Obsidian)**. Ketika pengguna memilih mode Light (putih-krem bernuansa laboratorium taktis), modal buku sebelumnya tetap tampil dalam warna hitam pekat karena penggunaan nilai hex hardcode, menciptakan ketidakselarasan visual yang kontras dengan seluruh antarmuka aplikasi.
2. **Bug Benturan Varian Dark Tailwind CSS v4 dengan Mode OS Windows**:
   - Di Tailwind CSS v4, aturan `@import "tailwindcss";` secara baku mengaktifkan selector `dark:` berbasis media query sistem operasi (`@media (prefers-color-scheme: dark)`), bukan berbasis class `.dark` pada elemen root `<html>`.
   - Karena sistem operasi pengguna (Windows) disetel pada Dark Mode, browser otomatis melaporkan preferensi `dark`, sehingga seluruh kelas `dark:*` pada modal dipaksa aktif oleh browser meskipun di aplikasi pengguna sedang memilih **Light Mode**.
   - Di sisi lain, `ThemeProvider.tsx` menghapus class `.dark` saat beralih ke Light Mode, menyebabkan variabel CSS `:root` aktif (`--color-surface-card: #FFFFFF` dan `--color-border-subtle: #E2E5DC`).
   - Akibat benturan ini: Garis-garis horizontal berjarak 28px yang menggunakan `--color-border-subtle` (#E2E5DC) terlukis sebagai **garis putih tebal zebra** di atas kanvas hitam, dan input form putih bersih kontras menabrak latar belakang gelap yang salah aktif (*clashing visual anomaly*).

---

## 2. Rincian Solusi & Perubahan Teknis Berdasarkan Git Diff

### A. Konfigurasi Varian Dark Berbasis Class pada Tailwind CSS v4 (`src/app/globals.css`)

Menambahkan deklarasi resmi Tailwind CSS v4 untuk membatasi varian `dark:` agar hanya aktif bila elemen leluhur memiliki kelas `.dark` (dikontrol penuh oleh `ThemeProvider.tsx` dan tombol toggle tema di navbar):

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

Dengan penambahan ini, selektor `dark:` tidak akan pernah diaktifkan secara sepihak oleh media query sistem operasi browser.

---

### B. Deklarasi Token Desain Buku Terbuka Semantik (`--color-book-*`)

Untuk memastikan kestabilan warna 100% tanpa risiko benturan utility class, dibuat token semantik khusus estetika buku jurnal atlet di `globals.css`:

```css
:root {
  /* Open Book Aesthetics - Light Mode (Ivory Field Journal) */
  --color-book-cover: #E2E5DC;
  --color-book-cover-border: #C6CCC0;
  --color-book-page-left: #FAFBF8;
  --color-book-page-right: #F5F7F0;
  --color-book-line: rgba(0, 0, 0, 0.05);
  --color-book-margin: rgba(214, 95, 88, 0.35);
  --color-book-crease-start: rgba(0, 0, 0, 0.04);
  --color-book-crease-mid: rgba(0, 0, 0, 0.18);
}

.dark {
  /* Open Book Aesthetics - Dark Mode (Obsidian Leather Journal) */
  --color-book-cover: #0A0F0C;
  --color-book-cover-border: #233228;
  --color-book-page-left: #121814;
  --color-book-page-right: #141B16;
  --color-book-line: rgba(95, 179, 149, 0.06);
  --color-book-margin: rgba(226, 114, 107, 0.35);
  --color-book-crease-start: rgba(0, 0, 0, 0.5);
  --color-book-crease-mid: rgba(0, 0, 0, 0.85);
}
```

---

### C. Pengikatan Dinamis pada Modal Buku Terbuka (`src/components/activity/modal/AddActivityModal.tsx`)

Menghapus kelas warna hardcoded dari kontainer buku dan lembaran halaman, menggantikannya dengan referensi variabel murni:

1. **Latar Sampul Buku**:
   - Mode Terang: Latar sampul kanvas/kulit vintage natural `#E2E5DC` dengan border `#C6CCC0`.
   - Mode Gelap: Latar sampul obsidian `#0A0F0C` dengan border `#233228`.
   ```tsx
   style={{
     backgroundColor: "var(--color-book-cover)",
     borderColor: "var(--color-book-cover-border)",
     borderWidth: "1px",
   }}
   ```
2. **Halaman Kiri & Kanan (Ruled Lines & Pencil Margin)**:
   - Garis horizontal berjarak 28px menggunakan warna transparan halus `var(--color-book-line)` dan garis margin pensil merah `var(--color-book-margin)`.
   - Halaman Kiri: `#FAFBF8` di mode terang $\to$ `#121814` di mode gelap.
   - Halaman Kanan: `#F5F7F0` di mode terang $\to$ `#141B16` di mode gelap.
   ```tsx
   style={{
     backgroundColor: "var(--color-book-page-left)",
     backgroundImage: `
       linear-gradient(to right, var(--color-book-margin) 1px, transparent 1px),
       linear-gradient(to bottom, var(--color-book-line) 1px, transparent 1px)
     `,
     backgroundSize: "100% 100%, 100% 28px",
     backgroundPosition: "38px 0, 0 8px",
   }}
   ```
3. **Bayangan Lekukan Lipatan Buku Tengah**:
   - Menggunakan gradien transparan dinamis dari `var(--color-book-crease-start)` ke `var(--color-book-crease-mid)` yang menghasilkan bayangan alami pada kertas terang dan bayangan kedalaman pekat pada kertas gelap.

---

### D. Penyelarasan Sub-komponen Input & Telemetri

1. **`ActivityManualFormFields.tsx`**:
   - Menggantikan background hardcode menjadi `bg-[var(--color-surface-card)]` dan `bg-[var(--color-surface-muted)]`.
   - Border input beralih dinamis mengikuti `border-[var(--color-border)]` dan fokus `focus:border-[var(--color-cycling)]`.
   - Kotak ringkasan kinematika (*speed & pace*) dan tombol stempel cabang olahraga kini menggunakan variabel teks semantik `text-[var(--color-text-primary)]` dan `text-[var(--color-text-secondary)]`.
2. **`ActivityHealthCheckinFields.tsx`**:
   - Header audit klinis, skala tombol Borg CR10 (1-10), slider skala nyeri sendi, dan kotak centang circuit-breaker kini merender menggunakan warna token tema aplikasi.
   - Skor Zone 2 dan status bebas nyeri sendi tetap terkalibrasi dengan aksen `var(--color-cycling)` dan `var(--color-alert-red)` baik pada mode Light maupun Dark.
3. **`ActivityImageUploader.tsx`**:
   - Area lampiran dropzone OCR foto telemetri kini menggunakan latar `bg-[var(--color-surface-card)]` dan border putus-putus adaptif.
   - Transkrip teks mentah (Raw OCR) dan badge hasil ekstraksi langsung menyesuaikan kecerahan kontras latar.

---

## 3. Matriks Perbandingan Git Diff

| File Terkait | Status | Baris Ditambahkan (+) | Baris Dihapus (-) | Fokus Pembaruan |
| :--- | :---: | :---: | :---: | :--- |
| `src/app/globals.css` | Modifikasi | +26 | 0 | Deklarasi `@custom-variant dark` Tailwind v4 & token `--color-book-*` |
| `src/components/activity/modal/AddActivityModal.tsx` | Modifikasi | +58 | -45 | Pengikatan lembaran buku, sampul, dan lipatan tengah ke variabel semantik |
| `src/components/activity/modal/ActivityManualFormFields.tsx` | Modifikasi | +35 | -35 | Transisi elemen formulir dan tombol stempel ke CSS variables tema |
| `src/components/activity/modal/ActivityHealthCheckinFields.tsx` | Modifikasi | +25 | -25 | Adaptasi kartu evaluasi klinis & skala intensitas terhadap mode terang/gelap |
| `src/components/activity/modal/ActivityImageUploader.tsx` | Modifikasi | +20 | -20 | Penyesuaian zona dropzone klip foto OCR terhadap palet tema |

**Total Perubahan**: 5 file termodifikasi, **+164 baris ditambahkan**, **-125 baris dihapus**.

---

## 4. Hasil Pengujian & Jaminan Mutu

1. **Pemeriksaan Kompilasi TypeScript**:
   - Perintah: `npx tsc --noEmit`
   - **Hasil**: Exit code `0` (0 Error, 100% Type-Safe).
2. **Verifikasi Produksi Build Next.js (Turbopack)**:
   - Perintah: `npm run build`
   - **Hasil**: Kompilasi selesai dalam 3.2s, seluruh 27 rute aplikasi berhasil teroptimasi tanpa kendala.
3. **Verifikasi Visual Light Mode vs Dark Mode**:
   - **Light Mode**: Modal menampilkan buku catatan lapangan putih-krem gading halus (`#FAFBF8`) dengan garis buku abu-abu transparan sangat lembut (`rgba(0,0,0,0.05)`), garis margin pensil merah, teks tinta pena tajam, dan input berlatar putih bersih yang selaras natural dengan dashboard. Tidak ada lagi garis zebra putih di latar hitam.
   - **Dark Mode**: Modal beralih sempurna ke kulit buku obsidian gelap (`#0A0F0C`) dengan lembaran hitam bertinta hijau zamrud transparan.
4. **Verifikasi HTTP Endpoint Terkait**:
   - `http://localhost:3000/training` $\to$ **HTTP 200 OK**.
   - `http://localhost:3000/api/activities` $\to$ **HTTP 200 OK**.

